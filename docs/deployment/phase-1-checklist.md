# Phase 1 — Kubernetes local (kind) checklist

**Parent:** [DEPLOYMENT-MASTER-PLAN.md](./DEPLOYMENT-MASTER-PLAN.md)  
**Command snippets:** [COMMAND-REFERENCE.md](./COMMAND-REFERENCE.md)  
**Status:** ✅ COMPLETE (2026-06-16) — full stack + rollback drill + hardcoding audit done

---

## Before you start

- [x] Phase 0 complete (compose stack verified)
- [x] Docker Desktop running
- [x] `kubectl` installed
- [x] `kind` installed
- [ ] Read master plan §6 (ConfigMap vs Secret)

---

## Session goals

1. Run same stack on **kind** cluster `dnd-dev`
2. Use **Namespace**, **Deployment**, **Service**, **ConfigMap**
3. **readinessProbe** validates Redis (Phase 0 lesson)
4. Practice **kubectl apply**, **port-forward**, K8s rollback

---

## Steps

### A. Preflight

- [x] `kind version`
- [x] `kubectl version --client`
- [x] `docker info`
- [x] On branch `chore/phase0-docker-compose` @ `8512ae7` (or equivalent)

→ Commands: [COMMAND-REFERENCE §1](./COMMAND-REFERENCE.md#1-preflight-tools)

### B. kind cluster

- [x] `kind create cluster --name dnd-dev`
- [x] `kubectl get nodes` → `Ready`

→ Commands: [COMMAND-REFERENCE §7](./COMMAND-REFERENCE.md#7-phase-1--kind-cluster)

### C. Namespace + folder layout

- [x] `deploy/k8s/base/` created
- [x] `deploy/k8s/overlays/dev/` created
- [x] `namespace.yaml` applied → `dnd-dev` Active

→ Commands: [COMMAND-REFERENCE §8](./COMMAND-REFERENCE.md#8-phase-1--namespace)

### D. Redis

- [x] `redis-deployment.yaml` + `redis-service.yaml`
- [x] Pod `1/1 Running`, Service `redis:6379`

→ Commands: [COMMAND-REFERENCE §9](./COMMAND-REFERENCE.md#9-phase-1--redis)

### E. API backend

- [x] Build `dndapp-api:local`
- [x] `kind load docker-image`
- [x] `api-configmap.yaml`, `api-deployment.yaml`, `api-service.yaml`
- [x] Pod `1/1 Running`
- [x] `port-forward` → `/health` OK

→ Commands: [COMMAND-REFERENCE §10–11](./COMMAND-REFERENCE.md#10-phase-1--api)

### F. Web frontend

- [x] Build `dndapp-web:local`
- [x] Web manifests applied
- [x] `tcpSocket` probes (Angular SSR Host fix) — see COMMAND-REFERENCE §14d
- [x] `port-forward` → HTTP 200 on `:4200`
- [ ] UI polish — **out of scope for deploy track** (WIP features / stash `WIP-DnDApp-2026-05-25`)

→ Commands: [COMMAND-REFERENCE §14](./COMMAND-REFERENCE.md#14-phase-1--web-frontend)

### G. Rollback drill (K8s)

- [x] Sabotage `REDIS_HOST: localhost` in ConfigMap
- [x] Discovered hardcoded probe masked failure → fixed probe to use `process.env.REDIS_HOST`
- [x] Observe pod `0/1 Ready` (not silent like compose)
- [x] Config rollback: revert ConfigMap + `rollout restart` → `1/1`
- [x] Learned: `rollout undo` does NOT revert ConfigMaps (config rollback ≠ revision rollback)

→ Commands: [COMMAND-REFERENCE §12](./COMMAND-REFERENCE.md#12-phase-1--rollback)  
→ Lesson: [lessons-hardcoding.md](./lessons-hardcoding.md)

---

## Exit criteria (Phase 1 complete)

- [x] Redis + API + Web running in `dnd-dev`
- [x] ConfigMap drives non-secret env
- [x] readinessProbe catches bad Redis config (API) — env-driven, not hardcoded
- [x] port-forward smoke tests pass (`/health`, web HTTP 200)
- [x] Rollback drill executed (config sabotage → 0/1 → revert → 1/1)
- [x] COMMAND-REFERENCE updated (web, probes, port conflicts)
- [x] Hardcoding audit documented (lessons-hardcoding.md) — fixes scheduled per phase

---

## After Phase 1

Next: **Phase 2** — push images to **GHCR**, deploy by git SHA tag.

Say in chat: **“Empezamos Fase 2”**

