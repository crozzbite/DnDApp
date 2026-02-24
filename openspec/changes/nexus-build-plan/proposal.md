## Why

Este plan de construcción establece la hoja de ruta estructurada para el desarrollo del DnDApp, asegurando que cada fase respete la **Nexus Architecture** de SkullRender. El objetivo es consolidar un sistema escalable, profesional y con personalidad, construyendo desde los "huesos" hasta la "flesh".

## What Changes

Se implementará el ecosistema completo del DnDApp en 7 fases incrementales:

1. **Bones:** Definición del dominio puro.
2. **Brain:** Lógica de negocio y orquestación.
3. **Nervous System:** Arquitectura de API y mensajería.
4. **Organs (The Infrastructure):**
   - 4.1 **Connectors:** Integración con APIs externas (Dnd5e, Open5e).
   - 4.2 **Persistence (DB):** Configuración de PostgreSQL (SQL Tome), Redis (Cache Mantle) y Pinecone (Vector Nexus).
   - 4.3 **Defense (Security):** Implementación de seguridad, rate limiting y auditoría.
5. **Flesh:** Interfaz de usuario reactiva y premium.
6. **Gauntlet:** Pruebas y aseguramiento de calidad.
7. **Deployment:** Operaciones y lanzamiento a producción.

## Capabilities

### New Capabilities

- `bones-domain`: Definición de interfaces base (`CompendiumResource`, `Monster`, `Spell`) y contratos de repositorio en `src/app/core/domain/`.
- `brain-logic`: Implementación de casos de uso (`SearchCompendium`, `GetResourceDetail`) y el `DataLichOrchestrator` para priorización de fuentes.
- `nervous-system-gateway`: Configuración de NestJS Fastify Gateway, BullMQ para Lich Workers e interceptores funcionales.
- `organs-connectors`: Implementación de conectores externos (`Dnd5eApiConnector`, `Open5eConnector`) para la ingesta de datos.
- `organs-persistence`: Configuración del `SQL Tome` (Prisma), `Cache Mantle` (Redis) y `Vector Nexus` (Pinecone).
- `organs-defense`: Implementación de seguridad, rate limiting, Shadow Sessions y sanitización de I/O.
- `flesh-ui`: Desarrollo de componentes Smart/Dumb en Angular 19, uso de Signals para estado global (`CompendiumStore`) y optimización con `@defer`.
- `gauntlet-qa`: Estrategia de TDD con Jest y Playwright, auditoría de seguridad y validación de lógica.
- `deployment-ops`: Configuración de CI/CD en GitHub Actions, monitoreo con Sentry y despliegue en Vercel.

### Modified Capabilities

- Ninguna (Este plan define la base de las nuevas capacidades).

## Spec Development Guidelines (Mandatory)

Para asegurar la calidad de SkullRender, cada especificación (`spec.md`) generada para las capacidades anteriores DEBE incluir los siguientes puntos sin excepción:

1. **Estructura Detallada:** Definición explícita de nombres de archivos, carpetas y organización de directorios.
2. **Framework/Stack:** Especificación de las herramientas y versiones (ej. Angular 19, NestJS, Prisma).
3. **Identificación de Fase:** Mencionar claramente a qué fase de la Nexus Architecture pertenece.
4. **Recursos de Construcción:** Listado de documentación de referencia, archivos `.md` de OpenSpec previos o endpoints de API necesarios.
5. **Valor Añadido:** Cualquier información técnica adicional (patrones de diseño, consideraciones de performance, etc.) que aporte solidez al componente.

## Impact

Este cambio afecta a toda la estructura del proyecto, estableciendo los estándares de codificación, organización de archivos y flujo de datos para todas las capas de la arquitectura Nexus.
