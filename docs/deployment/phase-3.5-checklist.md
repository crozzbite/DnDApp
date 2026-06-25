# Phase 3.5 — Hardening + TDD (pre-CI/CD)

**Parent:** [DEPLOYMENT-MASTER-PLAN.md](./DEPLOYMENT-MASTER-PLAN.md)  
**Judgment Day:** Round 1 → P0 fixes → Round 2 (P0 cleared on K8s path)  
**Status:** ✅ COMPLETE — 2026-06-25 — AKS smoke ×5 hosts (`/ready`, `/health`, API, web); cluster stopped when idle

---

## Goal

Close silent-failure gaps before Phase 4 GitHub Actions. Behavior-driven contracts (`/health` vs `/ready`), not superficial smoke.

---

## P0 — Judgment Day fixes ✅

- [x] `GET /ready` (503 if Redis down) + `GET /health` (liveness only)
- [x] Shared `getRedisConnectionConfig()` for BullMQ + `/ready`
- [x] K8s `readinessProbe` → `httpGet /ready`
- [x] Ingress + `Build-Overlay.ps1` expose `/ready`
- [x] Contract tests + e2e (503 path)
- [x] Round 2: K8s CRITICALs closed

---

## P1-a — GHCR image with `/ready`

- [x] API image built (`ghcr.io/crozzbite/dndapp-api:e7342ff`)
- [x] Pushed to GHCR — digest `sha256:3da3f26ded380dde02cd0c39e432d6d770330eb9a48da45fc32fbb0c0ed392e6`
- [x] `api-deployment.yaml` digest updated
- [x] `/ready` returns 200 on all five Ingress hosts (`dnd-dev` … `dnd-prod`)
- [ ] Sabotage drill on AKS (optional — deferred)

Cluster apply when ready:

```powershell
# az aks start --resource-group rg-dndapp-learn --name aks-dndapp
.\deploy\k8s\scripts\Build-Overlay.ps1 -Environment all -Apply
curl.exe http://dnd-dev.local/ready
curl.exe http://dnd-dev.local/health
# az aks stop ...
```

---

## P1 — Post Round 2 ✅ (code/docs)

- [x] **P1-b** Redis check uses RESP `PING` (not TCP-only)
- [x] **P1-c** Docker `HEALTHCHECK` → `/ready`
- [x] **P1-d** Compose `api.healthcheck` → `/ready`
- [x] **P1-e** `readinessProbe.timeoutSeconds: 5` aligned with app probe timeout
- [x] **P1-f** `bun run test` includes e2e (`jest` + `jest-e2e`)
- [x] **P1-g** E2e positive `/ready` 200 with fake Redis PONG
- [x] **P1-h** Contract tests: ingress `/ready`, overlay script, probe timeout
- [x] **P1-i** Docs smoke → `/ready` + `/health` (COMMAND-REFERENCE, phase-4)
- [x] **P1-j** `lessons-hardcoding.md` updated for canonical `/ready` fix
- [x] **P1-k** `build` script → `tsc` (avoids broken `nest`/`iconv-lite` on OneDrive)
- [x] **P1-l** JD Round 3 polish — Dockerfile HEALTHCHECK `node fetch /ready`; §5b drill text; Docker contract test

---

## Smoke contract (canonical)

| Check | Expect | Meaning |
|-------|--------|---------|
| `GET /health` | 200 `{ status: ok }` | Process alive (liveness) |
| `GET /ready` | 200 `{ status: ready, checks: { redis: true } }` | Ready for traffic |
| `GET /ready` (Redis down) | 503 | Fail visible — not silent |

---

## After Phase 3.5

→ **Phase 4** — `ci.yml` (see [phase-4-checklist.md](./phase-4-checklist.md))

**Go/no-go Phase 4:** P1-a complete + `bun run test` green + local `install/build` green.

### Local preflight gate ✅ (2026-06-25)

- [x] `bun run lint` — 0 errors (includes ESLint cleanup for CI readiness)
- [x] `bun run test` — 17/17 (14 unit + 3 e2e)
- [x] `bun run build` — `tsc` OK

> **Mañana Phase 4:** commit lint fixes → Step A frontend `npm ci` + `npm run build` → Step B `ci.yml`
