"""Resource sync email alerts v1: failures, 36-hour freshness, and retry deduplication.

Installed beside the three scheduled launchers. Google credentials stay in the
Automation Hub; OAuth refreshes are held in memory, never copied into this repo.
"""
from __future__ import annotations

import base64
from contextlib import contextmanager
from datetime import datetime, timedelta, timezone
from email.message import EmailMessage
import json
import os
from pathlib import Path
import subprocess
import tempfile
import time
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

SCRIPT_DIRECTORY = Path(__file__).resolve().parent
REPOSITORY = Path.home() / "Documents" / "Amalgam Improv" / "Website" / "amalgam-improv-embeds"
ALERT_DIRECTORY = SCRIPT_DIRECTORY / "amalgam-resource-sync-alert-reports"
GOOGLE_TOKEN_PATH = SCRIPT_DIRECTORY.parent / "google_access_token.json"
RECIPIENT = "ben@deeperthandata.media"
KINDS = ("read", "watch", "listen")
STALE_AFTER = timedelta(hours=36)
REMINDER_AFTER = timedelta(hours=24)


class AlertError(Exception):
    """A sanitized local error, safe to include in task reports."""


def now():
    return datetime.now(timezone.utc)


def parse_time(value):
    if not isinstance(value, str):
        return None
    try:
        result = datetime.fromisoformat(value.replace("Z", "+00:00"))
        return result.astimezone(timezone.utc) if result.tzinfo else None
    except ValueError:
        return None


def read_object(path):
    if not path.exists():
        return {}
    try:
        value = json.loads(path.read_text(encoding="utf-8-sig"))
        return value if isinstance(value, dict) else {}
    except (ValueError, OSError):
        return {}


def atomic_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = None
    try:
        with tempfile.NamedTemporaryFile(mode="w", encoding="utf-8", dir=path.parent, delete=False) as handle:
            temporary = Path(handle.name)
            json.dump(value, handle, indent=2)
            handle.write("\n")
        temporary.replace(path)
    finally:
        if temporary:
            temporary.unlink(missing_ok=True)


@contextmanager
def alert_lock():
    """Serialize all three senders and the watchdog to avoid duplicate emails."""
    ALERT_DIRECTORY.mkdir(parents=True, exist_ok=True)
    with (ALERT_DIRECTORY / "alert.lock").open("a+b") as handle:
        if handle.seek(0, 2) == 0:
            handle.write(b"0")
            handle.flush()
        deadline = time.monotonic() + 180
        while True:
            handle.seek(0)
            try:
                if os.name == "nt":
                    import msvcrt
                    msvcrt.locking(handle.fileno(), msvcrt.LK_NBLCK, 1)
                else:
                    import fcntl
                    fcntl.flock(handle, fcntl.LOCK_EX | fcntl.LOCK_NB)
                break
            except OSError:
                if time.monotonic() >= deadline:
                    raise AlertError("Email alert lock timed out") from None
                time.sleep(0.25)
        try:
            yield
        finally:
            handle.seek(0)
            if os.name == "nt":
                msvcrt.locking(handle.fileno(), msvcrt.LK_UNLCK, 1)
            else:
                fcntl.flock(handle, fcntl.LOCK_UN)


def request_json(url, token=None, body=None, form=None):
    """Do not automatically retry Gmail sends: an ambiguous response may have sent it."""
    headers = {"Accept": "application/json", "User-Agent": "Amalgam-Resource-Sync-Alerts/1"}
    if token:
        headers["Authorization"] = "Bearer " + token
    data = None
    if body is not None:
        headers["Content-Type"] = "application/json"
        data = json.dumps(body).encode("utf-8")
    elif form is not None:
        headers["Content-Type"] = "application/x-www-form-urlencoded"
        data = urlencode(form).encode("utf-8")
    try:
        with urlopen(Request(url, headers=headers, data=data), timeout=30) as response:
            return json.load(response)
    except HTTPError as error:
        raise AlertError(f"Google API returned HTTP {error.code}") from None
    except (URLError, TimeoutError, OSError, ValueError):
        raise AlertError("Google API request failed; delivery may need retry") from None


