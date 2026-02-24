# Spec: Phase 3 - Nervous System (API Architecture)

Este documento especifica la implementación de la **Capa 3: Nervous System** para el ecosistema DnDApp, siguiendo la Nexus Architecture de SkullRender.

## 1. Identificación de Fase

- **Fase:** 3 (Nervous System)
- **Arquitectura:** SkullRender Nexus Architecture - Capa de Comunicación y Backend.
- **Responsabilidad:** Gestión de la entrada de datos, orquestación de servicios asíncronos y contratos de API.

## 2. Estructura y Organización

El backend se basará en una arquitectura modular de NestJS, separando los controladores del gateway de los consumidores de tareas (workers).

```bash
backend/src/
├── api/                # Nexus Gateway Controllers
│   ├── auth/           # Manejo de tokens y sesiones
│   ├── compendium/     # Búsqueda y detalle de recursos
│   └── shared/         # Interceptores y filtros comunes
├── workers/            # Lich Workers (Spectral Services)
│   ├── ingestion/      # Consumidor de BullMQ para ingesta
│   ├── vector/         # Consumidor para indexación semántica
│   └── cron/           # Tareas programadas de limpieza
├── core/               # Lógica compartida de infraestructura
│   ├── providers/      # Redis, Database, VectorDB modules
│   └── queue/          # Configuración de BullMQ (Message Broker)
└── common/             # DTOs, Transformadores y Utilidades
```

## 3. Framework & Stack

- **Framework:** NestJS v11+ (con Fastify como motor de HTTP).
- **Runtime:** **Bun v1.3+** for extreme performance and faster cold starts.
- **Mensajería:** BullMQ (basado en Redis) para el Soul-Harvesting Broker.
- **Validación:** `class-validator` y `class-transformer` para DTOs.
- **Documentación:** Swagger (OpenAPI 3.0).

## 4. Performance & Security (The Immune System)

### Requirement: Hardened Ingress

El sistema DEBE implementar capas de seguridad pasiva en el punto de entrada.

- **Helmet:** Encabezados de seguridad para mitigar ataques XSS y Clickjacking.
- **Body Limit:** Restricción estricta de payloads a 1MB para prevenir ataques DoS.
- **CORS Hardening:** Restricción obligatoria de orígenes; falla el arranque en producción si `FRONTEND_URL` no está definido.

### Requirement: Latency Protection (SLO < 250ms)

Para garantizar la velocidad del Nexo, se implementan las siguientes medidas:

- **Threshold Compression:** Solo se comprimen respuestas > 1KB para evitar el overhead de CPU en búsquedas rápidas.
- **Fastify Serialization:** Uso de los esquemas de Fastify para serialización JSON acelerada.

### Requirement: Data Alchemy (Sanitization & Estandardization)

El sistema DEBE reutilizar la lógica de seguridad de la Capa 2 (Angular) en el backend y garantizar respuestas uniformes.

- **NexusSanitizer:** Utilidad centralizada para detectar y redactar patrones de _Prompt Injection_ y _PII_.
- **TransformInterceptor:** Estandarización automática de respuestas exitosas en un sobre `{ status: 'success', timestamp: ISO, data: T }`.
- **Entry Point Filter:** Se aplica sanitización obligatoria en el `SearchCompendiumDto` y el `CompendiumController` antes de cualquier procesamiento.

### Requirement: Global Defense (The Invisible Shield)

El sistema DEBE ser resiliente ante fallos internos y exposiciones de datos.

- **GlobalExceptionFilter:** Captura de TODAS las excepciones no manejadas para evitar fugas de stack traces y normalizar respuestas de error `{ status: 'error', message: string, ... }`.
- **Structured Logging:** Los logs de error deben incluir el contexto de la petición (`path`, `method`, `status`) para depuración inmediata.

### Requirement: Worker Resilience (The Spine)

Los Lich Workers deben ser robustos y escalables.

- **Concurrency:** El `IngestionWorker` cuenta con una concurrencia de 5 procesadores simultáneos.
- **Strong Typing:** Los contratos de Jobs se definen en interfaces estrictas y Enums (`IngestionJobName`).
- **Life-cycle Events:** Monitoreo activo de eventos `completed` y `failed` para telemetría de éxito de "cosecha de almas" (Soul Harvest).

### Requirement: Observability (Health Pulse)

- **Structured Logging:** Los logs no deben ser texto plano; deben usar objetos con contexto: `{ evt: 'EVENT_NAME', data: ... }`.
- **Health Check:** El Gateway expone `/health` para monitorización de uptime y estado vital.
- **Graceful Shutdown:** Hooks habilitados para cerrar conexiones de BullMQ y Redis limpiamente.

## 5. Recursos de Construcción

- **Documentación:** `api-architecture-nexus.md`, `system-map-atlas.md`.
- **Worker Snippets:** `Processor` y `Job` patterns definidos en el manual de arquitectura.

## 6. ADDED Requirements

### Requirement: Nexus Gateway (Entry Point)

... (resto igual)

El sistema DEBE exponer un punto de entrada unificado para todas las operaciones de consulta y administración.

#### Scenario: Búsqueda Unificada

- **WHEN** se recibe un `GET /v1/compendium/search`
- **THEN** el Gateway debe orquestar la llamada a la capa Brain y retornar un JSON normalizado.

### Requirement: Soul-Harvesting Broker (Message Queue)

Se DEBE implementar un sistema de colas para desacoplar las tareas pesadas de la respuesta inmediata al usuario.

#### Scenario: Encolado de Ingesta

- **WHEN** se inicia una sincronización de recursos
- **THEN** el sistema debe emitir un job `INGEST_RESOURCE` en BullMQ.

### Requirement: Interceptores Funcionales

El sistema DEBE utilizar interceptores para transformar datos de salida y manejar errores de forma centralizada.

#### Scenario: Normalización Snake-to-Camel

- **WHEN** el backend recibe datos en snake_case de APIs externas
- **THEN** un interceptor debe transformarlos a camelCase antes de entregarlos al cliente.

## 6. Valor Añadido (Design Patterns)

- **Event-Driven Architecture:** Uso de `Message Broker` para garantizar que la ingesta de datos no bloquee el hilo principal.
- **Fastify Engine:** Optimización de latencia extrema para el Gateway.
- **Modular Monolith:** Estructura modular que permite la extracción de workers a microservicios en el futuro si la carga lo requiere.
