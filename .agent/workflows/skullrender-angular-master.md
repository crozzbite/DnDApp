---
description: High-fidelity workflow for SkullRender Angular Landings. Includes battle-tested snippets and strict architecture validation.
---

# 🏆 Master Workflow: SkullRender Angular Landing (v2.0)

Este no es un workflow básico; es la destilación técnica de la **Academia Daniela**. Úsalo para no repetir el "desmadre" de la v1.0.

## 💀 FASE 0: El Skeleton Blindado
No toques el teclado hasta que esto esté configurado.

```bash
# 1. Generar App con separación TOTAL (Mandatorio)
npx -y @angular/cli@latest new [name] --style=css --routing --ssr=false --standalone --inline-style=false --inline-template=false

# 2. Estructura de Carpetas SkullRender v19
mkdir -p src/app/core/{models,services,guards,interceptors}
mkdir -p src/app/shared/{components,ui,pipes,directives}
mkdir -p src/app/features/{home,onboarding,results}
```

## 🧠 FASE 1: El Cerebro (State Management)
Copia este patrón de **Signal-based Store** destilado de `OnboardingStateService`.

```typescript
// core/services/onboarding-state.service.ts
export class OnboardingStateService {
  readonly level = signal<EnglishLevel>(null);
  readonly goal = signal<Goal>(null);
  readonly urgency = signal<Urgency>(null);

  readonly recommendedPlan = computed(() => {
    // Lógica de diagnosis pura
    if (this.urgency() === 'Alta (1-2 meses)') return 'Plan Intensivo';
    return 'Plan Básico';
  });

  reset() {
    this.level.set(null); 
    // ...reset all
  }
}
```

## 📱 FASE 2: La Conversión (WhatsApp Adapter)
Usa esta estructura para manejar mensajes dinámicos basados en el estado.

```typescript
// core/services/whatsapp-adapter.service.ts
export class WhatsappAdapterService {
  private state = inject(OnboardingStateService);
  private readonly PHONE = '+521234567890';

  buildMessage(): string {
    return `¡Hola! Mi nivel es ${this.state.level()} y mi plan es ${this.state.recommendedPlan()}`;
  }

  trigger() {
    window.open(`https://wa.me/${this.PHONE}?text=${encodeURIComponent(this.buildMessage())}`, '_blank');
  }
}
```

## 🚀 FASE 3: El Pulso (Deployment & 404 Hack)
El parche definitivo para GitHub Pages.

```yaml
# .github/workflows/deploy.yml
- name: 🏗️ Build con Base Href Correcto
  run: bun run build -- --base-href /[REPOSITORY-NAME]/

- name: 🧩 The 404 Hack (Obligatorio)
  run: cp dist/[PROJECT-NAME]/browser/index.html dist/[PROJECT-NAME]/browser/404.html
```

## 🛑 FASE 4: Tollgates de Validación (Feedback Loop)
1. **Tollgate de Diseño:** ¿Están los 16 outputs de Genesis creados? No sigas si falta uno.
2. **Tollgate Visual:** Tras crear el Header o Footer, ENVIAR CAPTURA al usuario. No refactorices si no tienes verde visual.
3. **Tollgate de Ruteo:** Probar que `/home` o `/about` cargan al refrescar el navegador (F5) en producción. Si falla, el 404 hack no está activo.

## ⚖️ Mandamientos Post-Traumáticos
- **NO MÁS INLINE:** Si ves un `template: \` ` o `styles: [` , bórralo y crea el archivo `.html`/`.css`.
- **NO MÁS GHOST PATHS:** Si rediriges a `/diagnosis`, asegúrate de que esa ruta EXISTA en `app.routes.ts`. De lo contrario, usa la raíz `''`.
- **LIMITAR CONTEXTO:** Si la conversación es muy larga, pide al usuario un resumen de "Hechos de Verdad" para resetear el foco.
