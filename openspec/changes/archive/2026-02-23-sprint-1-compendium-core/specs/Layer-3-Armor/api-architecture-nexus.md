# Specification: The Nexus Architecture (API & Backend)

## 1. Overview

El **Nexus** es el puente neuronal entre los Clientes (App/Web/CLI) y las vastas fuentes de conocimiento del multiverso D&D. Utiliza una arquitectura orientada a servicios y eventos para garantizar escalabilidad, resiliencia y frescura de los datos.

## 2. Core Components

### 2.1 Nexus Gateway (The Entry Point)

- **Tech Stack**: NestJS (TypeScript).
- **Responsabilidades**:
  - Unificación de APIs externas en un contrato único.
  - Autenticación (JWT/Firebase).
  - Rate Limiting (Protección contra ataques).
  - Caching (Redis) para respuestas frecuentes.
  - Orquestación de peticiones complejas.

### 2.2 Soul-Harvesting Broker (Message Queue)

- **Tech Stack**: Redis + BullMQ (o RabbitMQ).
- **Propósito**: Desvincular las peticiones de usuario de los procesos pesados de ingesta.
- **Flujo**: El Gateway emite un evento `INGEST_RESOURCE`, el Broker lo encola y un Worker lo procesa.

### 2.3 Lich Workers (Spectral Services)

- **Propósito**: Servicios aislados con responsabilidad única.
  - **PDF-Ingestor-Worker**: Extrae datos de manuales cargados.
  - **Crawler-Worker**: Mantiene el índice de Open5e y D&D 5e API actualizado.
  - **Vector-Worker**: Genera embeddings para búsqueda semántica (Pinecone).

## 3. API Design & Endpoints

### Base URL: `api.lich-gate.com/v1` (The Ethereal Gate)

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

## 4. Technical Snippets (The Architecture in Motion)

### 🧩 Logic: Gateway Controller (NestJS)

```typescript
@Controller("compendium")
export class CompendiumController {
  constructor(private readonly compendiumService: CompendiumService) {}

  @Get("search")
  @UseInterceptors(CacheInterceptor) // Caching automático en Redis
  async search(@Query("q") query: string) {
    // El Gateway orquestra la búsqueda en múltiples fuentes
    return this.compendiumService.unifiedSearch(query);
  }
}
```

### 🛡️ Logic: Worker Consumer (The Soul Harvester)

Para el manejo de errores, el Worker debe delegar la lógica de reintento a **BullMQ**. Arrojar un error dentro del proceso es la forma más elegante de señalar un fallo que requiere reintento asíncrono.

```typescript
@Processor("ingestion-queue")
export class IngestionWorker {
  @Process("INGEST_RESOURCE")
  async handleIngestion(job: Job) {
    const { resourceType, resourceIndex, source } = job.data;

    try {
      // 1. Fase de Extracción
      const rawData = await this.sourceAdapter.fetch(source, resourceIndex);

      // 2. Fase de Alquimia (Normalización)
      const bones = this.normalizer.toBones(rawData);

      // 3. Fase de Entierro (Persistencia)
      await this.database.save(bones);
      await this.cache.set(resourceIndex, bones);

      return { status: "harvested", index: resourceIndex };
    } catch (error) {
      // Registrar error para monitoreo antes de delegar a la cola
      this.logger.error(`Error en ingesta de ${resourceIndex}: ${error.message}`);

      // Arrojar el error permite que BullMQ maneje el 'attempts' y 'backoff'
      throw error;
    }
  }

  @OnQueueFailed()
  handleFailure(job: Job, err: Error) {
    // Lógica para cuando el job agota todos los reintentos (Dead Letter Queue)
    this.telemetry.captureException(err, { jobId: job.id });
  }
}
```

### 🔄 Logic: Message Broker Publisher

```typescript
async triggerSync(resource: string) {
  // Publicamos el trabajo en la cola para que un worker lo maneje asíncronamente
  await this.ingestionQueue.add('INGEST_RESOURCE', {
    resourceType: 'spell',
    resourceIndex: resource,
    source: 'dnd5eapi'
  }, {
    attempts: 3,
    backoff: 5000
  });
}
```

## 5. Database Schema (The Tome)

- **Primary DB**: PostgreSQL (Relacional) para entidades core.
- **Vector DB**: Pinecone (opcional) para búsquedas por lenguaje natural ("Dame monstruos que vivan en cuevas y usen fuego").
- **Cache**: Redis para el 90% de las lecturas de compendio.
