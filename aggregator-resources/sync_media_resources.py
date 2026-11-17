"""Watch and Listen sync v1: validated Airtable catalogs published as static JSON.

Reuses Read's HTTP retries, encrypted credentials, atomic writes, OS locking,
and count guards. Each catalog has separate configuration, health, and logs.
"""
from __future__ import annotations

import argparse
import base64
from datetime import datetime, timedelta, timezone
import json
import logging
from logging.handlers import TimedRotatingFileHandler
import math
from pathlib import Path
import re
import sys
import time
from urllib.parse import urlencode

# Import the existing, tested infrastructure without changing Read's behavior.
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE / "read"))
import sync_read_resources as common

LOG = logging.getLogger("media-sync")
FIELDS = {
    "watch": {"name": "Name", "location": "Location", "channelId": "YouTube Channel ID",
              "channelUrl": "Channel URL", "uploadsPlaylistUrl": "Uploads Playlist URL",
              "category": "Category", "description": "Description"},
    "listen": {"name": "Name", "category": "Category", "feedUrl": "Feed URL",
               "artworkUrl": "Artwork URL", "podcastUrl": "Podcast URL",
               "description": "Description", "platform": "Platform"},
}
VIDEO_TYPES = {"Set", "Short", "Sketch", "Podcast"}
LISTEN_CATEGORIES = {"Entertainment + Fun", "Learning + Resources"}
WATCH_CATEGORIES = {"", "Improv Theater / Training Center", "Comedy Theater", "Other"}


def fetch_records(kind, config, token, request=common.request_json):
    """Fetch all pages with an explicit allowlist; private Airtable notes never leave the API reader."""
    fields = [*FIELDS[kind].values(), "Public", "Publication Status", "Sort Order"]
    if kind == "watch":
        fields.append("improv_video_type")
    params = [("pageSize", 100)] + [("fields[]", name) for name in fields]
    endpoint = f'https://api.airtable.com/v0/{config["baseId"]}/{config["tableId"]}'
    records, ids, cursors = [], set(), set()
    while True:
        payload = request(endpoint + "?" + urlencode(params), token)
        if not isinstance(payload, dict) or not isinstance(payload.get("records"), list):
            raise common.SyncError("Airtable response has no records array")
        for record in payload["records"]:
            record_id = record.get("id", "")
            if not re.fullmatch(r"rec[A-Za-z0-9]{14}", record_id) or record_id in ids:
                raise common.SyncError("Invalid or duplicate Airtable record ID")
            ids.add(record_id)
            records.append(record)
        cursor = payload.get("offset")
        if not cursor:
            break
        if not isinstance(cursor, str) or cursor in cursors or not payload["records"]:
            raise common.SyncError("Incomplete or repeated Airtable pagination")
        cursors.add(cursor)
        params = [(k, v) for k, v in params if k != "offset"] + [("offset", cursor)]
    LOG.info("Airtable pages=%s records=%s", len(cursors) + 1, len(records))
    return records


def normalize_records(kind, records):
    resources = []
    unreviewed = 0
    for record in records:
        fields = record.get("fields", {})
        if fields.get("Public") is not True or common.text_value(fields.get("Publication Status")) != "Active":
            continue
        # Watch's existing editorial gate requires manual video-type review.
        types = fields.get("improv_video_type", [])
        if kind == "watch" and not types:
            unreviewed += 1
            continue
        row = {key: common.text_value(fields.get(name)) for key, name in FIELDS[kind].items()}
        row["id"] = record["id"]
        order = fields.get("Sort Order", 9999)
        try:
            if isinstance(order, bool):
                raise ValueError
            row["sortOrder"] = float(order)
        except (ValueError, TypeError):
            raise common.SyncError(f'{row["id"]}: invalid Sort Order') from None
        if kind == "watch":
            if not isinstance(types, list):
                raise common.SyncError(f'{row["id"]}: video types must be a list')
            # Preserve Airtable's first selection: Watch uses it as the primary type.
            row["improvVideoType"] = list(dict.fromkeys(common.text_value(value) for value in types))
        resources.append(row)
    validate_resources(kind, resources)
    resources.sort(key=lambda row: (row["sortOrder"], row["id"]))
    LOG.info("Filtered records=%s published=%s unreviewed=%s", len(records), len(resources), unreviewed)
    return resources


