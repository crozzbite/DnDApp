# Specification: Tech Stack & Standards (The Forge)

## 1. Overview

Este documento define las herramientas y martillos con los que forjamos SkullRender. La consistencia en el stack es lo que permite que el sistema sea mantenible y escalable.

## 2. Frontend: Angular Moderno (v19)

Seguiremos estrictamente "The Angular Way".

- **Estado Reactivo**: Uso de **Signals** para estado de UI y reactividad síncrona.
- **RxJS**: Permitido exclusivamente para streams asíncronos complejos (WebSockets para combates, pooling de ingestión).
- **Componentes**: Arquitectura **Standalone**. Nada de `NgModule` pesados.
- **SSR & Hydration**:
  - **Habilitado**: Landing, SEO Pages, Previsualización de Compendio.
  - **Deshabilitado (CSR)**: Búsqueda dinámica, Encounter Tracker, Paneles Administrativos.

```typescript
// Ejemplo de Componente SkullRender Standard
@Component({
  standalone: true,
  selector: "app-monster-card",
  template: `
    @if (monster(); as m) {
      <div class="card card-premium">
        <h3>{{ m.name }}</h3>
        <p>{{ m.cr }}</p>
      </div>
    }
    @placeholder {
      <div class="skeleton">Cargando Huesos...</div>
    }
  `,
})
export class MonsterCardComponent {
  monster = input.required<Monster>();
}
```

## 3. Styling: SkullRender Aesthetic

Minimalismo funcional.

- **Paleta**: Negro (`#000000`), Blanco (`#FFFFFF`), Rojo Skull (`#D32F2F`).
- **CSS**: Vanilla CSS + SASS para variables y mixins.
- **DRY**: Los componentes de UI deben vivir en `shared/components` y ser puramente presentacionales.

## 4. Backend & Persistencia (The Providers)

Agnósticos por contrato, pero definidos por implementación.

| Servicio             | Tecnología                   | Rol                                             |
| :------------------- | :--------------------------- | :---------------------------------------------- |
| **SQL Tome**         | PostgreSQL + Prisma          | Almacenamiento de la Verdad Absoluta.           |
| **Cache Mantle**     | Memory (L1) + Redis (L2)     | Estrategia multi-capa para latencia ultra-baja. |
| **Vector Nexus**     | Pinecone                     | Búsqueda semántica y RAG.                       |
| **API Framework**    | **Fastify** (Core API)       | Gateway de orquestación de Casos de Uso.        |
| **Ingestion Engine** | **Batch Workers** (Isolated) | Procesamiento offline de fuentes externas.      |

```prisma
// Snippet: Modelo de Dominio en Prisma (SQL Tome)
model Resource {
  id              String   @id @default(uuid())
  index           String   @unique
  name            String   @index
  category        String   @index
  tags            String[] // Para filtrado rápido relacional
  data            Json     // Contenido RAG completo
  version         Int      @default(1)
  sourceId        String   @index
  trustLevel      String   @default("untrusted") // trusted | semi-trusted | untrusted
  contentHash     String   // Para detección de cambios y duplicados
  schemaVersion   String   @default("1.0")
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  lastIngestedBy  String?
}
```

## 5. Directory Structure (Huesos)

Organización por dominios para escalabilidad infinita.

```text
src/
  app/
    core/           # Singletons (Auth, Interceptors, Global Services)
    shared/         # Reusable UI (Buttons, Skeletons, Pipes)
    features/       # Business Logic
      compendium/   # Feature: Compendium Search & Detail
      encounter/    # Feature: Combat tracking
    domain/         # Layer 1: Interfaces & Value Objects
    use-cases/      # Layer 2: Business Rules
    infra/          # Layer 3: Adapters (Prisma, Pinecone, Redis)
```

## 6. Deployment: The Hybrid Throne

Para maximizar rendimiento y seguridad:

1. **Edge (Vercel/Cloudflare)**: Sirve el Frontend Angular, maneja SSR Caching y Assets.
2. **Ops-Container (Docker/Fly.io)**: El `Nexo Core` (Fastify) corre en contenedores para garantizar conexiones persistentes a DB, persistencia de metrics de Prometheus y aislamiento del Ingestion Engine.

## 6. Development Workflow

- **Linting**: Reglas de ESLint estrictas para asegurar que el código sea limpio (Brains).
- **Format**: Prettier para consistencia visual.
- **Commit**: Conventional Commits (feat, fix, refactor, docs).
