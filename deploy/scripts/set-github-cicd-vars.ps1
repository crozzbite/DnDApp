# Sync deploy/local.env.ps1 → GitHub Actions repository variables (not secrets).
# Run from repo root after editing local.env.ps1.
# Requires: gh auth with repo admin, local.env.ps1 present.

$ErrorActionPreference = 'Stop'

$repoRoot = git rev-parse --show-toplevel 2>$null
if (-not $repoRoot) { throw 'Not inside a git repository.' }

$localEnv = Join-Path $repoRoot 'deploy\local.env.ps1'
if (-not (Test-Path $localEnv)) {
    throw "Missing $localEnv - copy deploy\local.env.ps1.example first."
}

. $localEnv

$required = @(
    'DndAzureResourceGroup',
    'DndAksCluster',
    'DndGhcrApiPackage',
    'DndGhcrWebPackage',
    'DndNamespacePrefix',
    'DndCdDeployEnvironment',
    'DndCdIngressHost'
)
foreach ($name in $required) {
    if (-not (Get-Variable -Name $name -ValueOnly -ErrorAction SilentlyContinue)) {
        throw "local.env.ps1 must define `$$name"
    }
}

Push-Location $repoRoot

function Set-GhVar {
    param([string]$Name, [string]$Value)
    if ([string]::IsNullOrWhiteSpace($Value)) { return }
    gh variable set $Name --body $Value
    Write-Host "  variable $Name"
}

Write-Host '=== GitHub Actions variables ===' -ForegroundColor Cyan
Set-GhVar 'AZURE_RESOURCE_GROUP' $DndAzureResourceGroup
Set-GhVar 'AZURE_AKS_CLUSTER' $DndAksCluster
Set-GhVar 'GHCR_API_PACKAGE' $DndGhcrApiPackage
Set-GhVar 'GHCR_WEB_PACKAGE' $DndGhcrWebPackage
Set-GhVar 'K8S_NAMESPACE_PREFIX' $DndNamespacePrefix
Set-GhVar 'CD_DEPLOY_ENVIRONMENT' $DndCdDeployEnvironment
Set-GhVar 'CD_INGRESS_HOST' $DndCdIngressHost
if ($DndDefaultBranch) { Set-GhVar 'CD_DEFAULT_BRANCH' $DndDefaultBranch }

Pop-Location
Write-Host 'Done. Secrets (AZURE_CLIENT_ID, etc.) remain separate - use bootstrap-github-oidc.ps1' -ForegroundColor Green
