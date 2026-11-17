r"""Amalgam Watch resources scheduled launcher v2.

Sync Public/Active Airtable media resources into the GitHub-hosted JSON used
by www.amalgamimprov.com/watch. Reuses the tested repository implementation,
including pagination, validation, encrypted credentials, locking, and no-op
detection, rather than maintaining a second copy of the sync logic.

SCHEDULE
Daily at 3 AM America/Chicago while the Windows user is signed in (a locked
desktop is fine). Also runs one minute after sign-in and catches missed runs
when available. Battery operation is allowed; the task does not wake the PC.

REPORTS
Writes timestamped reports and latest-report.txt in the sibling
amalgam-watch-resources-sync-reports directory. Retains reports for 35 days.
Failure and overdue alerts go to ben@deeperthandata.media. Health/logs are in watch/.watch-sync; encrypted credentials
and the Python runtime are shared with read/.read-sync in the repository.

MANUAL RUN
    C:\Python314\python.exe "C:\Users\benja\Desktop\Amalgam Automation Hub\Scheduled Tasks\amalgam-watch-resources-sync.py"

Add --local-only to validate/fetch without publishing, or --check-health to
check the last successful production sync without making API requests.
"""

from __future__ import annotations

import argparse
from datetime import datetime, timedelta, timezone
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile

import amalgam_resource_sync_alerts as sync_alerts


# Keep human-readable locations together so a future move is easy to reproduce.
SCRIPT_DIRECTORY = Path(__file__).resolve().parent
REPORT_DIRECTORY = SCRIPT_DIRECTORY / "amalgam-watch-resources-sync-reports"
RESOURCE_DIRECTORY = (Path.home() / "Documents" / "Amalgam Improv" / "Website"
                  / "amalgam-improv-embeds" / "aggregator-resources" / "watch")
RUNTIME_DIRECTORY = RESOURCE_DIRECTORY / ".watch-sync"
PYTHON_EXECUTABLE = RESOURCE_DIRECTORY.parent / "read" / ".read-sync" / "python-env" / "Scripts" / "python.exe"
SYNC_SCRIPT = RESOURCE_DIRECTORY.parent / "sync_media_resources.py"
CONFIGURATION = RUNTIME_DIRECTORY / "sync-config.json"
REPORT_PREFIX = "amalgam-watch-resources-sync-"


def atomic_text(path: Path, content: str) -> None:
    """Make each report available only when completely written."""
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = None
    try:
        with tempfile.NamedTemporaryFile(mode="w", encoding="utf-8", dir=path.parent,
                                         delete=False) as handle:
            temporary = Path(handle.name)
            handle.write(content)
        temporary.replace(path)
    finally:
        if temporary:
            temporary.unlink(missing_ok=True)


def save_report(lines: list[str], started: datetime) -> None:
    """Keep a latest report plus 35 days of this script's timestamped reports."""
    filename = REPORT_PREFIX + started.strftime("%Y%m%dT%H%M%S%fZ") + ".txt"
    content = "\n".join(lines) + "\n"
    atomic_text(REPORT_DIRECTORY / filename, content)
    atomic_text(REPORT_DIRECTORY / "latest-report.txt", content)
    cutoff = (datetime.now(timezone.utc) - timedelta(days=35)).timestamp()
    for report in REPORT_DIRECTORY.glob(REPORT_PREFIX + "*.txt"):
        if report.is_file() and not report.is_symlink() and report.stat().st_mtime < cutoff:
            report.unlink()


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--local-only", action="store_true")
    mode.add_argument("--check-health", action="store_true")
    args = parser.parse_args()
    started = datetime.now(timezone.utc)
    mode_name = "local-only" if args.local_only else "health check" if args.check_health else "publish"
    lines = ["Amalgam Watch Resources Sync", f"Started (UTC): {started.isoformat()}",
             f"Mode: {mode_name}", ""]
    exit_code = 1

    # Invoke the maintained sync engine without exposing tokens in command arguments.
    try:
        missing = [path.name for path in (PYTHON_EXECUTABLE, SYNC_SCRIPT, CONFIGURATION) if not path.is_file()]
        if missing:
            lines.append("Missing required local file(s): " + ", ".join(missing))
        else:
            command = [str(PYTHON_EXECUTABLE), str(SYNC_SCRIPT), "--kind", "watch", "--config", str(CONFIGURATION),
                       "--runtime", str(RUNTIME_DIRECTORY)]
            if args.local_only:
                command.append("--local-only")
            if args.check_health:
                command.append("--check-health")
            # Keep background execution invisible even under an interactive Windows task.
            result = subprocess.run(command, cwd=RESOURCE_DIRECTORY, capture_output=True, text=True,
                                    encoding="utf-8", errors="replace", timeout=12 * 60,
                                    creationflags=subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0)
            exit_code = result.returncode
            lines.extend([result.stdout.strip(), result.stderr.strip()])
            health_file = RUNTIME_DIRECTORY / "health.json"
            if health_file.is_file():
                health = json.loads(health_file.read_text(encoding="utf-8"))
                lines.extend(["", f"Last production success: {health.get('lastSuccessAt', 'never')}",
                              f"Airtable records: {health.get('totalRecords', 'unknown')}",
                              f"Public resources: {health.get('publishedCount', 'unknown')}",
                              f"GitHub commit status: {health.get('githubCommit', 'unknown')}",
                              f"Consecutive failures: {health.get('consecutiveFailures', 'unknown')}"])
    except subprocess.TimeoutExpired:
        exit_code = 1
        lines.append("FAILED: sync exceeded its 12-minute timeout; inspect sync health before retrying.")
    except Exception as error:
        # Unexpected exception messages can contain private data, so report only the class.
        exit_code = 1
        lines.append("FAILED: " + type(error).__name__)

    # Keep report failures visible to both Task Scheduler and the email monitor.
    try:
        save_report(lines, started)
    except Exception as error:
        exit_code = 1
        lines.append("Report write failed: " + type(error).__name__)

    # Only production runs send alerts; local previews and health-only checks do not.
    if not args.local_only and not args.check_health:
        try:
            alert = sync_alerts.record_run('watch', exit_code, started)
            lines.append("Email alert: " + alert["email"])
        except Exception as error:
            exit_code = 1
            lines.append("Email alert pending; monitor will retry: " + type(error).__name__)

    # Task Scheduler receives the same nonzero result that appears in the final report.
    lines.extend(["", f"Finished (UTC): {datetime.now(timezone.utc).isoformat()}",
                  f"Result: {'SUCCESS' if exit_code == 0 else 'FAILED'} (exit {exit_code})"])
    try:
        save_report(lines, started)
    except Exception:
        exit_code = 1
    if sys.stdout is not None:
        print("\n".join(lines))
    return exit_code


if __name__ == "__main__":
    sys.exit(main())
