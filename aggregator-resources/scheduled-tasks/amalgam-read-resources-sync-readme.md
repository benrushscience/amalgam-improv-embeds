# Amalgam Read Resources Sync

Windows task: **Amalgam - Read Resources Sync**.

- Runs daily at **3:00 AM America/Chicago**, following the desktop's Central timezone and daylight saving changes.
- Runs again **one minute after Ben signs in**, including after startup.
- Catches missed scheduled runs when Windows can run the task.
- Runs on battery and continues if AC power is disconnected.
- Uses the same signed-in-user setup as the existing Buffer and API health tasks. A locked screen is fine; a signed-out account cannot run it.
- Does not wake a sleeping computer. It cannot run while powered off.
- Prevents overlapping instances and retries failures three times at ten-minute intervals.
- Runs without a console window and stops after 15 minutes.

`amalgam-read-resources-sync.py` is the scheduled entry point. It invokes the
maintained sync engine in
`C:\Users\benja\Documents\Amalgam Improv\Website\amalgam-improv-embeds\aggregator-resources\read\sync_read_resources.py`
using the dedicated Python environment and encrypted credentials already set up
in that folder's ignored `.read-sync` directory. Keep that checkout at its current
location. There is no second copy of the ingestion logic to keep synchronized.

The engine reads all Airtable pages, exports only Public/Active records, validates
the result, and updates GitHub only when content changes. Failure preserves the
previous JSON. Source: base `appvJnNJbdcXwWSho`, table `tblCqeDj48Bf6qNT9`.

Published file: [resources.json on GitHub](https://github.com/benrushscience/amalgam-improv-embeds/blob/main/aggregator-resources/read/resources.json).

Reports are in the sibling `amalgam-read-resources-sync-reports` folder:
`latest-report.txt` plus timestamped reports retained for 35 days. Detailed logs,
health, and failure alerts stay in the engine's `.read-sync` folder. Failures and more-than-36-hour stale syncs email ben@deeperthandata.media. Task Scheduler receives a nonzero exit code when the sync fails.

Manual run:

```powershell
# Read resource manual run v1
& 'C:\Python314\python.exe' 'C:\Users\benja\Desktop\Amalgam Automation Hub\Scheduled Tasks\amalgam-read-resources-sync.py'
```

Optional arguments: `--local-only` fetches and validates without publishing;
`--check-health` checks the last production success without making API calls.

Re-register the same task (does not create a duplicate):

```powershell
# Read resource task registration v1
& 'C:\Users\benja\Desktop\Amalgam Automation Hub\Scheduled Tasks\amalgam-read-resources-sync-task-registration.ps1'
```

This daily task supersedes the earlier proposed four-hour schedule. The earlier
`install-read-sync.ps1` in the repository is not the registration script for this
desktop setup. The local stale-health threshold is 36 hours, providing a 12-hour
grace period beyond the daily cadence. Earlier absolute and relative record-count
guards remain in place.

Email monitoring and retry behavior are documented in `resource-sync-email-alerts.md` beside this file.
