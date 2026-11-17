"""Resource alert regression tests v1: simulated failures; no live email or sync writes."""
from datetime import datetime, timedelta, timezone
from email import message_from_bytes
import base64
import importlib.util
import io
from pathlib import Path
import tempfile
import subprocess
import unittest
from unittest.mock import patch

import amalgam_resource_sync_alerts as alerts


class AlertTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.clock = datetime(2026, 11, 17, 6, tzinfo=timezone.utc)
        self.sent = []
        for name, value in {"SCRIPT_DIRECTORY": self.root / "tasks", "ALERT_DIRECTORY": self.root / "alerts",
                            "REPOSITORY": self.root / "repo"}.items():
            patcher = patch.object(alerts, name, value)
            patcher.start()
            self.addCleanup(patcher.stop)

    def health(self, kind, age=1, failures=0):
        alerts.atomic_json(alerts.REPOSITORY / "aggregator-resources" / kind / f".{kind}-sync" / "health.json",
                           {"lastSuccessAt": (self.clock - timedelta(hours=age)).isoformat(), "consecutiveFailures": failures})

    def sender(self, subject, body):
        self.sent.append((subject, body))
        return "test-message-id"

    def check(self, kind="read", **kwargs):
        return alerts.evaluate(kind, current_time=self.clock, sender=self.sender, **kwargs)

    def test_fresh_success_never_sends_for_all_three(self):
        for kind in alerts.KINDS:
            self.health(kind)
            self.assertTrue(self.check(kind)["healthy"])
        self.assertEqual(self.sent, [])

    def test_failure_alerts_deduplicate_retries(self):
        for kind in alerts.KINDS:
            self.health(kind, failures=1)
            self.assertEqual(self.check(kind)["email"], "sent")
            self.assertEqual(self.check(kind)["email"], "deduplicated")
        self.assertEqual(len(self.sent), 3)

    def test_strict_36_hour_boundary(self):
        self.health("read", age=36)
        self.assertTrue(self.check()["healthy"])
        self.clock += timedelta(seconds=1)
        self.assertEqual(self.check()["email"], "sent")
        self.assertIn("more than 36 hours", self.sent[0][1])

    def test_missing_or_malformed_health_is_overdue(self):
        self.assertEqual(self.check()["email"], "sent")
        self.assertIn("No successful production", self.sent[0][1])
        path = alerts.REPOSITORY / "aggregator-resources/watch/.watch-sync/health.json"
        path.parent.mkdir(parents=True)
        path.write_text("not JSON")
        self.assertEqual(self.check("watch")["email"], "sent")

    def test_launcher_failure_alert_even_with_fresh_engine_health(self):
        self.health("read")
        path = alerts.SCRIPT_DIRECTORY / "amalgam-read-resources-sync-reports/run-status.json"
        alerts.atomic_json(path, {"finishedAt": self.clock.isoformat(), "exitCode": 1})
        self.assertEqual(self.check()["email"], "sent")
        self.assertIn("launcher run failed", self.sent[0][1])

    def test_scheduler_startup_failure_and_running_status(self):
        self.health("read")
        task = {"state": "Running", "result": 0x41301, "lastRun": self.clock.isoformat()}
        self.assertTrue(self.check(scheduler=task)["healthy"])
        task.update(state="Ready", result=0x80070002)
        self.assertEqual(self.check(scheduler=task)["email"], "sent")
        self.assertIn("Windows reported", self.sent[0][1])

    def test_old_task_failure_does_not_override_newer_success(self):
        self.health("read")
        task = {"state": "Ready", "result": 1, "lastRun": (self.clock - timedelta(hours=2)).isoformat()}
        self.assertTrue(self.check(scheduler=task)["healthy"])

    def test_recovery_resets_incident(self):
        self.health("read", failures=1)
        self.check()
        self.health("read", age=0, failures=0)
        self.assertTrue(self.check()["healthy"])
        self.health("read", age=0, failures=1)
        self.assertEqual(self.check()["email"], "sent")
        self.assertEqual(len(self.sent), 2)

    def test_daily_reminder_and_stale_escalation(self):
        self.health("read", age=12, failures=1)
        self.check()
        self.clock += timedelta(hours=23)
        self.assertEqual(self.check()["email"], "deduplicated")
        self.clock += timedelta(hours=1)
        self.assertEqual(self.check()["email"], "sent")
        self.clock += timedelta(seconds=1)
        self.assertEqual(self.check()["email"], "sent")  # First overdue notice.

    def test_failed_delivery_is_retried(self):
        self.health("read", failures=1)
        def fail(*args):
            raise OSError("secret must not enter state or email")
        with self.assertRaises(alerts.AlertError):
            alerts.evaluate("read", current_time=self.clock, sender=fail)
        state = (alerts.ALERT_DIRECTORY / "read-alert-state.json").read_text()
        self.assertNotIn("secret", state)
        self.assertNotIn("lastSentAt", state)
        self.assertEqual(self.check()["email"], "sent")

    def test_dry_run_sends_nothing_and_does_not_suppress_real_alert(self):
        self.health("read", age=37)
        self.assertEqual(self.check(dry_run=True)["email"], "would send")
        self.assertFalse((alerts.ALERT_DIRECTORY / "read-alert-state.json").exists())
        self.assertEqual(self.sent, [])
        self.assertEqual(self.check()["email"], "sent")

    def test_email_transport_has_expected_recipient_and_body(self):
        with patch.object(alerts, "authenticated_profile", return_value=("not-a-real-token", alerts.RECIPIENT)), \
                patch.object(alerts, "request_json", return_value={"id": "confirmed"}) as request:
            self.assertEqual(alerts.send_email("Failure subject", "Safe alert body"), "confirmed")
        message = message_from_bytes(base64.urlsafe_b64decode(request.call_args.kwargs["body"]["raw"]))
        self.assertEqual(message["To"], "ben@deeperthandata.media")
        self.assertEqual(message["Subject"], "Failure subject")
        self.assertIn("Safe alert body", message.get_payload())
        self.assertNotIn("not-a-real-token", str(message))

    def test_launchers_notify_for_failure_but_not_local_only(self):
        for kind in alerts.KINDS:
            path = Path(__file__).parent / f"amalgam-{kind}-resources-sync.py"
            spec = importlib.util.spec_from_file_location("launcher_" + kind, path)
            launcher = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(launcher)
            for local_only in (False, True):
                dummy = self.root / "present-file"
                dummy.touch()
                with patch.object(launcher, "PYTHON_EXECUTABLE", dummy), \
                        patch.object(launcher, "SYNC_SCRIPT", dummy), \
                        patch.object(launcher, "CONFIGURATION", dummy), \
                        patch.object(launcher, "RUNTIME_DIRECTORY", self.root), \
                        patch.object(launcher, "save_report"), \
                        patch.object(launcher.subprocess, "run", return_value=subprocess.CompletedProcess([], 1, "", "safe failure")), \
                        patch.object(launcher.sync_alerts, "record_run", return_value={"email": "sent"}) as notify, \
                        patch.object(launcher.sys, "argv", [str(path)] + (["--local-only"] if local_only else [])), \
                        patch.object(launcher.sys, "stdout", io.StringIO()):
                    self.assertEqual(launcher.main(), 1)
                    self.assertEqual(notify.call_count, 0 if local_only else 1)
                    if not local_only:
                        self.assertEqual(notify.call_args.args[:2], (kind, 1))


if __name__ == "__main__":
    unittest.main()
