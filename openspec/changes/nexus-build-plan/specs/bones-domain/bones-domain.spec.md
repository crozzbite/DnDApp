# Spec: Phase 1 - Bones (Core Domain)

Este documento especifica la implementación de la **Capa 1: Bones** para el ecosistema DnDApp, siguiendo la Nexus Architecture de SkullRender.

## 1. Identificación de Fase

- **Fase:** 1 (Bones)
- **Arquitectura:** SkullRender Nexus Architecture - Capa de Dominio.
- **Responsabilidad:** Definición de la lógica del multiverso pura, contratos y entidades sin dependencias externas.

## 2. Estructura y Organización

La implementación se organizará bajo el prefijo `src/app/core/domain/` para asegurar la centralización y evitar contaminación con otras capas.

```bash
src/app/core/domain/
├── models/             # Interfaces de entidades puras
│   ├── ability-stats.model.ts
│   ├── damage.model.ts
│   ├── resource.model.ts
│   ├── monster.model.ts
│   ├── spell.model.ts
│   ├── manual.model.ts
│   └── character-sheet.model.ts
├── repositories/        # Contratos (interfaces) de persistencia
│   ├── compendium.repository.interface.ts
│   ├── session.repository.interface.ts
│   └── vector.oracle.interface.ts
└── exceptions/         # Excepciones de dominio personalizadas
    └── domain.exception.ts
```

## 3. Framework & Stack

- **Lenguaje:** TypeScript v5.0+
- **Estándar:** Interfaces puras (no clases, excepto para excepciones).
- **Aliases:** El sistema DEBE utilizar Path Aliases configurados en el `tsconfig.json` para mantener la limpieza arquitectónica:
  - `@domain/*` → `src/app/core/domain/*` (Contratos y modelos)
  - `@core/*` → `src/app/core/*` (Lógica central)
  - `@shared/*` → `src/app/shared/*` (Componentes reutilizables)
  - `@features/*` → `src/app/features/*` (Módulos de negocio)
  - `@assets/*` → `src/assets/*` (Assets locales/iconos)
  - `@v1/*` → `src/app/*` (Versionado de lógica)

## 4. Recursos de Construcción

- **Documentación:** `domain-entities-bones.md`, `compendium-domain.md`.
- **Referencia Externa:** D&D 5e SRD (System Reference Document).

## 5. ADDED Requirements

### Requirement: Definición de Entidades Inmutables

El sistema DEBE definir interfaces de TypeScript para cada entidad del compendio, asegurando que contengan los campos obligatorios definidos en los Bones.

#### Scenario: Creación de entidad `Monster`

```typescript
export interface MonsterAction {
  name: string;
  description: string;
  damage?: Damage[];
}
```

- **WHEN** se define la entidad `Monster`
- **THEN** debe extender de `CompendiumResource` e incluir `abilityStats`, `armorClass`, `actions` y soporte para `specialAbilities` y modificadores de daño (resistencias/inmunidades).

### Requirement: Contratos de Repositorio (Interfaces)

Se DEBEN definir interfaces que dicten el "QUÉ" pero no el "CÓMO" de la persistencia de datos.

#### Scenario: Interface ICompendiumRepository

- **WHEN** se implementa la interface
- **THEN** debe incluir los métodos `findByIndex`, `search` y `save`.

### Requirement: Gestión de Errores de Dominio

El sistema DEBE contar con una clase base `DomainException` y especializaciones para errores comunes como recursos no encontrados.

#### Scenario: ResourceNotFoundException

- **WHEN** un recurso solicitado no existe
- **THEN** se debe lanzar una excepción que herede de `DomainException` con el código `RESOURCE_NOT_FOUND`.

## 6. Valor Añadido (Design Patterns)

- **Repository Pattern:** Desacoplamiento total entre la lógica de negocio y la infraestructura (SQL, Redis, APIs).
- **Hexagonal Architecture:** La capa Bones actúa como el núcleo (core) que no conoce a sus adaptadores.
- **Strict Typing:** Uso extensivo de `types` y `enums` para evitar "magic strings" en las categorías de recursos.
  81: - **Heavy Asset Policy:** Debido al volumen de 2GB+ en manuales y hojas, estos NO se servirán desde el bundle de la SPA. Se utilizará un **External Asset Nexus** (CDN/Bucket) y los Bone Models solo almacenarán la referencia URL externa.
