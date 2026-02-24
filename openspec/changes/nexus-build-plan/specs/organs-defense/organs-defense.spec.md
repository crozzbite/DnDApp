# Spec: Phase 4.3 - Organs (Defense)

Este documento especifica la implementación de la **Capa 4.3: Defense** para el ecosistema DnDApp, siguiendo la Nexus Architecture de SkullRender.

## 1. Identificación de Fase

- **Fase:** 4.3 (Organs - Defense)
- **Arquitectura:** SkullRender Nexus Architecture - Capa de Seguridad y Blindaje.
- **Responsabilidad:** Protección de la integridad de los datos, validación de identidad y defensa contra ataques de inyección.

## 2. Estructura y Organización

La defensa se implementa tanto en el cliente (Angular Guards/Interceptors) como en el servidor (NestJS Guards/Middleware).

```bash
backend/src/api/
├── guards/             # Guardias de seguridad (The Guard)
│   ├── admin-lich.guard.ts     # Validación HMAC para ingesta
│   └── shadow-session.guard.ts # Validación de sesión anónima
└── decorators/         # Decoradores de seguridad personalizados
    └── require-admin.decorator.ts

src/app/core/
├── guards/             # Functional Guards (CanActivateFn)
│   ├── session.guard.ts
│   └── admin.guard.ts
└── interceptors/       # Interceptores de seguridad
    ├── auth.interceptor.ts
    └── error.interceptor.ts
```

## 3. Framework & Stack

- **Servidor:** NestJS Guards con validación HMAC SHA-256.
- **Cliente:** Angular 19 Functional Guards.
- **Identidad:** Shadow Sessions con cookies `HttpOnly` y `Secure`.
- **Detección:** Filtros de Regex para PII y Prompt Injection.

## 4. Recursos de Construcción

- **Documentación:** `armor-security-tech.md`.
- **Estrategia:** Denegación por defecto, validación estricta de origen (CORS).

## 5. ADDED Requirements

### Requirement: Administrative Authentication (HMAC)

El sistema DEBE proteger los endpoints de ingesta mediante firmas HMAC SHA-256 de corta duración.

#### Scenario: Validación de Firma de Ingesta

- **WHEN** se recibe una petición de ingesta con `X-Admin-Signature`
- **THEN** el `AdminLichGuard` debe validar el hash contra el secreto y una ventana de tiempo de 5 minutos.

### Requirement: Shadow Sessions (Anonymous Identity)

Se DEBE gestionar la identidad de los usuarios mediante sesiones anónimas atadas al navegador (fingerprinting fuerte).

#### Scenario: Creación de Sesión Segura

- **WHEN** un usuario nuevo accede al sistema
- **THEN** se debe generar un `sessionId` y almacenarlo en una cookie con los flags `HttpOnly`, `Secure` y `SameSite: Strict`.

### Requirement: Defense contra Prompt Injection

El sistema DEBE sanitizar los inputs y outputs de búsqueda para evitar fugas de prompts del sistema o ejecución de instrucciones maliciosas.

#### Scenario: Detección de Patrones de Inyección

- **WHEN** el usuario ingresa "ignore all previous instructions"
- **THEN** el sistema debe alertar y bloquear la petición devolviendo un estado de seguridad.

## 6. Valor Añadido (Design Patterns)

- **Defense in Depth:** Múltiples capas de seguridad (Gateway -> Guard -> Use Case -> DB).
- **Least Privilege:** Los tokens de ingesta tienen permisos extremadamente limitados y solo para recursos específicos.
- **Audit Trail:** Cada acción crítica (especialmente en ingesta) deja un rastro inmutable con el diff de cambios.
