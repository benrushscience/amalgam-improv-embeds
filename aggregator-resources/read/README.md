# Read resources: Airtable to GitHub Pages

The Read page fetches `./resources.json` on its own origin. Airtable remains the
source of truth. The Python sync retrieves every REST API page, exports only
records whose **Public checkbox is true** and **Publication Status is Active**,
and updates GitHub `main` only when normalized resource contents change.
No credentials, internal notes, or unpublished records appear in the public JSON.

## Files and data contract

- `sync_read_resources.py`: standard-library Python ingestion, validation, publication, and health checks.
- `resources.json`: schema version 1, source metadata, content-change timestamp, and public resources.
- `index.html`: cards, cover loading, scrolling, and searchable Reference Table.
- `sync-config.example.json`: credential-free configuration and record-count safety limits.
- `install-read-sync.ps1`: encrypted local credential setup and Windows Task Scheduler installation.
- `test_sync_read_resources.py`: network-independent regression and snapshot acceptance tests.

The public fields are `id`, `title`, `creator`, `category`, `format`, `access`,
`description`, `isbn`, `coverUrl`, `sourceUrl`, `sourceLabel`, `amazonUrl`, and
numeric `sortOrder`. Categories are `book`, `manual`, `blog`, and `applied`;
access is `free`, `freemium`, or `purchase`. IDs are original Airtable IDs.
Sort order is numeric (including zero and decimals), with record ID as a stable
tie breaker. Manuals and books share a single sorted Books carousel.

`contentUpdatedAt` means the resources **changed**, not that the last sync ran.
Successful unchanged runs update local health only, avoiding timestamp-only commits.
Source record-count metadata describes the snapshot when content last changed.

The browser saves validated JSON locally for temporary outages. A saved copy is
accepted for at most 24 hours after it was fetched, and the page clearly labels
it as a fallback that may be out of date. Without a usable copy it shows an
unavailable message. There is no hand-maintained fallback list or Airtable scraping.

## Install on Windows

Requirements: Python 3.10+, Windows PowerShell 5.1, a working internet connection,
and a GitHub token with repository Contents write permission. The existing `gh`
login can supply the initial token. The Airtable PAT needs records read access
to base `appvJnNJbdcXwWSho`. The host timezone must be Central Standard Time
(Windows equivalent of America/Chicago, with daylight saving adjustment).

From the repository root, run this once in **an elevated PowerShell window**:

```powershell
# Read sync installation v1
& './aggregator-resources/read/install-read-sync.ps1' -AirtableTokenFile 'C:/path/to/your/airtable-token.txt'
```

Alternatively, supply `AIRTABLE_PAT` and `GITHUB_TOKEN` as process environment
variables. Do not put token values in script arguments, tracked configuration, or
shell history. `-CredentialsOnly` prepares storage and Python without registering tasks.

The installer creates an ignored `.read-sync` directory, a Python virtual
environment, a local configuration copy, and encrypted DPAPI credential files.
Its ACL grants access only to the installing user, SYSTEM, and Administrators.
Machine-scope DPAPI permits unattended S4U tasks to decrypt without storing the
Windows account password; file permissions are essential and must be preserved.
These files cannot be transferred to another computer as usable credentials.
The original credential file is not modified. Re-run with environment variables
to rotate credentials. Prefer narrowly scoped tokens for long-term operation.

Tasks installed under the current user with S4U (runs without an interactive login):

- **Amalgam Read Resources Sync**: midnight, 4 AM, 8 AM, noon, 4 PM, 8 PM, and startup.
- **Amalgam Read Resources Health**: every hour at :30 and startup.

Both run missed tasks when available, reject concurrent task instances, allow
battery operation, retry failures three times at ten-minute intervals, and stop
after 15 minutes. A process-level lock also protects manual runs. They cannot run
while the computer is off. Installation requires Windows administrator elevation;
Codex sandbox permission alone does not provide Windows elevation.

## Manual use and verification

From the repository root:

```powershell
# Read sync manual run v1
$readFolder = Join-Path (Get-Location) 'aggregator-resources/read'
& "$readFolder/.read-sync/python-env/Scripts/python.exe" "$readFolder/sync_read_resources.py" --config "$readFolder/.read-sync/sync-config.json"
```

Add `--local-only` to fetch and validate locally without writing GitHub. Local-only
runs do not mark the publishing health check successful. Add `--check-health` to
check freshness without making API requests.

```powershell
# Read sync regression tests v1
python -m unittest discover -s aggregator-resources/read -p 'test_*.py' -v

# Read sync task verification v1
Start-ScheduledTask -TaskName 'Amalgam Read Resources Sync'
Get-ScheduledTaskInfo -TaskName 'Amalgam Read Resources Sync'
Get-Content './aggregator-resources/read/.read-sync/health.json'
```

A completed task result of 0 and a recent `lastSuccessAt` confirm success.
GitHub Pages must finish its deployment before the new JSON is publicly served.
The sync writes through the GitHub Contents API with the existing blob SHA,
so a concurrent writer causes a safe failure instead of an overwrite. It never
stages, commits, pulls, or pushes unrelated checkout edits. Its successful remote
write is then copied to the local JSON; local Git status may show that data change.

## Monitoring and recovery

Local `read-sync.log` records start/finish time, fetched and public counts,
commit SHA or `unchanged`, and sanitized errors. Logs rotate daily and retain
35 rotated files (at least 30 days). `health.json` tracks the last successful
publication check, counts, consecutive failures, and last error. Failures return
exit code 1 so Task Scheduler records and retries them.

The independent health task returns failure and writes `READ-SYNC-ALERT.txt`
when the last successful sync is older than 24 hours or three consecutive runs
fail. The next successful sync clears the alert. The engine writes a local file / Task Scheduler alert. The desktop launcher now also emails ben@deeperthandata.media on failure; an independent hourly monitor checks for more than 36 hours without a successful sync. It does not notify anyone
while the computer is powered off.

The initial verified table contained 127 records, of which 104 were Public/Active.
The example safety floors are 100 total and 30 public records; a greater than
20% decrease from the previous successful total or public count also blocks
publication. Invalid IDs, duplicate IDs, required fields, unsafe URLs, unsupported
categories/access, invalid numeric sort order, and incomplete pagination block it.
Failed reads and validation preserve the prior JSON. Never lower these limits just
to suppress an unexplained failure. For an intentional bulk removal, confirm the
new Airtable counts, adjust the ignored local configuration, run manually, then
restore an appropriate floor. For authorization failures, rotate the appropriate
credential and rerun. For a GitHub conflict, rerun to read the latest blob SHA.

The tests simulate creation, edits, unpublishing, pagination, and outages without
changing production Airtable records. Snapshot checks verify adjacent Mick Napier
books and the second book's Amazon ASIN `1566081998`.

API references: [Airtable pagination](https://support.airtable.com/articles/6292134965-getting-started-with-airtable-s-web-api),
[GitHub Contents API](https://docs.github.com/en/rest/repos/contents?apiversion=2022-11-28).

The current desktop uses the 3 AM / after-sign-in launcher in Scheduled Tasks. See [email alert setup](../scheduled-tasks/resource-sync-email-alerts.md) for the shared Read, Watch, and Listen email monitor, deduplication, and recovery behavior.
