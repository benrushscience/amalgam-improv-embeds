"""Media sync regression tests v1; controlled API fixtures never mutate Airtable."""
import base64
from copy import deepcopy
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
from urllib.parse import parse_qs, urlsplit

import sync_media_resources as sync


def record(kind, number=1, **changes):
    fields = {"Name": "Example", "Public": True, "Publication Status": "Active", "Sort Order": number}
    if kind == "watch":
        fields.update({"YouTube Channel ID": f"UC{number:022d}", "improv_video_type": ["Set"]})
    else:
        fields.update({"Category": "Learning + Resources", "Feed URL": f"https://example.com/{number}/rss"})
    fields.update(changes)
    return {"id": f"rec{number:014d}", "fields": fields}


class MediaSyncTests(unittest.TestCase):
    def config(self, kind):
        config = sync.common.read_json(sync.HERE / kind / "sync-config.example.json")
        config.update(minimumTotalRecords=1, minimumPublicRecords=1)
        return config

    def test_pagination_and_private_field_allowlist(self):
        for kind in sync.FIELDS:
            calls = []
            def request(url, token):
                calls.append(parse_qs(urlsplit(url).query))
                if len(calls) == 1:
                    return {"records": [record(kind, i) for i in range(1, 101)], "offset": "page/2"}
                return {"records": [record(kind, 101)]}
            rows = sync.fetch_records(kind, self.config(kind), "secret", request)
            self.assertEqual(len(rows), 101)
            self.assertEqual(calls[1]["offset"], ["page/2"])
            self.assertNotIn("Internal Notes", calls[0]["fields[]"])

    def test_duplicate_id_and_repeated_cursor_fail(self):
        for kind in sync.FIELDS:
            for response in ({"records": [record(kind), record(kind)]},
                             {"records": [record(kind)], "offset": "repeat"}):
                with self.assertRaises(sync.common.SyncError):
                    sync.fetch_records(kind, self.config(kind), "secret", lambda *args: response)

    def test_public_active_gate_and_watch_review(self):
        for kind in sync.FIELDS:
            records = [record(kind, 1), record(kind, 2, Public=False),
                       record(kind, 3, **{"Publication Status": "Retired"}), record(kind, 4, Public="true")]
            if kind == "watch":
                records.append(record(kind, 5, improv_video_type=[]))
            rows = sync.normalize_records(kind, records)
            self.assertEqual([r["id"] for r in rows], [record(kind)["id"]])

    def test_select_normalization_decimal_zero_and_ties(self):
        rows = sync.normalize_records("watch", [record("watch", 3, **{"Sort Order": 10.5}),
                                                record("watch", 2, **{"Sort Order": 0}),
                                                record("watch", 1, improv_video_type=[{"name": "Set"}, {"name": "Short"}], **{"Sort Order": 0})])
        self.assertEqual([r["sortOrder"] for r in rows], [0, 0, 10.5])
        self.assertEqual(rows[0]["id"], record("watch")["id"])
        self.assertEqual(rows[0]["improvVideoType"], ["Set", "Short"])

    def test_invalid_urls_categories_ids_and_order(self):
        examples = [("watch", {"YouTube Channel ID": "bad"}), ("watch", {"improv_video_type": ["unknown"]}),
                    ("watch", {"Channel URL": "javascript:alert(1)"}), ("listen", {"Feed URL": ""}),
                    ("listen", {"Category": "unknown"}), ("listen", {"Artwork URL": 'https://example.com/"bad'}),
                    ("listen", {"Sort Order": float("nan")})]
        for kind, changes in examples:
            with self.subTest(kind=kind, changes=changes), self.assertRaises(sync.common.SyncError):
                sync.normalize_records(kind, [record(kind, **changes)])

    def test_duplicate_source_fails(self):
        for kind in sync.FIELDS:
            key = "YouTube Channel ID" if kind == "watch" else "Feed URL"
            with self.assertRaises(sync.common.SyncError):
                sync.normalize_records(kind, [record(kind), record(kind, 2, **{key: record(kind)["fields"][key]})])

    def test_unchanged_catalog_creates_no_commit(self):
        for kind in sync.FIELDS:
            rows = sync.normalize_records(kind, [record(kind)])
            doc = sync.make_document(kind, self.config(kind), rows, 1)
            calls = []
            def request(url, token, **kwargs):
                calls.append(kwargs)
                return {"sha": "old", "content": base64.b64encode(sync.common.encode_json(doc)).decode()}
            returned, status = sync.publish(kind, self.config(kind), "secret", rows, 1, request=request)
            self.assertEqual(status, "unchanged")
            self.assertEqual(returned, doc)
            self.assertEqual(len(calls), 1)

    def test_add_edit_and_unpublish_commit_expected_content(self):
        for kind in sync.FIELDS:
            original = sync.normalize_records(kind, [record(kind), record(kind, 2)])
            config = self.config(kind)
            config["maximumDropFraction"] = 0.6  # Allow this fixture's intentional 50% removal.
            doc = sync.make_document(kind, config, original, 2)
            for inputs in ([record(kind), record(kind, 2), record(kind, 3)],
                           [record(kind, Name="Changed"), record(kind, 2)],
                           [record(kind), record(kind, 2, Public=False)]):
                writes = []
                def request(url, token, **kwargs):
                    if kwargs.get("method") == "PUT":
                        writes.append(kwargs["body"])
                        return {"commit": {"sha": "new"}}
                    return {"sha": "old", "content": base64.b64encode(sync.common.encode_json(doc)).decode()}
                rows = sync.normalize_records(kind, inputs)
                _, status = sync.publish(kind, config, "secret", rows, len(inputs), request=request)
                self.assertEqual(status, "new")
                self.assertEqual(writes[0]["sha"], "old")
                self.assertEqual(json.loads(base64.b64decode(writes[0]["content"]))["resources"], rows)

    def test_concurrent_publication_rereads_after_conflict(self):
        rows = sync.normalize_records("listen", [record("listen")])
        calls = []
        def request(url, token, **kwargs):
            method = kwargs.get("method", "GET")
            calls.append(method)
            if method == "GET":
                return None
            if calls.count("PUT") == 1:
                raise sync.common.SyncError("api.github.com returned HTTP 409")
            return {"commit": {"sha": "new"}}
        with patch.object(sync.time, "sleep"):
            _, status = sync.publish("listen", self.config("listen"), "secret", rows, 1, request=request)
        self.assertEqual(status, "new")
        self.assertEqual(calls, ["GET", "PUT", "GET", "PUT"])

    def test_suspicious_count_blocks_publication(self):
        rows = sync.normalize_records("listen", [record("listen")])
        with self.assertRaises(sync.common.SyncError):
            sync.common.validate_counts(self.config("listen"), 1, rows, {"resources": rows * 10}, 10)

    def test_outage_keeps_last_good_file(self):
        for kind in sync.FIELDS:
            with tempfile.TemporaryDirectory() as temp:
                root = Path(temp)
                folder = root / kind
                folder.mkdir()
                target = folder / "resources.json"
                target.write_bytes(b"last good catalog")
                config = folder / "sync-config.example.json"
                config.write_bytes(sync.common.encode_json(self.config(kind)))
                with patch.object(sync, "HERE", root), patch.object(sync.common, "load_secret", return_value="secret"), \
                        patch.object(sync, "fetch_records", side_effect=sync.common.SyncError("Airtable unavailable")):
                    code = sync.main(["--kind", kind])
                self.assertEqual(code, 1)
                self.assertEqual(target.read_bytes(), b"last good catalog")
                self.assertEqual(sync.common.read_json(folder / f".{kind}-sync" / "health.json")["consecutiveFailures"], 1)

    def test_public_snapshots_validate(self):
        for kind in sync.FIELDS:
            doc = sync.common.read_json(sync.HERE / kind / "resources.json")
            self.assertEqual(doc["kind"], kind)
            sync.validate_resources(kind, doc["resources"])
            self.assertTrue(all("Internal Notes" not in row for row in doc["resources"]))


if __name__ == "__main__":
    unittest.main()
