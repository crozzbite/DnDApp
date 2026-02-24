---
name: owasp-llm
description: >
  OWASP LLM Top 10 security controls for AI/LLM applications.
  Trigger: When implementing LangChain flows, agent tools, or LLM outputs.
metadata:
  version: 1.0.0
  author: SkullRender (Antigravity)
  tags: [security, owasp, llm, ai, prompt-injection]
  parent_skill: app-security
---

# SKILL: OWASP LLM Top 10 (SkullRender Standard)

> [!IMPORTANT]
> **Filosofía**: Seguridad específica para agentes AI y LLMs.
> Basado en OWASP LLM Top 10 (2024).
>
> **Documentation**: [OWASP LLM Top 10](https://owasp.org/www-project-top-10-for-large-language-model-applications/)

## When to Use

- Implementando prompts o flujos LangChain/LangGraph.
- Procesando outputs de LLMs.
- Configurando herramientas MCP o agentes.
- Auditando seguridad de AI.

## Critical Patterns

### 1. Prompt Injection (LLM01)

| Pattern | Rule | Why |
|---------|------|-----|
| Detection | Scan for injection patterns | Prevent hijacking |
| System Prompts | Immutable, never user-modifiable | Maintain control |
| Retrieval | Sandbox RAG content from instructions | Indirect injection |

**Injection Patterns to Detect:**
```python
INJECTION_PATTERNS = [
    r"ignore\s+(previous|all)\s+instructions",
    r"forget\s+(everything|all)",
    r"you\s+are\s+now",
    r"new\s+instructions?:",
    r"system\s*:\s*",
    r"<\|.*\|>",  # Special tokens
]
```

### 2. Output Handling (LLM02)

| Pattern | Rule | Why |
|---------|------|-----|
| Sanitization | HTML escape all LLM output | Prevent XSS |
| Structured | Validate JSON against schema | Prevent injection |
| Length | Limit output size | Prevent DoS |

### 3. DoS Protection (LLM04)

| Pattern | Rule | Why |
|---------|------|-----|
| Token Limits | Max 4000 input, 2000 output | Cost control |
| Timeouts | 30s max per request | Prevent hanging |
| Rate Limiting | Per-user quotas | Fair usage |

### 4. Tool Security (LLM07)

| Pattern | Rule | Why |
|---------|------|-----|
| Permissions | Least privilege | Limit blast radius |
| HITL | Human approval for destructive actions | Prevent accidents |
| Logging | Audit all tool calls | Traceability |

## Anti-Patterns

- ❌ Trusting raw LLM output without sanitization.
- ❌ Allowing user-modifiable system prompts.
- ❌ No token limits or timeouts.
- ❌ Auto-approving destructive tool actions.
- ❌ Logging full prompts (may contain PII).
- ❌ No disclaimer on AI-generated content.

## Code Examples

### Good: Prompt Injection Detection
```python
import re

def detect_injection(text: str) -> bool:
    for pattern in INJECTION_PATTERNS:
        if re.search(pattern, text, re.IGNORECASE):
            return True
    return False
```

### Good: Output Sanitization
```python
import html

def sanitize_llm_output(raw: str) -> str:
    # 1. HTML escape
    clean = html.escape(raw)
    # 2. Length limit
    return clean[:MAX_OUTPUT_LENGTH]
```

### Good: Tool Permission Check
```python
TOOL_PERMISSIONS = {
    "read_file": {"risk": "low", "auto": True},
    "write_file": {"risk": "high", "auto": False},
}

async def call_tool(name: str, args: dict, user_approved: bool):
    perm = TOOL_PERMISSIONS.get(name, {"auto": False})
    if not perm["auto"] and not user_approved:
        raise PermissionError("Human approval required")
    return await execute_tool(name, args)
```

## Quick Reference

- **LLM01**: Prompt Injection → Detection patterns
- **LLM02**: Output Handling → Sanitization
- **LLM04**: DoS → Token limits, timeouts
- **LLM06**: Info Disclosure → PII detection
- **LLM07**: Plugin Security → HITL approval
- **LLM08**: Excessive Agency → Permission model
