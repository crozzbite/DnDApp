# Design: Nexus Architecture Implementation Plan

## Context

El proyecto DnDApp requiere una base sólida y escalable para convertirse en el ecosistema definitivo de gestión de conocimiento de D&D. Actualmente contamos con una estructura básica que necesita ser profesionalizada siguiendo la **Nexus Architecture** de SkullRender. Este diseño detalla cómo se orquestarán las 7 capas para entregar un producto de grado corporativo.

## Goals / Non-Goals

**Goals:**

- Implementar una arquitectura de 7 capas (Bones to Deployment) completamente desacoplada.
- Establecer un sistema de ingesta de datos asíncrono y resiliente.
- Garantizar una experiencia de usuario Zoneless con Angular 19 y Signals.
- Blindar el sistema con seguridad basada en HMAC y Shadow Sessions.

**Non-Goals:**

- Implementación de un sistema de login tradicional (se priorizan Shadow Sessions).
- Desarrollo de funcionalidades de red social o multijugador en tiempo real (fuera de combate local).
- Migración a frameworks distintos a Angular/NestJS.

## Decisions

### 1. Desacoplamiento via Interfaces (The Bones way)

Se ha decidido que ninguna capa superior dependa de implementaciones concretas. Todas las interacciones con la infraestructura se realizarán a través de contratos definidos en la Capa 1 (Bones).

- **Razón:** Facilita el testing (Gauntlet) y permite cambiar proveedores (SQL vs NoSQL) sin tocar la lógica de negocio.

### 2. Orquestación Híbrida de Datos (The Data Lich)

El `DataLichOrchestrator` gestionará la jerarquía de fuentes: Cache (Redis) -> Persistence (SQL) -> Connectors (External APIs).

- **Razón:** Maximizar la disponibilidad y reducir la latencia de respuesta para el usuario final.

### 3. Messaging Broker (Soul-Harvesting Broker)

Uso de BullMQ para todas las tareas de ingesta de datos.

- **Razón:** Prevenir que procesos pesados de parsing de PDFs o scraping de APIs degraden la performance del Gateway principal.

### 4. Zoneless & Signals (The Flesh)

Adopción total de Angular 19 sin Zone.js.

- **Razón:** Reducción del tamaño del bundle y optimización del ciclo de detección de cambios, permitiendo interfaces extremadamente fluidas.

## Risks / Trade-offs

- **[Risk] Complejidad de Infraestructura** → Mitigación: Uso de Docker y IaC para estandarizar entornos.
- **[Risk] Consistencia Eventual en Búsqueda Semántica** → Mitigación: Informar al usuario mediante UI de estados de indexación.
- **[Risk] Curva de Aprendizaje de Zoneless** → Mitigación: Seguir estrictamente el manual de SkullRender y evitar patrones imperativos.

## Migration Plan

1. **Fases 1-3:** Construcción del núcleo (Core Domain, Use Cases, Gateway).
2. **Fase 4:** Conexión de órganos y blindaje.
3. **Fase 5:** Implementación de la nueva piel (UI/UX).
4. **Fases 6-7:** Validación intensiva y despliegue híbrido.
5. **Rollback:** Cada fase se despliega en un entorno de staging para validación previa; el rollback se realiza mediante el historial de tags de Git y despliegues atómicos de Vercel/Docker.

## Open Questions

- ¿Se integrará finalmente Firebase Auth para el 1% administrativo o se mantendrán únicamente los secretos en variables de entorno?
- ¿Cuál será el límite exacto de créditos para el Vector Nexus (Pinecone) en la fase inicial?
