# Spec: Phase 2 - Brain (Application Logic)

Este documento especifica la implementación de la **Capa 2: Brain** para el ecosistema DnDApp, siguiendo la Nexus Architecture de SkullRender.

## 1. Identificación de Fase

- **Fase:** 2 (Brain)
- **Arquitectura:** SkullRender Nexus Architecture - Capa de Casos de Uso.
- **Responsabilidad:** Orquestación de la lógica de negocio, coordinación entre el dominio puro y la infraestructura.

## 2. Estructura y Organización

La lógica se dividirá en **Use Cases** (unidades de acción únicas) y **Services** de orquestación (Data Lich).

```bash
src/app/core/
├── use-cases/          # Clases de lógica de negocio (Query/Command)
│   ├── search-compendium.use-case.ts
│   ├── get-resource-detail.use-case.ts
│   ├── ingest-resource.use-case.ts
│   └── initialize-session.use-case.ts
└── services/           # Orquestadores inteligentes (The Lich)
    └── data-lich.orchestrator.ts
```

## 3. Framework & Stack

- **Lenguaje:** TypeScript v5.0+
- **Patrón:** Command/Query Pattern (simplificado).
- **Inyección de Dependencias:** Uso de decoradores `@Injectable` (Angular core) para facilitar el testing.

## 4. Recursos de Construcción

- **Documentación:** `use-cases-brain.md`, `data-lich-orchestrator.md`.
- **Contratos:** Repository Interfaces definidos en la Fase 1 (Bones).

## 5. ADDED Requirements

### Requirement: Implementación de Casos de Uso Query

El sistema DEBE implementar lógica para buscar y recuperar recursos del compendio integrando múltiples fuentes de datos.

#### Scenario: SearchCompendium con Prioridad Semántica

- **WHEN** se ejecuta la búsqueda
- **THEN** se debe consultar primero al `IVectorOracle` y complementar con el `ICompendiumRepository`.

### Requirement: Orquestación Inteligente (Data Lich)

El sistema DEBE contar con un orquestador que gestione la jerarquía de fuentes (Cache -> Database -> API) para optimizar el rendimiento.

#### Scenario: Recuperación con Stale-While-Revalidate

- **WHEN** se solicita un recurso
- **THEN** el `DataLichOrchestrator` debe intentar servir desde la cache mientras dispara una actualización asíncrona.

### Requirement: Seguridad en los Casos de Uso

Cada caso de uso DEBE incluir guardias de seguridad lógica, como la detección de PII o filtros contra Inyección de Prompts.

#### Scenario: PII Redaction en Search

- **WHEN** el usuario ingresa una query
- **THEN** el sistema debe filtrar información sensible antes de enviarla al Vector Nexus.

## 6. Valor Añadido (Design Patterns)

- **Orchestration Layer:** Separa la complejidad de la red y la persistencia de la vista.
- **Dependency Injection:** Permite mockear los repositorios y oráculos fácilmente en el Gauntlet (Fase 6).
- **Single Responsibility Principle (SRP):** Cada clase de `UseCase` solo tiene un método público `execute()`.
