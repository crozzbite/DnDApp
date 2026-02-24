# Spec: Phase 7 - Deployment (Production)

Este documento especifica la implementación de la **Capa 7: Deployment** para el ecosistema DnDApp, siguiendo la Nexus Architecture de SkullRender.

## 1. Identificación de Fase

- **Fase:** 7 (Deployment)
- **Arquitectura:** SkullRender Nexus Architecture - Capa de Infraestructura de Producción.
- **Responsabilidad:** Despliegue, escalabilidad, monitoreo y entrega continua.

## 2. Estructura y Organización

El despliegue sigue un modelo híbrido para maximizar la velocidad en el borde (Edge) y la potencia en el núcleo (Core).

```bash
docker/                 # Definiciones de contenedores
│   ├── backend.Dockerfile
│   └── workers.Dockerfile
.github/workflows/      # Pipelines de CI/CD
│   ├── frontend-deploy.yml
│   └── backend-deploy.yml
config/                 # Configuraciones de entorno (templates)
│   ├── production.env.example
│   └── staging.env.example
vercel.json             # Configuración de despliegue frontend
```

## 3. Framework & Stack

- **Frontend:** Vercel (Edge delivery + SSR Caching).
- **Backend (Nexo Core):** Docker + Fly.io / GCP Cloud Run.
- **CI/CD:** GitHub Actions.
- **Monitoreo:** OpenTelemetry + Prometheus + Grafana.

## 4. Recursos de Construcción

- **Documentación:** `armor-tech-stack.md` (Sección 6: The Hybrid Throne).
- **Estrategia:** Despliegue Atómico y Rollback inmediato.

## 5. ADDED Requirements

### Requirement: The Hybrid Throne (Edge + Core)

El sistema DEBE ser desplegado de forma híbrida: el frontend en el borde para latencia mínima y el núcleo en contenedores para procesos persistentes.

#### Scenario: Despliegue de Frontend en Vercel

- **WHEN** se realiza un push a la rama `master`
- **THEN** GitHub Actions debe disparar el build de Angular y desplegar en Vercel con SSR habilitado para páginas de SEO.

### Requirement: CI/CD con Gauntlet Integrado

Cada despliegue DEBE pasar exitosamente por la fase Gauntlet antes de ser promovido a producción.

#### Scenario: Bloqueo de Despliegue por Fallo de Calidad

- **WHEN** un test de Playwright falla en el pipeline
- **THEN** el despliegue debe ser abortado automáticamente y notificar al equipo técnico.

### Requirement: Observability & Health Checks

El sistema DEBE exponer endpoints de salud y métricas para monitoreo proactivo.

#### Scenario: Alerta de Latencia en el Gateway

- **WHEN** el TTFB del backend supera los 300ms de forma sostenida
- **THEN** el sistema de monitoreo debe disparar una alerta de degradación de performance.

## 6. Valor Añadido (Design Patterns)

- **Blue-Green Deployment:** Permite cambios sin tiempo de inactividad intercambiando el tráfico entre ambientes.
- **Infrastructure as Code (IaC):** Todas las definiciones de infraestructura están versionadas en el repositorio.
- **Atomic Rollbacks:** Capacidad de revertir a la versión anterior en menos de 30 segundos ante fallos detectados en producción.
