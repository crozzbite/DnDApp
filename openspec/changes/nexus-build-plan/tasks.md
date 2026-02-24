# Tasks: Nexus Architecture Implementation

Este documento desglosa las tareas necesarias para ejecutar el plan de construcción de la DnDApp, siguiendo la Nexus Architecture.

## 1. Fase 1: Bones (Core Domain)

- [x] 1.1 Crear directorio raíz de dominio en `src/app/core/domain/`.
- [x] 1.2 Definir interfaces base en `models/` (Monster, Spell, AbilityStats, etc.).
- [x] 1.3 Definir contratos de repositorio en `repositories/` (ICompendiumRepository, ISessionRepository).
- [x] 1.4 Implementar sistema de excepciones de dominio en `exceptions/`.
- [x] 1.5 Configurar Path Aliases en `tsconfig.json` para facilitar la navegación:
  - `@domain/*`: `src/app/core/domain/*`
  - `@core/*`: `src/app/core/*`
  - `@shared/*`: `src/app/shared/*`
  - `@features/*`: `src/app/features/*`
  - `@assets/*`: `src/assets/*`
  - `@v1/*`: `src/app/*`

## 2. Fase 2: Brain (Application Logic)

- [x] 2.1 Crear directorio de casos de uso en `src/app/core/use-cases/`.
- [x] 2.2 Implementar `SearchCompendiumUseCase` con lógica de orquestación inicial.
- [x] 2.3 Implementar `GetResourceDetailUseCase` con estrategia de cacheo.
- [x] 2.4 Desarrollar `DataLichOrchestrator` como singleton en `src/app/core/services/`.
- [x] 2.5 Integrar guardias funcionales de seguridad lógica (PII Redaction).

## 3. Fase 3: Nervous System (API Architecture) - COMPLETE

- [x] 3.1 Inicializar proyecto NestJS bajo el directorio `backend/` usando Bun.
- [x] 3.2 Configurar Fastify como motor HTTP y BullMQ para procesamiento asíncrono.
- [x] 3.3 Crear controladores para el Gateway (`/compendium/search`, `/compendium/detail`).
- [x] 3.4 Implementar `IngestionWorker` para el procesamiento de colas.
- [x] 3.5 Configurar Swagger para documentación automática de la API.
- [x] 3.6 **Immune System (Nervous Hardening):** Helmet, Compresión, Graceful Shutdown y CORS.
- [x] 3.7 **Alchemy & Shield:** `NexusSanitizer`, `GlobalExceptionFilter` y `TransformInterceptor`.
- [x] 3.8 **Final Audit:** Fase 3 auditada, endurecida y documentada en specs.

## 4. Fase 4: Organs (Infrastructure & Distributed Defense)

### 4.1 Connectors & Inbound Immunity

- [ ] 4.1.1 Implementar `Dnd5eApiConnector` con RxJS (retry, shareReplay).
- [ ] 4.1.2 Implementar `Open5eConnector` y normalizadores correspondientes.
- [ ] 4.1.3 Desarrollar adaptador para datos estáticos (Nick Aschenbach).
- [x] 4.1.4 **Immune System (Payload Defense):** Configurar `bodyLimit` y validation pipes globales (Completado en Fase 3).
- [ ] 4.1.5 Configurar sistema de manejo de errores `ConnectorError`.

### 4.2 Defense & Session Shield (Asynchronous Security)

- [ ] 4.2.1 Implementar `AdminLichGuard` con validación HMAC para endpoints de ingesta.
- [ ] 4.2.2 Configurar `ShadowSessionMiddleware` para cookies seguras y HttpOnly.
- [ ] 4.2.3 Implementar interceptores de seguridad en Angular (CSRF, Auth Headers).

### 4.3 Persistence & Data Sanctum

- [ ] 4.3.1 Configurar PostgreSQL con Prisma en el backend.
- [ ] 4.3.2 Implementar esquema polimórfico en `schema.prisma`.
- [ ] 4.3.3 Configurar Redis para el `CacheMantle`.
- [ ] 4.3.4 Integrar Pinecone para el `VectorNexus`.

### 4.4 External Asset Nexus (Storage)

- [ ] 4.4.1 Configurar Bucket externo (Cloudflare R2 / S3) para archivos pesados (2GB+).
- [ ] 4.4.2 Implementar script de migración para mover assets de `src/assets/docs` al Nexus.
- [ ] 4.4.3 Actualizar `pdfUrl` en los modelos para apuntar al CDN externo.

## 5. Fase 5: Flesh (UI/UX)

- [ ] 5.1 Definir Design Tokens en `src/app/core/styles/tokens.css`.
- [ ] 5.2 Refactorizar componentes existentes a la arquitectura Smart vs Dumb.
- [ ] 5.3 Implementar `CDK Virtual Scroll` en el grid de resultados.
- [ ] 5.4 Configurar bloques `@defer` para paneles de detalle y modales.
- [ ] 5.5 Migrar la aplicación a modo Zoneless (`provideZonelessChangeDetection`).

## 6. Fase 6: Gauntlet (QA/TDD)

- [ ] 6.1 Configurar Jest para pruebas unitarias en Angular y NestJS.
- [ ] 6.2 Crear tests unitarios para los Casos de Uso del Brain.
- [ ] 6.3 Implementar pruebas de integración para componentes Smart.
- [ ] 6.4 Desarrollar suite de pruebas E2E con Playwright para caminos críticos.

## 7. Fase 7: Deployment (Production)

- [ ] 7.1 Crear Dockerfiles para el backend y los workers.
- [ ] 7.2 Configurar pipelines de GitHub Actions para despliegue continuo.
- [ ] 7.3 Configurar Vercel para el despliegue del frontend con SSR.
- [ ] 7.4 Implementar sistema de monitoreo y alertas (Health Checks).