def google_token(force_refresh=False):
    credentials = read_object(GOOGLE_TOKEN_PATH)
    expiry = parse_time(credentials.get("expiry"))
    if not force_refresh and credentials.get("token") and expiry and expiry > now() + timedelta(minutes=5):
        return credentials["token"]
    required = ("client_id", "client_secret", "refresh_token")
    if not all(credentials.get(key) for key in required):
        raise AlertError("Google OAuth credentials are missing or cannot refresh")
    result = request_json("https://oauth2.googleapis.com/token", form={
        **{key: credentials[key] for key in required}, "grant_type": "refresh_token"})
    if not isinstance(result.get("access_token"), str):
        raise AlertError("Google OAuth refresh returned no access token")
    return result["access_token"]


def authenticated_profile():
    """Read-only authorization check also confirms the sending account."""
    token = google_token()
    try:
        profile = request_json("https://gmail.googleapis.com/gmail/v1/users/me/profile", token=token)
    except AlertError as error:
        if "HTTP 401" not in str(error):
            raise
        token = google_token(force_refresh=True)
        profile = request_json("https://gmail.googleapis.com/gmail/v1/users/me/profile", token=token)
    if profile.get("emailAddress", "").lower() != RECIPIENT:
        raise AlertError("Google OAuth account does not match the configured alert account")
    return token, profile["emailAddress"]


def send_email(subject, body):
    token, sender = authenticated_profile()
    message = EmailMessage()
    message["From"] = sender
    message["To"] = RECIPIENT
    message["Subject"] = subject
    message.set_content(body)
    raw = base64.urlsafe_b64encode(message.as_bytes()).decode("ascii")
    result = request_json("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", token=token, body={"raw": raw})
    if not result.get("id"):
        raise AlertError("Gmail did not confirm message delivery")
    return result["id"]


def task_snapshots():
    """Detect missing tasks and failures before Python can write a run report."""
    command = r"""
$ErrorActionPreference = 'Stop'
$rows = foreach ($kind in @('read','watch','listen')) {
    $name = 'Amalgam - ' + [cultureinfo]::InvariantCulture.TextInfo.ToTitleCase($kind) + ' Resources Sync'
    $task = Get-ScheduledTask -TaskName $name -ErrorAction SilentlyContinue
    if ($null -eq $task) { @{kind=$kind; missing=$true}; continue }
    $info = Get-ScheduledTaskInfo -TaskName $name
    @{kind=$kind; missing=$false; state=[string]$task.State; result=[long]$info.LastTaskResult;
      lastRun=$info.LastRunTime.ToUniversalTime().ToString('o')}
}
ConvertTo-Json -InputObject @($rows) -Compress
"""
    executable = Path(os.environ.get("SystemRoot", r"C:\Windows")) / "System32/WindowsPowerShell/v1.0/powershell.exe"
    result = subprocess.run([str(executable), "-NoProfile", "-NonInteractive", "-Command", command],
                            capture_output=True, text=True, timeout=45,
                            creationflags=subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0)
    if result.returncode:
        raise AlertError("Unable to inspect Windows scheduled task results")
    try:
        return {row["kind"]: row for row in json.loads(result.stdout)}
    except (ValueError, KeyError, TypeError):
        raise AlertError("Windows task result response was invalid") from None


