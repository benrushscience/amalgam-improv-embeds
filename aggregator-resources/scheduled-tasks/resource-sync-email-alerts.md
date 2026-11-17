# Read, Watch, and Listen email alerts

Recipient and sending account: **ben@deeperthandata.media**, matching the other
Amalgam Automation Hub scheduled-task alerts.

Each production launcher records its completion in its report folder's
`run-status.json` and immediately checks whether an email is needed. It alerts on
a nonzero exit, missing engine/runtime files, or a launcher timeout. Local-only
previews and manual `--check-health` commands do not send email.

**Amalgam - Resource Sync Email Monitor** independently checks all three syncs
hourly and five minutes after sign-in. It examines both local health and Windows
task results, catching failed launches, disabled/missing tasks, and any sync with
no successful production completion for **more than 36 hours**. Unchanged-data
production runs count as successful; the JSON content-change timestamp is not
used to determine freshness. Missing or invalid health data counts as overdue.
Threshold crossing is detected at the next hourly check, or after catch-up.

The monitor follows the existing signed-in-account setup, runs on battery, keeps
running when unplugged, and catches missed checks when available. It does not
wake the computer. It cannot send while the desktop is off, signed out, or offline;
checks and delivery retries resume when it can run with network access.

## Repeated failures and recovery

- Send once when an incident begins.
- Suppress duplicate emails from launcher/monitor overlap and automatic retries.
- Send a new notice if a failure becomes more than 36 hours overdue.
- Remind once per 24 hours while an incident remains unresolved.
- A successful sync resets the incident; the next failure alerts again.
- If Gmail fails, leave the notification pending and retry on a subsequent monitor
  run. Gmail sends are not blindly retried within a request because delivery may
  have succeeded despite a lost response. A later retry can duplicate an ambiguously
  delivered message; local state is marked sent only after Gmail confirms it.

Email contains the sync name, failure/overdue reason, last success time in UTC,
and paths to local reports. It does not include credentials, provider response
bodies, raw exception messages, or Airtable records.

## Local files and maintenance

Install `amalgam_resource_sync_alerts.py`, `amalgam-resource-sync-monitor.py`, and
the monitor registration script beside the three updated launchers in
`C:/Users/benja/Desktop/Amalgam Automation Hub/Scheduled Tasks`.

The helper reads the existing `google_access_token.json` one directory above.
It refreshes the access token in memory when required and checks the Google
account before sending. It never copies secrets into the repository or changes
the shared credential file. The Gmail API uses the
[documented message send endpoint](https://developers.google.com/workspace/gmail/api/guides/sending).

`amalgam-resource-sync-alert-reports` contains per-sync deduplication state,
`latest-monitor-report.json`, and 35 days of timestamped monitor reports.
The individual sync report folders retain their existing run reports.

Manual commands from the Scheduled Tasks folder:

```powershell
# Resource email monitor v1
& 'C:/Python314/python.exe' './amalgam-resource-sync-monitor.py' --dry-run
& 'C:/Python314/python.exe' './amalgam-resource-sync-monitor.py' --verify-email
& 'C:/Python314/python.exe' './amalgam-resource-sync-monitor.py'
& './amalgam-resource-sync-monitor-task-registration.ps1'
```

`--dry-run` evaluates real health without sending or modifying deduplication
state. `--verify-email` checks OAuth/account access without sending a message.
The normal monitor exits nonzero for unhealthy syncs or a monitoring/delivery
error so Windows records and retries the check. A deduplicated ongoing incident
still returns a nonzero monitor result. A healthy run sends no email.

Regression tests use temporary health fixtures and a mocked email sender to
exercise failure detection, stale boundaries, retries, recovery, and message
formatting without generating false production alerts:

```powershell
# Resource alert regression tests v1
python -m unittest discover -s aggregator-resources/scheduled-tasks -p 'test_resource_sync_alerts.py' -v
```
