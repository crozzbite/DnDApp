# Spec: Phase 4.1 - Organs (Connectors)

Este documento especifica la implementación de la **Capa 4.1: Connectors** para el ecosistema DnDApp, siguiendo la Nexus Architecture de SkullRender.

## 1. Identificación de Fase

- **Fase:** 4.1 (Organs - Connectors)
- **Arquitectura:** SkullRender Nexus Architecture - Capa de Infraestructura (Adaptadores Externos).
- **Responsabilidad:** Consumo, normalización y resiliencia de datos provenientes de fuentes externas.

## 2. Estructura y Organización

Los conectores viven en la infraestructura y actúan como implementaciones de los contratos de normalización.

```bash
src/app/core/infrastructure/connectors/
├── dnd5e/              # Conector para dnd5eapi.co
│   ├── dnd5e-api.connector.ts
│   ├── dnd5e-api.normalizer.ts
│   └── dnd5e-api.types.ts
├── open5e/             # Conector para open5e.com
│   ├── open5e.connector.ts
│   └── open5e.normalizer.ts
├── static/             # Adaptador para JSONs locales (Nick Aschenbach)
│   └── local-data.adapter.ts
├── pdf-ingestor/       # Ingestor para PDFs locales
│   ├── pdf-manuals.connector.ts
│   ├── pdf-manuals.normalizer.ts
│   └── pdf-manuals.index-loader.ts
└── common/             # Utilidades de red compartidas
    └── connector.error.ts
```

## 3. pdf-manuals-ingestor Spec (External Asset Nexus Integration)

Este conector evoluciona de una carga local a una integración con el **External Asset Nexus** (Cloudflare R2 / S3), permitiendo manejar los +2.6GB de grimorios sin saturar el repositorio.

### Requirement: Indexación Híbrida de Grimorios

El sistema DEBE ser capaz de leer el `index.json` y resolver las rutas de los archivos de forma dinámica, priorizando el CDN externo sobre los assets locales.

#### Scenario: Resolución de URL (Assets Nexus)

- **WHEN** el entorno es `production` o el flag `useExternalNexus` es `true`.
- **THEN** el `pdf-manuals.normalizer.ts` debe transformar las rutas relativas en URLs de CDN (ej. `https://nexus.skullrender.com/dnd-manuals/...`).

### Requirement: Ingesta y Sincronización (Task 4.4.2)

Se debe implementar un script de migración (`nexus-sync.ts`) que automatice la subida de los archivos desde `src/assets/docs/` hacia el Bucket externo, manteniendo la integridad referencial del `index.json`.

### Requirement: Configuración de Almacenamiento (Task 4.4.1)

El conector debe utilizar las credenciales del Vault para interactuar con la API de S3/R2 en tiempo de build o mediante prefijos de URL firmadas si se requiere acceso privado.

#### Scenario: Fallback a Local

- **WHEN** el asset no está disponible en el Nexus o estamos en `development` sin conexión.
- **THEN** el ingestor debe buscar el archivo en la ruta local de `assets/docs/` como fallback de emergencia.

### Requirement: Desacoplamiento via AssetResolver (Task 4.1.7)

Se DEBE utilizar el `AssetResolverService` para abstraer la construcción de las URLs finales. Ningún componente o conector debe manipular strings de rutas directamente.

## 3. Framework & Stack

- **Framework:** Angular v19 HttpClient.
- **Reactividad:** RxJS puros (uso de `shareReplay`, `retry`, `catchError`).
- **Normalización:** Funciones puras de mapeo para transformar JSONs externos a interfaces de **Bones**.

## 4. Recursos de Construcción

- **Documentación:** `dnd-5e-api-connector.md`, `open5e-api-connector.md`, `nick-aschenbach-data-adapter.md`.
- **Endpoints:** `https://www.dnd5eapi.co/api/2014/`, `https://api.open5e.com/`.

## 5. ADDED Requirements

### Requirement: Consumo y Mapeo de SRD

El sistema DEBE ser capaz de recuperar recursos de dnd5eapi.co y mapearlos al modelo `CompendiumResource`.

#### Scenario: Normalización de Monstruos

- **WHEN** se recibe un JSON de la API externa (snake_case)
- **THEN** el normalizador debe convertirlo a camelCase y asegurar que cumpla con el contrato de la Fase 1.

### Requirement: Deduplicación de Peticiones

Para optimizar el tráfico, el sistema DEBE evitar realizar peticiones HTTP duplicadas para el mismo recurso si ya hay una en curso.

#### Scenario: Peticiones Simultáneas

- **WHEN** múltiples componentes solicitan el mismo `index` al mismo tiempo
- **THEN** el conector debe compartir la misma subscripción de RxJS y realizar una sola llamada.

### Requirement: Gestión de Errores con ConnectorError

Los fallos de red deben ser capturados y transformados en un objeto `ConnectorError` estandarizado.

#### Scenario: Error 429 (Too Many Requests)

- **WHEN** la API externa devuelve un error de rate limit
- **THEN** el conector debe marcar `isRetryable: true` y disparar una estrategia de exponential backoff.

## 6. Valor Añadido (Design Patterns)

- **Adapter Pattern:** Permite que las fuentes externas se adapten al dominio interno sin contaminarlo.
- **Resilience Strategy:** Implementación de reintentos asíncronos para mejorar la estabilidad ante micro-cortes de red.
- **Functional Normalizers:** Las funciones de mapeo son puras y fáciles de testear unitariamente con Jest.
