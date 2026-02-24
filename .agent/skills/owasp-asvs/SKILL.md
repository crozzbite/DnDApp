---
name: owasp-asvs
description: >
  OWASP ASVS Level 1 security controls for MVP applications.
  Trigger: When auditing authentication, sessions, validation, cryptography, or logging.
metadata:
  version: 1.0.0
  author: SkullRender (Antigravity)
  tags: [security, owasp, asvs, authentication, validation]
  parent_skill: app-security
---

# SKILL: OWASP ASVS Level 1 (SkullRender Standard)

> [!IMPORTANT]
> **Filosofía**: 50+ controles verificables para MVPs.
> Basado en OWASP ASVS v4.0.3 Level 1 ("Opportunistic").
>
> **Documentation**: [OWASP ASVS](https://owasp.org/www-project-application-security-verification-standard/)

## When to Use

- Auditorías de seguridad generales.
- Implementando autenticación o gestión de sesiones.
- Validando inputs/outputs de APIs.
- Configurando cifrado o logging seguro.

## Critical Patterns

### 1. Authentication (V2)

| Pattern | Rule | Why |
|---------|------|-----|
| Password Length | Min 12 chars (or 8 with complexity) | Prevent brute force |
| Breached Check | Use haveibeenpwned API | Prevent credential stuffing |
| Rate Limiting | 5 attempts / 15 min | Anti-automation |

### 2. Session Management (V3)

| Pattern | Rule | Why |
|---------|------|-----|
| Token Location | Headers only, never URLs | Prevent logging leaks |
| Cookie Flags | `Secure`, `HttpOnly`, `SameSite` | XSS/CSRF protection |
| JWT Validation | Verify signature + expiration | Prevent token tampering |

### 3. Validation (V5)

| Pattern | Rule | Why |
|---------|------|-----|
| Input | Allowlist validation | Reject unknown input |
| Output | Context-aware encoding | Prevent XSS |
| Serialization | Integrity check | Prevent deserialization attacks |

### 4. Cryptography (V6)

| Pattern | Rule | Why |
|---------|------|-----|
| Algorithms | Industry-proven only (AES-256-GCM) | No custom crypto |
| Secrets | Environment variables only | Never hardcode |
| Random | CSPRNG (`secrets` module) | Cryptographically secure |

### 5. Logging (V7)

| Pattern | Rule | Why |
|---------|------|-----|
| Auth Events | Log all decisions | Audit trail |
| Sensitive Data | Never in logs | Prevent leakage |
| Log Injection | Sanitize before logging | Prevent attacks |

## Anti-Patterns

- ❌ Passwords shorter than 12 characters.
- ❌ Session tokens in URLs or GET parameters.
- ❌ Missing `HttpOnly` flag on auth cookies.
- ❌ Hardcoded secrets or API keys.
- ❌ Logging PII or credentials.
- ❌ Custom cryptography implementations.

## Code Examples

### Good: Secure Session Cookie
```python
response.set_cookie(
    "session_id",
    value=session_token,
    httponly=True,
    secure=True,
    samesite="Strict",
    max_age=86400
)
```

### Good: Input Validation
```python
from pydantic import BaseModel, validator

class UserInput(BaseModel):
    email: str
    
    @validator("email")
    def validate_email(cls, v):
        if not re.match(r"^[\w\.-]+@[\w\.-]+\.\w+$", v):
            raise ValueError("Invalid email format")
        return v
```

## Quick Reference

- **Level 1**: Opportunistic (MVP-suitable)
- **Controls**: ~50 for Level 1
- **Focus**: Authentication, Sessions, Validation, Crypto, Logging
- **Phylactery**: V2 delegated to Firebase, V3/V5/V6/V7 implemented
