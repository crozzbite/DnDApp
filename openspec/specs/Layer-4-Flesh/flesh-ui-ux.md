# Specification: The Flesh (UI/UX) - SkullRender Mastery

## 1. Overview

"The Flesh" es la manifestación visual de **SkullRender**. No es decoración, es claridad funcional. Esta capa define cómo el usuario interactúa con los huesos (domain), el cerebro (use cases) y la armadura (infra).

## 2. Visual Identity & Design Tokens (The Skull Palette)

Fiel al mantra: "Bones + Brain = Rational Creativity".

- **Fonts**:
  - _Headers_: 'Outfit' (Bold) para etiquetas e instrucciones.
  - _Data/Code_: 'JetBrains Mono' para estadísticas de monstruos y detalles técnicos.
- **Colors**:
  - `Primary`: #000000 (Deep Bone Black)
  - `Background`: #FFFFFF (Pure Marrow White)
  - `Accent`: #FF0000 (Vital Blood Red)
- **Status Colors**:
  - `Verified`: Emerald Green (opacity 0.8) para `trustLevel: HIGH`
  - `Experimental`: Amber (opacity 0.8) para `trustLevel: LOW`
- **Surfaces**: Glassmorphism sutil (Backdrop-blur: 12px, border: 1px solid rgba(0,0,0,0.1)).
- **SkullRender Motion**:
  - **Interacciones**: Transiciones de 0.2s (`ease-out`) para hover/active.
  - **Key Moments**: El `Accent Red` debe tener un sutil pulso o glow cuando se activa un recurso crítico.
  - **Transitions**: Uso de `void => *` animations nativas de Angular para la entrada de items en el grid.

### 2.1 Design Tokens (Standardization)

PROHIBIDO hardcodear valores. Todo debe referenciar a `tokens.css`:

```css
:root {
  --color-primary: #000000;
  --color-background: #ffffff;
  --color-accent: #ff0000;
  --status-verified: #10b981;
  --status-experimental: #f59e0b;
  --transition-fast: 0.2s ease-in-out;
}
```

Siguiendo el estándar de **Mastery**, eliminamos sufijos innecesarios en la estructura de archivos.

### 3.1 Smart vs Dumb Strategy (Feature Core)

Para orquestaciones complejas (Search, Panels), dividimos en:

- **Container (.container.ts)**: Único punto de contacto con `UseCases` y `Global Store`. Orquesta signals.
- **View (.view.ts / .view.html)**: UI pura. Recibe data por `input()` signals y emite por `output()`.

### 3.2 Hierarchy

- **Atoms**: `Button`, `Input`, `Badge` (Dumb).
- **Molecules**: `SearchBar`, `ResourceCard` (Dumb).
- **Organisms**: `SearchContainer` (Smart), `ResultGrid` (Virtual Scrolled), `AuditDashboard` (Smart).
- **Skeleton Screens**: Obligatorio definir `xxx-skeleton` para cada molécula y organismo pesado. No usar solo spinners.

### 3.1 File Structure (Separation of Concerns)

Todo componente debe estar dividido en 3 archivos (salvo lógica extremadamente trivial):

```text
compendium-header/
├── compendium-header.ts    (Lógica/Signals)
├── compendium-header.html  (Template)
└── compendium-header.css   (Styles)
```

- **Zoneless**: `provideZonelessChangeDetection()`. Prohibido el uso de `subscribe()` manual.
- **Signals & RxJS**:
  - Uso de **RxJS** obligatorio para orquestación de eventos complejos (debounce, switchMap, catchError).
  - Transformación obligatoria a signals mediante `toSignal()` o `rxResource` para el consumo en el template.
- **OnPush**: `ChangeDetectionStrategy.OnPush` por defecto en cada componente.
- **Modern Flow**: Uso exclusivo del nuevo control flow: `@if`, `@for`, `@switch`.
- **@defer**: Mandatorio para modales de detalle, paneles de estadísticas pesados y componentes fuera del viewport inicial.
- **Debounce**: El stream de búsqueda debe incluir `debounceTime(300)` para proteger el Oracle/Vector Nexus.
- **Virtual Scroll (Performance Pagination)**: El `ResultGrid` implementará `CDK Virtual Scroll`.
  - **Layout Rule**: Los items (`ResourceCard`) DEBEN tener una altura fija o predecible para evitar jitter y errores de medición.
  - **Paginación Técnica**: Manejo de >500 resultados sin degradación del DOM.

- **Optimized @defer Strategy**:
  - **NO usar `@defer` para el Grid principal** (evita retraso perceptual en la búsqueda inmediata).
  - **USAR `@defer` para modales de detalle**, secciones secundarias y componentes pesados fuera del viewport inicial.

## 5. Responsive Master Grid (Mobile-First)

Utilizamos CSS Grid nativo con enfoque móvil-primero.

