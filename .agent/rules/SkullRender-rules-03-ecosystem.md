---
trigger: always_on
description: RULE 03 - THE ECOSYSTEM. Testing, Observability, and CI/CD.
---

# Rule 03: The Ecosystem (The Life Support)

**"Code that is not observed is dead. Code that is not tested is a hallucination."**

---

## 🧪 I. The Testing Pyramid (Martin Fowler)

We adhere to the strict pyramid.

1.  **Unit Tests (70%)**:
    *   *Scope*: Single class/function. Independent. Fast (<10ms).
    *   *Mandate*: 100% Coverage on **Domain Layer**.
    *   *Tools*: `pytest`, `jest`.
2.  **Integration Tests (20%)**:
    *   *Scope*: Database, API calls (mocked).
    *   *Mandate*: Test the "wiring" of Adapters.
3.  **E2E Tests (10%)**:
    *   *Scope*: Full User Flow (UI -> Backend -> DB).
    *   *Tools*: `Playwright`.

### Advanced Tactics
*   **Mutation Testing**: `mutmut` / `Stryker`. Required for Domain.
*   **Chaos Engineering**: For distributed systems. Kill pods, throttle networks.

---

## 📊 II. Observability (O11y)

**"You cannot fix what you cannot see."**

### The Three Pillars (OpenTelemetry)
1.  **Logs**: "What happened?" (Structured JSON).
    *   *Fields*: `correlation_id`, `user_id`, `event_type`.
2.  **Metrics**: "Is it healthy?" (Aggregates).
    *   *Examples*: Latency (p95, p99), Error Rate, Throughput.
3.  **Traces**: "Where did it go?" (Request path).
    *   *Mandate*: Propagate Context across all boundaries (HTTP/Queue).

---

## 🚀 III. CI/CD (The Pipeline)

**"Ship constantly. Break nothing."**

### The Pipeline Ritual
1.  **Commit**: Runs Pre-commit hooks (Lint, Format, Type Check).
2.  **PR**: Runs Unit Tests + Mutation Tests. (Blocker).
3.  **Merge**: Deploys to Staging. Runs E2E.
4.  **Release**: Deploys to Prod. Canary/Blue-Green.

### Infrastructure as Code (IaC)
*   Nothing is manual. Server config is code (`Terraform`, `Pulumi`, `Docker Compose`).
*   **GitOps**: The repo is the source of truth for the infra state.
