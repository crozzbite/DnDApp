# Deploy — DnDApp

Infrastructure and runtime artifacts for DnDApp (Docker → Kubernetes → Azure).

**Start here:** [docs/deployment/DEPLOYMENT-MASTER-PLAN.md](../docs/deployment/DEPLOYMENT-MASTER-PLAN.md)  
**Tomorrow (Phase 0):** [docs/deployment/phase-0-checklist.md](../docs/deployment/phase-0-checklist.md)

## Planned layout

```text
deploy/
  docker/       # Dockerfiles (Phase 0)
  compose/      # docker-compose for local manual deploy (Phase 0)
  k8s/          # base + overlays per environment (Phase 1+)
```

Folders are populated phase by phase during the deployment learning track.
