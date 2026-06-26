# SkullRender Nexus: DnDApp

Bienvenido al sistema **Nexus**, una solución integral para el multiverso D&D bajo la arquitectura de **SkullRender**.

## 🏗️ Estructura del Proyecto

El proyecto se divide en dos dominios principales siguiendo el principio de separación de preocupaciones:

- **`/frontend`**: Capa de la Piel (Flesh). Aplicación Angular 19+ utilizando Signals y SSR.
- **`/backend`**: Capa de la Armadura y Cerebro (Armor & Brain). API NestJS con workers de ingesta distribuida.
- **`/openspec`**: Especificaciones técnicas y arquitectónicas del sistema.
- **`/.agent`**: Capacidad cognitiva y habilidades de SkullRender.

---

## 📦 Despliegue (DevOps track)

| Doc | Purpose |
|-----|---------|
| [DEPLOYMENT-MASTER-PLAN.md](docs/deployment/DEPLOYMENT-MASTER-PLAN.md) | Decision log + phase map |
| [COMMAND-REFERENCE.md](docs/deployment/COMMAND-REFERENCE.md) | Copy-paste workflows + **§0 DAGs** |
| [phase-4-checklist.md](docs/deployment/phase-4-checklist.md) | CI/CD close-out |
| [ghcr-packages.md](docs/deployment/ghcr-packages.md) | GHCR package README templates |

**API docs (Swagger):** `http://localhost:3000/docs` when running backend in dev — not the same as deployment runbooks.

---

## 🚀 Inicio Rápido

### Frontend

```bash
cd frontend
npm install
npm run start
```

### Backend

```bash
cd backend
npm install
npm run start:dev
```

---

## 🛡️ Estándares (The Skull Way)

- **Radical Naming**: Sin sufijos redundantes.
- **OnPush**: Estrategia de detección de cambios obligatoria.
- **Signals**: Gestión de estado reactiva nativa.

_Bones + Brain = Rational Creativity._
