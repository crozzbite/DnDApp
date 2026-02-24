---
trigger: always_on
description: RULE 07 - SECURITY DEEP DIVE. OWASP, LLM Security, and Zero Trust.
---

# Rule 07: Security Deep Dive (The Shield)

**"Trust is a vulnerability. Verify everything."**

---

## 🛡️ I. OWASP Top 10 (Standard)

We mitigate the classics at the **Interface Layer**.

1.  **Injection**: Use ORMs (Prisma/SQLAlchemy) and Parameterized Queries always.
2.  **Broken Auth**: Use standardized libraries (Clerk, Firebase Auth, NextAuth). Never roll your own crypto.
3.  **Sensitive Data Exposure**: Encrypt at rest (DB) and in transit (TLS).
4.  **XXE**: Disable external entities in XML parsers.
5.  **Broken Access Control**: Test RBAC properties. `can_view_dashboard(user)` must be explicit.

---

## 🤖 II. OWASP LLM Top 10 (AI Specific)

The new frontier of threats.

1.  **LLM01: Prompt Injection**:
    *   *Defense*: Delimiters ("""User Input"""), Instruction Tuning, and Heuristic Filtering (check for "Ignore previous instructions").
2.  **LLM02: Insecure Output Handling**:
    *   *Defense*: Treat LLM output as **Untrusted User Input**. Escape HTML/SQL before rendering/executing.
3.  **LLM06: Sensitive Information Disclosure**:
    *   *Defense*: Data Loss Prevention (DLP) middleware. Scan for PII (Pixels/Regex) before sending to OpenAI.

---

## 🔐 III. Zero Trust Implementation

1.  **Identity is the Perimeter**: No "Internal Network" trust. Service A calls Service B with a token.
2.  **Least Privilege**: Database users have granular permissions. The Application User cannot `DROP TABLE`.
3.  **Secrets Management**:
    *   **Dev**: `.env.local` (GitIgnored).
    *   **Prod**: AWS Parameter Store / Vault / Vercel Env Vars.
    *   **Rule**: If a secret is committed, it is burned. Rotate immediately.
