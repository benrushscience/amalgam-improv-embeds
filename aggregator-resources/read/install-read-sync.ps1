# Install Read resource sync v1 with encrypted credentials and unattended tasks.
[CmdletBinding()]
param(
    [string]$AirtableTokenFile,
    [switch]$CredentialsOnly
)
$ErrorActionPreference = 'Stop'
$runtime = Join-Path $PSScriptRoot '.read-sync'
$taskName = 'Amalgam Read Resources Sync'
$healthTaskName = 'Amalgam Read Resources Health'
$userSid = [System.Security.Principal.WindowsIdentity]::GetCurrent().User.Value

# Restrict local runtime files before writing any secrets. SYSTEM and admins can recover them.
New-Item -ItemType Directory -Path $runtime -Force | Out-Null
$acl = New-Object System.Security.AccessControl.DirectorySecurity
$acl.SetAccessRuleProtection($true, $false)
foreach ($sid in @($userSid, 'S-1-5-18', 'S-1-5-32-544')) {
    $identity = New-Object System.Security.Principal.SecurityIdentifier($sid)
    $rule = New-Object System.Security.AccessControl.FileSystemAccessRule(
        $identity, 'FullControl', 'ContainerInherit,ObjectInherit', 'None', 'Allow')
    $acl.AddAccessRule($rule)
}
Set-Acl -LiteralPath $runtime -AclObject $acl
Add-Type -AssemblyName System.Security

function Save-ProtectedToken([string]$Name, [string]$Value) {
    if ([string]::IsNullOrWhiteSpace($Value)) { throw "Missing $Name" }
    # Machine scope allows S4U tasks to decrypt without storing the Windows account password.
    $bytes = [Text.Encoding]::UTF8.GetBytes($Value.Trim())
    try {
        $encrypted = [Security.Cryptography.ProtectedData]::Protect(
            $bytes, $null, [Security.Cryptography.DataProtectionScope]::LocalMachine)
        [IO.File]::WriteAllText((Join-Path $runtime "$Name.dpapi"), [Convert]::ToBase64String($encrypted))
    } finally { [Array]::Clear($bytes, 0, $bytes.Length) }
}

# Import existing credentials without printing them or putting them in command arguments.
if ($AirtableTokenFile) {
    Save-ProtectedToken 'AIRTABLE_PAT' ([IO.File]::ReadAllText($AirtableTokenFile))
} elseif ($env:AIRTABLE_PAT) {
    Save-ProtectedToken 'AIRTABLE_PAT' $env:AIRTABLE_PAT
} elseif (-not (Test-Path (Join-Path $runtime 'AIRTABLE_PAT.dpapi'))) {
    throw 'Supply -AirtableTokenFile or AIRTABLE_PAT for initial setup.'
}
if ($env:GITHUB_TOKEN) {
    Save-ProtectedToken 'GITHUB_TOKEN' $env:GITHUB_TOKEN
} elseif (-not (Test-Path (Join-Path $runtime 'GITHUB_TOKEN.dpapi'))) {
    $githubToken = & gh auth token 2>$null
    if ($LASTEXITCODE -ne 0) { throw 'Run gh auth login, then retry installation.' }
    Save-ProtectedToken 'GITHUB_TOKEN' $githubToken
    $githubToken = $null
}

# Use a dedicated standard-library-only virtual environment with absolute paths.
$python = Join-Path $runtime 'python-env/Scripts/python.exe'
if (-not (Test-Path $python)) {
    & python -m venv (Join-Path $runtime 'python-env')
    if ($LASTEXITCODE -ne 0) { throw 'Virtual environment creation failed.' }
}
$config = Join-Path $runtime 'sync-config.json'
if (-not (Test-Path $config)) {
    Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'sync-config.example.json') -Destination $config
}
if ($CredentialsOnly) { Write-Output 'Encrypted credentials and Python environment are ready.'; exit 0 }

# The six daily triggers follow the Windows Central timezone, including DST.
if ((Get-TimeZone).Id -ne 'Central Standard Time') {
    throw 'Set the task host to Central Standard Time (America/Chicago) before installation.'
}
$script = Join-Path $PSScriptRoot 'sync_read_resources.py'
$arguments = '"{0}" --config "{1}" --runtime "{2}"' -f $script, $config, $runtime
$action = New-ScheduledTaskAction -Execute $python -Argument $arguments -WorkingDirectory $PSScriptRoot
$triggers = @(0, 4, 8, 12, 16, 20 | ForEach-Object {
    New-ScheduledTaskTrigger -Daily -At ([datetime]::Today.AddHours($_))
})
$triggers += New-ScheduledTaskTrigger -AtStartup
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -MultipleInstances IgnoreNew `
    -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 10) `
    -ExecutionTimeLimit (New-TimeSpan -Minutes 15) -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
$principal = New-ScheduledTaskPrincipal -UserId $userSid -LogonType S4U -RunLevel Limited
Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $triggers `
    -Settings $settings -Principal $principal -Force | Out-Null

# Independently check freshness hourly, including when the primary task stops running.
$healthAction = New-ScheduledTaskAction -Execute $python -Argument "$arguments --check-health" -WorkingDirectory $PSScriptRoot
$healthTriggers = @(0..23 | ForEach-Object {
    New-ScheduledTaskTrigger -Daily -At ([datetime]::Today.AddHours($_).AddMinutes(30))
})
$healthTriggers += New-ScheduledTaskTrigger -AtStartup
Register-ScheduledTask -TaskName $healthTaskName -Action $healthAction -Trigger $healthTriggers `
    -Settings $settings -Principal $principal -Force | Out-Null
Write-Output 'Installed Read sync (every four hours and startup) and hourly health check.'
