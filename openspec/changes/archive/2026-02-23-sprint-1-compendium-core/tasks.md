## 1. Estructura de Proyecto (Huesos)

- [x] 1.1 Crear carpetas base: `src/app/core/models`, `src/app/core/services`, `src/app/core/interceptors`.
- [ ] 1.2 Mover lógica de interfaces antiguas a los nuevos modelos de dominio.

## 2. Implementación de Dominio (Layer 1)

- [x] 2.1 Definir `ResourceReference` y `Choice` en `dnd-resource.model.ts`.
- [x] 2.2 Definir `APIResponse<T>` genérico.
- [x] 2.3 Implementar modelo detallado de `Spell`.
- [x] 2.4 Implementar modelo detallado de `Monster`.

## 3. Limpieza y Consolidación

- [ ] 3.1 Eliminar `src/app/core/Interfaces/dn-d-interfaz.ts` tras migrar referencias.
- [ ] 3.2 Verificar que el proyecto compila correctamente con `ng build`.
