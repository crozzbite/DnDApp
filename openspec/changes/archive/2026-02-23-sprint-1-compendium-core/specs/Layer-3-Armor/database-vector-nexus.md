# Specification: The Vector Nexus (Pinecone)

## 1. Overview

El **Vector Nexus** es el órgano de "intuición arcana" del sistema. Utiliza bases de datos vectoriales para permitir búsquedas por lenguaje natural, permitiendo que el conocimiento del compendio sea accesible de forma semántica y no solo por coincidencia exacta de palabras.

## 2. Vector Configuration (The Neural Map)

### 2.1 Engine Specs

- **Provider**: Pinecone (Serverless / Global).
- **Dimensiones**: 1536 (Optimizado para el modelo `text-embedding-3-small`).
- **Métrica de Distancia**: `cosine` (Ideal para medir la similitud entre descripciones narrativas).

### 2.2 Vector Anatomy (Namespaces + Metadata)

Para el estudio SkullRender, la organización no es opcional. El Vector Nexus utiliza un sistema de dos capas:

#### A. Namespaces (High-Level Partitions)

Actúan como "Contenedores" aislados para optimizar el rendimiento y el scope de búsqueda:

- `ns-core-srd`: Datos oficiales inmutables.
- `ns-ogl-open5e`: Contenido de terceros.
- `ns-custom-homebrew`: Contenido generado por usuarios.

#### B. Metadata (Record-Level Tags)

Cada vector dentro de un namespace lleva adjunto su ADN técnico. Esto permite que el motor vectorial filtre resultados antes de calcular la similitud:

```json
{
  "resource_index": "ancient-red-dragon",
  "category": "monster",
  "cr": 24,
  "environment": ["mountain", "underdark"],
  "source": "srd"
}
```

## 3. Hybrid Search Strategy

Usamos búsquedas híbridas (Semántica + Metadata) para garantizar precisión técnica. El flujo es:

1. **Embedding generation**: El Gateway convierte el input del usuario en un vector.
2. **Vector Query**: Se consulta a Pinecone indicando el `namespace` (scope) y un `filter` basado en metadatos (ej: solo hechizos de nivel 3).
3. **Re-ranking**: El sistema toma los Top-K resultados y los cruza con el **SQL Tome**.

## 4. CAP Theorem Decision: AP (Availability + Partition Tolerance)

En el **Vector Nexus**, seleccionamos un enfoque **AP**.

### ¿Por qué Disponibilidad y Tolerancia a Particiones?

A diferencia del SQL Tome, donde la consistencia es sagrada por temas mecánicos, una base de datos vectorial suele operar bajo **Consistencia Eventual**.

- **Performance**: Necesitamos respuestas inmediatas (<500ms) para que la búsqueda se sienta "mágica".
- **Realidad de los datos**: Si el **Vector-Worker** actualiza la descripción de un monstruo, no es crítico para el juego que ese cambio tarde 2 o 3 segundos en ser indexado semánticamente. La Verdad Legal sigue estando en el SQL Tome (CP), mientras que el buscador semántico prioriza estar siempre listo para responder (AP).

## 5. Ingestion Pipeline (The Soul Binding)

### 5.1 Sync con SQL Tome

El **Vector-Worker** es el encargado de mantener la sincronía:

- Cada vez que un recurso se inserta en el SQL Tome, se genera un trabajo en el Broker.
- El Worker extrae los campos narrativos (`desc`, `traits`, `actions`), los vectoriza y hace el `UPSERT` en Pinecone.

### 5.2 Re-indexing Strategy

Si el modelo de embeddings se actualiza, el worker ejecutará una "Re-indexación Masiva" regenerando el mapa neuronal.

## 6. Observability & Quality (The Oracle)

### 6.1 Telemetry

- **Latency Tracking**: Monitorea el tiempo de generación de embeddings + consulta vectorial. Target: < 400ms.
- **Recall Monitoring**: Auditoría para asegurar que el motor entiende la intención semántica.

### 6.2 Error Handling

Si el Vector Nexus no está disponible (debido a su naturaleza AP, podría fallar si hay una partición severa), el sistema hace un **fallback** automático a la búsqueda tradicional de texto completo en PostgreSQL.

```typescript
export interface VectorFilter {
  category?: string;
  source?: string;
  [key: string]: any; // Pinecone filters can be complex
}

// Pattern: Hybrid Semantic Search + SQL Re-ranking
async function hybridSearch(query: string, filter: VectorFilter): Promise<CompendiumResource[]> {
  try {
    // 1. Capa AP: Búsqueda Semántica
    const vector = await this.embedder.create(query);
    const candidates = await this.pinecone.query({
      vector,
      filter,
      topK: 10,
      includeMetadata: true,
    });

    // 2. Capa CP: Fusión Relacional (Hydration)
    // Tomamos los IDs del motor vectorial y traemos la "Verdad Legal" del SQL Tome
    const indices = candidates.matches.map((m) => m.metadata.resource_index);

    return await this.sqlTome.findMany({
      where: { index: { in: indices } },
      include: { stats: true, actions: true }, // Datos frescos y consistentes
    });
  } catch (e) {
    this.logger.error("Vector Nexus caído, usando búsqueda tradicional");
    return this.sqlTome.textSearch(query); // Fallback a SQL (CP)
  }
}
```

## 7. Data Fusion (The Master Re-ranking)

El Nexus no confía ciegamente en los vectores. El **Vector Nexus** es solo un "Indexador de gran escala". El resultado final que ve el usuario siempre es **hidratado** desde el SQL Tome. Esto garantiza que aunque el vector sugiera un monstruo, las estadísticas (HP, AC) que vea el jugador sean las más recientes y consistentes (CP).
