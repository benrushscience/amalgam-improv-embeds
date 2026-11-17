# Resource sync monitor task registration v1: hourly freshness checks and sign-in catch-up.
[CmdletBinding()]
param()
$ErrorActionPreference = 'Stop'
$name = 'Amalgam - Resource Sync Email Monitor'
$script = Join-Path $PSScriptRoot 'amalgam-resource-sync-monitor.py'
$python = Join-Path $env:USERPROFILE 'Documents/Amalgam Improv/Website/amalgam-improv-embeds/aggregator-resources/read/.read-sync/python-env/Scripts/pythonw.exe'
foreach ($path in @($script, $python)) {
    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) { throw "Missing required file: $path" }
}
$currentUser = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
$action = New-ScheduledTaskAction -Execute $python -Argument ('"{0}"' -f $script) -WorkingDirectory $PSScriptRoot

# Hourly checks also run after a missed trigger, without depending on a sync run.
$hourly = New-ScheduledTaskTrigger -Once -At ([datetime]::Today) `
    -RepetitionInterval (New-TimeSpan -Hours 1)
$hourly.StartBoundary = ([datetime]::Today).ToString('s')
$signIn = New-ScheduledTaskTrigger -AtLogOn -User $currentUser
$signIn.Delay = 'PT5M'
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -MultipleInstances IgnoreNew `
    -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries `
    -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 10) `
    -ExecutionTimeLimit (New-TimeSpan -Minutes 10)
$principal = New-ScheduledTaskPrincipal -UserId $currentUser -LogonType Interactive -RunLevel Limited
$task = New-ScheduledTask -Action $action -Trigger @($hourly, $signIn) -Settings $settings -Principal $principal `
    -Description 'Email ben@deeperthandata.media for failed Read/Watch/Listen syncs or no successful sync in over 36 hours. Hourly and after sign-in; battery allowed; repeated incident emails limited to daily.'
Register-ScheduledTask -TaskName $name -InputObject $task -Force | Out-Null
Write-Output "Registered $name hourly and five minutes after sign-in, with battery operation and missed-run recovery."
