# Frontend packaging (Phase 0)

Angular CLI + SSR are installed and built with **npm** (not bun) until bun hoisting is reliable on Windows/OneDrive.

```powershell
cd frontend
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
npm ci
npm run build
npm run serve:ssr:DnDApp
```

Use `package-lock.json` for reproducible Docker builds. Backend remains **bun-only** per SkullRender canon.
