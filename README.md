# SkullRender Nexus: DnDApp

Bienvenido al sistema **Nexus**, una solución integral para el multiverso D&D bajo la arquitectura de **SkullRender**.

## Estructura del proyecto

- **`/frontend`**: Capa de la Piel (Flesh). Angular 19+ con Signals y SSR.
- **`/backend`**: Capa de la Armadura y Cerebro. API NestJS con workers de ingesta.
- **`/openspec`**: Especificaciones técnicas y arquitectónicas.
- **`/.agent`**: Capacidad cognitiva y habilidades de SkullRender.

---

## Despliegue (DevOps track)

| Doc | Purpose |
|-----|---------|
| [DEPLOYMENT-MASTER-PLAN.md](docs/deployment/DEPLOYMENT-MASTER-PLAN.md) | Decision log + phase map |
| [skullrender-cicd-standard.md](docs/deployment/skullrender-cicd-standard.md) | **SkullRender CI/CD template** (reusable across repos) |
| [COMMAND-REFERENCE.md](docs/deployment/COMMAND-REFERENCE.md) | Operational runbook (no fingerprints in git) |
| [phase-4-checklist.md](docs/deployment/phase-4-checklist.md) | CI/CD close-out |
| [ghcr-packages.md](docs/deployment/ghcr-packages.md) | GHCR package README (paste into GitHub Packages UI) |

**API docs (Swagger):** `http://localhost:3000/docs` en dev — no sustituye los runbooks de deploy.

---

## Inicio rápido

### Frontend

```bash
cd frontend
npm install
npm run start
```

### Backend

```bash
cd backend
bun install
bun run start:dev
```

---

## Estándares (The Skull Way)

- **Radical Naming**: Sin sufijos redundantes.
- **OnPush**: Estrategia de detección de cambios obligatoria.
- **Signals**: Gestión de estado reactiva nativa.

_Bones + Brain = Rational Creativity._
