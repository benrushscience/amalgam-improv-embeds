# Amalgam Listen resources task registration v1: match existing signed-in-user tasks.
[CmdletBinding()]
param()
$ErrorActionPreference = 'Stop'

# Resolve the launcher and dedicated Python runtime using absolute paths.
$taskName = 'Amalgam - Listen Resources Sync'
$launcher = Join-Path $PSScriptRoot 'amalgam-listen-resources-sync.py'
$resourceFolder = Join-Path $env:USERPROFILE 'Documents/Amalgam Improv/Website/amalgam-improv-embeds/aggregator-resources/listen'
$python = Join-Path (Split-Path $resourceFolder -Parent) 'read/.read-sync/python-env/Scripts/pythonw.exe'
foreach ($requiredPath in @($launcher, $python)) {
    if (-not (Test-Path -LiteralPath $requiredPath -PathType Leaf)) { throw "Required file missing: $requiredPath" }
}
if ((Get-TimeZone).Id -ne 'Central Standard Time') {
    throw 'This task expects Central Standard Time (America/Chicago) on this desktop.'
}
$currentUser = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
$action = New-ScheduledTaskAction -Execute $python -Argument ('"{0}"' -f $launcher) -WorkingDirectory $PSScriptRoot

# Run daily at 3 AM and after sign-in; a short delay lets networking settle.
$daily = New-ScheduledTaskTrigger -Daily -At ([datetime]::Today.AddHours(3))
# Omit a UTC offset so 3 AM stays local when daylight saving time changes.
$daily.StartBoundary = ([datetime]::Today.AddHours(3)).ToString('s')
$signIn = New-ScheduledTaskTrigger -AtLogOn -User $currentUser
$signIn.Delay = 'PT1M'
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -MultipleInstances IgnoreNew `
    -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries `
    -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 10) `
    -ExecutionTimeLimit (New-TimeSpan -Minutes 15)
$principal = New-ScheduledTaskPrincipal -UserId $currentUser -LogonType Interactive -RunLevel Limited
$task = New-ScheduledTask -Action $action -Trigger @($daily, $signIn) -Settings $settings `
    -Principal $principal -Description 'Sync Airtable Listen resources to GitHub daily at 3 AM and after sign-in; catch up missed runs; battery power allowed. Reports are beside the Scheduled Tasks script.'
Register-ScheduledTask -TaskName $taskName -TaskPath '\' -InputObject $task -Force | Out-Null
Write-Output "Registered $taskName for 3 AM daily and one minute after sign-in, with missed-run recovery and battery operation."
