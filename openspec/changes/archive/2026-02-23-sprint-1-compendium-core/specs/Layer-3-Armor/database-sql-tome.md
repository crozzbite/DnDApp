# Specification: The SQL Tome (PostgreSQL)

## 1. Overview

El **SQL Tome** es la fuente de verdad estructurada y persistente del Nexus. Almacena todas las entidades del compendio con sus relaciones jerárquicas y referencias cruzadas.

## 2. Entity Relationship Model (ERM)

### 2.1 Core Tables

- **`resources`**: Tabla base para el polimorfismo.
  - `id` (UUID, PK)
  - `index` (String, Unique, Slug)
  - `name` (String)
  - `category` (Enum: monster, spell, item, etc.)
  - `source` (String: srd, open5e, custom)
  - `metadata` (JSONB)
  - `created_at` / `updated_at`

- **`monsters`**:
  - `resource_id` (FK -> resources.id)
  - `size`, `type`, `alignment`
  - `armor_class` (Integer)
  - `hit_points` (Integer)
  - `challenge_rating` (Decimal)
  - `stats` (JSONB: str, dex, con, int, wis, cha)

- **`spells`**:
  - `resource_id` (FK -> resources.id)
  - `level` (Integer)
  - `school` (String)
  - `casting_time` (String)
  - `range` (String)
  - `components` (Array)
  - `duration` (String)

### 2.2 Relationship Tables

- **`class_spells`**: Relación N:M entre Clases y Hechizos.
- **`monster_actions`**: Relación 1:N para habilidades y ataques.

## 3. Consumers

### 3.1 Nexus Gateway (Reader/Writer)

- **Operaciones**:
  - Consultas complejas (filtros por CR, nivel de hechizo, etc.).
  - Servir el detalle completo de un recurso cuando el cache falla.
  - Gestión de sesiones de usuario y compendios personalizados.

### 3.2 Lich Workers (Writer)

- **Operaciones**:
  - Inserción masiva tras procesos de ingesta.
  - Actualización de registros existentes (UPSERT) cuando se detectan cambios en las fuentes originales.

## 4. Technical Snippets (Prisma Schema Example)

```prisma
model Resource {
  id        String   @id @default(uuid())
  index     String   @unique
  name      String
  category  String
  source    String
  metadata  Json
  monster   Monster?
  spell     Spell?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Monster {
  id             String   @id @default(uuid())
  resource       Resource @relation(fields: [resourceId], references: [id])
  resourceId     String   @unique
  challengeRating Float
  hitPoints      Int
  stats          Json
}
```

## 5. CAP Theorem Decision: CP (Consistency + Partition Tolerance)

Para el **SQL Tome**, hemos seleccionado un enfoque **CP** (Consistencia y Tolerancia a Particiones), priorizando la integridad de los datos sobre la disponibilidad absoluta en caso de falla de red catastrófica.

### ¿Por qué Consistencia (C)?

En un compendio de D&D, la **exactitud mecánica** es sagrada. No podemos permitir "Consistencia Eventual" donde un jugador vea que una bola de fuego hace 8d6 de daño mientras que otro jugador vea 6d6 debido a un lag de replicación. El sistema debe garantizar que todos los escribas (clientes) vean la misma verdad al mismo tiempo.

### ¿Por qué Tolerancia a Particiones (P)?

Nuestra arquitectura es distribuida (Gateway, Workers, DB). Si hay una partición de red entre el Nexus y el SQL Tome, preferimos que el sistema devuelva un error (sacrificando Disponibilidad) antes que permitir que los Workers escriban datos inconsistentes o que el Gateway sirva estados corruptos.

### Compensación de Disponibilidad (A)

La falta de disponibilidad se mitiga mediante el **Cache Mantle (Redis)**. Si el SQL Tome está bajo mantenimiento o particionado, el 90% de las lecturas seguirán funcionando desde la cache, proporcionando una "Disponibilidad Aparente" mientras se recupera la fuente de verdad.

## 6. CP Implementation Strategy (The Gauntlet of Integrity)

Para materializar este enfoque **CP**, el Nexus implementará los siguientes mecanismos técnicos:

### 6.1 Consistencia Estricta (C)

1.  **Aislamiento de Transacciones**: Utilizaremos `isolationLevel: Serializable` en Prisma para operaciones críticas (ej. creación de hechizos custom o edición de campañas). Esto garantiza que no haya "Phantom Reads" ni condiciones de carrera mecánicas.
2.  **Escritura Centralizada (Single Writer Pattern)**: Solo los **Lich Workers** tienen permiso de escritura masiva, utilizando bloqueos optimistas para evitar colisiones durante la ingesta de datos.
3.  **Primary-Only Reads**: Para validaciones de reglas en tiempo real, el Gateway consultará siempre la instancia _Primary_, evitando el lag de replicación de los nodos secundarios.

### 6.2 Tolerancia a Particiones (P)

1.  **Circuit Breaker (Fast Failure)**: Implementaremos un patrón _Circuit Breaker_ (ej. con `Opossum`). Si la base de datos no responde en < 200ms, el circuito se abre y el sistema deja de intentar la conexión, protegiendo al resto de la infraestructura.
2.  **Health Checks Activos**: El Pool de conexiones gestionará validaciones constantes. Si se detecta una partición, el Gateway responderá con `503 Service Unavailable` antes de servir datos inconsistentes.
3.  **Workers Idempotentes**: Todos los eventos de ingesta procesados por los Workers son idempotentes. Si una partición de red ocurre a mitad de una transacción, el Worker puede re-procesar el evento completo sin corromper el estado de la base de datos.

## 7. Evolution & Observability (The Chronicler)

Para que el **SQL Tome** sea un organismo vivo y saludable, añadimos:

### 7.1 Schema Evolution (Prisma Migrations)

- **Control de Versiones**: Todos los cambios en la estructura se realizarán mediante `npx prisma migrate`. Queda prohibido el uso de SQL manual en producción.
- **Shadow Database**: Utilizaremos una DB temporal para validar migraciones antes de aplicarlas a la fuente de verdad, evitando tiempos de inactividad inesperados.

### 7.2 Observability (The Watcher)

- **Slow Query Logging**: Activaremos el seguimiento de consultas que superen los 100ms. En un compendio, la velocidad de consulta es vital para la UX en mesa.
- **Transaction Tracing**: Cada transacción de escritura de los Workers llevará un `trace_id` que se propaga desde el Nexus Gateway, permitiendo auditar exactamente qué proceso de ingesta causó un cambio específico en el Tomo.
- **Backup & Recovery (PITR)**: Implementaremos _Point-in-Time Recovery_ con retención de 7 días, permitiendo restaurar el compendio a cualquier segundo exacto antes de un posible error humano o bug catastrófico.

## 8. Performance Tuning (The Forge)

Para garantizar que el SQL Tome responda con la velocidad de un rayo, implementamos:

### 8.1 Indexación Avanzada

- **B-Tree**: En columnas `index` y `id`.
- **GIN (Generalized Inverted Index)**: En la columna `metadata` (JSONB). Esto permite que el Nexus Gateway pueda filtrar monstruos por sus campos internos (como `environment` o `stats`) en milisegundos.

### 8.2 Connection Pooling (PgBouncer)

Utilizaremos **PgBouncer** como mediador. El Nexus Gateway y los Workers no conectan directamente a PostgreSQL, sino a un pool gestionado. Esto evita que se agoten las conexiones durante ráfagas de tráfico y reduce el overhead de conexión en un 40%.
