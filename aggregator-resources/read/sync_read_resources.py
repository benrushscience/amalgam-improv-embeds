"""Read resource sync v1: authenticated ingestion, validation, and atomic publication.

Uses Python's standard library. Secrets come from environment variables or locally
encrypted Windows DPAPI files; only the explicit public field allowlist is exported.
"""

from __future__ import annotations

import argparse
import base64
from contextlib import contextmanager
import ctypes
from datetime import datetime, timedelta, timezone
import json
import logging
from logging.handlers import TimedRotatingFileHandler
import math
import os
from pathlib import Path
import re
import sys
import tempfile
import time
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode, urlsplit
from urllib.request import Request, urlopen

HERE = Path(__file__).resolve().parent
RUNTIME = HERE / ".read-sync"
FIELDS = {
    "title": "Name", "creator": "Creator", "category": "Category",
    "format": "Format", "access": "Access", "description": "Description",
    "isbn": "ISBN", "coverUrl": "Cover URL", "sourceUrl": "Source URL",
    "sourceLabel": "Source Label", "amazonUrl": "Amazon URL",
}
CATEGORIES = {"book", "manual", "blog", "applied"}
ACCESS = {"free", "freemium", "purchase"}
LOG = logging.getLogger("read-sync")


class SyncError(Exception):
    """A sanitized failure that may safely appear in local logs."""


def utc_now():
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def read_json(path):
    return json.loads(Path(path).read_text(encoding="utf-8-sig"))


def encode_json(value):
    return (json.dumps(value, ensure_ascii=False, indent=2, allow_nan=False) + "\n").encode("utf-8")


def atomic_write(path, content):
    """Replace only after the complete candidate has been written to the same disk."""
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    name = None
    try:
        with tempfile.NamedTemporaryFile(dir=path.parent, delete=False) as handle:
            name = handle.name
            handle.write(content)
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(name, path)
    finally:
        if name and os.path.exists(name):
            os.unlink(name)


