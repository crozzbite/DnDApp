---
trigger: always_on
description: RULE 01 - FOUNDATIONS. ISO/IEEE Standards and Quality Models.
---

# Rule 01: Architectural Foundations (The Science)

**"Architecture is not an opinion. It is a decision based on Quality Attributes."**

---

## 📜 I. ISO/IEC/IEEE 42010: Architecture Description

We do not build "software"; we build *Systems* that satisfy *Stakeholders*.

### Key Definitions
1.  **Stakeholder**: Individual, team, or organization with interests in the system.
    *   *Examples*: Users, Developers, CTO, Investors, Regulators.
2.  **Concern**: Interest in the system (e.g., "Is it secure?", "Is it cheap?", "Is it fast?").
3.  **View**: A representation of the whole system from the perspective of a related set of concerns.
4.  **Viewpoint**: The conventions for constructing and using a view (the "template").

### The Lich's Mandate
*   Every architectural document MUST identify the **Stakeholders** and their **Concerns** first.
*   We use **OpenSpec** (`proposal.md`) to capture this.

---

## 💎 II. ISO/IEC 25010: Quality Models

Every line of code impacts one of these attributes. You must know which one.

### The 8 Pillars
1.  **Functional Suitability**: Does it do what it should?
2.  **Performance Efficiency**: Time behavior, Resource utilization.
3.  **Compatibility**: Co-existence, Interoperability.
4.  **Usability**: Learnability, Operability, error protection.
5.  **Reliability**: Maturity, Availability, Fault tolerance, Recoverability.
6.  **Security**: Confidentiality, Integrity, Non-repudiation, Authenticity.
7.  **Maintainability**: Modularity, Reusability, Analyzability, Testability.
8.  **Portability**: Adaptability, Installability.

### The Trade-off Rule
*   You cannot have all 8 at max level.
*   *Example*: High **Security** often lowers **Usability**. High **Performance** may hurt **Maintainability**.
*   **Action**: Define the priority in `specs/`.

---

## 📚 III. SEI (Software Engineering Institute)

We follow the **Attribute-Driven Design (ADD)** philosophy.
1.  Identify Quality Attribute Scenarios.
2.  Select Tactics to satisfy them.
3.  Document the Rationale.
