Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$workspaceRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $workspaceRoot

function Invoke-Checked {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Command,

    [Parameter(Mandatory = $true)]
    [string[]]$CommandArgs
  )

  & $Command @CommandArgs
  if ($LASTEXITCODE -ne 0) {
    throw "Command failed ($LASTEXITCODE): $Command $($CommandArgs -join ' ')"
  }
}

function Invoke-Pnpm {
  param(
    [Parameter(Mandatory = $true)]
    [string[]]$PnpmArgs
  )

  Invoke-Checked -Command $pnpmExecutable -CommandArgs ($pnpmPrefixArgs + $PnpmArgs)
}

function Test-DockerReady {
  $previousErrorActionPreference = $ErrorActionPreference
  $ErrorActionPreference = "SilentlyContinue"
  try {
    & docker info --format "{{.ServerVersion}}" 2>$null | Out-Null
    return $LASTEXITCODE -eq 0
  }
  finally {
    $ErrorActionPreference = $previousErrorActionPreference
  }
}

$pnpmCommand = Get-Command pnpm -ErrorAction SilentlyContinue | Select-Object -First 1
$pnpmPrefixArgs = @()
if ($pnpmCommand) {
  $pnpmExecutable = $pnpmCommand.Source
}
else {
  $nodeCommand = Get-Command node -ErrorAction SilentlyContinue | Select-Object -First 1
  if (-not $nodeCommand) {
    throw "Node.js was not found. Install Node.js 24 or add it to PATH."
  }

  $corepackCommand = Get-Command corepack -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($corepackCommand) {
    $corepackExecutable = $corepackCommand.Source
  }
  else {
    $corepackBesideNode = Join-Path (Split-Path -Parent $nodeCommand.Source) "corepack.cmd"
    if (Test-Path -LiteralPath $corepackBesideNode) {
      $corepackExecutable = $corepackBesideNode
    }
  }
  if (-not $corepackExecutable) {
    throw "Neither pnpm nor Corepack was found. Reinstall Node.js 24 with Corepack enabled."
  }

  $env:COREPACK_HOME = Join-Path $workspaceRoot ".pnpm-store\corepack"
  $pnpmShimDirectory = Join-Path $workspaceRoot ".pnpm-store\corepack-bin"
  New-Item -ItemType Directory -Path $pnpmShimDirectory -Force | Out-Null
  Invoke-Checked -Command $corepackExecutable -CommandArgs @(
    "enable",
    "--install-directory",
    $pnpmShimDirectory,
    "pnpm"
  )
  $env:Path = "$pnpmShimDirectory;$env:Path"
  $pnpmExecutable = Join-Path $pnpmShimDirectory "pnpm.cmd"
  Write-Host "[AURELIS] pnpm is not on PATH; using a workspace-local Corepack shim."
  Invoke-Pnpm -PnpmArgs @("--version")
}

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  throw "Docker was not found. Install Docker Desktop or add docker.exe to PATH."
}

$envFile = Join-Path $workspaceRoot ".env"
if (-not (Test-Path -LiteralPath $envFile)) {
  Copy-Item -LiteralPath (Join-Path $workspaceRoot ".env.example") -Destination $envFile
  Write-Host "[AURELIS] Created .env from .env.example."
}

foreach ($line in Get-Content -LiteralPath $envFile) {
  $trimmedLine = $line.Trim()
  if (-not $trimmedLine -or $trimmedLine.StartsWith("#")) {
    continue
  }

  $parts = $trimmedLine -split "=", 2
  if ($parts.Count -ne 2) {
    continue
  }

  $key = $parts[0].Trim()
  $value = $parts[1].Trim()
  if ($value.Length -ge 2 -and $value[0] -eq '"' -and $value[$value.Length - 1] -eq '"') {
    $value = $value.Substring(1, $value.Length - 2)
  }
  [Environment]::SetEnvironmentVariable($key, $value, "Process")
}

$openAiApiKey = [Environment]::GetEnvironmentVariable("OPENAI_API_KEY", "Process")
if ([string]::IsNullOrWhiteSpace($openAiApiKey)) {
  Write-Host "[AURELIS] OPENAI_API_KEY is not configured; AI brand evaluation will be unavailable."
}

if (-not (Test-DockerReady)) {
  $dockerDesktop = Join-Path $env:ProgramFiles "Docker\Docker\Docker Desktop.exe"
  if (-not (Test-Path -LiteralPath $dockerDesktop)) {
    throw "Docker Desktop is not running and its executable was not found."
  }

  Write-Host "[AURELIS] Starting Docker Desktop..."
  Start-Process -FilePath $dockerDesktop -WindowStyle Hidden | Out-Null

  $dockerReady = $false
  for ($attempt = 0; $attempt -lt 90; $attempt++) {
    Start-Sleep -Seconds 2
    if (Test-DockerReady) {
      $dockerReady = $true
      break
    }
  }

  if (-not $dockerReady) {
    throw "Docker Desktop did not become ready within 3 minutes."
  }
}

Write-Host "[AURELIS] Starting PostgreSQL and HTML validator..."
Invoke-Checked -Command "docker" -CommandArgs @("compose", "up", "-d", "--wait", "--wait-timeout", "120")

Write-Host "[AURELIS] Preparing the database..."
Invoke-Pnpm -PnpmArgs @("db:generate")
Invoke-Pnpm -PnpmArgs @("db:migrate")
Invoke-Pnpm -PnpmArgs @("db:seed")

Write-Host "[AURELIS] Starting the web server and worker..."
$pnpmDevArgs = $pnpmPrefixArgs + @("dev")
& $pnpmExecutable @pnpmDevArgs
exit $LASTEXITCODE
