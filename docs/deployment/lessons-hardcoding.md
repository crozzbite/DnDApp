# Lesson — Hardcoded values that can mask config failures

**Parent:** [DEPLOYMENT-MASTER-PLAN.md](./DEPLOYMENT-MASTER-PLAN.md)  
**Commands:** [COMMAND-REFERENCE.md](./COMMAND-REFERENCE.md)  
**Discovered:** 2026-06-16 (Phase 1 rollback drill)

---

## The incident

API `readinessProbe` had a **hardcoded** Redis host:

```yaml
# BAD — always probes "redis" regardless of app config
command: ["node","-e","require('net').connect(6379,'redis',...)"]
```

When we sabotaged `REDIS_HOST: localhost` in the ConfigMap:

| Layer | Result |
|-------|--------|
| ConfigMap / pod env | `REDIS_HOST=localhost` (bad) |
| App (BullMQ) | `ECONNREFUSED 127.0.0.1:6379` in logs (broken) |
| readinessProbe (hardcoded `redis`) | **passed** → pod `1/1 Ready` (lie) |

Same silent-degradation class as Phase 0 compose (`/health` green while Redis down).

## The fix

Probe must read the **same env the app uses**:

```yaml
# GOOD — probe follows REDIS_HOST/REDIS_PORT, same as the app
command:
  - node
  - -e
  - "require('net').connect({port:Number(process.env.REDIS_PORT||6379),host:process.env.REDIS_HOST||'redis'},function(){this.end();process.exit(0)}).on('error',()=>process.exit(1))"
```

Now bad `REDIS_HOST` → probe fails → pod `0/1 Ready` → no traffic. Failure is **visible**.

## How to detect this class of failure

```powershell
# 1. App truth — logs reveal the real connection target
kubectl logs -n dnd-dev -l app.kubernetes.io/name=api --tail=20
#    look for: ECONNREFUSED 127.0.0.1:6379  (app pointing at localhost)

# 2. Compare probe intent vs actual env
kubectl describe pod -n dnd-dev -l app.kubernetes.io/name=api | Select-String "Readiness"
kubectl exec -n dnd-dev deploy/api -- printenv REDIS_HOST
#    if probe target != printenv value → the probe can lie
```

**Rule of thumb:** a health check MUST use the exact same configuration as the application. A probe with its own hardcoded copy can report healthy while the app is broken.

---

## Audit — all base manifests (2026-06-16)

Two categories of hardcoding:

- **DANGER (masks failures):** probe/command targets a value DIFFERENT from app config.
- **DRIFT risk (duplication):** same literal repeated in several files; internally consistent today, but can silently diverge from the ConfigMap source of truth.

> K8s limitation: integer fields (`containerPort`, Service `port`, probe `port`) **cannot** reference a ConfigMap directly. The clean fix is **Kustomize** (single source per overlay) — planned for Phase 1 overlays. Until then: keep literals consistent and commented.

| # | File | Field | Issue | Category | Action |
|---|------|-------|-------|----------|--------|
| 1 | `api-deployment.yaml` | `readinessProbe` host | Was `redis` hardcoded ≠ `REDIS_HOST` | DANGER | ✅ Fixed (uses env) |
| 2 | `api-deployment.yaml` | `livenessProbe` port `3000` | Hardcoded vs ConfigMap `PORT` | DRIFT | Keep consistent; Kustomize later |
| 3 | `api-deployment.yaml` | `containerPort: 3000` | Hardcoded vs ConfigMap `PORT` | DRIFT | Keep consistent; Kustomize later |
| 4 | `api-service.yaml` | `port` / `targetPort 3000` | Hardcoded vs ConfigMap `PORT` | DRIFT | Keep consistent; Kustomize later |
| 5 | `web-deployment.yaml` | `containerPort 4000`, probe `4000` | Hardcoded vs `web-config PORT` | DRIFT | Keep consistent; Kustomize later |
| 6 | `web-service.yaml` | `port` / `targetPort 4000` | Hardcoded vs `web-config PORT` | DRIFT | Keep consistent; Kustomize later |
| 7 | `backend.Dockerfile` | `HEALTHCHECK ...:3000/health` | `/health` does NOT check Redis; Docker shows healthy while Redis down | DANGER (Docker layer) | Document; K8s readinessProbe is the real gate |
| 8 | `redis-deployment.yaml` | `containerPort 6379`, `redis-cli ping` | No host hardcode; ping is local | OK | No change |

### Priority fixes (apply AFTER the rollback drill)

1. **#1 — DONE.** Probe now env-driven.
2. **#7 — accept + document.** Docker `HEALTHCHECK` on `/health` is a liveness signal, not a Redis check. In K8s the **readinessProbe** (env-driven) is the authoritative Redis gate. Optionally add a `/ready` endpoint that pings Redis for a single source of truth.
3. **#2–#6 — Kustomize (Phase 1 overlays).** Define `PORT` once per environment; let overlays patch ports + ConfigMap together so they can't drift.

### Guardrail going forward

- Before adding any literal in a manifest, ask: *"Does this value already live in a ConfigMap/Secret? Will the app and the probe read the SAME source?"*
- Probes and commands → always `process.env.X`, never a second hardcoded copy.
- Integer ports → single source via Kustomize; never edit one file's port without the others.
