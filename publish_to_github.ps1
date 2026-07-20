[CmdletBinding()]
param(
    [string]$Owner = "jizhe1921",
    [string]$Repository = "articuling_account_web",
    [string]$AuthorName = "jizhe1921",
    [string]$AuthorEmail = "jizhe1921@gmail.com"
)

$ErrorActionPreference = "Stop"
$RemoteUrl = "https://github.com/$Owner/$Repository.git"
$KnownWrongRemoteUrl = "https://github.com/fraljimetry/$Repository.git"
$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

Set-Location $ProjectRoot

function Invoke-NativeChecked {
    param(
        [Parameter(Mandatory = $true)]
        [scriptblock]$Command,
        [Parameter(Mandatory = $true)]
        [string]$FailureMessage
    )

    & $Command
    if ($LASTEXITCODE -ne 0) {
        throw "$FailureMessage (exit code: $LASTEXITCODE)"
    }
}

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    throw "Git is not installed. Install Git for Windows or GitHub Desktop first."
}

if (-not (Test-Path -LiteralPath ".git")) {
    Invoke-NativeChecked -Command { git init } -FailureMessage "git init failed"
    Invoke-NativeChecked -Command { git branch -M main } -FailureMessage "creating the main branch failed"
}

# Use repository-local identity. This does not change the user's global Git config.
Invoke-NativeChecked -Command { git config user.name $AuthorName } -FailureMessage "setting the local Git author name failed"
Invoke-NativeChecked -Command { git config user.email $AuthorEmail } -FailureMessage "setting the local Git author email failed"

$remoteNames = @(& git remote)
if ($LASTEXITCODE -ne 0) {
    throw "listing Git remotes failed (exit code: $LASTEXITCODE)"
}

if ($remoteNames -notcontains "origin") {
    Invoke-NativeChecked -Command { git remote add origin $RemoteUrl } -FailureMessage "adding the origin remote failed"
} else {
    $origin = & git remote get-url origin
    if ($LASTEXITCODE -ne 0 -or -not $origin) {
        throw "reading the origin remote failed (exit code: $LASTEXITCODE)"
    }
    $origin = "$origin".Trim()
    if ($origin -eq $KnownWrongRemoteUrl) {
        Write-Host "Replacing the incorrect Fraljimetry origin with $RemoteUrl" -ForegroundColor Yellow
        Invoke-NativeChecked -Command { git remote set-url origin $RemoteUrl } -FailureMessage "replacing the incorrect origin failed"
    } elseif ($origin -ne $RemoteUrl) {
        throw "The current origin is '$origin', but the expected origin is '$RemoteUrl'. The script stopped to avoid pushing to the wrong repository."
    }
}

$gh = Get-Command gh -ErrorAction SilentlyContinue
if ($gh) {
    & gh auth status --hostname github.com
    if ($LASTEXITCODE -ne 0) {
        throw "GitHub CLI is not authenticated. Run 'gh auth login --hostname github.com --web' and then run this script again."
    }

    $authenticatedLogin = & gh api user --jq .login
    if ($LASTEXITCODE -ne 0 -or -not $authenticatedLogin) {
        throw "The script could not determine the GitHub CLI account."
    }
    $authenticatedLogin = "$authenticatedLogin".Trim()
    if ($authenticatedLogin -ne $Owner) {
        throw "GitHub CLI is authenticated as '$authenticatedLogin', not '$Owner'. Run 'gh auth logout --hostname github.com', then 'gh auth login --hostname github.com --web', and sign in as '$Owner'."
    }

    & gh repo view "$Owner/$Repository" *> $null
    if ($LASTEXITCODE -ne 0) {
        Invoke-NativeChecked -Command {
            gh repo create "$Owner/$Repository" --public --description "ArticuLing email verification and password reset pages"
        } -FailureMessage "creating the GitHub repository failed"
    }
} else {
    Write-Warning "GitHub CLI was not found, so the script cannot verify the signed-in GitHub account."
    Write-Host "Before continuing, create an empty public repository at:" -ForegroundColor Yellow
    Write-Host "https://github.com/$Owner/$Repository" -ForegroundColor Yellow
    Write-Host "The push will target only $RemoteUrl. A different account should be rejected by GitHub unless it has permission." -ForegroundColor Yellow
}

if (Get-Command npm -ErrorAction SilentlyContinue) {
    Invoke-NativeChecked -Command { npm test } -FailureMessage "npm test failed"
    Invoke-NativeChecked -Command { npm run check } -FailureMessage "npm run check failed"
} else {
    Write-Warning "npm was not found. Local JavaScript tests were skipped."
}

Invoke-NativeChecked -Command { git add --all } -FailureMessage "git add failed"
$changes = & git status --porcelain
if ($LASTEXITCODE -ne 0) {
    throw "git status failed (exit code: $LASTEXITCODE)"
}

if ($changes) {
    Invoke-NativeChecked -Command {
        git commit -m "Create ArticuLing account action pages"
    } -FailureMessage "git commit failed"
} else {
    Write-Host "No uncommitted changes were found." -ForegroundColor Yellow
}

Invoke-NativeChecked -Command { git branch -M main } -FailureMessage "setting the main branch failed"
Invoke-NativeChecked -Command { git push -u origin main } -FailureMessage "git push failed"

Write-Host ""
Write-Host "Source code was pushed to $RemoteUrl" -ForegroundColor Green
Write-Host "Next: GitHub > Settings > Pages > Deploy from a branch > main > /(root)" -ForegroundColor Yellow
Write-Host "Custom domain: account.articuling.com" -ForegroundColor Yellow
Write-Host "Cloudflare CNAME: account -> jizhe1921.github.io" -ForegroundColor Yellow
