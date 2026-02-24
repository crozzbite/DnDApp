---
name: app-security
description: >
  Security hub skill orchestrating all security standards (OWASP ASVS, LLM Top 10, GDPR, PCI DSS).
  Trigger: When auditing security, handling secrets, sanitizing PII, or reviewing PRs.
metadata:
  version: 2.0.0
  author: SkullRender (Antigravity)
  tags: [security, dlp, pii, secrets, compliance, hub]
  dependencies:
    - detect-secrets
  child_skills:
    - owasp-asvs
    - owasp-llm
    - gdpr-compliance
---

# SKILL: App Security Hub (SkullRender Standard)

> [!IMPORTANT]
> **Filosofía**: Hub central que orquesta todos los estándares de seguridad.
> Este skill coordina OWASP ASVS, LLM Top 10, GDPR y PCI DSS.
>
> **Workflow**: `/security-audit`

## Related Workflows

- [`/security-audit`](../../workflows/security-audit.md) — Auditoría completa usando todos los estándares

## Child Skills

| Skill | Standard | Scope |
|-------|----------|-------|
| [owasp-asvs](../owasp-asvs/SKILL.md) | OWASP ASVS Level 1 | General app security (50+ controls) |
| [owasp-llm](../owasp-llm/SKILL.md) | OWASP LLM Top 10 | AI/LLM-specific risks |
| [gdpr-compliance](../gdpr-compliance/SKILL.md) | GDPR/CCPA | Data privacy |
| **This skill** | PCI DSS SAQ A | Payment security + secrets + PII |

## When to Use

- Auditorías de seguridad generales.
- Detectando secretos en código.
- Sanitizando PII en inputs/outputs.
- Revisando PRs antes de merge.
- Implementando pagos con Stripe.

## Critical Patterns

### 1. Secret Detection

| Pattern | Rule | Why |
|---------|------|-----|
| Tool | `detect-secrets` | Industry standard |
| Scan | Before every file write | Prevent leaks |
| Baseline | `.secrets.baseline` | Track false positives |

```bash
# Scan repository
detect-secrets scan > .secrets.baseline
detect-secrets audit .secrets.baseline
```

### 2. PII Sanitization

| Pattern | Regex | Replacement |
|---------|-------|-------------|
| Email | `[\w\.-]+@[\w\.-]+\.\w+` | `[REDACTED_EMAIL]` |
| Credit Card | `(?:\d[ -]*?){13,16}` | `[REDACTED_PCI]` |
| IPv4 | `\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b` | `[REDACTED_IP]` |

### 3. HMAC Approval Signing

| Pattern | Rule | Why |
|---------|------|-----|
| Format | `v1.timestamp.nonce.signature` | Versioned, expiring |
| Algorithm | HMAC-SHA256 | Cryptographically secure |
| Expiration | 5 minutes max | Prevent replay |

### 4. PCI DSS SAQ A (Payments)

| Pattern | Rule | Why |
|---------|------|-----|
| Card Input | Stripe Checkout only | Never see card data |
| Backend | Session IDs only | No PAN/CVV |
| Webhook | Signature verification | Prevent spoofing |

## Anti-Patterns

- ❌ Processing user input without PII sanitization.
- ❌ Writing files without secret scanning.
- ❌ Logging raw content with secrets/PII.
- ❌ Hardcoding API keys or secrets.
- ❌ Card input fields in our frontend.
- ❌ Trusting Stripe webhooks without signature check.

## Code Examples

### Good: Secret Scanning Before Write
```python
from detect_secrets.core.scan import scan_file

def write_file_safe(path: str, content: str):
    if has_secrets(content):
        raise SecurityError("Secrets detected, aborting write")
    with open(path, "w") as f:
        f.write(content)
```

### Good: PII Sanitization
```python
import re

PII_PATTERNS = {
    "email": (r"[\w\.-]+@[\w\.-]+\.\w+", "[REDACTED_EMAIL]"),
    "card": (r"(?:\d[ -]*?){13,16}", "[REDACTED_PCI]"),
}

def sanitize_pii(text: str) -> str:
    for name, (pattern, replacement) in PII_PATTERNS.items():
        text = re.sub(pattern, replacement, text)
    return text
```

### Good: HMAC Token
```python
import hmac, hashlib, time, secrets

def sign_payload(secret: bytes, payload: str) -> str:
    ts = str(int(time.time()))
    nonce = secrets.token_hex(8)
    msg = f"{ts}:{nonce}:{payload}".encode()
    sig = hmac.new(secret, msg, hashlib.sha256).hexdigest()
    return f"v1.{ts}.{nonce}.{sig}"
```

### Good: Stripe Webhook Verification
```python
from stripe import Webhook, SignatureVerificationError

async def handle_webhook(request):
    sig = request.headers.get("Stripe-Signature")
    try:
        event = Webhook.construct_event(
            await request.body(), sig, WEBHOOK_SECRET
        )
    except SignatureVerificationError:
        raise HTTPException(403, "Invalid signature")
    return event
```

## Quick Reference

- **Secrets**: `detect-secrets scan` before commits
- **PII**: Regex sanitization on all inputs
- **HMAC**: `v1.timestamp.nonce.signature` format
- **Payments**: Stripe Checkout redirect only
- **PR Gate**: Run security tests before merge
- **Workflow**: `/security-audit` for full audit
