# Kubernetes manifests — DnDApp

**Learning track:** Phase 1 (kind local) → Phase 3 (AKS)

**Command workflows (copy-paste):** [docs/deployment/COMMAND-REFERENCE.md](../../docs/deployment/COMMAND-REFERENCE.md)  
**Session checklist:** [docs/deployment/phase-1-checklist.md](../../docs/deployment/phase-1-checklist.md)

## Layout

```text
deploy/k8s/
  base/                 # Shared manifests (all environments)
  config/
    environments.json   # Single source of truth: namespace, host, FRONTEND_URL per env
  scripts/
    Build-Overlay.ps1   # Generates .generated/<env>/ overlay (DRY)
  overlays/
    README.md           # How to run the generator (no duplicated YAML trees)
  .generated/           # gitignored — built by Build-Overlay.ps1
```

## Quick start (full stack)

```powershell
cd C:\Users\zzorc\OneDrive\Desktop\WorkDesktop\DnDApp

# Cluster (once per machine — survives reboot if Docker Desktop kept)
kind create cluster --name dnd-dev

# Manifests
kubectl apply -f deploy\k8s\base\namespace.yaml
kubectl apply -f deploy\k8s\base\redis-deployment.yaml
kubectl apply -f deploy\k8s\base\redis-service.yaml

# API image
docker build -f deploy\docker\backend.Dockerfile -t dndapp-api:local .
kind load docker-image dndapp-api:local --name dnd-dev
kubectl apply -f deploy\k8s\base\api-configmap.yaml
kubectl apply -f deploy\k8s\base\api-deployment.yaml
kubectl apply -f deploy\k8s\base\api-service.yaml

# Web image
docker build -f deploy\docker\frontend.Dockerfile -t dndapp-web:local .
kind load docker-image dndapp-web:local --name dnd-dev
kubectl apply -f deploy\k8s\base\web-configmap.yaml
kubectl apply -f deploy\k8s\base\web-deployment.yaml
kubectl apply -f deploy\k8s\base\web-service.yaml

# Verify
kubectl get pods,svc -n dnd-dev

# Access (two terminals)
kubectl port-forward -n dnd-dev svc/api 3000:3000
kubectl port-forward -n dnd-dev svc/web 4200:4000
```

See **COMMAND-REFERENCE.md** §11 (port conflicts), §13 (troubleshoot), §14d (Angular probes).
