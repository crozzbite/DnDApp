---
name: uc-patterns
description: Enterprise patterns for Use Cases (observability, security, resilience)
metadata:
  version: 1.1.0
  author: SkullRender AI
  tags: [architecture, enterprise, observability, security, resilience, circuit-breaker]
---

# SKILL: UC Enterprise Patterns (SkullRender Standard)

> [!IMPORTANT]
> **Philosophy**: Enterprise patterns applied to ALL Use Cases, regardless of type.
> This skill is modular - apply only the patterns relevant to your UC type.
>
> **Scope**: Backend architecture (FastAPI + LangGraph + External Services)

## When to Use

- Designing new Use Cases for any SkullRender project
- Refactoring existing UCs for production readiness
- Adding observability, security, or resilience to any endpoint
- Code reviews involving critical endpoints
- **ANY UC type**: CRUD, LLM, Integration, Auth, Background Jobs

---

## UC Type Classification

Before applying patterns, classify your UC:

| UC Type | Examples | Required Patterns |
|---------|----------|-------------------|
| **CRUD** | Create artifact, Update profile | Observability, Correlation ID |
| **LLM** | Chat, Summarize, Generate | All 4 patterns (+ Injection Detection) |
| **Auth** | Login, Register, Logout | Observability, Security (Brute Force) |
| **Integration** | Browser automation, MCP | Observability, Circuit Breaker |
| **Query** | Search, List, Get by ID | Observability, Rate Limiting |
| **Background** | Sync, Cleanup, Index | Observability, Circuit Breaker |

---

## Critical Patterns (The "Must Haves")

### 1. Observability (Required for ALL UCs)

**Effort:** 2-3 days per UC

**Structured Logging (JSON, GDPR-compliant):**

```python
# Standard log format - adapt fields per UC
{
  "timestamp": "2026-02-08T16:56:36Z",
  "level": "INFO",
  "event": "{uc}_{event_type}",
  "correlation_id": "uuid",
  "user_id": "auth0|abc123",  # Omit for public endpoints
  "ip_hash": "ip_a3f9c2d1e4b5a678",  # Always anonymized
  "duration_ms": 245  # For completed events
}
```

**IP Anonymization (GDPR - always apply):**

```python
import hashlib
from datetime import datetime
import os

def anonymize_ip(ip: str, date: str | None = None) -> str:
    if date is None:
        date = datetime.now().date().isoformat()
    daily_salt = os.getenv("IP_SALT_SECRET") + date
    hashed = hashlib.sha256(f"{ip}:{daily_salt}".encode()).hexdigest()[:16]
    return f"ip_{hashed}"
```

**Standard Events (adapt per UC):**

| Event | When to Log | Required Fields |
|-------|-------------|-----------------|
| `{uc}_started` | Request received | `correlation_id`, `user_id` |
| `{uc}_validated` | All guards passed | `validation_ms` |
| `{uc}_processing` | Main logic started | (optional) |
| `{uc}_completed` | Success | `duration_ms`, `result_summary` |
| `{uc}_error` | Any error | `error_code`, `error_message` |

**Prometheus Metrics (choose relevant):**

| Metric | Type | When to Use |
|--------|------|-------------|
| `{uc}.requests_total` | Counter | Always |
| `{uc}.latency_seconds` | Histogram | Always |
| `{uc}.errors_total` | Counter | Always |
| `{uc}.active_requests` | Gauge | Long-running UCs |
| `{uc}.items_processed` | Counter | Batch/CRUD UCs |

**OpenTelemetry Spans:**

```
{uc}_request (root)
├── guard_validation
├── domain_logic
├── [external_call]  # Only if applicable
└── [persistence]    # Only if writes data
```

---

### 2. Security Hardening (Apply per UC type)

**Effort:** 1-3 days depending on UC type

#### 2.1 Rate Limiting (ALL UCs)

