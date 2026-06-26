# One-time bootstrap: GitHub Actions OIDC → Azure → AKS (Step E)
# Run locally after: az login
#
# Usage:
#   .\deploy\scripts\bootstrap-github-oidc.ps1
#   .\deploy\scripts\bootstrap-github-oidc.ps1 -SetGitHubSecrets

param(
    [switch]$SetGitHubSecrets
)

$ErrorActionPreference = 'Stop'

$AppDisplayName = 'dndapp-github-actions'
$GitHubOrg = 'crozzbite'
$GitHubRepo = 'DnDApp'
$Branch = 'master'
$RG = 'rg-dndapp-learn'
$Cluster = 'aks-dndapp'
$FederatedName = 'github-dndapp-master'

Write-Host "=== Azure account ===" -ForegroundColor Cyan
$account = az account show | ConvertFrom-Json
$SubscriptionId = $account.id
$TenantId = $account.tenantId
Write-Host "Subscription: $($account.name) ($SubscriptionId)"
Write-Host "Tenant:       $TenantId"

Write-Host "`n=== App Registration ===" -ForegroundColor Cyan
$existing = az ad app list --display-name $AppDisplayName --query "[0].appId" -o tsv 2>$null
if ($existing) {
    $ClientId = $existing.Trim()
    Write-Host "Reusing existing app: $ClientId"
} else {
    $ClientId = az ad app create --display-name $AppDisplayName --query appId -o tsv
    Write-Host "Created app: $ClientId"
    az ad sp create --id $ClientId | Out-Null
    Write-Host "Service principal created."
}

Write-Host "`n=== Federated credential (OIDC) ===" -ForegroundColor Cyan
$subject = "repo:${GitHubOrg}/${GitHubRepo}:ref:refs/heads/${Branch}"
$federatedJson = @{
    name        = $FederatedName
    issuer      = 'https://token.actions.githubusercontent.com'
    subject     = $subject
    description = 'DnDApp CD deploy on push to master'
    audiences   = @('api://AzureADTokenExchange')
} | ConvertTo-Json -Compress

$fedPath = Join-Path $env:TEMP 'dndapp-federated-credential.json'
$federatedJson | Set-Content -Path $fedPath -Encoding utf8

try {
    az ad app federated-credential create --id $ClientId --parameters "@$fedPath" 2>$null | Out-Null
    Write-Host "Federated credential created: $subject"
} catch {
    Write-Host "Federated credential may already exist (OK if re-run)."
}

Write-Host "`n=== Role assignments ===" -ForegroundColor Cyan
$clusterId = az aks show -g $RG -n $Cluster --query id -o tsv
$rgId = az group show -n $RG --query id -o tsv

$roles = @(
    @{ Role = 'Azure Kubernetes Service Cluster User Role'; Scope = $clusterId },
    @{ Role = 'Azure Kubernetes Service RBAC Cluster Admin'; Scope = $clusterId },
    @{ Role = 'Contributor'; Scope = $rgId }
)

foreach ($r in $roles) {
    az role assignment create --assignee $ClientId --role $r.Role --scope $r.Scope 2>$null | Out-Null
    Write-Host "Role: $($r.Role)"
}

Write-Host "`n=== Values for GitHub Secrets ===" -ForegroundColor Green
Write-Host "AZURE_CLIENT_ID       = $ClientId"
Write-Host "AZURE_TENANT_ID       = $TenantId"
Write-Host "AZURE_SUBSCRIPTION_ID = $SubscriptionId"

if ($SetGitHubSecrets) {
    Write-Host "`n=== Setting GitHub Secrets ===" -ForegroundColor Cyan
    Push-Location (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent)
    gh secret set AZURE_CLIENT_ID --body $ClientId
    gh secret set AZURE_TENANT_ID --body $TenantId
    gh secret set AZURE_SUBSCRIPTION_ID --body $SubscriptionId
    Pop-Location
    Write-Host "Secrets set on crozzbite/DnDApp"
}

Write-Host "`nDone. Re-run with -SetGitHubSecrets to push secrets via gh CLI." -ForegroundColor Green
