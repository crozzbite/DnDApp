# Specification: Quality & Operations (The Shield)

## 1. Overview

La "Armadura" de **SkullRender** no es solo estética; es integridad estructural. Este documento define los estándares de calidad, observabilidad y escalabilidad que aseguran que el Nexo sea un sistema de grado producción, capaz de soportar la carga del multiverso.

## 2. Service Level Objectives (SLOs)

Para garantizar la excelencia, el sistema debe cumplir con los siguientes umbrales:

| Métrica                    | Objetivo (SLO) | Definición (SLI)                                         |
| :------------------------- | :------------- | :------------------------------------------------------- |
| **Latencia Cache Hit**     | < 100ms (p95)  | Respuesta desde el Cache Mantle (L1/L2).                 |
| **Latencia Hybrid Search** | < 370ms (p95)  | Proceso completo (Sanitize + Oracle + SQL + Hydration).  |
| **Disponibilidad**         | 99.9%          | Tiempo de uptime mensual de la API del Nexo.             |
| **Precisión de Ingesta**   | 99.5%          | Recursos purificados exitosamente sin errores de schema. |

### 2.1 Error Budget Policy

- **Uptime Budget**: 0.1% de error mensual (~43 minutos).
- **Burn Rate Monitoring**: Si el budget se quema > 50% en una semana, el equipo de "SkullRender" entra en modo **Freeze de Features**: solo se permiten fixes de estabilidad.

## 3. Escalabilidad e Infraestructura

El sistema está diseñado para escalar horizontalmente.

### 3.1 Base de Datos (SQL Tome)

- **Estrategia**: Replicación Primaria-Réplica.
- **Implementación**: Prisma con múltiples datasources.
- **Flujo**: Escrituras (Ingesta) al nodo Primario; Lecturas (Búsqueda/Detalle) a las Réplicas.

### 3.2 Consistency Model (Replica Lag Mitigation)

Para evitar inconsistencias tras una ingesta automatizada:

1. **Strong Consistency**: Lecturas de recursos individuales (GetDetail) consultan al **Primario** o al **Mantle (Cache)**.
2. **Eventual Consistency**: La búsqueda híbrida puede tener un lag de < 2s respecto a la réplica de lectura.
3. **Write-Through**: Al ingerir, el `IngestResource` actualiza el Mantle inmediatamente.

### 3.3 Ingestion Resilience (DLQ & Audit)

Para asegurar que ninguna pieza de conocimiento se pierda en la forja:

- **Dead Letter Queue (DLQ)**: Cualquier recurso que falle la purificación o normalización se envía a una "Cola de Descarte" para inspección manual (no se pierde).
- **Audit Trail**: Cada registro en el SQL Tome incluye `sourceId`, `ingestedAt`, `checksum` y `version` para rastrear el origen.

```typescript
// Ejemplo de configuración de Prisma para Escalabilidad
const prisma = new PrismaClient({
  datasources: {
    db: { url: process.env.DATABASE_URL }, // Primario
    read: { url: process.env.READ_REPLICA_URL }, // Réplica
  },
});
```

### 3.2 Balanceo de Carga

- Se implementará un balanceador (ej. NGINX o Cloudflare) con políticas de **Health Checks** para evitar enviar tráfico a nodos del Nexo que estén re-indexando o con alta carga.

## 4. The Gauntlet (Testing Strategy)

En SkullRender, el código no probado es código roto.

- **Unit Testing (Jest)**:
  - `core/` & `domain/`: ≥ 95% de cobertura.
  - `use-cases/`: 100% de los flujos lógicos cubiertos.
  - `infra/`: ≥ 80% (foco en integración).
- **Component Testing**: Uso de `Angular Testing Library` para verificar la experiencia del usuario.
- **Integration Testing**: Pruebas de contrato entre el Nexo y Pinecone/SQL.

```typescript
// Snippet: Prueba de Caso de Uso (The Gauntlet)
describe("SearchCompendiumUseCase", () => {
  it("should prioritize semantic results from Oracle", async () => {
    const { oracle, repository, useCase } = setup();
    oracle.search.mockResolvedValue(["dragon-id"]);

    const results = await useCase.execute("dragon");

    expect(oracle.search).toHaveBeenCalledWith("dragon");
    expect(repository.getByIds).toHaveBeenCalledWith(["dragon-id"]);
  });
});
```

## 5. Observabilidad y Telemetría

No volamos a ciegas.

- **Logging**: Logs estructurados en formato JSON.
- **Tracing**: Implementación de `OpenTelemetry` para rastrear el flujo de un request desde el Interceptor hasta la DB.
- **Error Tracking**: `Sentry` para captura de excepciones en Tiempos de Ejecución (Runtime).

```typescript
// Snippet: Log Estructurado
logger.info({
  event: "SEARCH_EXECUTED",
  latency_ms: 145,
  results_count: 12,
  user_session: "shadow-123",
});
```

## 6. Resilience (The Immortality Protocol)

### 6.1 Circuit Breaker & Fallback

Si el `VectorOracle` falla, el sistema debe degradarse con gracia:

- **Fallback**: Si el Oracle no responde en < 500ms, disparar el Circuit Breaker y realizar una búsqueda puramente relacional (SQL Tome).
- **States**: Closed (Operación normal), Open (Fallback total), Half-Open (Recuperación gradual).

### 6.2 Retry & Bulkheading

- **Retries**: 2 reintentos con backoff exponencial (100ms, 300ms) para operaciones no-mutantes.
- **Bulkheading**: El pool de conexiones al Oracle está limitado para evitar que fallos del Nexus saturen el `Nexo Core`.

## 7. Scalability Horizon: Mass Scale (>100k Resources)

Si el Compendio crece más allá de los 10k recursos iniciales:

- **Database Sharding**: Particionado de la SQL Tome por categoría o región.
- **Vector Pod Scaling**: Escalado horizontal de pods en Pinecone y uso de metadatos más granulares para filtrar el espacio de búsqueda.
- **Streaming Ingestion**: Migración de Batch a Streaming (Kafka/Redis Streams) solo si el throttling de ingesta supera las 2 horas.

## 8. Disaster Recovery (The Restoration Ritual)

En caso de corrupción de datos o pérdida total:

- **RPO (Recovery Point Objective)**: 24 horas (Snapshots diarios de la SQL Tome).
- **RTO (Recovery Time Objective)**: 4 horas para restaurar el servicio básico.
- **Oracle Re-sync**: Si Pinecone se pierde, el sistema puede re-indexar todo el Compendio desde la SQL Tome (fuente de verdad absoluta) en < 2 horas.