```python
# Per-user limit (authenticated)
@limiter.limit("60 per minute", key_func=get_user_id)
# Per-IP limit (public/DDoS protection)
@limiter.limit("100 per hour", key_func=lambda: request.client.host)
```

| UC Type | User Limit | IP Limit |
|---------|------------|----------|
| Auth | 10/min | 50/hour |
| LLM Chat | 20/min | 100/hour |
| CRUD | 60/min | 200/hour |
| Query | 100/min | 500/hour |

#### 2.2 Prompt Injection Detection (LLM UCs ONLY)

```python
import re

INJECTION_PATTERNS = [
    r"ignore\s+(all\s+)?previous\s+instructions?",
    r"you\s+are\s+now\s+(a\s+)?",
    r"forget\s+(everything|all|your\s+instructions)",
    r"system\s*:\s*",
    r"<\|im_start\|>",
    r"</s>",
    r"\[INST\]",
    r"sudo\s+mode",
    r"developer\s+mode",
    r"jailbreak"
]

def detect_prompt_injection(message: str) -> tuple[bool, str]:
    for pattern in INJECTION_PATTERNS:
        match = re.search(pattern, message, re.IGNORECASE)
        if match:
            return True, pattern
    return False, ""
```

#### 2.3 Output Sanitization (User-facing responses)

```python
import bleach

def sanitize_output(response: str) -> str:
    return bleach.clean(response, tags=[], strip=True)
```

#### 2.4 Brute Force Protection (Auth UCs ONLY)

```python
# Track failed attempts per user/IP
# Lock after 5 failures for 15 minutes
@limiter.limit("5 per 15 minutes", key_func=get_login_key)
```

#### 2.5 URL/Path Validation (Integration UCs)

```python
ALLOWED_DOMAINS = ["github.com", "docs.google.com", ...]

def validate_url(url: str) -> bool:
    parsed = urlparse(url)
    return parsed.netloc in ALLOWED_DOMAINS
```

---

### 3. Correlation ID (Required for ALL UCs)

**Effort:** 1 day (one-time setup)

**Middleware (apply once, works for all UCs):**

```python
import uuid
from contextvars import ContextVar

correlation_id_var: ContextVar[str] = ContextVar("correlation_id")

@app.middleware("http")
async def correlation_id_middleware(request: Request, call_next):
    correlation_id = request.headers.get("X-Correlation-ID", str(uuid.uuid4()))
    correlation_id_var.set(correlation_id)
    response = await call_next(request)
    response.headers["X-Correlation-ID"] = correlation_id
    return response

def get_correlation_id() -> str:
    return correlation_id_var.get("unknown")
```

**Propagation Points:**

| Layer | How to Pass |
|-------|-------------|
| Frontend → Backend | `X-Correlation-ID` header |
| Backend → LangGraph | State context |
| LangGraph → MCP | Tool input metadata |
| Backend → External APIs | Header or metadata |
| All Logs | `extra={"correlation_id": get_correlation_id()}` |

---

### 4. Circuit Breaker (External service calls ONLY)

**Effort:** 1 day per service type

**Apply when:** UC calls any external service (LLM, database, API, MCP)

```python
from circuitbreaker import circuit

class ServiceError(Exception):
    pass

@circuit(
    failure_threshold=5,
    recovery_timeout=60,
    expected_exception=ServiceError
)
async def call_external_service(config: ServiceConfig):
    try:
        return await service.call(config)
    except TimeoutError:
        raise ServiceError("Service timeout")
    except ConnectionError:
        raise ServiceError("Service unavailable")
```

**Circuit States:**

| State | Behavior |
|-------|----------|
| CLOSED | Normal operation |
| OPEN | Fail-fast (threshold reached) |
| HALF_OPEN | Test single request (after recovery timeout) |

**Configuration by Service Type:**

| Service | Threshold | Recovery | Timeout |
|---------|-----------|----------|---------|
| LLM (OpenAI, Anthropic) | 5 failures | 60s | 30s |
| Vector DB (Pinecone) | 3 failures | 30s | 10s |
| Browser (Puppeteer) | 3 failures | 30s | 60s |
| MCP Servers | 3 failures | 30s | 15s |
| External APIs | 5 failures | 60s | 10s |

