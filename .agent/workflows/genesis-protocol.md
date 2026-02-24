---
description: The Genesis Protocol - Master Workflow for New Projects
---
# 💀 The Genesis Protocol (Master Workflow)

Este es el flujo de trabajo INQUEBRANTABLE para inicializar cualquier proyecto en SkullRender. Obligatorio ejecutar paso a paso antes de escribir la primera línea de código de un nuevo sistema.

## Fase 0: Sincronización Engram y Snippets
1. **Verificar KI Summaries**: Leer resúmenes de Knowledge Items provistos por el sistema.
2. **Reutilización de Snippets**: Buscar código fino de otros proyectos de SkullRender. No reescribir lo que ya funciona perfectamente (Auth, Interceptors, Base UI).
3. **Lectura Profunda**: Invocar `view_file` en KIs y snippets relevantes.
4. **Setup Base**: Asegurar que las reglas (`.agent/skills`) están cargadas.

## Fase 1: The Mind (Descubrimiento y Negocio)
1. **Ejecutar `/opsx-explore`**: Iniciar exploración sin escribir código.
2. **Aplicar `/pensamiento-socratico`**: Cuestionar la existencia misma del requerimiento.
3. **Ejecutar `/software-company-generator`**: Definir el MVP, Target Audience, y Reglas de Negocio base.
4. **Ejecutar `/opsx-onboard` o `/opsx-new`**: Crear el contenedor del Change.

## Fase 2: The Skeleton (Forjado de Huesos - Tollgates)
El agente generará los 16 Outputs de Arquitectura divididos en 3 Bloques (Tollgates). **El usuario debe aprobar cada bloque antes de pasar al siguiente.**

### Tollgate 1: Domain & Core
- Output 1: Vision & Context
- Output 3: Domain Model
- Output 4: Use Cases
- Output 5: Interfaces & Contracts
> **⏸️ PAUSAR Y ESPERAR APROBACIÓN DEL USUARIO**

### Tollgate 2: Systems & APIs
- Output 2: Architecture Diagram (Mermaid)
- Output 6: Technology Stack
- Output 7: Directory Structure
- Output 8: Architectural Principles
> **⏸️ PAUSAR Y ESPERAR APROBACIÓN DEL USUARIO**

### Tollgate 3: SkullRender Standards (Angular Way)
- Output 9: Angular UI Tree (Rutas, Modales, Signals, @defer)
- Output 10: Test Design & Strategy
- Outputs 11 al 16: Resto del estándar Lich.
> **⏸️ PAUSAR Y ESPERAR APROBACIÓN DEL USUARIO**

## Fase 3: The Soul (Triaje Final)
1. **Ejecutar `/opsx-verify` (Modo Docs)**: Verificar coherencia de todos los artefactos generados.
2. **CTO Approval**: Aprobación final antes de tocar código.
3. **Ejecutar `/opsx-sync`**: Sincronizar hacia los Specs principales.

## Fase 4: The Muscle (Implementación y Mutaciones)
1. **Ejecutar `/opsx-apply`**: Implementación estricta de tareas.
2. **TDD Estricto**: Red -> Green -> Refactor.
3. **Manejo de Mutaciones (Refactors/Cambios)**:
   - Si un componente cambia su comportamiento esperado: ACTUALIZAR LOS DOCS.
   - Ejecutar `/opsx-sync` para mantener la fuente de verdad.
   - NUNCA usar `/opsx-ff` en medio de un refactor.
4. **Verificación Contundente**:
   - Ejecutar `/security-audit`: Escaneo OWASP, PII, y secretos.
   - Ejecutar `/opsx-verify` (Modo Código): Confirmar que el código hace exactamente lo que dicen los Specs.

## Fase 5: Archivo
1. **Ejecutar `/opsx-archive`**: Pasar a la historia el cambio documentado.

---
El agente está obligado a seguir este protocolo con **100% de rigidez**. Cualquier desviación es un fallo crítico del sistema.