@contextmanager
def run_lock(runtime):
    """The OS releases this lock after a crash, so stale lockfiles cannot block recovery."""
    runtime.mkdir(parents=True, exist_ok=True)
    with (runtime / "sync.lock").open("a+b") as handle:
        handle.seek(0)
        handle.write(b"0")
        handle.flush()
        handle.seek(0)
        try:
            if os.name == "nt":
                import msvcrt
                msvcrt.locking(handle.fileno(), msvcrt.LK_NBLCK, 1)
            else:
                import fcntl
                fcntl.flock(handle, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except OSError:
            raise SyncError("Another Read resource sync is already running") from None
        try:
            yield
        finally:
            handle.seek(0)
            if os.name == "nt":
                msvcrt.locking(handle.fileno(), msvcrt.LK_UNLCK, 1)
            else:
                fcntl.flock(handle, fcntl.LOCK_UN)


def load_secret(name, runtime):
    """Decrypt machine DPAPI data protected by the installer's restrictive file ACL."""
    value = os.environ.get(name)
    if value:
        return value.strip()
    if os.name != "nt":
        raise SyncError(f"Set {name} in the environment")
    path = runtime / f"{name}.dpapi"
    if not path.exists():
        raise SyncError(f"Missing encrypted {name}; run install-read-sync.ps1")
    from ctypes import wintypes

    class Blob(ctypes.Structure):
        _fields_ = [("size", wintypes.DWORD), ("data", ctypes.POINTER(ctypes.c_char))]

    encrypted = base64.b64decode(path.read_bytes(), validate=True)
    buffer = ctypes.create_string_buffer(encrypted)
    source = Blob(len(encrypted), ctypes.cast(buffer, ctypes.POINTER(ctypes.c_char)))
    result = Blob()
    crypt = ctypes.WinDLL("crypt32", use_last_error=True)
    crypt.CryptUnprotectData.argtypes = [ctypes.POINTER(Blob), ctypes.c_void_p,
                                        ctypes.c_void_p, ctypes.c_void_p, ctypes.c_void_p,
                                        wintypes.DWORD, ctypes.POINTER(Blob)]
    crypt.CryptUnprotectData.restype = wintypes.BOOL
    if not crypt.CryptUnprotectData(ctypes.byref(source), None, None, None, None, 1,
                                   ctypes.byref(result)):
        raise SyncError(f"Cannot decrypt {name}")
    kernel = ctypes.WinDLL("kernel32", use_last_error=True)
    kernel.LocalFree.argtypes = [ctypes.c_void_p]
    kernel.LocalFree.restype = ctypes.c_void_p
    try:
        return ctypes.string_at(result.data, result.size).decode("utf-8").strip()
    finally:
        kernel.LocalFree(result.data)


def request_json(url, token, method="GET", body=None, allow_missing=False):
    """Retry transient reads; never log headers, tokens, or response bodies.

    Writes are not blindly retried: a subsequent run re-reads GitHub after any
    ambiguous network failure and compares contents before deciding to commit.
    """
    headers = {"Authorization": f"Bearer {token}", "User-Agent": "Amalgam-Read-Sync",
               "Accept": "application/json", "Content-Type": "application/json"}
    if urlsplit(url).hostname == "api.github.com":
        headers["X-GitHub-Api-Version"] = "2022-11-28"
    attempts = 4 if method == "GET" else 1
    for attempt in range(attempts):
        try:
            request = Request(url, headers=headers, method=method,
                              data=encode_json(body) if body is not None else None)
            with urlopen(request, timeout=30) as response:
                return json.load(response)
        except HTTPError as error:
            if error.code == 404 and allow_missing:
                return None
            if error.code not in {429, 500, 502, 503, 504} or attempt == attempts - 1:
                raise SyncError(f"{urlsplit(url).hostname} returned HTTP {error.code}") from None
            delay = 30 if error.code == 429 else 2 ** attempt
        except (URLError, TimeoutError, OSError):
            if attempt == attempts - 1:
                raise SyncError(f"Network request to {urlsplit(url).hostname} failed") from None
            delay = 2 ** attempt
        time.sleep(delay)
    raise SyncError("Network retry limit reached")


def fetch_records(config, token, request=request_json):
    """Fetch every page; detect repeated cursors and duplicate IDs before filtering."""
    endpoint = f'https://api.airtable.com/v0/{config["baseId"]}/{config["tableId"]}'
    records, cursors, ids = [], set(), set()
    params = [("pageSize", "100")]
    params += [("fields[]", name) for name in [*FIELDS.values(), "Sort Order", "Public", "Publication Status"]]
    while True:
        payload = request(endpoint + "?" + urlencode(params), token)
        if not isinstance(payload, dict) or not isinstance(payload.get("records"), list):
            raise SyncError("Airtable response has no records array")
        for record in payload["records"]:
            record_id = record.get("id", "")
            if not re.fullmatch(r"rec[A-Za-z0-9]{14}", record_id) or record_id in ids:
                raise SyncError("Airtable returned an invalid or duplicate record ID")
            ids.add(record_id)
            records.append(record)
        cursor = payload.get("offset")
        if not cursor:
            break
        if not isinstance(cursor, str) or cursor in cursors or not payload["records"]:
            raise SyncError("Airtable pagination is incomplete or repeated")
        cursors.add(cursor)
        params = [(key, value) for key, value in params if key != "offset"] + [("offset", cursor)]
    LOG.info("Airtable pages=%s records=%s", len(cursors) + 1, len(records))
    return records


def text_value(value):
    if isinstance(value, dict):
        value = value.get("name", "")
    if value is None:
        return ""
    if not isinstance(value, (str, int, float)) or isinstance(value, bool):
        raise SyncError("Unexpected field type")
    return str(value).strip()


def valid_url(value):
    try:
        parsed = urlsplit(value)
        return (parsed.scheme in {"https", "http"} and bool(parsed.hostname)
                and not parsed.username and not parsed.password
                and not re.search(r'[\s<>"\x00-\x1f]', value))
    except ValueError:
        return False


def normalize_records(records):
    resources = []
    for record in records:
        fields = record.get("fields", {})
        if fields.get("Public") is not True or text_value(fields.get("Publication Status")) != "Active":
            continue
        resource = {key: text_value(fields.get(name)) for key, name in FIELDS.items()}
        resource["id"] = record["id"]
        order = fields.get("Sort Order", 9999)
        try:
            if isinstance(order, bool):
                raise ValueError
            resource["sortOrder"] = float(order)
        except (ValueError, TypeError):
            raise SyncError(f'{record["id"]}: Sort Order must be numeric') from None
        resources.append(resource)
    resources.sort(key=lambda row: (row["sortOrder"], row["id"]))
    validate_resources(resources)
    LOG.info("Filtered records=%s published=%s", len(records), len(resources))
    return resources


def validate_resources(resources):
    if not isinstance(resources, list) or not resources:
        raise SyncError("Refusing to publish an empty resource array")
    ids = set()
    for row in resources:
        record_id = row.get("id", "")
        if not re.fullmatch(r"rec[A-Za-z0-9]{14}", record_id) or record_id in ids:
            raise SyncError("Invalid or duplicate public record ID")
        ids.add(record_id)
        for key in FIELDS:
            if not isinstance(row.get(key), str):
                raise SyncError(f"{record_id}: invalid {key}")
        if not all(row[key].strip() for key in ("title", "creator", "format", "description", "sourceUrl")):
            raise SyncError(f"{record_id}: missing required public fields")
        if row["category"] not in CATEGORIES or row["access"] not in ACCESS:
            raise SyncError(f"{record_id}: unsupported category or access")
        if not isinstance(row.get("sortOrder"), (int, float)) or not math.isfinite(row["sortOrder"]):
            raise SyncError(f"{record_id}: invalid numeric order")
        for key in ("sourceUrl", "amazonUrl", "coverUrl"):
            if row[key] and not valid_url(row[key]):
                raise SyncError(f"{record_id}: invalid {key}")


def validate_counts(config, total, resources, previous=None, previous_total=None):
    """Absolute and relative floors catch truncated reads and unexpected mass removals."""
    if total < config["minimumTotalRecords"] or len(resources) < config["minimumPublicRecords"]:
        raise SyncError("Record count is below the configured safety floor")
    retention = 1 - config["maximumDropFraction"]
    if previous and len(resources) < len(previous["resources"]) * retention:
        raise SyncError("Public record count dropped beyond the safety limit")
    if previous_total and total < previous_total * retention:
        raise SyncError("Total Airtable record count dropped beyond the safety limit")


def github_snapshot(config, token, request=request_json):
    endpoint = f'https://api.github.com/repos/{config["repository"]}/contents/{config["jsonPath"]}'
    result = request(endpoint + "?" + urlencode({"ref": config["branch"]}), token, allow_missing=True)
    if result is None:
        return endpoint, None, None
    document = json.loads(base64.b64decode(result["content"]))
    if document.get("schemaVersion") != 1:
        raise SyncError("GitHub JSON has an unsupported schema")
    validate_resources(document.get("resources"))
    return endpoint, result["sha"], document


def publish(config, token, resources, total, previous_total=None, request=request_json):
    endpoint, sha, previous = github_snapshot(config, token, request)
    validate_counts(config, total, resources, previous, previous_total)
    if previous and previous["resources"] == resources:
        return previous, "unchanged"
    document = {"schemaVersion": 1, "source": "Airtable Read Resources",
                "sourceMetadata": {"baseId": config["baseId"], "tableId": config["tableId"],
                                   "recordCountAtContentChange": total},
                "contentUpdatedAt": utc_now(), "resources": resources}
    body = {"message": "Sync Read resources from Airtable.", "branch": config["branch"],
            "content": base64.b64encode(encode_json(document)).decode("ascii")}
    if sha:
        body["sha"] = sha
    response = request(endpoint, token, method="PUT", body=body)
    return document, response["commit"]["sha"]


def update_health(runtime, state, error=None):
    """Keep health local so unchanged resource runs never generate GitHub commits."""
    state["lastFinishedAt"] = utc_now()
    if error:
        state["consecutiveFailures"] = state.get("consecutiveFailures", 0) + 1
        state["lastError"] = error
    else:
        state.update(lastSuccessAt=utc_now(), consecutiveFailures=0, lastError=None)
    atomic_write(runtime / "health.json", encode_json(state))


def check_health(config, runtime, state):
    last = state.get("lastSuccessAt")
    stale = not last or datetime.now(timezone.utc) - datetime.fromisoformat(last) > timedelta(hours=config["staleHours"])
    failing = state.get("consecutiveFailures", 0) >= config["failureAlertThreshold"]
    alert = runtime / "READ-SYNC-ALERT.txt"
    if stale or failing:
        message = (f'Read resource sync needs attention. Last success: {last or "never"}; '
                   f'consecutive failures: {state.get("consecutiveFailures", 0)}. '
                   'See health.json and read-sync.log; run the manual command in README.md.')
        atomic_write(alert, message.encode("utf-8"))
        LOG.error(message)
        return False
    alert.unlink(missing_ok=True)
    return True


def configure_logging(runtime):
    runtime.mkdir(parents=True, exist_ok=True)
    handler = TimedRotatingFileHandler(runtime / "read-sync.log", when="midnight",
                                      backupCount=35, encoding="utf-8", utc=True)
    logging.basicConfig(level=logging.INFO, handlers=[handler, logging.StreamHandler()],
                        format="%(asctime)sZ %(levelname)s %(message)s")
    logging.Formatter.converter = time.gmtime


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--config", type=Path, default=HERE / "sync-config.example.json")
    parser.add_argument("--runtime", type=Path, default=RUNTIME)
    parser.add_argument("--local-only", action="store_true", help="Fetch and validate without publishing to GitHub")
    parser.add_argument("--check-health", action="store_true", help="Check local sync freshness without an API request")
    args = parser.parse_args(argv)
    configure_logging(args.runtime)
    try:
        with run_lock(args.runtime):
            config = read_json(args.config)
            state_path = args.runtime / "health.json"
            state = read_json(state_path) if state_path.exists() else {}
            if args.check_health:
                return 0 if check_health(config, args.runtime, state) else 1
            LOG.info("Run started mode=%s", "local-only" if args.local_only else "publish")
            started = time.monotonic()
            try:
                records = fetch_records(config, load_secret("AIRTABLE_PAT", args.runtime))
                resources = normalize_records(records)
                target = HERE / "resources.json"
                previous = read_json(target) if target.exists() else None
                validate_counts(config, len(records), resources, previous, state.get("totalRecords"))
                if args.local_only:
                    document = previous if previous and previous["resources"] == resources else {
                        "schemaVersion": 1, "source": "Airtable Read Resources",
                        "sourceMetadata": {"baseId": config["baseId"], "tableId": config["tableId"],
                                           "recordCountAtContentChange": len(records)},
                        "contentUpdatedAt": utc_now(), "resources": resources}
                    commit = "local-only"
                else:
                    document, commit = publish(config, load_secret("GITHUB_TOKEN", args.runtime),
                                               resources, len(records), state.get("totalRecords"))
                # Local output changes only after all validation and publication succeed.
                content = encode_json(document)
                if not target.exists() or target.read_bytes() != content:
                    atomic_write(target, content)
                LOG.info("Run finished records=%s published=%s GitHub=%s seconds=%.1f",
                         len(records), len(resources), commit, time.monotonic() - started)
                if not args.local_only:
                    state.update(totalRecords=len(records), publishedCount=len(resources), githubCommit=commit)
                    update_health(args.runtime, state)
                    check_health(config, args.runtime, state)
                return 0
            except Exception as error:
                # Unexpected exceptions are named, never stringified: they might contain secrets.
                message = str(error) if isinstance(error, SyncError) else type(error).__name__
                LOG.error("Run failed seconds=%.1f error=%s", time.monotonic() - started, message)
                if not args.local_only:
                    update_health(args.runtime, state, message)
                    check_health(config, args.runtime, state)
                return 1
    except Exception as error:
        LOG.error("Unable to run: %s", str(error) if isinstance(error, SyncError) else type(error).__name__)
        return 1


if __name__ == "__main__":
    sys.exit(main())