---

## Anti-Patterns (The "Never Do's")

- ❌ Log PII without anonymization (IP, email, user-agent)
- ❌ Call external services without circuit breaker
- ❌ Omit correlation ID in logs or external calls
- ❌ Trust user input without validation
- ❌ Expose stack traces in HTTP responses
- ❌ Hardcode rate limits (use config per tier)
- ❌ Apply LLM-specific patterns to non-LLM UCs
- ❌ Skip observability for "simple" CRUD operations

---

## UC Documentation Template

Use this template when documenting ANY Use Case:

```markdown
### UC-XX: [Name]

**Type:** [CRUD | LLM | Auth | Integration | Query | Background]
**Actor:** [Who triggers]  
**Goal:** [What they want]  
**Preconditions:** [List]

**Related Use Cases:** [UC-YY if handoff exists]

---

#### Guard Clauses (Fail-Fast)

1. [Auth/Authz] - if authenticated UC
2. [Rate Limiting] - always
3. [Input Validation] - always
4. [Quota Check] - if applicable
5. [Prompt Injection] - LLM UCs only

#### Domain Flow (Business Logic)

[Numbered steps - what changes in the system]

#### Technical Flow (Implementation)

[Sequence diagram - include Logger, Metrics participants]

#### Applied Patterns

| Pattern | Applied? | Notes |
|---------|----------|-------|
| Observability | ✅/❌ | [Events, metrics, spans] |
| Security | ✅/❌ | [Which guards applied] |
| Correlation ID | ✅/❌ | [Propagation points] |
| Circuit Breaker | ✅/❌ | [Which services] |
```

---

## Pattern Application Matrix

Quick reference for which patterns to apply:

| UC Type | Observability | Rate Limit | Input Valid | Injection | Output Sanitize | Circuit Breaker |
|---------|---------------|------------|-------------|-----------|-----------------|-----------------|
| CRUD | ✅ | ✅ | ✅ | ❌ | ✅ | ❓ DB calls |
| LLM | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Auth | ✅ | ✅ Brute | ✅ | ❌ | ❌ | ❓ OAuth |
| Integration | ✅ | ✅ | ✅ URL | ❌ | ✅ | ✅ |
| Query | ✅ | ✅ | ✅ | ❌ | ❌ | ❓ DB |
| Background | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ |

Legend: ✅ Required | ❓ Conditional | ❌ Not Applicable

---

## Production Ready Checklist

Apply per UC type (check only relevant items):

### All UCs
- [ ] Guard clauses documented (fail-fast order)
- [ ] Domain Flow separated from Technical Flow
- [ ] Structured logging GDPR-compliant
- [ ] Prometheus metrics defined
- [ ] Correlation ID propagated
- [ ] Error handling with specific HTTP codes
- [ ] Rate limiting configured

### LLM UCs (additional)
- [ ] Prompt injection detection
- [ ] Output sanitization
- [ ] LLM circuit breaker
- [ ] Token usage logged

### Integration UCs (additional)
- [ ] URL/path validation
- [ ] External service circuit breaker
- [ ] Timeout handling

### Auth UCs (additional)
- [ ] Brute force protection
- [ ] Token/session expiration
- [ ] Audit logging

---

## Related Skills

- [`app-security`](../app-security/SKILL.md) — PII sanitization, Secret Detection
- [`clean-code`](../clean-code/SKILL.md) — Strict typing, validation
- [`typescript`](../typescript/SKILL.md) — Interface exports to frontend
- [`angular`](../angular/SKILL.md) — Interceptor for correlation ID

## Trigger & Enforcement

- **PLANNING**: Apply when designing new UCs (choose patterns based on UC type)
- **EXECUTION**: Implement selected patterns
- **VERIFICATION**: Validate all applicable patterns are in place
