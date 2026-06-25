# Generates a Kustomize overlay for one environment from config/environments.json.
# Kustomize has no native variables — this script is the DRY layer (single source of truth).
#
# Usage:
#   .\deploy\k8s\scripts\Build-Overlay.ps1 -Environment dev
#   .\deploy\k8s\scripts\Build-Overlay.ps1 -Environment dev -Apply
#   .\deploy\k8s\scripts\Build-Overlay.ps1 -Environment all -Apply

param(
    [Parameter(Mandatory = $true)]
    [ValidateSet('dev', 'test', 'qa', 'stage', 'prod', 'all')]
    [string]$Environment,

    [switch]$Apply
)

$ErrorActionPreference = 'Stop'

$k8sRoot = Split-Path $PSScriptRoot -Parent
$configPath = Join-Path $k8sRoot 'config\environments.json'
$generatedRoot = Join-Path $k8sRoot '.generated'

if (-not (Test-Path $configPath)) {
    throw "Missing config: $configPath"
}

$config = Get-Content $configPath -Raw | ConvertFrom-Json

function Write-OverlayFiles {
    param(
        [string]$EnvKey,
        [pscustomobject]$EnvConfig
    )

    $outDir = Join-Path $generatedRoot $EnvKey
    New-Item -ItemType Directory -Force -Path $outDir | Out-Null

    $ns = $EnvConfig.namespace
    $ingressHost = $EnvConfig.ingressHost
    $frontendUrl = $EnvConfig.frontendUrl

    @"
apiVersion: v1
kind: Namespace
metadata:
  name: $ns
  labels:
    app.kubernetes.io/part-of: dndapp
    environment: $EnvKey
"@ | Set-Content -Path (Join-Path $outDir 'namespace.yaml') -Encoding utf8

    @"
apiVersion: v1
kind: ConfigMap
metadata:
  name: api-config
  labels:
    app.kubernetes.io/name: api
    app.kubernetes.io/part-of: dndapp
data:
  NODE_ENV: production
  PORT: "3000"
  # Must match backend/src/config/redis-connection.config.ts (DEFAULT_REDIS_*)
  REDIS_HOST: redis
  REDIS_PORT: "6379"
  FRONTEND_URL: $frontendUrl
"@ | Set-Content -Path (Join-Path $outDir 'api-configmap.yaml') -Encoding utf8

    @"
apiVersion: v1
kind: ConfigMap
metadata:
  name: web-config
  labels:
    app.kubernetes.io/name: web
    app.kubernetes.io/part-of: dndapp
data:
  NODE_ENV: production
  PORT: "4000"
"@ | Set-Content -Path (Join-Path $outDir 'web-configmap.yaml') -Encoding utf8

    @"
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: dndapp
spec:
  rules:
    - host: $ingressHost
      http:
        paths:
          - path: /v1
            pathType: Prefix
            backend:
              service:
                name: api
                port:
                  number: 3000
          - path: /health
            pathType: Exact
            backend:
              service:
                name: api
                port:
                  number: 3000
          - path: /ready
            pathType: Exact
            backend:
              service:
                name: api
                port:
                  number: 3000
          - path: /
            pathType: Prefix
            backend:
              service:
                name: web
                port:
                  number: 4000
"@ | Set-Content -Path (Join-Path $outDir 'ingress-patch.yaml') -Encoding utf8

    @"
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

namespace: $ns

resources:
  - namespace.yaml
  - api-configmap.yaml
  - web-configmap.yaml
  - ../../base

patches:
  - path: ingress-patch.yaml
    target:
      kind: Ingress
      name: dndapp
"@ | Set-Content -Path (Join-Path $outDir 'kustomization.yaml') -Encoding utf8

    Write-Host "Generated overlay: $outDir (namespace=$ns, host=$ingressHost)"
    return $outDir
}

function Invoke-Overlay {
    param([string]$OutDir)

    kubectl kustomize $OutDir | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "kustomize build failed for $OutDir"
    }

    if ($Apply) {
        kubectl apply -k $OutDir
        if ($LASTEXITCODE -ne 0) {
            throw "kubectl apply failed for $OutDir"
        }
    }
}

$envKeys = if ($Environment -eq 'all') {
    @($config.environments.PSObject.Properties.Name)
} else {
    @($Environment)
}

foreach ($key in $envKeys) {
    $envConfig = $config.environments.$key
    if (-not $envConfig) {
        throw "Unknown environment in config: $key"
    }
    $outDir = Write-OverlayFiles -EnvKey $key -EnvConfig $envConfig
    Invoke-Overlay -OutDir $outDir
}

if (-not $Apply) {
    Write-Host "Dry run OK. Add -Apply to deploy."
}