def validate_resources(kind, resources):
    if not isinstance(resources, list) or not resources:
        raise common.SyncError("Refusing an empty resource catalog")
    ids, sources = set(), set()
    for row in resources:
        record_id = row.get("id", "")
        if not re.fullmatch(r"rec[A-Za-z0-9]{14}", record_id) or record_id in ids:
            raise common.SyncError("Invalid or duplicate resource ID")
        ids.add(record_id)
        if any(not isinstance(row.get(key), str) for key in FIELDS[kind]) or not row["name"].strip():
            raise common.SyncError(f"{record_id}: missing name or invalid text field")
        if isinstance(row.get("sortOrder"), bool) or not isinstance(row.get("sortOrder"), (int, float)) or not math.isfinite(row["sortOrder"]):
            raise common.SyncError(f"{record_id}: invalid numeric order")
        if kind == "watch":
            source = row["channelId"]
            types = row.get("improvVideoType")
            if not re.fullmatch(r"UC[A-Za-z0-9_-]{22}", source):
                raise common.SyncError(f"{record_id}: invalid YouTube channel ID")
            if not isinstance(types, list) or not types or any(value not in VIDEO_TYPES for value in types):
                raise common.SyncError(f"{record_id}: invalid reviewed video types")
            if row["category"] not in WATCH_CATEGORIES:
                raise common.SyncError(f"{record_id}: unsupported Watch category")
            urls = ("channelUrl", "uploadsPlaylistUrl")
        else:
            source = row["feedUrl"]
            if not source or row["category"] not in LISTEN_CATEGORIES:
                raise common.SyncError(f"{record_id}: missing feed or unsupported Listen category")
            urls = ("feedUrl", "artworkUrl", "podcastUrl")
        if source in sources:
            raise common.SyncError(f"{record_id}: duplicate source")
        sources.add(source)
        for key in urls:
            if row[key] and not common.valid_url(row[key]):
                raise common.SyncError(f"{record_id}: invalid {key}")


def make_document(kind, config, resources, total):
    return {"schemaVersion": 1, "kind": kind, "source": f"Airtable {kind.title()} Resources",
            "sourceMetadata": {"baseId": config["baseId"], "tableId": config["tableId"],
                               "recordCountAtContentChange": total},
            "contentUpdatedAt": common.utc_now(), "resources": resources}


def publish(kind, config, token, resources, total, previous_total=None, request=common.request_json):
    """Read/compare/write with SHA protection; re-read on concurrent 3 AM commits."""
    endpoint = f'https://api.github.com/repos/{config["repository"]}/contents/{config["jsonPath"]}'
    for attempt in range(3):
        remote = request(endpoint + "?" + urlencode({"ref": config["branch"]}), token, allow_missing=True)
        previous = None
        if remote:
            previous = json.loads(base64.b64decode(remote["content"]))
            if previous.get("schemaVersion") != 1 or previous.get("kind") != kind:
                raise common.SyncError("Unexpected published catalog schema")
            validate_resources(kind, previous.get("resources"))
        common.validate_counts(config, total, resources, previous, previous_total)
        if previous and previous["resources"] == resources:
            return previous, "unchanged"
        document = make_document(kind, config, resources, total)
        body = {"message": f"Sync {kind.title()} resources from Airtable.", "branch": config["branch"],
                "content": base64.b64encode(common.encode_json(document)).decode("ascii")}
        if remote:
            body["sha"] = remote["sha"]
        try:
            result = request(endpoint, token, method="PUT", body=body)
            return document, result["commit"]["sha"]
        except common.SyncError as error:
            if "HTTP 409" not in str(error) or attempt == 2:
                raise
            time.sleep(attempt + 1)
    raise common.SyncError("Concurrent publication retry limit reached")


