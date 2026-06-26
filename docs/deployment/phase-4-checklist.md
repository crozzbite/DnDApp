# Phase 4 — CI/CD (GitHub Actions) checklist

**Parent:** [DEPLOYMENT-MASTER-PLAN.md](./DEPLOYMENT-MASTER-PLAN.md)  
**Command snippets:** [COMMAND-REFERENCE.md §18](./COMMAND-REFERENCE.md#18-phase-4--cicd-github-actions) — CI complete; CD subsection §18f pending  
**Status:** ✅ **COMPLETE** (2026-06-26) — learning track closed; Step F (GitHub environments) deferred  
**Command snippets:** [COMMAND-REFERENCE.md](./COMMAND-REFERENCE.md) — §0 visual maps · §18 CI/CD · [ghcr-packages.md](./ghcr-packages.md)

**Learning mode:** one step at a time — agent explains, **you run commands**. Do not skip ahead to CD until CI passes on GitHub.

---

## Before you start

- [x] Phase 3 complete (AKS, five namespaces, Ingress smoke)
- [x] Phase 2 complete (GHCR manual push + digest deploy)
- [x] AKS `powerState: Stopped` when not practicing deploy (`az aks stop` after 2026-06-25 smoke)
- [x] `gh auth status` → `repo`, `workflow`, `write:packages` (2026-06-25)
- [ ] Git remote clean — **no PAT in URL** ([DEPLOYMENT-MASTER-PLAN §4](./DEPLOYMENT-MASTER-PLAN.md#4-security-prerequisite-do-before-phase-0-push))
- [ ] Confirm **cost budget** — GitHub Actions free minutes + AKS only running during deploy drills

---

## Session goals

1. **CI workflow** — test / lint / build on PR or push to **`master`** ✅
2. **CD build+push** — on merge to `main`, build images and push to GHCR with tag `<git-sha-short>`
3. **CD deploy test** — automatically deploy that SHA to **`dnd-test`** on AKS
4. **Promotion gates** — manual approval (or documented `workflow_dispatch`) for **`dnd-qa`**, **`dnd-stage`**, **`dnd-prod`**
5. **`gga`** installed in repo (local guardrail) if applicable
6. **No secrets in git** — GitHub Secrets / OIDC only
7. **Docs** — COMMAND-REFERENCE §18 CI ✅; §18f CD when Step D lands

---

## What we automate (map from manual phases)

| Manual (Phases 2–3) | Automated (Phase 4) |
|----------------------|---------------------|
| `docker build` + tag `$sha` + `docker push` GHCR | Job on merge to `main` |
| `Build-Overlay.ps1 -Environment test -Apply` | Job after successful GHCR push |
| Re-apply overlay for qa/stage/prod | Separate workflow + **manual approval** |
| Local `bun run lint/test/build` (backend) | CI job on every PR/push |
| Local `ng build` (frontend) | CI job on every PR/push |

**Image convention (unchanged):**

```text
ghcr.io/crozzbite/dndapp-api:<git-sha-short>
ghcr.io/crozzbite/dndapp-web:<git-sha-short>
```

---

## Steps

### A. Preflight — local commands CI will call

Prove the same commands work on your PC **before** writing YAML.

**Backend** (`backend/` — bun):

```powershell
cd C:\Users\zzorc\OneDrive\Desktop\WorkDesktop\DnDApp\backend
bun install
bun run lint
bun run test
bun run build
```

**Frontend** (`frontend/` — npm per Dockerfile convention; Angular SSR):

```powershell
cd C:\Users\zzorc\OneDrive\Desktop\WorkDesktop\DnDApp\frontend
npm ci
npm run build
```

> `bun run test` runs **unit + e2e** (health/ready contracts). Frontend Karma deferred in v1 CI.

- [x] Backend lint / test / build pass locally
- [x] Frontend `npm ci` + `npm run build` pass locally (2026-06-25)
- [x] Web K8s probes: `httpGet /health` on Express (JD P2 — not tcpSocket)
- [ ] Record build warnings / npm audit debt (see Engram `dndapp/frontend-build-warnings`)

### Runtime pin (canon — Lich + Gentleman)

| Layer | Pin |
|-------|-----|
| Frontend Docker + CI | **Node 22** (`node:22-alpine`, `actions/setup-node` `node-version: '22'`) |
| Backend CI | **bun** (`oven-sh/setup-bun`, `bun install --frozen-lockfile`) |
| Backend Docker run stage | Node 22 alpine (Nest output via `node dist/main`) |

Workflow file name: **`.github/workflows/dndapp-ci.yml`** (not generic `ci.yml` — multi-repo clarity).

### B. Scaffold GitHub Actions (CI only)

First file — **no deploy, no GHCR push yet:**

```text
.github/workflows/dndapp-ci.yml
```

Planned triggers (confirm before commit):

- `pull_request` → branches: `main` (and feature branches if desired)
- `push` → branches: `main` (optional for direct pushes)

Planned jobs (minimal v1):

| Job | Working directory | Commands |
|-----|-------------------|----------|
| `backend` | `backend/` | `bun install` → `bun run lint` → `bun run test` (unit+e2e) → `bun run build` |
| `frontend` | `frontend/` | `npm ci` → `npm run build` (Node **22**) |

- [x] Create `.github/workflows/` directory
- [x] Add `dndapp-ci.yml` (merged PR #3)
- [x] No secrets required for CI-only workflow

### C. Verify CI on GitHub

- [x] Push branch or open PR targeting `master` (PR #3, #4)
- [x] Actions tab shows **DnDApp CI** workflow running
- [x] Both jobs green (incl. post-merge `28205354984`)
- [x] Fix failures before proceeding to CD — N/A (green)

### D. CD — build + push to GHCR (after CI green)

Workflow: `.github/workflows/dndapp-cd-build.yml`

- [x] Trigger: `workflow_run` after green CI on push to `master`
- [x] Build `deploy/docker/backend.Dockerfile` + `frontend.Dockerfile`
- [x] Tag with `git rev-parse --short HEAD`
- [x] Push to `ghcr.io/crozzbite/dndapp-api` + `dndapp-web`
- [x] `GITHUB_TOKEN` + Manage Actions access (Write) on both GHCR packages
- [x] Verified green: run `28207520768` (tag `722e2ca`)

### E. CD — deploy to `dnd-test` on AKS (OIDC)

Workflow: `.github/workflows/dndapp-cd-deploy.yml`  
Bootstrap (once): `deploy/scripts/bootstrap-github-oidc.ps1 -SetGitHubSecrets`

- [x] App Registration + federated credential (`repo:crozzbite/DnDApp:ref:refs/heads/master`)
- [x] GitHub Secrets: `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`
- [x] `Build-Overlay.ps1 -Environment test -ImageTag <sha> -Apply`
- [x] Verify first green deploy run on GitHub Actions (`28209417348`, tag `e934f87`)
- [x] Smoke: **`/ready` 200** + `/health` via Ingress (workflow step)
- [ ] `az aks stop` after drill if not continuing same session — **deferred** (cluster Running for continued practice)

### F. Promotion — qa / stage / prod (manual gate)

**Policy (2026-06-26):** auto deploy **only `dnd-test`**. qa / stage / prod **manual** for now.

- [x] Same SHA promoted manually; ConfigMap differs per namespace (`Build-Overlay -Environment all -ImageTag 0c51991` — verified `/ready` ×5)
- [ ] Workflow(s) with **`environment:`** + reviewers — **deferred** (Step F later)
- [ ] Documented manual promote command in COMMAND-REFERENCE §18h

**Manual promote (current canon):**

```powershell
$tag = git rev-parse --short HEAD   # or pinned SHA e.g. 0c51991
.\deploy\k8s\scripts\Build-Overlay.ps1 -Environment qa    -ImageTag $tag -Apply
.\deploy\k8s\scripts\Build-Overlay.ps1 -Environment stage -ImageTag $tag -Apply
.\deploy\k8s\scripts\Build-Overlay.ps1 -Environment prod  -ImageTag $tag -Apply
```

### G. Local guardrail — `gga`

- [x] `gga init` in repo root (2026-06-26)
- [x] `gga install` — pre-commit hook active
- [x] Configure `.gga` `PROVIDER` + run `gga run` green on staged changes (Gemini, commit `de48622`)

### H. Documentation close-out

- [x] COMMAND-REFERENCE §0 visual maps (DAGs + promotion state)
- [x] Extend §18f / §18g with verified CD runs + diagrams
- [x] §18h manual promote commands
- [x] [ghcr-packages.md](./ghcr-packages.md) — package README templates
- [x] Mark all steps above complete in this file (exit criteria review)
- [x] Update [DEPLOYMENT-MASTER-PLAN.md §14](./DEPLOYMENT-MASTER-PLAN.md#14-session-handoff) → Phase 4 complete

---

## Exit criteria (Phase 4 complete)

- [x] **CI:** test / lint / build on PR or push to **`master`**
- [x] **CD push:** automatic GHCR push with SHA tag on push to `master`
- [x] **CD deploy:** automatic deploy to **`dnd-test`** on AKS
- [x] **Promotion:** manual promote documented (§18h); GitHub `environment:` gates **deferred**
- [x] **`phase-4-checklist.md`** final sign-off (this file)
- [x] **COMMAND-REFERENCE §18** + §0 maps + ghcr-packages
- [x] **`gga`** installed + Gemini provider
- [x] **No secrets in git** — remote `origin` clean URL (2026-06-26 audit); workflows use secret **names** only

---

## Cost reminders

| Resource | Cost note |
|----------|-----------|
| GitHub Actions | Free tier minutes/month — usually enough for learning |
| AKS | Bill while `Running` — **`az aks stop`** when not testing deploy from Actions |
| GHCR | Storage for images; keep tag hygiene |

---

## After Phase 4

Parked for later phases:

- Custom domain + cert-manager TLS
- Headless frontend tests in CI (Karma/Chrome)
- Observability (Prometheus/Grafana)
- PostgreSQL when backend adds persistence

---

## Current step

**→ Done.** Optional: paste [ghcr-packages.md](./ghcr-packages.md) into GHCR package READMEs; `az aks stop` when idle.
