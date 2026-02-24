# Spec: Phase 6 - Gauntlet (QA/TDD)

Este documento especifica la implementación de la **Capa 6: Gauntlet** para el ecosistema DnDApp, siguiendo la Nexus Architecture de SkullRender.

## 1. Identificación de Fase

- **Fase:** 6 (Gauntlet)
- **Arquitectura:** SkullRender Nexus Architecture - Capa de Calidad y Verificación.
- **Responsabilidad:** Garantizar la integridad de la lógica, la estabilidad del sistema y el cumplimiento de los estándares de performance.

## 2. Estructura y Organización

Las pruebas se integran directamente en el árbol de archivos del proyecto para las pruebas unitarias y en un directorio dedicado para las pruebas de extremo a extremo (E2E).

```bash
src/app/
├── core/
│   ├── use-cases/*.spec.ts     # Pruebas unitarias de lógica de negocio
│   └── services/*.spec.ts      # Pruebas de orquestación
└── features/
    └── **/*.spec.ts            # Pruebas de integración de componentes (Smart)
tests/
└── e2e/                        # Pruebas de extremo a extremo
    ├── search-journey.spec.ts
    └── session-resilience.spec.ts
```

## 3. Framework & Stack

- **Unit Testing:** Jest (configuración rápida y paralela).
- **E2E Testing:** Playwright (para pruebas multi-navegador y performance).
- **Mocking:** `jest-mock` para repositorios y proveedores de infraestructura.
- **CI/CD integration:** GitHub Actions para ejecución automática en cada PR.

## 4. Recursos de Construcción

- **Documentación:** `gauntlet-qa-tdd.md`, `qa-testing-strategy.md`.
- **Estándar:** Pirámide de SkullRender (70% Unit, 20% Integration, 10% E2E).

## 5. ADDED Requirements

### Requirement: Pruebas unitarias de Reactividad (Signals)

Se DEBEN validar los estados derivados de los Signals y su reacción ante cambios en los inputs.

#### Scenario: Reacción a Búsqueda con Debounce

- **WHEN** se actualiza el `searchTerm` en un componente
- **THEN** el test debe verificar que la llamada al servicio se realiza solo después del tiempo de debounce (ej. 300ms) usando `fakeAsync`.

### Requirement: Validación de Caminos Críticos (E2E)

El sistema DEBE verificar automáticamente el flujo completo del usuario desde la búsqueda hasta la gestión de encuentros.

#### Scenario: El Viaje del Héroe

- **WHEN** el usuario busca "Beholder", abre el detalle y agrega al encuentro
- **THEN** Playwright debe confirmar que el estado se refleja correctamente en la UI y persiste en la sesión.

### Requirement: Mocking de Infraestructura

Todas las dependencias externas (APIs, Redis, DB) DEBEN ser reemplazadas por mocks en el entorno de pruebas unitarias.

#### Scenario: Fallo del Oráculo Semántico

- **WHEN** se simula un error de conexión con Pinecone
- **THEN** el sistema debe demostrar que activa correctamente el fallback relacional sin colapsar.

## 6. Valor Añadido (Design Patterns)

- **TDD (Test-Driven Development):** Construcción basada en especificaciones de prueba previas al código.
- **Performance Assertions:** Los tests E2E incluyen aserciones de tiempo de carga (<300ms) para asegurar la agilidad SkullRender.
- **Leak Protection:** Verificación de destrucción de efectos y subscripciones para evitar fugas de memoria en el cliente.