```css
/* shared/styles/layout.css */
.nexus-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: 1fr; /* Mobile */
  padding: 1rem;
}

@media (min-width: 768px) {
  .nexus-grid {
    grid-template-columns: repeat(2, 1fr);
  } /* Tablet */
}

@media (min-width: 1200px) {
  .nexus-grid {
    grid-template-columns: repeat(4, 1fr);
  } /* PC */
}
```

## 6. Routing, Guards & Interceptors

### 6.1 Modern Routes

```typescript
export const COMPENDIUM_ROUTES: Routes = [
  {
    path: "",
    loadComponent: () => import("./shell/shell").then((m) => m.CompendiumShell),
    children: [
      {
        path: "search",
        loadComponent: () => import("./search/search").then((m) => m.SearchContainer),
      },
      {
        path: "detail/:id",
        loadComponent: () => import("./detail/detail").then((m) => m.ResourceDetail),
        canActivate: [() => inject(SessionGuard).canActivate()],
      },
    ],
  },
];
```

### 6.2 Security & Global State

El Frontend NO almacena secretos compartidos (No HMAC Keys en el cliente).

- **Interceptors**:
  - `CSRF`: Manejo de **Double Submit Cookie** nativo de Angular.
  - `SessionContext`: Adjunta el `fingerprint` (Session ID) para que el Oracle identifique la Shadow Session.

### 6.2 Global Store (Signal-Based)

Dedicado a estado global puro.

- **Rules**:
  - **Estado Puro**: El Store solo almacena y transforma datos.
  - **Prohibido Side Effects**: El Store NO puede llamar a UseCases ni servicios externos directamente.
  - **Orquestación**: Los Side-effects viven únicamente en **Containers**.

- **Estructura**:
  - `ActiveEncounter`: Signal de combate/encuentro actual.
  - `UserPrefs`: Signal de preferencias del usuario.
  - `SessionMetadata`: Signal de estado de sesión.

### 6.3 Search Stream Specification (RxJS Pipes)

Toda búsqueda reactiva DEBE seguir este pipeline para garantizar integridad y orden:

```typescript
search$ = queryChange$.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  switchMap((q) =>
    useCase.execute(q).pipe(
      catchError((err) => {
        this.localError.set(err);
        return of([]); // Fallback local seguro
      }),
    ),
  ),
  takeUntilDestroyed(),
);
```

### 6.4 Granular Error Handling

- **Global**: `VoidFallback` para fallos catastróficos.
- **Local (Feature Level)**: Cada Feature (Search, Detail, Encounter) DEBE manejar un Signal `error = signal<Error | null>(null)`.
- **UI**: Uso de `@if (error())` para mostrar mensajes contextuales sin romper toda la aplicación.

### 6.3 Shell Persistence & Errors

- **Error Boundaries**: Implementación de un `Global Error Handler` que renderice un `VoidFallback` UI si el Shell colapsa.

## 7. Accessibility (A11y) & Semantic UI

Para cumplir con el estándar **Enterprise**, cada componente debe nacer accesible.

- **Aria-Live**: El contador de resultados (`X resultados encontrados`) debe usar `aria-live="polite"`.
- **Keyboard Navigation**: El `CDK Virtual Scroll` debe ser navegable mediante flechas y Enter.
- **Focus Management**: Al usar `@defer` para abrir un modal, el foco debe trasladarse al primer elemento interactivo del modal y restaurarse al cerrar.
- **Contrast**: El `Accent Red` (#FF0000) debe usarse solo sobre fondos con contraste verificado (AA).

## 8. Optimistic UI Pattern

Para acciones de baja latencia percibida (e.g., agregar a un encuentro):

- **Regla**: Al pulsar `btn-add-to-encounter`, el estado del `GlobalStore` se actualiza **inmediatamente**.
- **Rollback**: Si el backend falla, el `Container` captura el error y revierte el cambio en el Store, notificando al usuario mediante un `LocalError`.

## 9. Interaction Patterns & CTAs

| Nombre CTA             | Acción                         | Feedback UX                              |
| :--------------------- | :----------------------------- | :--------------------------------------- |
| `btn-search-trigger`   | Dispara búsqueda híbrida       | Loading spinner en input                 |
| `btn-add-to-encounter` | Agrega monstruo a la sesión    | Badge animado en el panel lateral        |
| `btn-filter-category`  | Muta el Signal `activeFilters` | El color del botón cambia a `Accent Red` |
| `btn-clear-nexus`      | Resetea `searchTerm`           | Limpieza inmediata del Grid              |

### 9.1 Happy Path

1. Usuario enfoca `input-search`.
2. Escribe "Beholder" -> Signal reacciona.
3. El Grid se actualiza **instantáneamente** (sin `@defer`) usando `CDK Virtual Scroll`.
4. Clic en `btn-view-detail` -> Carga diferida del modal mediante `@defer` con `JetBrains Mono`.

### 9.2 Error Flow

1. **Oracle Offline**: El interceptor detecta fallo del backend -> UI muestra el componente `RelationalFallback` (Capa 3).
2. **Session Expired**: El Guard redirige a `/void` (página de re-init de sesión).
