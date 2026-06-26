# Phase 2 — GHCR manual push checklist

**Parent:** [DEPLOYMENT-MASTER-PLAN.md](./DEPLOYMENT-MASTER-PLAN.md)  
**Command snippets:** [COMMAND-REFERENCE.md §16](./archive/COMMAND-REFERENCE-phases-0-3-manual.md#16-phase-2--ghcr-registry)  
**Status:** ✅ COMPLETE (2026-06-21) — build, push, digest deploy, smoke test done

---

## Before you start

- [x] Phase 1 complete (kind stack in `dnd-dev`)
- [x] Docker Desktop running
- [x] `gh auth login` with `write:packages` scope
- [x] `docker login ghcr.io` succeeds
- [x] Clean git tree (Phase 1 artifacts committed before tagging)

---

## Session goals

1. **Build once**, tag with `git rev-parse --short HEAD`
2. **Push** to `ghcr.io/crozzbite/dndapp-api` and `dndapp-web`
3. **Deploy by digest** (immutable pin) with real GHCR pull on kind
4. Smoke test via port-forward

---

## Steps

### A. Preflight GHCR

- [x] `gh auth refresh -h github.com -s write:packages,read:packages`
- [x] `gh auth status` → scopes include `write:packages`
- [x] `gh auth token | docker login ghcr.io -u crozzbite --password-stdin` → Login Succeeded
- [x] Dead PAT scrubbed from `git remote` URL
- [x] Cluster `dnd-dev` healthy (`kubectl get pods -n dnd-dev`)

→ Commands: [archive §16a](./archive/COMMAND-REFERENCE-phases-0-3-manual.md#16a-auth-preflight-per-token)

### B. Build + tag for GHCR

- [x] `$sha = git rev-parse --short HEAD` → `28a836e` (after Phase 1 commit)
- [x] `docker build` api + web with `-t ghcr.io/crozzbite/dndapp-*:$sha`

→ Commands: [archive §16b](./archive/COMMAND-REFERENCE-phases-0-3-manual.md#16b-build-images-tagged-for-ghcr)

### C. Push to GHCR

- [x] `docker push ghcr.io/crozzbite/dndapp-api:$sha`
- [x] `docker push ghcr.io/crozzbite/dndapp-web:$sha`
- [x] Digests recorded (api `sha256:09bc0710...`, web `sha256:b4733fe5...`)

→ Commands: [archive §16c](./archive/COMMAND-REFERENCE-phases-0-3-manual.md#16c-push-to-ghcr)

### D. Link packages to repo

- [x] Linked `dndapp-api` + `dndapp-web` to `crozzbite/DnDApp` via GitHub UI
- [x] OCI `LABEL org.opencontainers.image.source` added to Dockerfiles (rebuild deferred to Phase 4)

→ Commands: [archive §16h](./archive/COMMAND-REFERENCE-phases-0-3-manual.md#16h-link-ghcr-package-to-repo-oci-label--rebuild)

### E. Manifests + pull secret

- [x] `api-deployment.yaml` + `web-deployment.yaml` → GHCR digest refs + `imagePullPolicy: Always`
- [x] `imagePullSecrets: ghcr-pull` on both Deployments
- [x] `kubectl create secret docker-registry ghcr-pull ...` in `dnd-dev`

→ Commands: [archive §16d–16f](./archive/COMMAND-REFERENCE-phases-0-3-manual.md#16d-point-manifests-at-ghcr)

### F. Redeploy + verify pull from GHCR

- [x] `kubectl apply` api + web deployments
- [x] Rollout success; pods `1/1 Running`
- [x] `kubectl describe pod` → `Successfully pulled` from `ghcr.io` (api + web)

### G. Smoke test

- [x] port-forward api → `/health` OK
- [x] port-forward web → HTTP 200 (`:4200`)
- [ ] UI polish — **out of scope** (WIP app / stash `WIP-DnDApp-2026-05-25`)

---

## Exit criteria (Phase 2 complete)

- [x] Images in GHCR tagged by git SHA
- [x] Manifests pin by digest (`@sha256:...`)
- [x] Cluster pulls private images via `ghcr-pull` secret
- [x] Smoke tests pass (infra; UI WIP acceptable)
- [x] COMMAND-REFERENCE §16 + §16h documented
- [x] Phase 2 artifacts committed on branch `chore/deploy-phase0-1`

---

## After Phase 2

Next: **Phase 3** — Azure AKS (one cluster, five namespaces, Ingress + HTTPS).

Say in chat: **"Empezamos Fase 3"**

**Deferred to Phase 4:** OCI label rebuild (auto-link on push), `imagePullPolicy: Always` → `IfNotPresent`, Dockerfile HEALTHCHECK (#7), port literals → Kustomize overlays (#2–6).
