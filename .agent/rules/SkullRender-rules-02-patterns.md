---
trigger: always_on
description: RULE 02 - PATTERNS. Architectural Styles and Selection Criteria.
---

# Rule 02: Architectural Patterns (The Skeleton)

**"Form follows Function. Structure follows Scale."**

---

## 🏰 I. Monolithic Architecture

**Definition**: All components (UI, API, DB Access) in a single deployable unit.

### When to use (SkullRender Default)
*   MVP / Startup phase.
*   Small team (< 5 developers).
*   Simple domain complexity.

### The "Modular Monolith" (Recommended)
*   Code is separated into domains (`modules/user`, `modules/payment`).
*   Communications via in-memory calls (Function calls).
*   **Strict Rule**: Modules CANNOT import each other directly. Use Interfaces.

---

## 🐝 II. Microservices Architecture

**Definition**: Suite of small services, each in its own process, communicating via HTTP/gRPC.

### When to use (The "Danger Zone")
*   Scaling specific components independently.
*   Multiple teams (> 20 developers).
*   Polyglot requirements (Service A in Python, Service B in Rust).

### The Lich's Warning
> "Do not build Microservices to solve Code Complexity. Build them to solve Organizational Scalability."

---

## ⚡ III. Event-Driven Architecture (EDA)

**Definition**: Components communicate by emitting and consuming **Events** (Facts that happened).

### When to use
*   Decoupling systems (Fire and Forget).
*   High volume, asynchronous processing.
*   Complex workflows (Sagas).

---

## 🧠 IV. Selection Matrix

| Feature | Monolith | Microservices | Event-Driven |
| :--- | :--- | :--- | :--- |
| **Deployment** | Simple | Complex (K8s) | Complex (Brokers) |
| **Debug** | Easy | Hard (Distributed Tracing) | Hardest (Async) |
| **Latency** | Lowest (In-memory) | Medium (Network) | Variable (Queue) |
| **Consistency** | Strong (ACID) | Eventual | Eventual |

### The "Bones" Directive
Start with a **Modular Monolith**. Extract to **Microservices** only when a specific module is choking the whole (Performance) or when separate teams collide (Governance).
