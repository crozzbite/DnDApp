---
trigger: always_on
description: RULE 10 - GOVERNANCE. Evolution, Versioning, and ADRs.
---

# Rule 10: Governance & Evolution (The Law)

**"Code rots. Rules endure."**

---

## 🏛️ I. Architectural Decision Records (ADRs)

We do not rely on memory. We rely on records.

*   **When**: Every time we choose a DB, a Framework, or a Pattern.
*   **Format**:
    1.  **Title**: ADP-001: Use Postgres for Auth.
    2.  **Status**: Accepted.
    3.  **Context**: We need ACID compliance.
    4.  **Decision**: Postgres.
    5.  **Consequences**: Harder to scale horizontally than NoSQL, but safer.

---

## 🔄 II. Versioning Strategy

1.  **Semantic Versioning**: `MAJOR.MINOR.PATCH`.
2.  **API Versioning**:
    *   URI Path: `/v1/users`
    *   **Sunset Policy**: Deprecated versions live for 3 months, then 410 Gone.

---

## 📈 III. Evolution Strategy (Fitness Functions)

*   **Definition**: Automated tests that measure architectural alignment.
*   **Example**: `archunit` test that ensures `Domain` never imports `Infrastructure`.
*   **Review**: Quarterly review of the "Tech Radar" to adopt/hold/drop technologies.
