---
name: gdpr-compliance
description: >
  GDPR and CCPA data privacy compliance for applications.
  Trigger: When handling PII, implementing data export/delete, or auditing privacy.
metadata:
  version: 1.0.0
  author: SkullRender (Antigravity)
  tags: [security, gdpr, ccpa, privacy, pii]
  parent_skill: app-security
---

# SKILL: GDPR/CCPA Compliance (SkullRender Standard)

> [!IMPORTANT]
> **Filosofía**: Privacidad por diseño, datos mínimos.
> Basado en GDPR (EU) y CCPA (California).
>
> **Documentation**: [GDPR](https://gdpr.eu/) | [CCPA](https://oag.ca.gov/privacy/ccpa)

## When to Use

- Manejando datos personales (email, nombre, etc.).
- Implementando export/delete de cuentas.
- Configurando consent o privacy policies.
- Auditando cumplimiento de privacidad.

## Critical Patterns

### 1. Data Subject Rights

| Right | GDPR | Implementation |
|-------|------|----------------|
| Access | Art. 15 | UC-01i (Export Data) |
| Portability | Art. 20 | UC-01i (JSON export) |
| Erasure | Art. 17 | UC-01e (Delete Account) |
| Rectification | Art. 16 | UC-01h (Update Profile) |

### 2. Data Minimization

| Pattern | Rule | Why |
|---------|------|-----|
| Collection | Only necessary data | Reduce risk |
| Retention | Define expiration policies | Don't hoard data |
| Purpose | Bound to stated purpose | Legal compliance |

### 3. Encryption Requirements

| Data Type | At Rest | In Transit |
|-----------|---------|------------|
| PII | ✅ Required | ✅ Required |
| Credentials | ✅ Required | ✅ Required |
| Analytics | ❌ Anonymize | ✅ Required |

### 4. Third-Party Processors

| Processor | Purpose | DPA Required |
|-----------|---------|--------------|
| Stripe | Payments | ✅ Included in ToS |
| Firebase | Auth | ✅ Google Cloud DPA |
| OpenAI | AI | ⚠️ Review required |
| Pinecone | Memory | ⚠️ Review required |

## Anti-Patterns

- ❌ Collecting data "just in case."
- ❌ Indefinite data retention.
- ❌ PII in logs or analytics.
- ❌ Missing consent records.
- ❌ No way for users to delete data.
- ❌ Sharing data without DPA.

## Code Examples

### Good: Data Minimization
```python
class UserCreate(BaseModel):
    email: str  # Required for auth
    display_name: str | None = None  # Optional
    # ❌ Don't collect: phone, address, DOB unless needed
```

### Good: Retention Policy
```python
RETENTION = {
    "conversations": timedelta(days=365),
    "analytics": timedelta(days=90),
    "auth_logs": timedelta(days=30),
}

async def cleanup():
    for data_type, retention in RETENTION.items():
        cutoff = datetime.utcnow() - retention
        await delete_older_than(data_type, cutoff)
```

### Good: Data Export (UC-01i)
```python
async def export_user_data(user_id: str) -> dict:
    return {
        "profile": await get_profile(user_id),
        "conversations": await get_conversations(user_id),
        "artifacts": await get_artifacts(user_id),
        "exported_at": datetime.utcnow().isoformat(),
    }
```

## Quick Reference

- **Export**: UC-01i (< 30 days response)
- **Delete**: UC-01e (30-day grace period)
- **Consent**: Record timestamp + purpose
- **Encryption**: All PII at rest + transit
- **Retention**: Define policies per data type
- **Processors**: DPA with all third parties
