# Specification: Domain Entities & Pure Contracts (The Bones)

## 1. Overview

En el corazón de **SkullRender**, la Capa de Dominio (Capa 1) es sagrada. Contiene la "Lógica del Multiverso" pura, libre de frameworks, bases de datos o APIs. Estos contratos definen la esencia de un Monstruo, un Hechizo y cómo interactuamos con ellos, asegurando que el sistema sea resistente al cambio tecnológico.

## 2. Value Objects (The Essence)

Los Objetos de Valor son inmutables y encapsulan validaciones mecánicas esenciales de D&D.

### 2.1 AbilityStats

Representa las 6 estadísticas base de cualquier criatura.

```typescript
export interface AbilityStats {
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
}

// Pure Domain Logic (Static Helpers)
export const getModifier = (stat: number): number => Math.floor((stat - 10) / 2);
```

### 2.2 Damage & Dice

```typescript
export interface Damage {
  formula: string; // ej: "2d6 + 4"
  type: string; // ej: "fire", "slashing"
}
```

## 3. Pure Entities (The Core)

Las entidades representan objetos con identidad única. Se definen como interfaces de TypeScript para ser livianas y fáciles de transportar entre capas.

### 3.1 Base Resource

```typescript
export interface CompendiumResource {
  id: string; // UUID
  index: string; // Slug / Key única (ej: "ancient-red-dragon")
  name: string;
  category: "monster" | "spell" | "equipment" | "magic-item" | "class" | "race" | "feat" | "background" | "rule" | "npc" | "campaign" | "location" | "plane" | "religion" | "table" | "codex" | "manual" | "character-sheet";
  source: string; // "srd", "custom-homebrew"
}
```

### 3.2 Monster Entity

```typescript
export interface Monster extends CompendiumResource {
  category: "monster";
  size: string;
  type: string;
  alignment: string;
  armorClass: number;
  hitPoints: number;
  challengeRating: number;
  stats: AbilityStats;
  actions: MonsterAction[];
}

export interface MonsterAction {
  name: string;
  desc: string;
  damage?: Damage[];
}
```

### 3.3 Spell Entity

```typescript
export interface Spell extends CompendiumResource {
  category: "spell";
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string[];
  duration: string;
  isRitual: boolean;
  description: string;
}
```

### 3.4 Manual & Codex Entity

```typescript
export interface Manual extends CompendiumResource {
  category: "manual" | "codex";
  author?: string;
  version: string; // ej: "5.0", "Revised"
  pages: number;
  assets: {
    pdfUrl: string; // Ruta local o remota al binario
    thumbnailUrl?: string;
  };
  tableOfContents: string[]; // Secciones clave indexables
}
```

## 4. Repository Interfaces (The Contracts)

Estas interfaces definen **QUÉ** se puede hacer con los datos, pero no **CÓMO**. La implementación real (Prisma, Redis, Pinecone) vive en la Capa de Infraestructura.

### 4.1 ICompendiumRepository

```typescript
export interface SearchFilters {
  category?: string;
  source?: string;
  level?: number;
  challengeRating?: number;
  [key: string]: string | number | boolean | undefined;
}

export interface ICompendiumRepository {
  findByIndex(index: string): Promise<CompendiumResource | null>;
  search(query: string, filters: SearchFilters): Promise<CompendiumResource[]>;
  save(resource: CompendiumResource): Promise<void>;
}
```

### 4.2 ISessionRepository (Cache Mantle Contract)

```typescript
export interface ISessionRepository {
  getSession(sessionId: string): Promise<UserSession | null>;
  updateSession(sessionId: string, data: Partial<UserSession>): Promise<void>;
}

export interface UserSession {
  id: string;
  history: string[]; // Últimos índices visitados
  activeEncounter?: ActiveEncounter;
}

export interface ActiveEncounter {
  id: string;
  name: string;
  round: number;
  turnIndex: number;
  combatants: EncounterCombatant[];
}

export interface EncounterCombatant {
  entityIndex: string; // Referencia al Compendium (ej: "goblin")
  instanceId: string; // ID único para esta instancia en el combate
  customName?: string;
  currentHp: number;
  maxHp: number;
  initiative: number;
}
```

### 4.3 IVectorOracle (Vector Nexus Contract)

```typescript
export interface IVectorOracle {
  findSemanticMatches(query: string, topK: number): Promise<string[]>; // Retorna IDs
  indexResource(resource: CompendiumResource): Promise<void>;
}
```

## 5. Domain Exceptions (The Guard's Warnings)

No permitimos que errores genéricos "sucios" contaminen el multiverso. Definimos excepciones de dominio específicas:

```typescript
export class DomainException extends Error {
  constructor(
    public message: string,
    public code: string,
  ) {
    super(message);
    this.name = "DomainException";
  }
}

export class ResourceNotFoundException extends DomainException {
  constructor(index: string) {
    super(`El recurso '${index}' no existe en los registros del Nexo.`, "RESOURCE_NOT_FOUND");
  }
}

export class AlchemyException extends DomainException {
  constructor(details: string) {
    super(`Fallo en la transmutación de datos: ${details}`, "ALCHEMY_ERROR");
  }
}
```

## 6. Domain Contracts (Advanced)

### 6.1 IResourceNormalizer (The Alchemist's Contract)

Define cómo los datos externos se transforman en entidades puras de SkullRender.

```typescript
export interface IResourceNormalizer {
  toBones(rawData: unknown, category: string): CompendiumResource;
}
```

## 7. Domain Rules (The Law)

Reglas puras que deben cumplirse en cualquier implementación:

- **Inmutabilidad**: Las entidades de dominio no deben ser modificadas directamente; se deben crear versiones nuevas si el estado cambia.
- **Validación de Identidad**: Ningún recurso puede entrar al Dominio sin un `id` (UUID) y un `index` (Slug) válido.
- **Normalización**: Los datos provenientes de la infraestructura deben pasar por el `IResourceNormalizer` antes de ser admitidos como Entidades de Dominio (SkullRender Bones).
- **Tratamiento de Excepciones**: Los repositorios y servicios deben mapear errores técnicos a `DomainException` para mantener la pureza de la Capa 1.
