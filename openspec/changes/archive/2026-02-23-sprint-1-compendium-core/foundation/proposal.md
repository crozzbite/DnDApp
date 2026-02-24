## Why

Este repositorio es una reliquia que debe ser restaurada para servir como la **Guía Definitiva de D&D 5e**. El objetivo es transformar una aplicación plana en un compendio gigante, gratuito y autogestionado (Open Source) que centralice información de múltiples fuentes (APIs, PDFs, Manuales) para optimizar la gestión de campañas de DMs y jugadores.

"Cimentaremos los huesos antes de reconstruir la carne."

## What Changes

1.  **Reestructuración Arquitectónica**: Migración a Clean Architecture (SkullRender Standard) con capas `core/`, `shared/` y `features/`.
2.  **Capa de Dominio (Layer 1)**: Definición formal de las entidades de D&D (Hechizos, Monstruos, Clases, etc.) mediante interfaces estrictas e invariantes.
3.  **Gestión de Estado Moderna**: Implementación de Signals de Angular 19 para un flujo de datos reactivo y eficiente.
4.  **Consumo de Datos Multi-fuente**: Creación de un orquestador capaz de estructurar datos provenientes de la API 5e-bits y futuras integraciones.

## Stakeholders [VERIFIED]

- **Dungeon Masters (DMs)**: Usuarios finales que requieren velocidad y precisión para dictar campañas.
- **Jugadores**: Usuarios finales que consultan reglas, hechizos y habilidades de clase.
- **Fuentes de Información**: Entidades proveedoras de datos (APIs/JSON) que alimentan el compendio.
- **SkullRender Core**: Maintainers encargados de la integridad arquitectónica y el despliegue del software.

### Fuentes de Información (The Knowledge Base)

- **[D&D 5e API](https://www.dnd5eapi.co/)**: Fuente primaria y robusta para el System Reference Document (SRD). Proporciona el núcleo de clases, hechizos y monstruos base.
- **[Open5e](https://open5e.com/)**: API que expande el SRD con contenido OGL de terceros (Kobold Press, Level Up A5E), incluyendo bestiarios expandidos y reglas suplementarias.
- **[Dnd-data (nick-aschenbach)](https://github.com/nick-aschenbach/dnd-data)**: Librería con datos estructurados de monstruos, objetos y hechizos en formatos listos para consumir. (Preferida por el Stakeholder).
- **[Dnd5-srd (soryy708)](https://github.com/soryy708/dnd5-srd)**: Base de datos estática en JSON para fallback y optimización de carga inicial (Bones offline).
- **Public Domain & OGL PDFs**: Manuales estructurados para ser procesados y filtrados.

## Capabilities

### New Capabilities

- `dnd-5e-api-connector`: Definición de tipos y lógica de consumo para el SRD oficial desde dnd5eapi.co.
- `open5e-api-connector`: Integración y mapeo de contenido expandido OGL (Kobold Press, etc.) desde la API de Open5e.
- `nick-aschenbach-data-adapter`: Adaptador específico para la ingesta de datos estructurados de alta calidad desde la librería dnd-data.
- `soryy708-static-provider`: Proveedor de datos estáticos en JSON para soporte offline y optimización de carga desde dnd5-srd.
- `pdf-manuals-ingestor`: Capacidad de indexación y referencia de manuales PDF locales para complementar datos que falten en las APIs.
- `data-lich-orchestrator`: Servicio maestro que orquestra los conectores anteriores, unificando y normalizando las respuestas para el dominio.
- `signal-reactive-state`: Sistema de gestión de estado global basado exclusivamente en Angular Signals, permitiendo una reactividad quirúrgica y de alto rendimiento.
- `bones-visual-system`: Sistema de diseño basado en la estética SkullRender, implementado con variables CSS y SASS modular (Negro, Blanco, Rojo).
- `compendium-search-engine`: Motor de búsqueda y filtrado reactivo capaz de procesar colecciones locales y remotas simultáneamente.
- `headless-cache-layer`: Capa de persistencia agnóstica para guardar hechizos y consultas frecuentes, minimizando latencia y consumo de datos.

## Impact

- Refactorización total de `src/app/Services` y `src/app/Components`.
- Estándares de testing (Jest) para el 100% de la capa de dominio.
- Eliminación de dependencias obsoletas y limpieza visual.
