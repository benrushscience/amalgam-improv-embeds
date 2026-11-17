# Amalgam Listen Resources Sync

Entry point: `amalgam-listen-resources-sync.py` in this folder.
Task name: **Amalgam - Listen Resources Sync**.

Runs at 3 AM Central daily, one minute after sign-in, and catches missed runs.
Runs on battery and continues when unplugged. Requires a signed-in Windows account;
a locked desktop is fine. Does not wake the PC. Retries three times, ten minutes apart.

Reports: `amalgam-listen-resources-sync-reports/latest-report.txt`, plus 35 days of
history. Exit 0 means success; nonzero means failure. No email is sent.

Uses the maintained repository script `aggregator-resources/sync_media_resources.py`
with `--kind listen`, the existing Read Python environment and encrypted credentials,
and separate `listen/.listen-sync/sync-config.json` and health/log files.
Keep the checkout at `C:/Users/benja/Documents/Amalgam Improv/Website/amalgam-improv-embeds`.

Manual run: invoke this .py with `C:/Python314/python.exe`. Optional `--local-only`
validates without publishing; `--check-health` checks last production success.
Re-register with `amalgam-listen-resources-sync-task-registration.ps1` in this folder.

[Published JSON](https://github.com/benrushscience/amalgam-improv-embeds/blob/main/aggregator-resources/listen/resources.json).
