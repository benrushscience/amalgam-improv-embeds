"""Resource sync monitor v1: independently check Read, Watch, and Listen every hour."""
from datetime import timedelta
import argparse
import json
from pathlib import Path
import sys

import amalgam_resource_sync_alerts as alerts


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dry-run", action="store_true", help="Evaluate alerts without sending or changing deduplication state")
    parser.add_argument("--verify-email", action="store_true", help="Check the Google OAuth account without sending email")
    args = parser.parse_args()
    if args.verify_email:
        _, address = alerts.authenticated_profile()
        print("Google OAuth account verified: " + address)
        return 0
    started = alerts.now()
    results = []
    exit_code = 0
    try:
        tasks = alerts.task_snapshots()
    except Exception as error:
        # Continue freshness/launcher checks even if Task Scheduler querying fails.
        tasks = {}
        results.append({"monitorError": type(error).__name__})
        exit_code = 1
    for kind in alerts.KINDS:
        try:
            result = alerts.evaluate(kind, tasks.get(kind), dry_run=args.dry_run)
            results.append(result)
            if not result["healthy"]:
                exit_code = 1
        except Exception as error:
            results.append({"kind": kind, "monitorError": type(error).__name__})
            exit_code = 1
    report = {"startedAt": started.isoformat(), "finishedAt": alerts.now().isoformat(),
              "dryRun": args.dry_run, "results": results, "exitCode": exit_code}
    folder = alerts.ALERT_DIRECTORY
    alerts.atomic_json(folder / "latest-monitor-report.json", report)
    alerts.atomic_json(folder / ("monitor-" + started.strftime("%Y%m%dT%H%M%S%fZ") + ".json"), report)
    cutoff = (alerts.now() - timedelta(days=35)).timestamp()
    for path in folder.glob("monitor-*.json"):
        if path.is_file() and not path.is_symlink() and path.stat().st_mtime < cutoff:
            path.unlink()
    if sys.stdout is not None:
        print(json.dumps(report, indent=2))
    return exit_code


if __name__ == "__main__":
    sys.exit(main())
