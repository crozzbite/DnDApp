# Specification: Technical Security (The Guard)

## 1. Overview

Este documento detalla la implementación técnica de las medidas de seguridad definidas en la Capa 2. Aquí es donde los "Guards" y los "Interceptors" se vuelven realidad.

## 2. Administrative Authentication

Protección del 1% administrativo (Ingesta).

- **Mecanismo**: Short-lived signed tokens (**HMAC SHA-256**).
- **Implementación**: El Admin Client firma el request. El `AdminLichGuard` en Fastify valida la firma contra el secreto y el timestamp (ventana de 5 min).
- **Aislamiento**: IP Allowlist para los endpoints de ingesta automatizada.

```typescript
// Snippet: Guard de Ingesta con HMAC
export const AdminLichGuard: CanActivateFn = (route, state) => {
  const signature = inject(REQUEST_HEADERS).get("X-Admin-Signature");
  const timestamp = inject(REQUEST_HEADERS).get("X-Admin-Timestamp");

  if (!isValidHMAC(signature, timestamp, process.env.ADMIN_SECRET_KEY)) {
    throw new UnauthorizedException("Firma del Lich inválida o expirada");
  }
  return true;
};
```

## 3. Shadow Sessions (Anonymous Identity)

Gestión de identidad sin login para el 99% de los usuarios.

- **Generación**: Al primer contacto, el servidor genera un `sessionId` (UUID v4).
- **Persistencia**: Se almacena en una cookie `HttpOnly`, `Secure` y `SameSite: Strict`. Esto evita ataques XSS sobre la identidad del usuario.
- **Session Binding**: Fingerprint fuerte basado en `Hash(User-Agent + Accept-Language + IP/24 + sessionSalt)`.
- **Life Cycle**:
  - **TTL**: 7 días (Sliding expiration).
  - **Rotation**: Re-generación de ID cada 24 horas de actividad.

```typescript
// Estructura de Sesión en Redis (Mantle)
interface SessionData {
  activeEncounterId?: string;
  uiPreferences: {
    theme: "dark" | "light";
    compactMode: boolean;
  };
  metadata: {
    lastPath: string;
    interactionsCount: number;
  };
}

interface UserSessionRecord {
  sessionId: string;
  fingerprint: string;
  expiresAt: number;
  data: SessionData;
}
```

## 4. Input & Output Protection

Blindando las puertas del Nexo.

- **Detección de PII**: El search-service pasará la query por un filtro de RegEx antes de enviarla a Pinecone.
- **Prompt Injection Defense**:
  - **Input**: Gateway de búsqueda valida patrones de subversión.
  - **Output (RAG Sanitization)**: Antes de enviar los chunks de Pinecone al cliente/modelo, se escanean en busca de instrucciones de sistema (system prompt leaking defense).

```typescript
// Snippet: Filtro de Inyección (Capa 3 Purification)
const INJECTION_PATTERNS = [/ignore.*instructions/i, /system\s*prompt/i, /forget.*all/i];

export function sanitizeContext(text: string, resourceId: string): string {
  if (INJECTION_PATTERNS.some((p) => p.test(text))) {
    logger.alert("POISONED_CONTEXT_DETECTED", { resourceId });
    // Enviamos a cuarentena semántica (no se sirve al modelo)
    return "[SECURITY_REDACTED: Malicious Instructions Detected]";
  }
  return text;
}
```

## 5. Angular Functional Guards

Protección de rutas en el cliente.

- Uso de `CanActivateFn` para asegurar que el usuario tenga una sesión válida antes de acceder a la interfaz de "Encounter Tracker".
- Redirección automática a una página de "Sesión Expirada" si Redis devuelve un `null` para el ID actual.

## 6. Rate Limiting (Armor Hardening)

- **Umbral**: 100 requests por minuto por `sessionId`.
- **Implementation**: Middleware en el entry-point que utiliza `token bucket` en Redis.
- **Botnet Protection**: Limitación escalonada: por **IP** (Global), por **SessionId** y por **Endpoint** de búsqueda.

## 7. Automated Ingestion Security (The Purification Layer)

Siendo la ingesta automática y por **Batch**, implementamos una zona de cuarentena:

1. **Source Trust**: Solo fuentes en el `Allowlist` son procesadas.
2. **Ingestion Firewall**: Escaneo de contenido antes de persistir en SQL para evitar **Knowledge Poisoning**.
3. **Malicious Pattern Scan**: Aplicamos sanitización profunda a los datos externos.
4. **CSRF Protection**:
   - **Double Submit Cookie**: Implementamos tokens CSRF en headers para todos los endpoints mutables (`POST`, `PUT`, `DELETE`).
   - El token se valida en el `Nexo Core` contra la Shadow Session.
5. **Audit Trail**: Logs de ingesta obligatorios con diff de cambios y firma de la fuente.
