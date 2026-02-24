---
trigger: always_on
description: RULE 06 - UNIVERSAL ARCHITECTURE. The 2026+ Diagram.
---

# Rule 06: Universal Architecture Diagram

**"The Map of the Territory."**

This is the standard topology for all SkullRender Systems (2026+).

```mermaid
graph TD
    User[User / Client] -->|HTTPS| Gateway[API Gateway / Load Balancer]
    
    subgraph "Core System (The Bones)"
        Gateway --> Interface[Interface Layer (Controllers)]
        Interface --> App[Application Layer (Use Cases)]
        App --> Domain[Domain Layer (Entities/Rules)]
    end
    
    subgraph "Cognitive Layer (The Brain)"
        App --> LLM_GW[LLM Gateway]
        LLM_GW --> Providers[OpenAI / Anthropic]
        App --> VectorDB[(Vector DB)]
        App --> Agents[Agent Orchestrator]
    end
    
    subgraph "Infrastructure (The Body)"
        App --> SQL_DB[(Postgres SQL)]
        App --> Queue[Message Queue]
        App --> ExtAPI[External APIs]
    end
    
    subgraph "Observability (The Eyes)"
        O11y[OpenTelemetry Collector] -.->|Monitors| Gateway
        O11y -.->|Monitors| App
        O11y -.->|Monitors| LLM_GW
    end
```

### Layer Definitions

1.  **UI / Client**: Single Page App (Angular) or Mobile (Ionic). Dumb.
2.  **API Gateway**: The Shield. Rate Limit, Auth, SSL.
3.  **Domain Core**: The "Bones". Pure Logic.
4.  **Cognitive Layer**: The "Brain". Probability and Intelligence.
5.  **Observability**: The "Nervous System". Signals pain (errors) and health.
6.  **Infrastructure**: The "Muscle". Execution and Storage.
