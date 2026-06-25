# Overlays — generated, not hand-edited

Kustomize has **no variables** (no `$(namespace)` in YAML). Duplicating five folders violates DRY.

**Single source of truth:** [`../config/environments.json`](../config/environments.json)

**Generator:** [`../scripts/Build-Overlay.ps1`](../scripts/Build-Overlay.ps1)

```powershell
cd C:\Users\zzorc\OneDrive\Desktop\WorkDesktop\DnDApp

# Preview (writes to deploy/k8s/.generated/<env>/, gitignored)
.\deploy\k8s\scripts\Build-Overlay.ps1 -Environment dev

# Deploy one environment
.\deploy\k8s\scripts\Build-Overlay.ps1 -Environment dev -Apply

# Deploy all five namespaces (AKS Phase 3)
.\deploy\k8s\scripts\Build-Overlay.ps1 -Environment all -Apply
```

To add a new stage or change `FRONTEND_URL` for prod: edit **only** `environments.json`, then re-run the script.

Shared workloads (Deployments, Services, image digests) stay in [`../base/`](../base/).
