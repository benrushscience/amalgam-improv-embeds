"""Read sync regression tests v1; all network responses are controlled fixtures."""

import base64
from copy import deepcopy
from datetime import datetime, timedelta, timezone
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
from urllib.parse import parse_qs, urlsplit

import sync_read_resources as sync


def record(number=1, **changes):
    fields = {"Name": "Example", "Creator": "Author", "Category": "book",
              "Format": "Book", "Access": "purchase", "Description": "Reading resource.",
              "Source URL": "https://example.com/book", "Public": True,
              "Publication Status": "Active", "Sort Order": number}
    fields.update(changes)
    return {"id": f"rec{number:014d}", "fields": fields}


class SyncTests(unittest.TestCase):
    def setUp(self):
        self.config = sync.read_json(sync.HERE / "sync-config.example.json")
        self.config.update(minimumTotalRecords=1, minimumPublicRecords=1)

    def test_pagination_reads_127_records(self):
        calls = []

        def request(url, token):
            calls.append(parse_qs(urlsplit(url).query))
            if len(calls) == 1:
                return {"records": [record(i) for i in range(1, 101)], "offset": "next/page"}
            return {"records": [record(i) for i in range(101, 128)]}

        result = sync.fetch_records(self.config, "secret", request)
        self.assertEqual(len(result), 127)
        self.assertEqual(calls[1]["offset"], ["next/page"])
        self.assertEqual(calls[0]["pageSize"], ["100"])
        self.assertNotIn("Internal Notes", calls[0]["fields[]"])

    def test_repeated_cursor_or_duplicate_id_fails(self):
        for response in ({"records": [record(), record()]},
                         {"records": [record()], "offset": "repeat"}):
            with self.subTest(response=response), self.assertRaises(sync.SyncError):
                sync.fetch_records(self.config, "secret", lambda *args: response)

    def test_public_active_filter_and_select_names(self):
        result = sync.normalize_records([
            record(1, Public=False), record(2, **{"Publication Status": "Draft"}),
            record(3, Category={"name": "manual"}), record(4, Public="true")])
        self.assertEqual([r["id"] for r in result], [record(3)["id"]])
        self.assertEqual(result[0]["category"], "manual")
        self.assertNotIn("Public", result[0])

    def test_zero_decimal_order_and_stable_tie_break(self):
        result = sync.normalize_records([record(4, **{"Sort Order": 10.5}),
                                         record(3, **{"Sort Order": 10}),
                                         record(2, **{"Sort Order": 0}),
                                         record(1, **{"Sort Order": 0})])
        self.assertEqual([r["id"] for r in result], [record(i)["id"] for i in (1, 2, 3, 4)])

    def test_invalid_public_data_is_rejected(self):
        for fields in ({"Source URL": "javascript:alert(1)"}, {"Category": "unknown"},
                       {"Name": ""}, {"Sort Order": float("nan")},
                       {"Cover URL": 'https://example.com/"onclick'}, {"Access": "unknown"}):
            with self.subTest(fields=fields), self.assertRaises(sync.SyncError):
                sync.normalize_records([record(**fields)])

    def test_count_guards(self):
        rows = sync.normalize_records([record()])
        for total, previous, previous_total in [(0, None, None), (1, {"resources": rows * 10}, None), (1, None, 10)]:
            with self.assertRaises(sync.SyncError):
                sync.validate_counts(self.config, total, rows, previous, previous_total)

    def test_unchanged_data_does_not_commit_or_change_timestamp(self):
        rows = sync.normalize_records([record()])
        previous = {"schemaVersion": 1, "resources": rows, "contentUpdatedAt": "original"}
        calls = []

        def request(url, token, **kwargs):
            calls.append(kwargs)
            return {"sha": "old", "content": base64.b64encode(sync.encode_json(previous)).decode()}

        document, status = sync.publish(self.config, "secret", rows, 1, request=request)
        self.assertEqual(status, "unchanged")
        self.assertEqual(document, previous)
        self.assertEqual(len(calls), 1)

    def test_add_edit_and_unpublish_update_github_with_sha(self):
        original = sync.normalize_records([record(1), record(2)])
        for incoming in ([record(1), record(2), record(3)],
                         [record(1, Name="Updated"), record(2)],
                         [record(1), record(2, Public=False)]):
            with self.subTest(incoming=incoming):
                # Explicitly permit the intentional 50% removal in this fixture.
                self.config["maximumDropFraction"] = 0.6
                writes = []

                def request(url, token, **kwargs):
                    if kwargs.get("method") == "PUT":
                        writes.append(kwargs["body"])
                        return {"commit": {"sha": "new"}}
                    return {"sha": "old", "content": base64.b64encode(sync.encode_json(
                        {"schemaVersion": 1, "resources": original})).decode()}

                rows = sync.normalize_records(incoming)
                _, status = sync.publish(self.config, "secret", rows, len(incoming), request=request)
                self.assertEqual(status, "new")
                self.assertEqual(writes[0]["sha"], "old")
                self.assertEqual(json.loads(base64.b64decode(writes[0]["content"]))["resources"], rows)

    def test_outage_preserves_local_json_and_records_failure(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            target = root / "resources.json"
            target.write_bytes(b"last good file")
            config = root / "config.json"
            config.write_bytes(sync.encode_json(self.config))
            with patch.object(sync, "HERE", root), patch.object(sync, "configure_logging"), \
                    patch.object(sync, "load_secret", return_value="secret"), \
                    patch.object(sync, "fetch_records", side_effect=sync.SyncError("Airtable unavailable")):
                code = sync.main(["--config", str(config), "--runtime", str(root)])
            self.assertEqual(code, 1)
            self.assertEqual(target.read_bytes(), b"last good file")
            self.assertEqual(sync.read_json(root / "health.json")["consecutiveFailures"], 1)

    def test_alert_staleness_failures_and_recovery(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            old = (datetime.now(timezone.utc) - timedelta(hours=25)).isoformat()
            state = {"lastSuccessAt": old, "consecutiveFailures": 0}
            self.assertFalse(sync.check_health(self.config, root, state))
            self.assertTrue((root / "READ-SYNC-ALERT.txt").exists())
            state.update(lastSuccessAt=sync.utc_now(), consecutiveFailures=3)
            self.assertFalse(sync.check_health(self.config, root, state))
            sync.update_health(root, state)
            self.assertTrue(sync.check_health(self.config, root, state))
            self.assertFalse((root / "READ-SYNC-ALERT.txt").exists())

    def test_committed_snapshot_and_napier_acceptance(self):
        document = sync.read_json(sync.HERE / "resources.json")
        sync.validate_resources(document["resources"])
        books = [r for r in document["resources"] if r["category"] in {"manual", "book"}]
        indices = [i for i, r in enumerate(books) if r["creator"] == "Mick Napier"]
        self.assertEqual(len(indices), 2)
        self.assertEqual(indices[1], indices[0] + 1)
        self.assertIn("/dp/1566081998", books[indices[1]]["amazonUrl"])


if __name__ == "__main__":
    unittest.main()
