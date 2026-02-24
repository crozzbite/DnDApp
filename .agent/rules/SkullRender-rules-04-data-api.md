---
trigger: always_on
description: RULE 04 - DATA & API. Database Theory and Interface Contracts.
---

# Rule 04: Data & API Standards (The Bloodstream)

**"Data is the soul. The API is the voice."**

---

## 💾 I. Database Theory

We respect the Laws of Physics in Data.

### 1. ACID (Jim Gray)
*   **Atomicity**: All or nothing.
*   **Consistency**: Valid state to valid state.
*   **Isolation**: Transactions don't spy on each other.
*   **Durability**: Written means written.
*   **Mandate**: All financial/audit data MUST live in an ACID-compliant DB (Postgres).

### 2. CAP Theorem (Eric Brewer)
*   **Consistency** vs **Availability** vs **Partition Tolerance**.
*   **The Choice**: We choose **CP** (Consistency/Partition) for Core Domain. We choose **AP** (Availability/Partition) for Search/Caching.

---

## 🌐 II. API Standards (REST & OpenAPI)

### 1. The Contract First
*   We do not write code then generate docs. We define the **OpenAPI Spec** first (via Pydantic or manual YAML).
*   **REST Maturity**: Level 2 (Resources + Verbs) minimum. Level 3 (HATEOAS) optional.

### 2. Status Codes
*   `200`: OK.
*   `201`: Created.
*   `204`: No Content (Delete/Update success).
*   `400`: Bad Request (Validation).
*   `401`: Unauthorized (Who are you?).
*   `403`: Forbidden (You can't do that).
*   `404`: Not Found.
*   `429`: Too Many Requests (Rate Limit).
*   `500`: Server Error (We failed).

### 3. Versioning
*   **URL Versioning**: `/api/v1/users`.
*   **Breaking Changes**: Require `v2`. Never break `v1`.
