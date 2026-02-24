# Spec: Phase 4.2 - Organs (Persistence)

Este documento especifica la implementación de la **Capa 4.2: Persistence** para el ecosistema DnDApp, siguiendo la Nexus Architecture de SkullRender.

## 1. Identificación de Fase

- **Fase:** 4.2 (Organs - Persistence)
- **Arquitectura:** SkullRender Nexus Architecture - Capa de Datos (Fuentes de Verdad).
- **Responsabilidad:** Almacenamiento estructurado, cacheo de alta velocidad y búsqueda semántica.

## 2. Estructura y Organización

La persistencia se divide en tres niveles: Relacional (SQL Tome), Cache (Cache Mantle) y Vectorial (Vector Nexus).

```bash
backend/
├── prisma/             # Definiciones de base de datos SQL
│   ├── schema.prisma   # Esquema de entidades Core
│   └── migrations/     # Historial de cambios en SQL Tome
├── src/infrastructure/
│   ├── database/       # SQL Tome Adapters (Prisma)
│   │   ├── prisma.service.ts
│   │   └── repositories/
│   ├── cache/          # Cache Mantle Adapters (Redis)
│   │   ├── redis.service.ts
│   │   └── session.cache.ts
│   └── vector/         # Vector Nexus Adapters (Pinecone)
│       ├── pinecone.service.ts
│       └── vector-search.adapter.ts
```

## 3. Framework & Stack

- **SQL Tome:** PostgreSQL v15+ con Prisma ORM.
- **Cache Mantle:** Redis v7+ (uso de MessagePack para compresión).
- **Vector Nexus:** Pinecone (modelo `multilingual-e5-large`).
- **Configuración:** Variables de entorno seguras para cadenas de conexión.

## 4. Recursos de Construcción

- **Documentación:** `database-sql-tome.md`, `database-cache-mantle.md`, `database-vector-nexus.md`.
- **Estrategia CAP:** SQL (CP), Redis (AP), Pinecone (AP).

## 5. ADDED Requirements

### Requirement: Esquema Polimórfico en SQL Tome

El esquema de Prisma DEBE permitir el polimorfismo mediante una tabla base `Resource` y extensiones para `Monster`, `Spell`, etc.

#### Scenario: Inserción de Monstruo con Relación

- **WHEN** se guarda un monstruo
- **THEN** se debe crear un registro en `Resource` y su correspondiente extensión en `Monster` en una transacción serializable.

### Requirement: Estrategia de Cache Mantle (Redis)

Se DEBE implementar una estructura de claves por namespaces para evitar colisiones y facilitar la invalidación.

#### Scenario: Almacenamiento de Sesión

- **WHEN** se guarda una sesión de usuario
- **THEN** la clave debe seguir el formato `session:{sessionId}` con un TTL de 24 horas.

### Requirement: Búsqueda Híbrida en Vector Nexus

El sistema DEBE ser capaz de realizar búsquedas semánticas y filtrar por metadatos técnicos.

#### Scenario: Búsqueda Semántica por Entorno

- **WHEN** el usuario busca "criaturas del desierto"
- **THEN** el adaptador vectorial debe consultar Pinecone usando embeddings y aplicar filtros de metadatos para retornar solo índices válidos.

## 6. Valor Añadido (Design Patterns)

- **Connection Pooling:** Uso de PgBouncer para optimizar el manejo de conexiones a PostgreSQL.
- **Stale-While-Revalidate (Cache):** Mejora la UX sirviendo datos rápidos desde Redis mientras se refresca el SQL Tome en segundo plano.
- **Hybrid Search Engine:** Combina la precisión del SQL con la flexibilidad del lenguaje natural en vectores.