def check_health(kind, config, runtime, state):
    last = state.get("lastSuccessAt")
    stale = not last or datetime.now(timezone.utc) - datetime.fromisoformat(last) > timedelta(hours=config["staleHours"])
    alert = runtime / f"{kind.upper()}-SYNC-ALERT.txt"
    if stale or state.get("consecutiveFailures", 0) >= config["failureAlertThreshold"]:
        message = f'{kind.title()} sync needs attention. Last success: {last or "never"}; failures: {state.get("consecutiveFailures", 0)}. See health.json and resource-sync.log.'
        common.atomic_write(alert, message.encode("utf-8"))
        LOG.error(message)
        return False
    alert.unlink(missing_ok=True)
    return True


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--kind", choices=tuple(FIELDS), required=True)
    parser.add_argument("--config", type=Path)
    parser.add_argument("--runtime", type=Path)
    parser.add_argument("--local-only", action="store_true")
    parser.add_argument("--check-health", action="store_true")
    args = parser.parse_args(argv)
    folder = HERE / args.kind
    runtime = args.runtime or folder / f".{args.kind}-sync"
    runtime.mkdir(parents=True, exist_ok=True)
    handler = TimedRotatingFileHandler(runtime / "resource-sync.log", when="midnight", backupCount=35, utc=True, encoding="utf-8")
    logging.Formatter.converter = time.gmtime
    console = logging.StreamHandler()
    formatter = logging.Formatter("%(asctime)sZ %(levelname)s %(message)s")
    LOG.setLevel(logging.INFO)
    LOG.propagate = False
    for destination in (handler, console):
        destination.setFormatter(formatter)
        LOG.addHandler(destination)
    try:
        with common.run_lock(runtime):
            config = common.read_json(args.config or folder / "sync-config.example.json")
            state_path = runtime / "health.json"
            state = common.read_json(state_path) if state_path.exists() else {}
            if args.check_health:
                return 0 if check_health(args.kind, config, runtime, state) else 1
            LOG.info("Run started catalog=%s mode=%s", args.kind, "local-only" if args.local_only else "publish")
            started = time.monotonic()
            try:
                records = fetch_records(args.kind, config, common.load_secret("AIRTABLE_PAT", common.RUNTIME))
                resources = normalize_records(args.kind, records)
                target = folder / "resources.json"
                previous = common.read_json(target) if target.exists() else None
                common.validate_counts(config, len(records), resources, previous, state.get("totalRecords"))
                if args.local_only:
                    document = previous if previous and previous["resources"] == resources else make_document(args.kind, config, resources, len(records))
                    commit = "local-only"
                else:
                    document, commit = publish(args.kind, config, common.load_secret("GITHUB_TOKEN", common.RUNTIME),
                                               resources, len(records), state.get("totalRecords"))
                data = common.encode_json(document)
                if not target.exists() or target.read_bytes() != data:
                    common.atomic_write(target, data)
                LOG.info("Run finished records=%s published=%s GitHub=%s seconds=%.1f", len(records), len(resources), commit, time.monotonic() - started)
                if not args.local_only:
                    state.update(totalRecords=len(records), publishedCount=len(resources), githubCommit=commit)
                    common.update_health(runtime, state)
                    check_health(args.kind, config, runtime, state)
                return 0
            except Exception as error:
                message = str(error) if isinstance(error, common.SyncError) else type(error).__name__
                LOG.error("Run failed seconds=%.1f error=%s", time.monotonic() - started, message)
                if not args.local_only:
                    common.update_health(runtime, state, message)
                    check_health(args.kind, config, runtime, state)
                return 1
    except Exception as error:
        LOG.error("Unable to run: %s", str(error) if isinstance(error, common.SyncError) else type(error).__name__)
        return 1
    finally:
        # Release Windows log handles even when main is invoked repeatedly by tests.
        for destination in (handler, console):
            LOG.removeHandler(destination)
            destination.close()


if __name__ == "__main__":
    sys.exit(main())
