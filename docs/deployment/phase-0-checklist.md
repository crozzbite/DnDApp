# Phase 0 — Local manual deployment checklist

**Parent:** [DEPLOYMENT-MASTER-PLAN.md](./DEPLOYMENT-MASTER-PLAN.md)  
**Status:** ✅ COMPLETE (2026-06-09) — stack verified, rollback drill executed (REDIS_HOST sabotage → ECONNREFUSED diagnosis → recovery)

---

## Before you start

- [ ] Docker Desktop installed and running (Windows)
- [ ] `bun` available locally (canon SkullRender for backend)
- [ ] Git remote has **no PAT in URL** (see master plan §4)
- [ ] Read master plan §2 (decisions) once

---

## Session goals

1. Build three containers: **frontend**, **backend**, **redis**
2. Wire config via **environment** (compose) — ConfigMap pattern comes in Phase 1
3. Verify health and basic UI
4. Practice **rollback**: tear down and restore previous image tag

---

## Steps (fill checkboxes during session)

### A. Prerequisites

- [ ] `cd DnDApp`
- [ ] `git status` clean or intentional branch
- [ ] Note current commit: `git rev-parse --short HEAD`

### B. Build images (manual)

- [ ] Build backend image from `deploy/docker/backend.Dockerfile`
- [ ] Build frontend image from `deploy/docker/frontend.Dockerfile`
- [ ] Record image tags used (e.g. `local-dnd-api:abc1234`)

### C. Compose up

- [ ] `docker compose -f deploy/compose/docker-compose.yml up --build`
- [ ] Wait until all services healthy

### D. Smoke tests

| Check | URL / command | Expected |
|-------|----------------|----------|
| API health | `http://localhost:3000/health` | `{ "status": "ok", ... }` |
| API prefix | `http://localhost:3000/v1/...` | compendium route if exposed |
| Frontend | `http://localhost:4200` (or mapped port) | App shell loads |
| Redis | logs show BullMQ connected | no Redis connection errors |

### E. Config sanity

- [ ] `FRONTEND_URL` matches frontend origin (CORS)
- [ ] `REDIS_HOST` points at redis service name in compose
- [ ] `NODE_ENV` set appropriately per service

### F. Rollback drill (manual pipeline discipline)

- [x] `docker compose down`
- [x] Change one env var (simulate config promotion mistake) — `REDIS_HOST: localhost`
- [x] `docker compose up` — observe failure or wrong behavior — silent degradation: `Up (healthy)` but BullMQ `ECONNREFUSED 127.0.0.1:6379` in logs
- [x] Revert env / use previous image tag
- [x] `docker compose up` — confirm recovery — clean boot, no ECONNREFUSED

**Lesson captured:** two failure modes seen — boot crash (missing `FRONTEND_URL`, container dies) vs silent degradation (`REDIS_HOST` wrong, healthcheck still green because `/health` doesn't validate Redis).

### G. Teardown

- [ ] `docker compose down -v` (only if you intend to wipe volumes)

---

## Exit criteria (Phase 0 complete)

- [ ] All sections B–F checked
- [ ] Notes captured: ports used, image tags, any blockers
- [ ] Master plan updated if decisions changed

---

## After Phase 0

Next: **Phase 1** — same stack on **kind** with real **ConfigMap** + **Secret** manifests.

Say in chat: **“Empezamos Fase 1”** or continue with registry (**Phase 2**).