def resource_status(kind, scheduler=None, current_time=None):
    current_time = current_time or now()
    runtime = REPOSITORY / "aggregator-resources" / kind / f".{kind}-sync"
    health = read_object(runtime / "health.json")
    run = read_object(SCRIPT_DIRECTORY / f"amalgam-{kind}-resources-sync-reports" / "run-status.json")
    success = parse_time(health.get("lastSuccessAt"))
    finished = parse_time(run.get("finishedAt"))
    problems = []
    if run.get("exitCode", 0) != 0 and finished and (not success or finished >= success):
        problems.append("The latest sync launcher run failed (exit code " + str(int(run["exitCode"])) + ").")
    elif health.get("consecutiveFailures", 0) > 0:
        problems.append("The sync engine reported a failed run.")
    if scheduler:
        last_run = parse_time(scheduler.get("lastRun"))
        # Ready/running/not-yet-run status codes are not failed task completions.
        informational = {0, 0x41300, 0x41301, 0x41302, 0x41303}
        if scheduler.get("missing"):
            problems.append("The Windows scheduled sync task is missing.")
        elif scheduler.get("state") == "Disabled":
            problems.append("The Windows scheduled sync task is disabled.")
        elif scheduler.get("state") != "Running" and scheduler.get("result") not in informational and last_run and (not success or last_run > success):
            problems.append("Windows reported a failed sync task (result " + str(scheduler.get("result")) + ").")
    stale = success is None or current_time - success > STALE_AFTER
    if stale:
        problems.append("No successful production sync is recorded." if success is None else "No successful production sync in more than 36 hours.")
    return {"kind": kind, "problems": problems, "stale": stale,
            "lastSuccessAt": success.isoformat() if success else None,
            "report": str(SCRIPT_DIRECTORY / f"amalgam-{kind}-resources-sync-reports" / "latest-report.txt"),
            "health": str(runtime / "health.json")}


def evaluate(kind, scheduler=None, current_time=None, sender=None, dry_run=False):
    """Alert once per incident, on escalation to stale, and then once per 24 hours."""
    if kind not in KINDS:
        raise AlertError("Unknown resource sync")
    current_time = current_time or now()
    sender = sender or send_email
    with alert_lock():
        status = resource_status(kind, scheduler, current_time)
        path = ALERT_DIRECTORY / f"{kind}-alert-state.json"
        state = read_object(path)
        if not status["problems"]:
            if not dry_run:
                atomic_json(path, {"healthyAt": current_time.isoformat()})
            return {"kind": kind, "healthy": True, "email": "not needed"}
        previous_sent = parse_time(state.get("lastSentAt"))
        recovered_since = state.get("lastSuccessAt") != status["lastSuccessAt"]
        due = not previous_sent or recovered_since or (status["stale"] and not state.get("stale")) or current_time - previous_sent >= REMINDER_AFTER
        result = {"kind": kind, "healthy": False, "problems": status["problems"], "email": "deduplicated"}
        if not due:
            return result
        title = "overdue" if status["stale"] else "failed"
        subject = f"[Action needed] Amalgam {kind.title()} resource sync {title}"
        body = "\n".join([
            f"The Amalgam {kind.title()} resource sync needs attention.", "", *status["problems"], "",
            "Last successful production sync (UTC): " + (status["lastSuccessAt"] or "not available"),
            "Checked (UTC): " + current_time.isoformat(), "",
            "Local report: " + status["report"], "Health record: " + status["health"], "",
            "Task: Amalgam - " + kind.title() + " Resources Sync",
            "Check the report, restore credentials or network access if necessary, then rerun the task.",
            "Previous published JSON is retained when ingestion or validation fails.",
            "Retry emails are suppressed; an unresolved incident is repeated after 24 hours.",
        ])
        if dry_run:
            result.update(email="would send", subject=subject, body=body)
            return result
        try:
            message_id = sender(subject, body)
        except Exception as error:
            # A failed send remains pending; the independent monitor will retry it.
            state.update(lastAttemptAt=current_time.isoformat(), deliveryError=type(error).__name__)
            atomic_json(path, state)
            raise AlertError(f"{kind.title()} alert email could not be confirmed; monitor will retry") from None
        atomic_json(path, {"lastSentAt": current_time.isoformat(), "lastSuccessAt": status["lastSuccessAt"],
                           "stale": status["stale"], "messageId": message_id})
        result["email"] = "sent"
        return result


def record_run(kind, exit_code, started):
    """Persist failures outside the sync engine, including launcher timeouts and missing files."""
    path = SCRIPT_DIRECTORY / f"amalgam-{kind}-resources-sync-reports" / "run-status.json"
    atomic_json(path, {"startedAt": started.isoformat(), "finishedAt": now().isoformat(), "exitCode": exit_code})
    return evaluate(kind)
