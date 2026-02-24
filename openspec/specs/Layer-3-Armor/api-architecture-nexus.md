# Specification: The Nexus Architecture (API & Backend)

## 1. Overview

El **Nexus** es el puente neuronal entre los Clientes (App/Web/CLI) y las vastas fuentes de conocimiento del multiverso D&D. Utiliza una arquitectura orientada a servicios y eventos para garantizar escalabilidad, resiliencia y frescura de los datos.

## 2. Core Components

### 2.1 Nexus Gateway (The Entry Point)

- **Tech Stack**: **NestJS v11+ (con Fastify)**.
- **Runtime**: **Bun v1.3+** (Optimización de latencia y Cold Starts).
- **Responsabilidades**:
  - Unificación de APIs externas en un contrato único.
  - Autenticación (JWT/Firebase).
  - **Hardened Security**: Helmet, CORS estrictos, 1MB Body Limit.
  - **Latency SLO**: < 250ms para búsquedas, < 400ms para hidratación.
  - **Compression**: Threshold 1024 bytes (Fastify).
  - Health Checks (`/health`).
  - Orquestación de peticiones complejas.

### 2.2 Soul-Harvesting Broker (Message Queue)

- **Tech Stack**: Redis + BullMQ.
- **Propósito**: Desvincular las peticiones de usuario de los procesos pesados de ingesta.
- **Flujo**: El Gateway emite un evento `INGEST_RESOURCE`, el Broker lo encola y un Worker lo procesa.

### 2.3 Lich Workers (Spectral Services)

- **Propósito**: Servicios aislados con responsabilidad única.
  - **PDF-Ingestor-Worker**: Extrae datos de manuales cargados.
  - **Crawler-Worker**: Mantiene el índice de Open5e y D&D 5e API actualizado.
  - **Vector-Worker**: Genera embeddings para búsqueda semántica (Pinecone).

## 3. API Design & Immune System

### 3.1 Base URL: `api.lich-gate.com/v1` (The Ethereal Gate)

| Categoría       | Domain / Endpoint         | Descripción                                            |
| :-------------- | :------------------------ | :----------------------------------------------------- |
| **Search**      | `/compendium/search`      | Búsqueda global (query params: `q`, `type`, `source`). |
| **Bestiary**    | `/compendium/monsters`    | Monstruos, habilidades y estadísticas.                 |
| **Arcana**      | `/compendium/spells`      | Hechizos, rituales y escuelas de magia.                |
| **Armory**      | `/compendium/equipment`   | Armas, armaduras y equipo de aventura.                 |
| **Vault**       | `/compendium/magic-items` | Objetos mágicos y artefactos legendarios.              |
| **Registry**    | `/compendium/classes`     | Clases, subclases y rasgos de clase.                   |
| **Lineage**     | `/compendium/races`       | Razas, subrazas y rasgos raciales.                     |
| **Grimoire**    | `/compendium/feats`       | Dotes y talentos (fuente OGL/Open5e).                  |
| **Library**     | `/compendium/rules`       | Reglas base y secciones del manual (PHB/SRD).          |
| **Backgrounds** | `/compendium/backgrounds` | Trasfondos y competencias iniciales.                   |
| **System**      | `/health`                 | Estado del Nexus y latencia de los frentes.            |

### 3.2 Immune System (Defense Layers)

El Nexo implementa una defensa multicapa (**The Armor**):

1.  **Transport Security**: Helmet (HSTS, CSP in production), CORS estricto.
2.  **Input Validation**: Global `ValidationPipe` con `class-validator` y `class-transformer`.
3.  **Data Alchemy (Sanitization)**: `NexusSanitizer` interceptando queries en el controlador.
4.  **Invisible Shield**: `GlobalExceptionFilter` para centralizar errores y prevenir fugas de stack traces.
5.  **Standard Communication**: `TransformInterceptor` para garantizar que el 100% de las respuestas cumplan el contrato del Nexo.

## 4. Technical Snippets (The Architecture in Motion)

### 🧩 Logic: Gateway Controller (NestJS 11 + Fastify)

El controlador consume sanitisers y delega la respuesta al interceptor global.

```typescript
@Controller("compendium")
export class CompendiumController {
  private readonly logger = new Logger(CompendiumController.name);

  @Get("search")
  async search(@Query() dto: SearchCompendiumDto) {
    // Sanitización obligatoria (Anti-Prompt Injection)
    const sanitizedQuery = NexusSanitizer.sanitizeQuery(dto.query);

    this.logger.debug({ evt: "SEARCH_REQUESTED", query: sanitizedQuery });

    // El TransformInterceptor envolverá esto en un { status: 'success', ... }
    return this.orchestrator.search({ ...dto, query: sanitizedQuery });
  }
}
```

### 🛡️ Logic: Worker Consumer (The Soul Harvester)

El Worker utiliza `WorkerHost` y eventos de ciclo de vida para telemetría estructurada.

```typescript
@Processor("ingestion")
export class IngestionWorker extends WorkerHost {
  private readonly logger = new Logger(IngestionWorker.name);

  async process(job: Job<IngestResourceJob>) {
    try {
      // 1. Fase de Alquimia (Sanitización & Normalización)
      const secureData = NexusSanitizer.sanitizeData(job.data.rawData);

      // 2. Fase de Entierro (Persistencia distribuida)
      await this.orchestrator.catalyze(job.data.resourceId, secureData);

      return { status: "harvested" };
    } catch (error) {
      this.logger.error({ evt: "JOB_FAILED", jobId: job.id, error: error.message });
      throw error; // Delegar reintento a BullMQ
    }
  }

  @OnWorkerEvent("completed")
  onCompleted(job: Job) {
    this.logger.log({ evt: "SOUL_HARVEST_SUCCESS", jobId: job.id });
  }
}
```

## 5. Database Schema (The Tome)

- **Primary DB**: PostgreSQL (Relacional) para entidades core.
- **Vector DB**: Pinecone (opcional) para búsquedas por lenguaje natural.
- **Cache**: Redis para el 90% de las lecturas de compendio.
