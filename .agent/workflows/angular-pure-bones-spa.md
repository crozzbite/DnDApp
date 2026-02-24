---
description: Create a SkullRender 'Pure Bones' Angular SPA with automatic deployment to GitHub Pages (including 404 routing fix).
---

# 🦴 Workflow: Angular Pure Bones SPA

Este workflow permite generar una SPA rápida, limpia y profesional con Angular 19, Bun y despliegue automatizado.

## 💀 1. Inicialización (The Bones)
Generar el proyecto base garantizando la separación total de archivos y limpieza de residuos.

> [!IMPORTANT]
> **BLOQUEO TÉCNICO:** No se debe escribir código de funcionalidad hasta completar los 16 Outputs del `@/genesis-protocol` y recibir aprobación en cada Tollgate.

```bash
# Crear app limpia - MANDATORIO: archivos separados desde el nacimiento
npx -y @angular/cli@latest new [app-name] --style=css --routing --ssr=false --standalone --inline-style=false --inline-template=false
cd [app-name]

# Limpieza Crítica de Residuos (Eliminar cualquier rastro de boilerplate no deseado)
# Asegurarse de que package.json no contenga dependencias legacy.
```

## 🧠 2. Componentización Global (Footer & Header)
Todo layout debe nacer modular.

- **Footer Component:** Separar en `shared/ui/footer` inmediatamente.
- **Header Component:** Separar en `shared/ui/header` inmediatamente.
- **Feedback Loop:** Solicitar revisión visual después de cada componente de UI creado.

## 🧠 3. Arquitectura de Dominio
Separar la lógica del negocio antes de tocar la UI.

1. Crear `src/app/core/models/domain.model.ts` con tus interfaces estrictas.
2. Crear los servicios de estado en `src/app/core/services/`.

## 🚀 4. CI/CD: El Pulso (GitHub Pages Fix)
Crear `.github/workflows/deploy.yml` con el parche de ruteo para subdirectorios.

```yaml
name: Pure Bones Deployment

on:
  push:
    branches: [ main ]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      
      - name: 🦴 Install
        run: bun install
        
      - name: 🏗️ Build (Replace [REPO-NAME])
        run: bun run build -- --base-href /[REPO-NAME]/
        
      - name: 🧩 404 Hack (Routing Fix)
        run: cp dist/[PROJECT-NAME]/browser/index.html dist/[PROJECT-NAME]/browser/404.html
        
      - name: 📤 Upload
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist/[PROJECT-NAME]/browser/

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: github-pages
    steps:
      - uses: actions/deploy-pages@v4
```

## 📱 4. Responsividad (Header Protocol)
Usa siempre este snippet para el Header para evitar solapamientos en mobile.

```html
<header class="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-center max-w-5xl mx-auto w-full gap-4">
  <!-- Logo -->
  <nav class="flex flex-wrap items-center justify-center gap-3 sm:gap-6">
    <!-- Links -->
  </nav>
</header>
```

## ⚖️ 5. Mandamientos de Engram
- NO usar `/` para rutas de reinicio, usa el nombre de la ruta o asegúrate de que el wildcard redirija a `''`.
- Siempre verifica el `base-href` si el sitio se ve en blanco pero el HTML carga.
- El 404 hack es obligatorio para SPAs en GitHub Pages.
