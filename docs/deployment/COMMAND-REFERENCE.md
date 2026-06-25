# DnDApp — Deployment command reference

**Parent:** [DEPLOYMENT-MASTER-PLAN.md](./DEPLOYMENT-MASTER-PLAN.md)  
**Purpose:** Copy-paste workflows for manual deploy, verify, rollback, and troubleshoot.  
**Shell:** PowerShell on Windows — chain with `;` (not `&&`).

All paths assume repo root:

```powershell
cd C:\Users\zzorc\OneDrive\Desktop\WorkDesktop\DnDApp
```

---

## Quick index

| Workflow | Phase | Section |
|----------|-------|---------|
| Tool preflight | 0–1 | [§1](#1-preflight-tools) |
| Compose up / down | 0 | [§2](#2-phase-0--compose-lifecycle) |
| Build images (compose) | 0 | [§3](#3-phase-0--build-images) |
| Smoke tests (compose) | 0 | [§4](#4-phase-0--smoke-tests) |
| Rollback drill (compose) | 0 | [§5](#5-phase-0--rollback-drill) |
| Compose troubleshoot | 0 | [§6](#6-phase-0--troubleshoot) |
| kind cluster lifecycle | 1 | [§7](#7-phase-1--kind-cluster) |
| Namespace | 1 | [§8](#8-phase-1--namespace) |
| Redis (K8s) | 1 | [§9](#9-phase-1--redis) |
| API build + load + deploy | 1 | [§10](#10-phase-1--api) |
| Verify + port-forward (K8s) | 1 | [§11](#11-phase-1--verify-and-access) |
| Rollback (K8s) | 1 | [§12](#12-phase-1--rollback) |
| K8s troubleshoot | 1 | [§13](#13-phase-1--troubleshoot) |
| Web build + load + deploy | 1 | [§14](#14-phase-1--web-frontend) |
| Full stack smoke test | 1 | [§11](#11-phase-1--verify-and-access) |
| Full teardown | 1 | [§15](#15-full-teardown-phase-1-session-end) |
| GHCR auth + build + push | 2 | [§16](#16-phase-2--ghcr-registry) |
| Deploy by GHCR tag | 2 | [§16](#16-phase-2--ghcr-registry) |
| Link package to repo (OCI label) | 2 / 4 | [§16h](#16h-link-ghcr-package-to-repo-oci-label--rebuild) |
| **CI — local preflight** | 4 | [§18a](#18a-local-preflight-mirror-ci) |
| **CI — PR + monitor (`gh`)** | 4 | [§18c](#18c-pr-merge-to-master) · [§18d](#18d-monitor-ci-from-terminal) |
| **CI — troubleshoot** | 4 | [§18e](#18e-ci-troubleshoot) |
| CD build + push (GHCR) | 4 | §18 — **Step D (next)** |

---

## 1. Preflight (tools)

```powershell
# Docker running?
docker info --format "{{.ServerVersion}}"

# kubectl client (server line appears after cluster exists)
kubectl version --client

# kind installed?
kind version

# Git context (optional)
git branch --show-current
git rev-parse --short HEAD
```

**Install kind (if missing):**

```powershell
winget install Kubernetes.kind
# Close and reopen terminal, then:
kind version
```

---

## 2. Phase 0 — Compose lifecycle

### Start Docker Desktop (if not running)

```powershell
Start-Process "${env:ProgramFiles}\Docker\Docker\Docker Desktop.exe"
(ese comando solo sirve para mi maquina por que ahy tenemos instalado el Docker) 

# Wait until the engine is ready (repeat until version prints, ~30–90s)
docker info --format "{{.ServerVersion}}"
```

| Part | Meaning |
|------|---------|
| `Start-Process` | Launch Docker Desktop from terminal (GUI runs in tray; no need to open from Start menu) |
| `docker info` | Fails until the daemon is up — use as readiness check before `compose` / `kind` |

### Start stack (foreground — logs in terminal)

```powershell
docker compose -f deploy\compose\docker-compose.yml up --build
```

| Flag | Meaning |
|------|---------|
| `-f deploy\compose\docker-compose.yml` | Compose file path |
| `up` | Create and start containers |
| `--build` | Rebuild images before start |

### Start stack (background / detached)

```powershell
docker compose -f deploy\compose\docker-compose.yml up --build -d
```

| Flag | Meaning |
|------|---------|
| `-d` | Detached — terminal free, logs via `docker compose logs` |

### Stop stack (keep volumes)

```powershell
docker compose -f deploy\compose\docker-compose.yml down
```

### Stop stack + wipe volumes

```powershell
docker compose -f deploy\compose\docker-compose.yml down -v
```

| Flag | Meaning |
|------|---------|
| `-v` | Remove named/anonymous volumes (Redis data wiped) |

### Restart one service

```powershell
docker compose -f deploy\compose\docker-compose.yml restart api
```

---

## 3. Phase 0 — Build images

Build individually (tags for rollback / audit):

```powershell
$sha = git rev-parse --short HEAD

docker build -f deploy\docker\backend.Dockerfile -t dndapp-api:local .
docker build -f deploy\docker\backend.Dockerfile -t dndapp-api:$sha .

docker build -f deploy\docker\frontend.Dockerfile -t dndapp-web:local .
docker build -f deploy\docker\frontend.Dockerfile -t dndapp-web:$sha .
```

List local images:

```powershell
docker images | Select-String "dndapp"
```

---

## 4. Phase 0 — Smoke tests

```powershell
# API liveness (process up — does NOT check Redis)
Invoke-RestMethod http://localhost:3000/health

# API readiness (Redis PING — traffic gate)
Invoke-RestMethod http://localhost:3000/ready

# Frontend (browser)
# http://localhost:4200

# Service status — api should be healthy only when /ready passes
docker compose -f deploy\compose\docker-compose.yml ps
```

---

## 5. Phase 0 — Rollback drill

Simulates a bad config promotion and recovery (manual pipeline discipline).

### 5a. Baseline — stack healthy

```powershell
docker compose -f deploy\compose\docker-compose.yml up -d
docker compose -f deploy\compose\docker-compose.yml ps
docker compose -f deploy\compose\docker-compose.yml logs api --tail=30
```

### 5b. Sabotage — wrong Redis host (failure must be visible)

Edit `deploy/compose/docker-compose.yml` → set `REDIS_HOST: localhost` under `api.environment`.

```powershell
docker compose -f deploy\compose\docker-compose.yml down
docker compose -f deploy\compose\docker-compose.yml up -d
docker compose -f deploy\compose\docker-compose.yml ps
docker compose -f deploy\compose\docker-compose.yml logs api --tail=50

# Readiness gate (traffic) — must fail
Invoke-RestMethod http://localhost:3000/ready -ErrorAction SilentlyContinue
# Or: curl.exe -i http://localhost:3000/ready   → expect HTTP 503

# Liveness only — may still pass (by design)
Invoke-RestMethod http://localhost:3000/health
```

**Expected (Phase 3.5+):** `api` shows **`unhealthy`** in `docker compose ps` (healthcheck targets `/ready`). Logs show `ECONNREFUSED 127.0.0.1:6379`. `/ready` returns **503**; `/health` may still return **200** — that split is intentional (liveness vs readiness). Failure is **visible**, not silent.

### 5c. Recover — revert config

Revert `REDIS_HOST` to `redis` in compose file.

```powershell
docker compose -f deploy\compose\docker-compose.yml down
docker compose -f deploy\compose\docker-compose.yml up -d
docker compose -f deploy\compose\docker-compose.yml logs api --tail=30
```

### 5d. Rollback — previous image tag (optional)

If you tagged by SHA and need to pin an older image:

```powershell
# Example: run api with older tag (adjust compose image: field or rebuild)
docker compose -f deploy\compose\docker-compose.yml down
# Edit compose to use image: dndapp-api:<older-sha> instead of build:
docker compose -f deploy\compose\docker-compose.yml up -d
```

---

## 6. Phase 0 — Troubleshoot

```powershell
# All service logs (follow)
docker compose -f deploy\compose\docker-compose.yml logs -f

# One service, last N lines
docker compose -f deploy\compose\docker-compose.yml logs api --tail=100

# Follow one service
docker compose -f deploy\compose\docker-compose.yml logs -f api

# Inspect container env
docker compose -f deploy\compose\docker-compose.yml exec api printenv | Select-String "REDIS|FRONTEND|PORT"

# Shell inside container
docker compose -f deploy\compose\docker-compose.yml exec api sh
```

| Flag | Meaning |
|------|---------|
| `-f` | Follow log output (live) |
| `--tail=N` | Show last N lines only |
| `exec` | Run command inside running container |

---

## 7. Phase 1 — kind cluster

### Create cluster

```powershell
kind create cluster --name dnd-dev
```

| Flag | Meaning |
|------|---------|
| `--name dnd-dev` | Cluster name; kubectl context becomes `kind-dnd-dev` |

### Verify cluster

```powershell
kubectl cluster-info --context kind-dnd-dev
kubectl get nodes
kubectl get namespaces
```

### List / switch context

```powershell
kubectl config get-contexts
kubectl config use-context kind-dnd-dev
```

### Delete cluster (full teardown)

```powershell
kind delete cluster --name dnd-dev
```

---

## 8. Phase 1 — Namespace

### Apply namespace manifest

```powershell
kubectl apply -f deploy\k8s\base\namespace.yaml
kubectl get namespace dnd-dev
```

### Fix wrong namespace name

```powershell
kubectl delete namespace dnd-app   # wrong name
kubectl apply -f deploy\k8s\base\namespace.yaml
kubectl get namespace dnd-dev
```

**Note:** `metadata.name` in YAML is the source of truth — not the filename.

---

## 9. Phase 1 — Redis

### Apply manifests

```powershell
kubectl apply -f deploy\k8s\base\redis-deployment.yaml
kubectl apply -f deploy\k8s\base\redis-service.yaml
```

### Verify

```powershell
kubectl get pods -n dnd-dev
kubectl get svc -n dnd-dev
kubectl describe pod -n dnd-dev -l app.kubernetes.io/name=redis
kubectl logs -n dnd-dev -l app.kubernetes.io/name=redis --tail=30
```

### Delete Redis (re-apply workflow)

```powershell
kubectl delete -f deploy\k8s\base\redis-service.yaml
kubectl delete -f deploy\k8s\base\redis-deployment.yaml
```

---

## 10. Phase 1 — API

### 10a. Build image + load into kind

```powershell
docker build -f deploy\docker\backend.Dockerfile -t dndapp-api:local .

kind load docker-image dndapp-api:local --name dnd-dev
```

| Command | Meaning |
|---------|---------|
| `kind load docker-image` | Copies local Docker image into kind node (no registry in Phase 1) |
| `--name dnd-dev` | Target cluster |

**After code changes:** rebuild image, `kind load` again, then restart deployment (see §12).

### 10b. Apply ConfigMap + Deployment + Service

```powershell
kubectl apply -f deploy\k8s\base\api-configmap.yaml
kubectl apply -f deploy\k8s\base\api-deployment.yaml
kubectl apply -f deploy\k8s\base\api-service.yaml
```

### 10c. Verify API pod

```powershell
kubectl get pods -n dnd-dev
kubectl get svc -n dnd-dev
kubectl logs -n dnd-dev -l app.kubernetes.io/name=api --tail=50
kubectl describe pod -n dnd-dev -l app.kubernetes.io/name=api
```

**Ready column:** `1/1` = container passed readinessProbe (includes Redis TCP check).

---

## 11. Phase 1 — Verify and access

### Port-forward API to localhost

```powershell
kubectl port-forward -n dnd-dev svc/api 3000:3000
```

| Part | Meaning |
|------|---------|
| `port-forward` | Tunnel from your PC into the cluster |
| `svc/api` | Target Service (stable; survives pod restarts) |
| `3000:3000` | `local_port:service_port` |

In another terminal or browser:

```powershell
Invoke-RestMethod http://localhost:3000/health
```

### Port-forward both services (full stack UI)

Use **two terminals** (each blocks while forwarding):

```powershell
# Terminal 1 — API
kubectl port-forward -n dnd-dev svc/api 3000:3000

# Terminal 2 — Web (SSR)
kubectl port-forward -n dnd-dev svc/web 4200:4000
```

Browser: `http://localhost:4200`  
API health: `http://localhost:3000/health`

`FRONTEND_URL` in `api-configmap.yaml` must match the browser origin (`http://localhost:4200`) for CORS.

### Port already in use (bind error)

If you see `Only one usage of each socket address ... is normally permitted`:

```powershell
# See what holds the port (example: 3000)
netstat -ano | Select-String ":3000 "

# Option A: stop the old port-forward terminal (Ctrl+C) or compose stack
docker compose -f deploy\compose\docker-compose.yml down

# Option B: use a different LOCAL port (Service port stays the same)
kubectl port-forward -n dnd-dev svc/api 3001:3000
Invoke-RestMethod http://localhost:3001/health
```

| Part | Meaning |
|------|---------|
| `3001:3000` | Local **3001** → cluster Service port **3000** |
| Two port-forwards on same local port | Not allowed — one listener per local port |

### Full stack verify (all pods Ready)

```powershell
kubectl get pods,svc -n dnd-dev

# Expect: redis, api, web — all READY 1/1
Invoke-RestMethod http://localhost:3000/health
Invoke-RestMethod http://localhost:3000/ready
(Invoke-WebRequest http://localhost:4200 -UseBasicParsing).StatusCode   # expect 200
```

**UI looks wrong but HTTP 200?** Infra is OK — likely application code (WIP branch/stash), not Kubernetes. Separate feature work from deploy verification.

### Port-forward Redis (debug only)

```powershell
kubectl port-forward -n dnd-dev svc/redis 6379:6379
```

### Apply entire base folder (when all manifests exist)

```powershell
kubectl apply -f deploy\k8s\base\
kubectl get all -n dnd-dev
```

| Command | Meaning |
|---------|---------|
| `get all` | Shortcut for pods, services, deployments, replicasets (not everything, but useful) |

---

## 12. Phase 1 — Rollback

### 12a. Config rollback (ConfigMap)

Edit `deploy/k8s/base/api-configmap.yaml` (e.g. revert `REDIS_HOST` from `localhost` to `redis`).

```powershell
kubectl apply -f deploy\k8s\base\api-configmap.yaml
kubectl rollout restart deployment/api -n dnd-dev
kubectl rollout status deployment/api -n dnd-dev
kubectl get pods -n dnd-dev -w
```

| Command | Meaning |
|---------|---------|
| `rollout restart` | Recreate pods to pick up new env from ConfigMap |
| `rollout status` | Wait until rollout finishes |
| `-w` | Watch pod status until Ctrl+C |

### 12b. Sabotage drill (Redis — K8s version of Phase 0 lesson)

```powershell
# 1. Edit api-configmap.yaml → REDIS_HOST: localhost
kubectl apply -f deploy\k8s\base\api-configmap.yaml
kubectl rollout restart deployment/api -n dnd-dev

# 2. Observe: pod should stay 0/1 Ready (readinessProbe fails Redis TCP)
kubectl get pods -n dnd-dev
kubectl describe pod -n dnd-dev -l app.kubernetes.io/name=api

# 3. Revert REDIS_HOST: redis, re-apply, restart
kubectl apply -f deploy\k8s\base\api-configmap.yaml
kubectl rollout restart deployment/api -n dnd-dev
kubectl get pods -n dnd-dev
```

**Lesson:** Unlike compose, K8s readinessProbe catches bad `REDIS_HOST` — pod not Ready, no silent traffic.

### 12c. Deployment revision rollback

```powershell
kubectl rollout history deployment/api -n dnd-dev
kubectl rollout undo deployment/api -n dnd-dev
kubectl rollout status deployment/api -n dnd-dev
```

Undo to specific revision:

```powershell
kubectl rollout undo deployment/api -n dnd-dev --to-revision=2
```

### 12d. Image rollback (local tags)

```powershell
docker build -f deploy\docker\backend.Dockerfile -t dndapp-api:local .
kind load docker-image dndapp-api:local --name dnd-dev
kubectl rollout restart deployment/api -n dnd-dev
```

To pin a specific tag, edit `image:` in `api-deployment.yaml`, then `kubectl apply -f ...`.

---

## 13. Phase 1 — Troubleshoot

```powershell
# Events (scheduling, probe failures, image pull)
kubectl get events -n dnd-dev --sort-by='.lastTimestamp'

# Pod details (Conditions, Events at bottom)
kubectl describe pod -n dnd-dev <pod-name>

# Logs — current container
kubectl logs -n dnd-dev <pod-name> --tail=100

# Logs — previous crashed container
kubectl logs -n dnd-dev <pod-name> --previous

# Follow logs
kubectl logs -n dnd-dev -l app.kubernetes.io/name=api -f

# Env inside running pod
kubectl exec -n dnd-dev -it deploy/api -- printenv | Select-String "REDIS|FRONTEND|PORT"

# Shell inside pod
kubectl exec -n dnd-dev -it deploy/api -- sh

# Check probes / readiness from describe
kubectl describe pod -n dnd-dev -l app.kubernetes.io/name=api | Select-String "Ready|Liveness|Readiness|Warning|Error"
```

### Common fixes

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| `ImagePullBackOff` | Image not on kind node | `kind load docker-image ...` |
| Pod `0/1 Ready` | readinessProbe failing | `describe pod` → Events; check `REDIS_HOST` |
| `CrashLoopBackOff` | App exits on boot | `logs --previous`; check `FRONTEND_URL` in prod |
| YAML apply parse error | Bad indentation | `spec` must be sibling of `metadata`, not under `labels` |
| Wrong namespace | `-n` omitted | Add `-n dnd-dev` to every kubectl command |
| `port-forward` bind error | Local port already used | §11 — Ctrl+C old forward, or use `3001:3000` |
| Web logs: `Header "host" ... is not allowed` | Angular SSR + `httpGet` on `/` uses pod IP as Host | §14d — `httpGet /health` on Express route in `server.ts` |
| `docker build` reads wrong file | Used `-f` twice instead of `-t` for tag | `docker build -f deploy\docker\....Dockerfile -t name:tag .` |

### Angular SSR probe lesson (web deployment)

Kubernetes `httpGet` probes on `/` hit the **Angular SSR** catch-all with `Host: <pod-ip>:4000`. Angular 19 rejects unknown hosts (SSRF protection).

**Canonical fix (Phase 4+):** `GET /health` on **Express** in `frontend/src/server.ts` (before SSR). Probes use `httpGet` path `/health` — no Host header tricks, no `tcpSocket`-only lie.

```yaml
readinessProbe:
  httpGet:
    path: /health
    port: 4000
  timeoutSeconds: 5
livenessProbe:
  httpGet:
    path: /health
    port: 4000
```

Browser/Ingress traffic to `/` still goes through SSR with allowed hosts from the client.

---

## 14. Phase 1 — Web frontend

Manifests: `web-configmap.yaml`, `web-deployment.yaml`, `web-service.yaml` (same 3-file pattern as API).

### 14a. Build image + load into kind

```powershell
docker build -f deploy\docker\frontend.Dockerfile -t dndapp-web:local .

kind load docker-image dndapp-web:local --name dnd-dev
```

| Flag | Meaning |
|------|---------|
| `-f deploy\docker\frontend.Dockerfile` | Dockerfile path |
| `-t dndapp-web:local` | **T**ag image name (common mistake: second `-f` instead of `-t`) |
| `.` | Build context = repo root |

Frontend image uses **npm ci** (not bun) — see master plan §2 Docker image builds.

### 14b. Apply ConfigMap + Deployment + Service

```powershell
kubectl apply -f deploy\k8s\base\web-configmap.yaml
kubectl apply -f deploy\k8s\base\web-deployment.yaml
kubectl apply -f deploy\k8s\base\web-service.yaml
```

### 14c. Verify web pod

```powershell
kubectl get pods -n dnd-dev
kubectl logs -n dnd-dev -l app.kubernetes.io/name=web --tail=10
kubectl rollout status deployment/web -n dnd-dev
```

**Expected log:** `Node Express server listening on http://localhost:4000` (no repeating Host errors after §14d).

### 14d. Web HTTP probes (`/health` on Express)

`web-deployment.yaml` uses **httpGet `/health`** (not `tcpSocket`, not `httpGet /`).

Express serves `/health` in `frontend/src/server.ts` before the Angular SSR catch-all — kubelet probes get HTTP 200 without SSR Host validation.

```yaml
readinessProbe:
  httpGet:
    path: /health
    port: 4000
  initialDelaySeconds: 15
  periodSeconds: 10
  timeoutSeconds: 5
livenessProbe:
  httpGet:
    path: /health
    port: 4000
  initialDelaySeconds: 30
  periodSeconds: 20
  timeoutSeconds: 5
```

Smoke (port-forward web to 4200):

```powershell
Invoke-RestMethod http://localhost:4200/health
```

Apply and roll out:

```powershell
kubectl apply -f deploy\k8s\base\web-deployment.yaml
kubectl rollout status deployment/web -n dnd-dev
kubectl logs -n dnd-dev -l app.kubernetes.io/name=web --tail=5
```

### 14e. Port-forward + browser

```powershell
kubectl port-forward -n dnd-dev svc/web 4200:4000
```

See §11 for running API + Web forwards together and port-conflict workarounds.

---

## 15. Full teardown (Phase 1 session end)

```powershell
# Remove app resources (keep cluster)
kubectl delete namespace dnd-dev

# Or delete entire cluster
kind delete cluster --name dnd-dev
```

Recreate from scratch: §7 → §8 → §9 → §10 → §14.

---

## 16. Phase 2 — GHCR (registry)

**Goal:** stop using `kind load` (local-only) and instead **push images to GitHub Container Registry (GHCR)**, then deploy by an **immutable git-SHA tag**. This is how a remote cluster (AKS) pulls images.

**Image naming:** `ghcr.io/<owner>/<name>:<tag>` → e.g. `ghcr.io/crozzbite/dndapp-api:28a836e`.

### 16a. Auth preflight (per token)

GHCR push needs a token with the `write:packages` scope.

```powershell
# Add packages scopes to the gh token (opens browser device flow)
gh auth refresh -h github.com -s write:packages,read:packages
gh auth status   # confirm scopes include write:packages

# Log Docker into GHCR using the gh token (no password stored on disk)
gh auth token | docker login ghcr.io -u crozzbite --password-stdin
```

**Expected:** `Login Succeeded`.

### 16b. Build images tagged for GHCR

```powershell
$sha = git rev-parse --short HEAD   # must be a CLEAN working tree, else the tag lies

docker build -f deploy\docker\backend.Dockerfile  -t ghcr.io/crozzbite/dndapp-api:$sha .
docker build -f deploy\docker\frontend.Dockerfile -t ghcr.io/crozzbite/dndapp-web:$sha .

docker images | Select-String "ghcr.io/crozzbite"
```

| Part | Meaning |
|------|---------|
| `-f ...Dockerfile` | which recipe (Dockerfile) to build |
| `-t ghcr.io/crozzbite/<name>:$sha` | full registry address + version tag |
| `.` | build context = repo root (filtered by `.dockerignore`) |

**Why the SHA:** ties each image to the exact commit → traceable + rollback-able. Commit first.

### 16c. Push to GHCR

```powershell
docker push ghcr.io/crozzbite/dndapp-api:$sha
docker push ghcr.io/crozzbite/dndapp-web:$sha
```

**Expected:** layers uploaded + a `digest: sha256:...` line. Note the digest — deploy-by-digest is the most immutable reference.

### 16d. Point manifests at GHCR

In `deploy/k8s/base/api-deployment.yaml` and `web-deployment.yaml`:

```yaml
# before (Phase 1 — local image loaded onto the node)
image: dndapp-api:local
imagePullPolicy: IfNotPresent
# after (Phase 2 — pull from GHCR by immutable SHA tag)
image: ghcr.io/crozzbite/dndapp-api:28a836e
imagePullPolicy: IfNotPresent
```

### 16e. Redeploy + verify

```powershell
kubectl apply -f deploy\k8s\base\api-deployment.yaml
kubectl apply -f deploy\k8s\base\web-deployment.yaml
kubectl rollout status deployment/api -n dnd-dev
kubectl rollout status deployment/web -n dnd-dev
kubectl get pods -n dnd-dev
```

### 16f. Private package → cluster needs a pull secret

New GHCR packages are **private by default** (keep them private). A cluster then needs credentials to pull:

```powershell
kubectl create secret docker-registry ghcr-pull --docker-server=ghcr.io --docker-username=crozzbite --docker-password="$(gh auth token)" -n dnd-dev
# PowerShell: use "$(gh auth token)" — bare (gh auth token) splits into two kubectl NAME args
# then add to the Deployment spec:  imagePullSecrets: [{ name: ghcr-pull }]
```

> 🚨 Cerbero: keep packages private; never bake secrets into image layers (`.dockerignore` excludes `.git`, `.env*`). A package made public is reachable from the open internet.

### 16g. Troubleshoot

| Symptom | Cause | Fix |
|---------|-------|-----|
| `denied: ... write:packages` | token missing scope | §16a `gh auth refresh -s write:packages` |
| `unauthorized` on push | not logged into ghcr.io | §16a `docker login ghcr.io` |
| pod `ImagePullBackOff` | private package, no pull secret | §16f create `ghcr-pull` secret |
| `manifest unknown` on pull | tag never pushed / typo | re-check tag, `docker push` again |

### 16h. Link GHCR package to repo (OCI label + rebuild)

**When:** After a manual `docker push`, packages may not appear under the repo sidebar until linked. You can link once via GitHub UI (**Package → Connect repository → `crozzbite/DnDApp`**), or automate future pushes with an OCI label in the Dockerfile (recommended for Phase 4 CI).

**Already in repo:** both `deploy/docker/backend.Dockerfile` and `frontend.Dockerfile` include:

```dockerfile
LABEL org.opencontainers.image.source=https://github.com/crozzbite/DnDApp
```

(on the final `run` stage — the image that gets pushed)

**What it does:** GitHub reads this annotation on `docker push` and associates the container package with the repo. No K8s YAML involved — this is GitHub Packages metadata.

**Deferred rebuild (do at next image publish — Phase 4 CI or manual):**

```powershell
cd C:\Users\zzorc\OneDrive\Desktop\WorkDesktop\DnDApp

# 1. Commit Dockerfile LABEL change first (if not already committed)
git add deploy/docker/backend.Dockerfile deploy/docker/frontend.Dockerfile
git commit -m "chore(deploy): add OCI source label for GHCR repo linking"

# 2. Build + tag with new git SHA
$sha = git rev-parse --short HEAD
docker build -f deploy\docker\backend.Dockerfile  -t ghcr.io/crozzbite/dndapp-api:$sha .
docker build -f deploy\docker\frontend.Dockerfile -t ghcr.io/crozzbite/dndapp-web:$sha .

# 3. Verify label embedded (optional)
docker inspect ghcr.io/crozzbite/dndapp-api:$sha --format "{{index .Config.Labels \"org.opencontainers.image.source\"}}"
# Expected: https://github.com/crozzbite/DnDApp

# 4. Push — GHCR auto-links (or reinforces UI link)
docker push ghcr.io/crozzbite/dndapp-api:$sha
docker push ghcr.io/crozzbite/dndapp-web:$sha
```

**Phase 2 note (2026-06-21):** packages were linked manually via UI for images tagged `28a836e` (pushed before LABEL existed). No rebuild required for that link. Next build with LABEL keeps linking automatic without UI.

**Phase 4 note:** GitHub Actions push with `GITHUB_TOKEN` from `crozzbite/DnDApp` also auto-links; the LABEL is belt-and-suspenders for manual pushes and supply-chain traceability.

> 🚨 Cerbero: the label is a public URL in the image manifest (not a secret). Keep packages **Private** regardless of repo link.

---

## 17. Phase 3 — Azure AKS

**Status:** ✅ COMPLETE (2026-06-22) — cluster `aks-dndapp`, five namespaces, Ingress smoke on all `*.local` hosts.

**Goal:** one AKS cluster, **five namespaces** (`dnd-dev` … `dnd-prod`), NGINX Ingress (HTTP). Same GHCR digest promoted everywhere; only ConfigMaps differ per environment.

**Validated reference (this track):**

| Item | Value |
|------|--------|
| Resource group | `rg-dndapp-learn` (eastus) |
| Cluster | `aks-dndapp` |
| Node VM | `Standard_D2s_v7` (free trial; B2s blocked) |
| Ingress EXTERNAL-IP | `52.149.204.135` (yours may differ — use §17c) |
| GHCR api digest | `sha256:09bc071032f9c861903e9e945cdca5f5e6c0dc6dc69dd0c60c0ce7e21b507978` |
| GHCR web digest | `sha256:b4733fe5cca586a465289d1d436f95af74c72384c5ba804812a9db5a59a849d8` |

**Session constants** (reuse in every Phase 3 terminal):

```powershell
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

$RG = "rg-dndapp-learn"
$LOC = "eastus"
$CLUSTER = "aks-dndapp"
```

**Kustomize layout (DRY — 2026-06-22):**

```text
deploy/k8s/
  base/                         # Deployments, Services, Ingress, Redis (shared)
  config/environments.json      # namespace, ingressHost, frontendUrl per env
  scripts/Build-Overlay.ps1     # generates .generated/<env>/ (gitignored)
  overlays/README.md            # usage docs (no duplicated YAML trees)
```

**Deploy one or all environments:**

```powershell
cd C:\Users\zzorc\OneDrive\Desktop\WorkDesktop\DnDApp

# Preview (no apply)
.\deploy\k8s\scripts\Build-Overlay.ps1 -Environment dev

# Apply one env
.\deploy\k8s\scripts\Build-Overlay.ps1 -Environment dev -Apply

# Apply all five
.\deploy\k8s\scripts\Build-Overlay.ps1 -Environment all -Apply
```

### 17a. Preflight Azure

```powershell
# Install (once) — winget on Windows
winget install Microsoft.AzureCLI --accept-package-agreements --accept-source-agreements

# Refresh PATH in current PowerShell if az not found
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

az version
az login                    # browser — free trial / subscription with credits
az account show -o table
az account list -o table    # if wrong sub: az account set --subscription "<id>"

# First-time subscription: register AKS provider (wait until Registered)
az provider register --namespace Microsoft.ContainerService
az provider show -n Microsoft.ContainerService --query registrationState -o tsv

# Context hygiene — kind local vs AKS cloud
kubectl config get-contexts
kubectl config current-context
```

| Context | Cluster | Use for |
|---------|---------|---------|
| `kind-dnd-dev` | kind on Docker Desktop | Phase 1–2 local practice |
| `aks-dndapp` | Azure AKS | Phase 3 cloud |

**Switch context explicitly before every apply:**

```powershell
kubectl config use-context aks-dndapp    # cloud
kubectl config use-context kind-dnd-dev  # local kind
```

**Optional:** when only using AKS, free local RAM — `kind delete cluster --name dnd-dev` (does not affect Azure).

### 17b. Create AKS cluster

**Cost note:** nodes + Load Balancer bill while `powerState` is `Running`. Use §17g to stop when idle.

**VM size (free trial gotcha):** `Standard_B2s` is often `NotAvailableForSubscription` in `eastus`. Use **`Standard_D2s_v7`** (2 vCPU, 8 GB). Always pass `--node-vm-size` explicitly — omitting it may default to a SKU your trial blocks.

```powershell
$RG = "rg-dndapp-learn"
$LOC = "eastus"
$CLUSTER = "aks-dndapp"

az group create --name $RG --location $LOC

# Verify RG exists (skip create if already there)
az group show --name $RG -o table

az aks create `
  --resource-group $RG `
  --name $CLUSTER `
  --node-count 1 `
  --node-vm-size Standard_D2s_v7 `
  --generate-ssh-keys `
  --enable-managed-identity

az aks get-credentials --resource-group $RG --name $CLUSTER --overwrite-existing
kubectl config current-context
kubectl get nodes
```

**Expected:** context `aks-dndapp`, one node `Ready`, K8s ~1.34.x.

**Spot nodes (optional, testing only):** `--priority Spot` is **not** valid on `az aks create`. `--node-count 0` fails on the default **system** pool on free trial. To use Spot later: create a regular cluster first, then `az aks nodepool add ... --priority Spot` (see Azure docs). Not recommended for live D&D sessions (eviction risk).

### 17c. NGINX Ingress Controller

AKS does not ship Ingress by default. Install the community controller (once per cluster):

```powershell
kubectl config current-context   # must be aks-dndapp

kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.11.3/deploy/static/provider/cloud/deploy.yaml

kubectl wait --namespace ingress-nginx `
  --for=condition=ready pod `
  --selector=app.kubernetes.io/component=controller `
  --timeout=180s

kubectl get svc -n ingress-nginx ingress-nginx-controller
```

Note **EXTERNAL-IP** (may take 2–5 min on Azure LB). **One IP for all environments** — NGINX routes by **Host** header (`dnd-dev.local`, `dnd-test.local`, …). The `.local` suffix is a **lab hostname** (no real DNS domain yet); apps run in **Azure**, not on your PC.

### 17d. GHCR pull secret (all namespaces)

The `ghcr-pull` secret from kind **does not transfer** to AKS. Create in each namespace:

```powershell
$namespaces = @("dnd-dev", "dnd-test", "dnd-qa", "dnd-stage", "dnd-prod")

foreach ($ns in $namespaces) {
  kubectl create namespace $ns --dry-run=client -o yaml | kubectl apply -f -
  kubectl create secret docker-registry ghcr-pull `
    --docker-server=ghcr.io `
    --docker-username=crozzbite `
    --docker-password="$(gh auth token)" `
    -n $ns `
    --dry-run=client -o yaml | kubectl apply -f -
}
```

> 🚨 Cerbero: PowerShell requires `"$(gh auth token)"` — bare `(gh auth token)` splits into two kubectl args.

### 17e. Deploy overlays

**Typo traps:** `-Environment` (not `-Enviroment`); `$namespaces` (not `$namespace`); `kubectl` (not `cubectl`).

Create `ghcr-pull` in all five namespaces (§17d), then:

```powershell
cd C:\Users\zzorc\OneDrive\Desktop\WorkDesktop\DnDApp

kubectl config current-context   # aks-dndapp

# All five namespaces (idempotent — safe to re-run)
.\deploy\k8s\scripts\Build-Overlay.ps1 -Environment all -Apply

# Verify rollouts (pick any namespace)
kubectl rollout status deployment/api -n dnd-dev
kubectl rollout status deployment/web -n dnd-prod
kubectl get pods -A | Select-String "dnd-"
kubectl get ingress -A
```

**Verify same digest across namespaces:**

```powershell
kubectl get deploy -A -l app.kubernetes.io/part-of=dndapp `
  -o custom-columns='NS:.metadata.namespace,NAME:.metadata.name,IMAGE:.spec.template.spec.containers[0].image'
```

**Expected:** api + web in all five namespaces reference the same `@sha256:...` digests from Phase 2.

**Pod count (portal “~30” is normal):**

```powershell
kubectl get pods -A --no-headers | ForEach-Object { ($_ -split '\s+')[0] } | Group-Object | Sort-Object Name
```

| Namespace | Expected pods |
|-----------|----------------|
| `dnd-dev` … `dnd-prod` | 3 each (api, web, redis) → **15 app pods** |
| `ingress-nginx` | 1 |
| `kube-system` | ~14 (DNS, CNI, metrics, …) |
| **Total** | **~30** — not duplicate deploys |

### 17f. Ingress smoke test

Without a custom domain, use the Ingress **EXTERNAL-IP** + **hosts file** entries:

```powershell
$ip = kubectl get svc -n ingress-nginx ingress-nginx-controller -o jsonpath='{.status.loadBalancer.ingress[0].ip}'
Write-Host "EXTERNAL-IP: $ip"
```

Add to `C:\Windows\System32\drivers\etc\hosts` (**Administrator** Notepad — a `# comment` in PowerShell does **not** edit this file):

```powershell
# Run PowerShell as Administrator, then:
notepad C:\Windows\System32\drivers\etc\hosts
```

Append **one line** with **all five hosts** (replace IP with your EXTERNAL-IP from §17c):

```text
52.149.204.135  dnd-dev.local dnd-test.local dnd-qa.local dnd-stage.local dnd-prod.local
```

If only `dnd-dev.local` is listed, other hosts fail with `Could not resolve host`.

Smoke (all environments — same IP, different Host):

```powershell
curl.exe http://dnd-dev.local/ready
curl.exe http://dnd-dev.local/health
curl.exe http://dnd-test.local/ready
curl.exe http://dnd-test.local/health
curl.exe http://dnd-qa.local/ready
curl.exe http://dnd-stage.local/ready
curl.exe http://dnd-prod.local/ready
curl.exe -I http://dnd-dev.local/
```

Browser: `http://dnd-test.local/` etc.

**Expected:** `/ready` → `{"status":"ready","checks":{"redis":true},...}` on each env (Redis up). `/health` → `{"status":"ok",...}`. `Could not resolve host` → add missing hostnames to `hosts` (§17f admin Notepad).

**Fallback (no Ingress yet):** port-forward works identically to Phase 1–2:

```powershell
kubectl port-forward -n dnd-dev svc/api 3000:3000
kubectl port-forward -n dnd-dev svc/web 4200:4000
```

**TLS / HTTPS:** deferred until custom domain exists → cert-manager + Let's Encrypt in Phase 4+.

### 17g. Cost control (stop/start)

**Option A — stop entire cluster** (fastest cost cut; API unavailable):

```powershell
az aks stop --resource-group $RG --name $CLUSTER

# Verify stopped (PowerState = Stopped; kubectl cannot connect)
az aks show -g $RG -n $CLUSTER --query powerState.code -o tsv
kubectl get nodes   # expected: Unable to connect to the server

# Resume next session:
az aks start --resource-group $RG --name $CLUSTER
az aks show -g $RG -n $CLUSTER --query powerState.code -o tsv   # Running
kubectl get nodes                                               # Ready
```

**Option B — scale node pool to zero** (cluster API stays; no workload nodes):

```powershell
az aks nodepool scale --resource-group $RG --cluster-name $CLUSTER --name nodepool1 --node-count 0
# Scale back up:
az aks nodepool scale --resource-group $RG --cluster-name $CLUSTER --name nodepool1 --node-count 1
```

**Always stop when not practicing.** kind local remains free for day-to-day dev.

### 17h. Azure Portal — where to look

**Infrastructure (9 resources in “All resources”):** VMSS, Load Balancer, Public IPs, VNet in `MC_rg-dndapp-learn_aks-dndapp_eastus` — auto-created node resource group.

**Kubernetes workloads:** open **`aks-dndapp`** in `rg-dndapp-learn` → left menu:

| Portal menu (ES / EN) | What you see |
|------------------------|--------------|
| Espacios de nombres / Namespaces | `dnd-dev`, `dnd-test`, `dnd-qa`, `dnd-stage`, `dnd-prod` |
| Cargas de trabajo / Workloads | All pods (~30: 15 app + system + ingress) |
| Servicios e ingresos / Services and ingresses | Ingress per namespace; same ADDRESS, different HOSTS |

**Power state:** cluster overview → **Estado de energía** / **Power state** → `Running` or `Stopped`.

### 17i. Resume session (full workflow)

```powershell
$RG = "rg-dndapp-learn"
$CLUSTER = "aks-dndapp"

az aks start --resource-group $RG --name $CLUSTER
az aks show -g $RG -n $CLUSTER --query powerState.code -o tsv
kubectl get nodes

# If ghcr token expired, recreate secrets (§17d) then:
cd C:\Users\zzorc\OneDrive\Desktop\WorkDesktop\DnDApp
kubectl config current-context
kubectl get pods -A | Select-String "dnd-"

# Smoke one env
curl.exe http://dnd-dev.local/health

az aks stop --resource-group $RG --name $CLUSTER
```

### 17j. Troubleshoot

| Symptom | Cause | Fix |
|---------|-------|-----|
| `az: command not found` | PATH not refreshed | §17a PATH refresh or new terminal |
| `No subscriptions found` | Azure account without subscription | Sign up at azure.microsoft.com/free, then `az login` |
| `MissingSubscriptionRegistration` | AKS provider not registered | §17a `az provider register --namespace Microsoft.ContainerService` |
| `Standard_B2s` / `Standard_D4d_v5` not allowed | free trial SKU restrictions | §17b use `Standard_D2s_v7`; always set `--node-vm-size` |
| `agentPoolProfile.count was 0` | system pool requires ≥1 node | cannot use `--node-count 0` on create for Camino Spot |
| `--priority Spot` on `az aks create` | flags only on `nodepool add` | §17b note; create regular cluster first |
| `Could not resolve host: dnd-dev.local` | hosts file not edited | §17f admin Notepad, not PowerShell `#` comment |
| `dnd-dev.local` works, `dnd-test.local` fails | hosts missing other hostnames | §17f — add all five on one line |
| Portal shows ~30 pods, expected 15 | counting system + ingress pods | §17e pod count table |
| `ImagePullBackOff` on AKS | no `ghcr-pull` in namespace | §17d |
| Ingress `404` / no address | controller not ready / no EXTERNAL-IP | §17c wait + `kubectl get svc -n ingress-nginx` |
| Wrong cluster updated | context mix-up kind vs AKS | `kubectl config current-context` before apply |
| CORS errors from API | `FRONTEND_URL` mismatch | edit `deploy/k8s/config/environments.json` + re-run Build-Overlay |
| `az aks create` quota error | subscription limits | try another region or smaller VM |
| `-Enviroment` / `$namespace` / `cubectl` | PowerShell typos | §17e typo traps |
| CI run shows **cancelled** (X) | `concurrency: cancel-in-progress` + new push | §18e — check latest run, not the cancelled one |
| `Deletion of directory failed` on `git checkout` | Windows file lock / OneDrive | §18e — `git reset --hard HEAD` then `git switch master` |
| Submodule `No url found` on checkout | orphan submodule entry | vendor files or proper `.gitmodules`; §18e |

---

## 18. Phase 4 — CI (GitHub Actions)

**Status:** ✅ CI v1 live on `master` (2026-06-25) — PR #3 (workflow) + PR #4 (`/health`, Gentleman-Skills).  
**Workflow file:** `.github/workflows/dndapp-ci.yml`  
**Workflow name in Actions UI:** `DnDApp CI`  
**Default branch:** `master` (not `main`).

**CI v1 scope:** lint + test + build only. **No** Redis in runner, **no** Docker build, **no** GHCR push, **no** AKS deploy, **no** Karma.

### 18a. Local preflight (mirror CI)

Run these locally **before** changing the workflow or opening a PR.

**Backend** (`backend/` — bun 1.3.9 per `package.json` `packageManager`):

```powershell
cd C:\Users\zzorc\OneDrive\Desktop\WorkDesktop\DnDApp\backend
bun install
bun run lint
bun run test
bun run build
```

| Command | CI equivalent |
|---------|----------------|
| `bun install` | `bun install --frozen-lockfile` |
| `bun run test` | unit + e2e (`jest` + `jest-e2e`) — 20 tests incl. `/health` `/ready` contracts |

**Frontend** (`frontend/` — npm + **Node 22**, same as `frontend.Dockerfile`):

```powershell
cd C:\Users\zzorc\OneDrive\Desktop\WorkDesktop\DnDApp\frontend
npm ci
npm run build
```

| Pin | Where |
|-----|--------|
| Node **22** | `setup-node` in workflow + `node:22-alpine` in Dockerfiles |
| bun **1.3.9** | `oven-sh/setup-bun` in workflow + `packageManager` in `backend/package.json` |

### 18b. Workflow triggers and jobs

```yaml
# .github/workflows/dndapp-ci.yml (summary)
on:
  pull_request:
    branches: [master]
  push:
    branches: [master]
```

| Job | Runner | Steps |
|-----|--------|-------|
| `backend` | `ubuntu-latest` | checkout → setup-bun → `bun install --frozen-lockfile` → lint → test → build |
| `frontend` | `ubuntu-latest` | checkout → setup-node 22 → `npm ci` → `npm run build` |

Jobs run **in parallel**. `permissions: contents: read` only — no secrets in v1.

`concurrency` + `cancel-in-progress: true` cancels an in-flight run when a newer push hits the same PR (saves minutes).

### 18c. PR + merge to `master`

```powershell
cd C:\Users\zzorc\OneDrive\Desktop\WorkDesktop\DnDApp

# Feature branch (example)
git checkout -b chore/my-change
# ... commit ...
git push -u origin chore/my-change

gh pr create --base master --title "feat: ..." --body "## Summary`n- ...`n`n## Test plan`n- [ ] DnDApp CI green"
```

After merge, CI runs again on **`push` to `master`**.

```powershell
gh pr merge <number> --merge
# or squash:
gh pr merge <number> --squash
```

Sync local `master` after merge:

```powershell
git switch master
git pull origin master
```

If `git switch master` fails with `Deletion of directory ... failed`, answer **`n`**, then:

```powershell
git reset --hard HEAD
git fetch origin
git switch master
git pull origin master
```

### 18d. Monitor CI from terminal

```powershell
cd C:\Users\zzorc\OneDrive\Desktop\WorkDesktop\DnDApp

# Recent runs
gh run list --limit 5
gh run list --workflow dndapp-ci.yml --limit 5
gh run list --branch master --limit 5

# Inspect one run (use ID from list)
gh run view <RUN_ID>
gh run view <RUN_ID> --verbose

# Watch live until finish
gh run watch <RUN_ID>
gh run watch <RUN_ID> --exit-status

# Logs in terminal
gh run view <RUN_ID> --log
gh run view <RUN_ID> --log --job "Backend (lint, test, build)"
gh run view <RUN_ID> --log --job "Frontend (build)"
```

PR checks from CLI:

```powershell
gh pr checks
gh pr view --json statusCheckRollup,url
```

### 18e. CI troubleshoot

| Symptom | Cause | Fix |
|---------|-------|-----|
| Run status **cancelled** (X in `gh run list`) | Newer push replaced it (`cancel-in-progress`) | Use the **latest** run — usually `success` |
| Annotation: Node.js 20 deprecated | Internal runtime of `actions/checkout` / `setup-node` | Informational — frontend build still uses **Node 22** in the Build step |
| `gh pr create` → `No commits between main and master` | Wrong base branch name | Use `--base master` |
| `Head sha can't be blank` / no commits | Branch not pushed | `git push -u origin <branch>` first |
| `fatal: No url found for submodule` in post-checkout | Orphan submodule in index | Remove submodule ref; vendor files under `.agent/skills/` (PR #4) |
| Backend test fails on Redis | Expected locally without Redis | e2e mocks Redis TCP/PONG — if fail, run `bun run test` locally |
| `npm ci` fails in CI | `package-lock.json` out of sync | Regenerate lock locally, commit, push |
| `bun install --frozen-lockfile` fails | `bun.lock` out of sync | `bun install` locally, commit `bun.lock` |

**Verified green runs (reference):**

| Event | Run ID (approx.) | Notes |
|-------|------------------|-------|
| PR #3 merge → master | `28204230172` | First CI on master |
| PR #4 CI | `28205247965` | `/health` + contract tests |
| PR #4 merge → master | `28205354984` | Post-merge CI |

### 18f. CD (Step D — not yet automated)

Next workflow (planned): `.github/workflows/dndapp-cd-build.yml` — Docker build + push to GHCR on merge to `master`. Requires `write:packages` (`gh auth status`). See [phase-4-checklist.md](./phase-4-checklist.md) Step D.

---

## Cheat sheet — flags at a glance

| Flag / pattern | Tool | Meaning |
|----------------|------|---------|
| `-d` | compose | Detached (background) |
| `--build` | compose | Build before up |
| `--tail=N` | compose / kubectl logs | Last N log lines |
| `-f` | compose logs / kubectl apply | Follow logs / file path |
| `-n dnd-dev` | kubectl | Namespace |
| `-l app.kubernetes.io/name=api` | kubectl | Label selector |
| `apply -f` | kubectl | Declarative create/update |
| `delete -f` | kubectl | Delete resources from file |
| `IfNotPresent` | Deployment | Use local image on node |
| `tcpSocket` | Deployment probe | Port-open only (legacy web workaround; prefer `httpGet /health` on Express) |
| `port-forward` | kubectl | Local access to cluster Service |
| `docker push` | docker | Upload an image to a registry (GHCR) |
| `ghcr.io/<owner>/<name>:<tag>` | docker | Full registry image address |
| `docker login ghcr.io` | docker | Authenticate to GHCR before push/pull |
| `imagePullSecrets` | Deployment | Credentials to pull a private registry image |
| `apply -k` | kubectl | Apply Kustomize overlay directory |
| `Build-Overlay.ps1 -Environment` | PowerShell | Generate `.generated/<env>/` from `environments.json` |
| `az provider register` | Azure CLI | Enable AKS on new subscriptions |
| `az aks stop/start` | Azure CLI | Cost control — pause/resume AKS cluster |
| `Standard_D2s_v7` | AKS | Trial-friendly node VM size (eastus) |
| `gh run list` / `gh run watch` | GitHub CLI | Monitor Actions from terminal (§18d) |
| `gh pr create --base master` | GitHub CLI | Open PR — default branch is `master` |
| `bun install --frozen-lockfile` | bun | CI install — lockfile must match `package.json` |
| `dndapp-ci.yml` | GitHub Actions | CI workflow — lint/test/build on PR + push to `master` |

---

*Maintained during the DnDApp deployment learning track. Update when new phases or manifests are added.*
