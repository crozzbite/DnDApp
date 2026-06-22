# Phase 3 — Azure AKS checklist

**Parent:** [DEPLOYMENT-MASTER-PLAN.md](./DEPLOYMENT-MASTER-PLAN.md)  
**Command snippets:** [COMMAND-REFERENCE.md §17](./COMMAND-REFERENCE.md#17-phase-3--azure-aks)  
**Status:** ✅ COMPLETE (2026-06-22)

**Reference cluster:** `aks-dndapp` in `rg-dndapp-learn` (eastus), node `Standard_D2s_v7`, Ingress IP `52.149.204.135`.

---

## Before you start

- [x] Phase 2 complete (GHCR digest deploy on kind)
- [x] `kubectl` + `kustomize` (built into kubectl)
- [x] Azure CLI installed (`az version`)
- [x] `az login` + active subscription (Azure subscription 1, $200 credits)
- [x] `gh auth status` → `write:packages` (for GHCR pull secret)
- [x] Confirm **cost budget** — AKS is **not free**; stop/start when not practicing

---

## Session goals

1. Create **one AKS cluster** (cost-controlled node pool)
2. Install **NGINX Ingress Controller** (HTTP; TLS deferred until custom domain)
3. Deploy **five namespaces** via `Build-Overlay.ps1` (`dev` → `prod`)
4. Recreate **`ghcr-pull`** secret in **each** namespace on AKS
5. Promote **same image digest** across namespaces (only ConfigMap/Secret differ)
6. Smoke test `/health` + web HTTP 200 (port-forward or Ingress + hosts file)

---

## Steps

### A. Preflight Azure + context hygiene

- [x] Azure CLI installed (winget `Microsoft.AzureCLI` 2.87.0)
- [x] `az login` → browser auth (`zzorc_666@hotmail.com`)
- [x] `az account show` → subscription Enabled
- [x] `az provider register --namespace Microsoft.ContainerService` → Registered
- [x] Note **kind** context vs **AKS** context — never apply to wrong cluster

→ Commands: [COMMAND-REFERENCE §17a](./COMMAND-REFERENCE.md#17a-preflight-azure)

### B. Resource group + AKS cluster

- [x] Resource group created (`rg-dndapp-learn`, eastus)
- [x] AKS cluster created (`aks-dndapp`, 1× `Standard_D2s_v7` — B2s blocked on free trial)
- [x] `az aks get-credentials` → context `aks-dndapp`
- [x] `kubectl get nodes` → `Ready`

→ Commands: [COMMAND-REFERENCE §17b](./COMMAND-REFERENCE.md#17b-create-aks-cluster)

### C. NGINX Ingress Controller

- [x] Ingress controller installed in `ingress-nginx` namespace
- [x] External IP assigned (`52.149.204.135`)

→ Commands: [COMMAND-REFERENCE §17c](./COMMAND-REFERENCE.md#17c-nginx-ingress-controller)

### D. GHCR pull secret (per namespace)

- [x] `ghcr-pull` in all five: `dnd-dev`, `dnd-test`, `dnd-qa`, `dnd-stage`, `dnd-prod`

→ Commands: [COMMAND-REFERENCE §17d](./COMMAND-REFERENCE.md#17d-ghcr-pull-secret-all-namespaces)

### E. Deploy overlays (Kustomize)

- [x] `Build-Overlay.ps1 -Environment all -Apply` → 15 app pods `1/1 Running`
- [x] Same digest on all api/web Deployments (verified)

→ Config: `deploy/k8s/config/environments.json` · Script: `deploy/k8s/scripts/Build-Overlay.ps1`

### F. Ingress smoke (HTTP)

- [x] Hosts file: all five `*.local` hostnames → EXTERNAL-IP (admin Notepad)
- [x] `curl http://dnd-*.local/health` → OK on all five
- [x] Web HTTP 200 in browser (UI WIP acceptable)

→ Commands: [COMMAND-REFERENCE §17f](./COMMAND-REFERENCE.md#17f-ingress-smoke-test)

### G. Cost control drill

- [x] `az aks stop` / `az aks start` drill executed
- [x] Verified `powerState: Stopped` / `Running`

→ Commands: [COMMAND-REFERENCE §17g](./COMMAND-REFERENCE.md#17g-cost-control-stopstart)

---

## Exit criteria (Phase 3 complete)

- [x] AKS cluster reachable; kubectl context documented
- [x] NGINX Ingress Controller running with external IP
- [x] Five namespaces deployed with **same GHCR digest**
- [x] `ghcr-pull` in all five namespaces
- [x] Smoke: `/health` + web on all five hosts via Ingress
- [x] Cost stop/start drill executed
- [x] COMMAND-REFERENCE §17 + this checklist updated
- [x] Commit `f2f7dd5` + follow-up docs commit (pending user)

---

## After Phase 3

Next: **Phase 4** — GitHub Actions build/test/push + manual approval gates.

Say in chat: **"Empezamos Fase 4"**
