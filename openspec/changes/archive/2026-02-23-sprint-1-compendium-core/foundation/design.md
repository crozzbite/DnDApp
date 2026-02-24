## Context

El proyecto actual carece de una separación clara de responsabilidades. La lógica de negocio, el consumo de API y el tipado están mezclados en servicios planos. Necesitamos establecer la "Capa 1" (Bones) para permitir un escalado seguro.

## Goals / Non-Goals

**Goals:**

- Implementar el modelo de dominio completo para D&D 5e (Hechizos, Monstruos, Recursos).
- Establecer la estructura de carpetas funcional (`core`, `shared`, `features`).
- Garantizar tipado estricto (Zero `any`) en los modelos de base.

**Non-Goals:**

- Implementar el buscador o la UI en este sprint.
- Integrar fuentes de datos externas adicionales (PDFs/Foros) fuera de la API principal.

## Decisions

- **Arquitectura de Carpetas**: Seguiremos el estándar SkullRender dividiendo en `core/` (global), `shared/` (reusable) y `features/` (específico).
- **Inmutabilidad del Dominio**: Las interfaces en `core/models` se tratarán como contratos inmutables.
- **Signals**: Toda la reactividad de la aplicación se basará en Signals de Angular 19, evitando `Observables` a menos que sea estrictamente necesario para el flujo HTTP de RxJS.

## Risks / Trade-offs

- **[Riesgo] Complejidad Inicial** → La creación de interfaces detalladas toma tiempo. _Mitigación_: Empezar por las entidades más críticas (Spell, Monster).
- **[Trade-off] Rigidez** → El tipado estricto puede dificultar prototipos rápidos. _Justificación_: En SkullRender priorizamos la robustez (Bones) sobre la velocidad superficial.
