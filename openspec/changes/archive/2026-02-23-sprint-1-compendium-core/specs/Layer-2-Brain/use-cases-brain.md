# Specification: Application Use Cases (The Brain)

## 1. Overview

La Capa 2 representan los **Cerebros** operativos del sistema. Aquí es donde se orquestan las reglas de negocio de la aplicación, coordinando el flujo de datos entre las Entidades de Dominio (Capa 1) y los servicios externos. Cada Caso de Uso es una unidad de lógica pura, independiente del framework.

## 2. Compendium Use Cases (Query Side)

Orquesta la búsqueda híbrida (semántica + relacional) para encontrar conocimiento en el multiverso.

- **Entrada**: `query: string`, `filters: SearchFilters`, `pagination: { limit: number, offset: number }`
- **Merge Strategy**: `semantic-priority` (prioriza resultados del Vector Oracle, rellena con SQL y elimina duplicados por `index`).
- **Security Guards**:
  - `PII-Redaction`: Escanea la `query` para evitar fuga de emails o IPs hacia Pinecone.
  - `Injection-Filter`: Detecta patrones de Prompt Injection (ignore instructions) antes de pasar al Oracle.
- **Flujo**:
  1. Solicita al `IVectorOracle` los IDs que coinciden semánticamente.
  2. Solicita al `ICompendiumRepository` una búsqueda por texto (Full-Text Search) si la query tiene términos específicos.
  3. **De-duplicación**: Combina ambos conjuntos usando el `index` como clave única.
  4. **Paginación**: Aplica el `limit` y `offset` sobre el conjunto combinado.
  5. **Hidratación**: Recupera los objetos completos del `ICompendiumRepository`.
- **Salida**: `Promise<{ items: CompendiumResource[], total: number }>`

### 2.2 GetResourceDetail (Resilient Fetcher)

Obtiene la verdad absoluta sobre un recurso específico, priorizando la cache.

- **Entrada**: `index: string`, `options?: { bypassCache: boolean }`
- **Caching Strategy**: `stale-while-revalidate` (sirve basura rápido, actualiza en fondo si es necesario).
- **Flujo**:
  1. Consulta en el `ISessionRepository` (Cache Mantle). Si existe y no ha expirado el **TTL (60 min)**, lo retorna.
  2. Si es _stale_ o no existe, lo solicita al `ICompendiumRepository`.
  3. Actualiza asíncronamente la cache con un nuevo TTL.
  4. Si no existe en SQL, lanza `ResourceNotFoundException`.
- **Salida**: `Promise<CompendiumResource>`

## 3. Ingestion & Alchemy Use Cases (Command Side)

### 3.1 IngestResource (The Ingestion Pipeline)

Transforma conocimiento crudo en Huesos.

- **Entrada**: `rawData: unknown`, `category: string`, `source: string`, `options?: { forceUpdate: boolean }`
- **Security Guards**:
  - `Key-Validation`: Solo accesible mediante una `X-Admin-System-Key` válida (HMAC o Static Secret en variables de entorno), ya que no hay sistema de login tradicional.
  - `Schema-Validation`: Valida el `rawData` contra el modelo de la categoría antes de procesar.
  - `Audit-Logging`: Registra el origen del request y el `index` del recurso mutado.
- **Flujo**:
  1. **Idempotency Guard**: Verifica si ya existe un recurso con el mismo `index` o hash de contenido.
  2. Si existe y `forceUpdate` es falso, termina el proceso de forma exitosa.
  3. **Transmutación**: Llama al `IResourceNormalizer` para crear la entidad de dominio.
  4. **Persistencia**: Guarda el recurso en el `ICompendiumRepository`.
  5. **Evento de Dominio**: Publica `ResourceIngestedEvent`. (El `Vector-Worker` reaccionará indexando en Pinecone asíncronamente).
- **Salida**: `Promise<{ status: 'created' | 'updated' | 'skipped' }>`

### 3.2 IngestDocument (Library Processor)

Procesa archivos físicos (PDF/Markdown) para incorporarlos al conocimiento del Nexo.

- **Entrada**: `file: FileReference`, `metadata: Partial<Manual>`
- **Flujo**:
  1. **Source Tracking**: Registra la ruta local del archivo en la entidad `Manual`.
  2. **Parsing (External)**: Delega en el `LibraryAdapter` la lectura del PDF.
  3. **Chunking**: Divide el contenido en fragmentos lógicos para el Vector Nexus.
  4. **Persistencia Dual**:
     - Guarda metadatos en `ICompendiumRepository` (SQL Tome).
     - Envía fragmentos al `IVectorOracle` para búsqueda semántica.
- **Salida**: `Promise<Manual>`

## 4. Session & Adventure Use Cases

### 4.1 InitializeSession (Shadow Session Anchor)

- **Entrada**: `sessionId: string`, `meta: { ua: string, locale: string }`
- **Security Guards**:
  - `Rate-Limiting`: Max 5 intentos cada 15 min por IP.
  - `Integrity-Binding`: La sesión queda atada al `User-Agent` inicial; cambios bruscos invalidan la sesión.
- **Flujo**:
  1. Verifica existencia en `ISessionRepository`.
  2. Si es nueva, crea `UserSession` con **TTL de 24h** y medidas anti-session fixation.
  3. Retorna la sesión inicializada.
- **Salida**: `Promise<UserSession>`

### 4.2 TrackEncounterAction (Combat Orchestrator)

- **Entrada**: `sessionId: string`, `action: CombatAction`
- **Security Guards**:
  - `Ownership-Validation`: Verifica que el `sessionId` del request coincida con el registro en Cache/Redis (Shadow Session).
- **Flujo**:
  1. Recupera la sesión desde el `ISessionRepository`.
  2. **Delegación de Dominio**: El Caso de Uso **NO** calcula daño ni cambia turnos. Llama a `encounter.applyAction(action)`.
  3. Si la acción es válida, persiste la sesión con el nuevo estado.
- **Salida**: `Promise<ActiveEncounter>`

## 5. Pure Logic Patterns (The Neural Paths)

Cada Caso de Uso debe seguir el patrón de **Inyección de Dependencias**.

- **Lore Names (Alias)**: Alchemy (Pipeline), Souls (Data), Mantle (Cache).
- **Technical Names (Logs/Code)**: IngestionService, DomainEntity, CacheRepository.

```typescript
class SearchCompendiumUseCase {
  constructor(
    private repository: ICompendiumRepository,
    private oracle: IVectorOracle,
  ) {}

  async execute(query: string, filters: SearchFilters): Promise<CompendiumResource[]> {
    // Orquestación...
  }
}
```

## 6. Business Guards & Quality (The Armor)

- **Observabilidad**: Cada Caso de Uso debe emitir trazas de telemetría (OpenTelemetry) para medir latencia y logs estructurados.
- **Consistencia Eventual**: Se acepta explícitamente que el `VectorOracle` puede tardar hasta N segundos en reflejar nuevos recursos ingeridos.
- **Idempotencia**: Obligatoria en todos los comandos de escritura.
