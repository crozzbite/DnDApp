# Spec: Phase 5 - Flesh (UI/UX)

Este documento especifica la implementación de la **Capa 5: Flesh** para el ecosistema DnDApp, siguiendo la Nexus Architecture de SkullRender.

## 1. Identificación de Fase

- **Fase:** 5 (Flesh)
- **Arquitectura:** SkullRender Nexus Architecture - Capa de Interfaz de Usuario.
- **Responsabilidad:** Presentación visual, interactividad reactiva y experiencia de usuario premium (Zoneless).

## 2. Estructura y Organización

La UI se organiza en **Features** (dominios de negocio) y **Shared** (componentes reutilizables), siguiendo la estrategia Smart vs Dumb.

```bash
src/app/
├── features/           # Funcionalidades de alto nivel (Smart)
│   ├── compendium/     # Buscador y explorador de recursos
│   ├── encounter/      # Seguimiento de combate y sesiones
│   └── dashboard/      # Vista general y estadísticas
├── shared/             # Unidades atómicas y moleculares (Dumb)
│   ├── components/     # Botones, inputs, badges, cards
│   ├── pipes/          # Transformadores de visualización
│   └── directives/     # Comportamientos de UI (hover, accessibility)
└── core/layout/        # Estructura maestra (Shell)
    ├── navbar/
    └── footer/
```

## 3. Framework & Stack

- **Framework:** Angular v19 (Zoneless Change Detection).
- **Estado:** Angular Signals (Input, Output, Model, Computed, Effect).
- **Estilo:** Vanilla CSS con Design Tokens y CSS Grid (Mobile-First).
- **Componentes:** Standalone Components por defecto.

## 4. Recursos de Construcción

- **Documentación:** `flesh-ui-ux.md`, `signal-reactive-state.md`.
- **Paleta de Colores:** Deep Bone Black (#000000), Pure Marrow White (#FFFFFF), Vital Blood Red (#FF0000).

## 5. ADDED Requirements

### Requirement: Implementación de Design Tokens

El sistema DEBE utilizar tokens de diseño centralizados en `index.css` para asegurar la consistencia SkullRender.

#### Scenario: Uso de Accent Red en CTAs

- **WHEN** se define un botón de acción principal
- **THEN** debe utilizar la variable `--color-accent` para el fondo y aplicar un sutil glow en hover.

### Requirement: Estrategia Smart vs Dumb (Feature Core)

Cada feature compleja DEBE dividirse en un `Container` (Smart) que maneje la lógica y una `View` (Dumb) que solo renderice datos.

#### Scenario: Contenedor de Búsqueda

- **WHEN** el usuario busca un recurso
- **THEN** el `SearchContainer` debe llamar al Use Case y pasar el Signal de resultados al `ResultView`.

### Requirement: Uso de Bloques @defer (Rendimiento)

Se DEBEN utilizar bloques `@defer` para cargar de forma diferida componentes no críticos como modales de detalle o paneles pesados.

#### Scenario: Carga de Detalle de Recurso

- **WHEN** el usuario hace clic en ver detalle
- **THEN** el componente de detalle debe cargarse de forma diferida con un skeleton UI como placeholder.

## 6. Valor Añadido (Design Patterns)

- **Zoneless Architecture:** Elimina la sobrecarga de `zone.js`, mejorando drásticamente el rendimiento percibido.
- **Virtual Scroll:** Uso de `CDK Virtual Scroll` para manejar listas masivas de resultados sin degradar el DOM.
- **Glassmorphism:** Estética premium con efectos de desenfoque de fondo y bordes sutiles.
