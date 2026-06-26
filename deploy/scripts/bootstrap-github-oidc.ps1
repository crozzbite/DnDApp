# One-time bootstrap: GitHub Actions OIDC → Azure → AKS (Step E)
# Run locally after: az login
#
# Usage:
#   .\deploy\scripts\bootstrap-github-oidc.ps1
#   .\deploy\scripts\bootstrap-github-oidc.ps1 -SetGitHubSecrets
#   .\deploy\scripts\bootstrap-github-oidc.ps1 -SetGitHubSecrets -ApplyK8sRbac

param(
    [switch]$SetGitHubSecrets,
    [switch]$ApplyK8sRbac
)

$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$localEnv = Join-Path $repoRoot 'deploy\local.env.ps1'
if (Test-Path $localEnv) {
    . $localEnv
} else {
    Write-Warning "Missing deploy\local.env.ps1 — copy from local.env.ps1.example"
}

function Get-GhRepoOwner {
    $v = gh repo view --json owner -q '.owner.login' 2>$null
    if ($LASTEXITCODE -ne 0) { return '' }
    return "$v".Trim()
}

function Get-GhRepoName {
    $v = gh repo view --json name -q '.name' 2>$null
    if ($LASTEXITCODE -ne 0) { return '' }
    return "$v".Trim()
}

$GitHubOrg = if ($DndGitHubOrg) { $DndGitHubOrg } else { Get-GhRepoOwner }
$GitHubRepo = if ($DndGitHubRepo) { $DndGitHubRepo } else { Get-GhRepoName }
$Branch = if ($DndDefaultBranch) { $DndDefaultBranch } else { 'master' }
$RG = $DndAzureResourceGroup
$Cluster = $DndAksCluster
$DeployNamespace = if ($DndNamespacePrefix -and $DndCdDeployEnvironment) {
    "$DndNamespacePrefix-$DndCdDeployEnvironment"
} else { 'app-test' }
$AppDisplayName = if ($DndOidcAppDisplayName) { $DndOidcAppDisplayName } else { "$GitHubRepo-github-actions" }
$FederatedName = if ($DndOidcFederatedCredentialName) { $DndOidcFederatedCredentialName } else { "github-$GitHubRepo-$Branch" }

if (-not $RG -or -not $Cluster) {
    throw 'Set DndAzureResourceGroup and DndAksCluster in deploy\local.env.ps1'
}
function Remove-RoleAssignmentIfExists {
    param(
        [string]$Assignee,
        [string]$Scope,
        [string]$RoleName
    )
    $ids = az role assignment list --assignee $Assignee --scope $Scope `
        --query "[?roleDefinitionName=='$RoleName'].id" -o tsv 2>$null
    foreach ($id in ($ids -split "`n")) {
        if ($id.Trim()) {
            az role assignment delete --ids $id.Trim() | Out-Null
            Write-Host "Removed role '$RoleName' on scope (hardening)."
        }
    }
}

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

$spObjectId = az ad sp show --id $ClientId --query id -o tsv

Write-Host "`n=== Federated credential (OIDC) ===" -ForegroundColor Cyan
$subject = "repo:${GitHubOrg}/${GitHubRepo}:ref:refs/heads/${Branch}"
$federatedJson = @{
    name        = $FederatedName
    issuer      = 'https://token.actions.githubusercontent.com'
    subject     = $subject
    description = "CD deploy on push to $Branch"
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

Write-Host "`n=== Role assignments (least privilege) ===" -ForegroundColor Cyan
$clusterId = az aks show -g $RG -n $Cluster --query id -o tsv
$rgId = az group show -n $RG --query id -o tsv

# Remove legacy broad roles from prior bootstrap runs
Remove-RoleAssignmentIfExists -Assignee $ClientId -Scope $rgId -RoleName 'Contributor'
Remove-RoleAssignmentIfExists -Assignee $ClientId -Scope $clusterId -RoleName 'Azure Kubernetes Service RBAC Cluster Admin'

$roles = @(
    @{ Role = 'Azure Kubernetes Service Cluster User Role'; Scope = $clusterId },
    @{ Role = 'Contributor'; Scope = $clusterId }
)

foreach ($r in $roles) {
    az role assignment create --assignee $ClientId --role $r.Role --scope $r.Scope 2>$null | Out-Null
    Write-Host "Role: $($r.Role) (scope: cluster only)"
}

Write-Host "`n=== Kubernetes RBAC ($DeployNamespace only) ===" -ForegroundColor Cyan
if ($ApplyK8sRbac) {
    $rbacPath = Join-Path $env:TEMP 'dndapp-github-actions-rbac.yaml'
    @"
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: github-actions-deploy
  namespace: $DeployNamespace
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: admin
subjects:
  - apiGroup: rbac.authorization.k8s.io
    kind: User
    name: $spObjectId
"@ | Set-Content -Path $rbacPath -Encoding utf8

    kubectl apply -f $rbacPath
    Write-Host "RoleBinding applied: github-actions-deploy in $DeployNamespace"
} else {
    Write-Host "Skipped. Re-run with -ApplyK8sRbac (kubectl context = aks-dndapp) to scope deploy to $DeployNamespace."
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
    Write-Host "Secrets set on ${GitHubOrg}/${GitHubRepo}"
}

Write-Host "`nDone. Contributor is cluster-scoped (aks start/stop). K8s deploy scoped via RoleBinding in $DeployNamespace." -ForegroundColor Green
