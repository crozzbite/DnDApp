# Architecture Output Checklist

This document defines the canonical outputs that the Lich must deliver after completing the architectural design process.

**Output Count:**
- **Generic Lich:** 14 outputs (Outputs 1-14)
- **Phylactery Lich:** 16 outputs (Outputs 1-16, includes SkullRender-specific outputs)

**Note:** Output 9 is divided into two sequential steps (Testing Strategy → Test Design) to enable Test-Driven Architecture (TDA).

---

## 📋 The 16 Outputs

### 1️⃣ Vision & Context
**File:** `architecture/vision.md`

**Contents:**
- System purpose and goals
- Problem being solved
- Key actors/stakeholders
- System boundaries
- Success criteria

---

### 2️⃣ Architecture Diagram
**File:** `architecture/diagrams/layers.mmd`

**Contents (Mermaid):**
- Layered architecture visualization
- Component dependencies
- Data flow directions
- External integrations
- Technology boundaries

---

### 3️⃣ Architectural Principles
**File:** `architecture/principles.md`

**Contents:**
- Core design rules (e.g., "Domain doesn't depend on frameworks")
- Constraints and invariants
- Coding standards references
- Architecture enforcement mechanisms

---

### 4️⃣ Domain Model
**File:** `architecture/domain/entities.md`

**Contents:**
- Entities (with identity)
- Value Objects (immutable, no identity)
- Aggregates and boundaries
- Domain invariants
- Ubiquitous language glossary

---

### 5️⃣ Use Cases
**File:** `architecture/domain/use-cases.md`

**Contents:**
- Actor-driven use case catalog
- Primary flow (happy path)
- Alternative flows
- Error scenarios
- Pre/post-conditions

---

### 6️⃣ Interfaces & Contracts
**File:** `architecture/interfaces.md`

**Contents:**
- API contracts (REST, GraphQL, etc.)
- DTOs (Data Transfer Objects)
- Event schemas
- Integration points with external systems
- Message formats

---

### 7️⃣ Technology Stack
**File:** `architecture/stack.md`

**Contents:**
- Backend technologies (with justification)
- Frontend technologies (with justification)
- Infrastructure (databases, message queues, etc.)
- Testing tools
- Rationale for each choice (ADR-lite)

---

### 8️⃣ Directory Structure
**File:** `architecture/directory-structure.md`

**Contents:**
- Proposed folder hierarchy
- Layer mapping to directories
- Module organization
- Naming conventions
- Dependency enforcement strategy

---

### 9️⃣ Testing Strategy (Step 1)
**File:** `architecture/testing-strategy.md`

**Contents:**
- Test pyramid levels (unit, integration, e2e)
- What to test at each level
- Testing tools and frameworks
- Coverage targets
- CI/CD integration

**Purpose:** Define HOW testing will be structured.

---

### 9️⃣.5️⃣ Test Design (Step 2)
**File:** `architecture/test-design.md`

**Contents:**
- **Architecture Tests:** Structural validation rules (dependencies, layer isolation)
- **Domain Tests:** Business logic test cases (entities, value objects, invariants)
- **Use Case Tests:** Behavioral scenarios (happy path, errors, edge cases)
- **Integration Tests:** Adapter contracts (database, HTTP clients, external APIs)
- **E2E Tests:** Critical user flows

**Purpose:** Define WHAT specific tests to write BEFORE implementation (Test-First approach).

**Implementation Order:**
1. Write failing tests (Red)
2. Write minimal code to pass (Green)
3. Refactor (Refactor)

---

### 🔟 Architecture Decision Records (ADRs)
**Directory:** `architecture/adrs/`

**Files:** `001-title.md`, `002-title.md`, etc.

**Format per ADR:**
```markdown
# ADR-001: [Decision Title]

**Date:** YYYY-MM-DD
**Status:** Proposed | Accepted | Deprecated | Superseded

## Context
What is the issue that we're seeing?

## Decision
What is the change that we're proposing?

## Alternatives Considered
- Alternative 1: [description]
- Alternative 2: [description]

## Consequences
### Positive
- What becomes easier

### Negative
- What becomes harder

### Neutral
- What stays the same
```

---

### 1️⃣1️⃣ Risks & Trade-offs
**File:** `architecture/risks.md`

**Contents:**
- Technical risks (vendor lock-in, scalability, etc.)
- Operational risks (deployment complexity, monitoring)
- Economic risks (cost, licensing)
- Mitigation strategies
- Acceptance criteria for each risk

---

### 1️⃣2️⃣ Evolutionary Roadmap
**File:** `architecture/roadmap.md`

**Contents:**
- Current state (v0.x)
- Short-term evolution (Sprint 1-3)
- Medium-term evolution (v1.0-2.0)
- Long-term vision (v2.0+)
- Migration strategies
- Agile sprint planning integration

---

### 1️⃣4️⃣ Skills Manifest
**File:** `architecture/skills-manifest.md`

**Contents:**
- **Base Layer Skills:** Universal principles
- **Architecture Layer Skills:** Design patterns
- **Domain Layer Skills:** Business logic
- **Application Layer Skills:** Use case implementation
- **Infrastructure Layer Skills:** Technical details
- **Observability Layer Skills:** Monitoring/logging
- **Skills to Create:** Gaps in current skill inventory
- **Skill Resolution Order:** Invocation sequence

**Format:**
```markdown
## 🧠 Layer 0: Base Skills
- [x] `base/clean-code` - SOLID, DRY, KISS
- [x] `base/app-security` - PII, secrets

## 🏛️ Layer 1: Architecture Skills
- [x] `architecture/lich` - Orchestrator

## Skills to Create
- [ ] `backend/api-design` - REST/GraphQL patterns

## Skill Resolution Order
Priority Rule: Specific > Generic
```

---

### 1️⃣5️⃣ SkullRender Compliance Report
**File:** `architecture/skullrender-compliance.md`

**Contents (Phylactery Lich ONLY):**
- **Angular Compliance:** Standalone components, Signals, new control flow (`@if`, `@for`, `@defer`)
- **Python Compliance:** `uv` tooling, `mypy --strict`, `ruff` linting
- **Testing Coverage:** Per-layer test coverage percentages
- **Security Checklist:** Guards, interceptors, PII sanitization, secret detection
- **Anti-Pattern Detection:** NgModules, manual subscriptions, `any` types, god objects
- **Deviations:** Justified exceptions with rationale

**Purpose:** Enforce SkullRender standards and measure compliance.

---

### 1️⃣6️⃣ User Feedback Report
**File:** `architecture/feedback-report.md`

**Contents:**
- **Clarity:** Were the diagrams and documents clear?
- **Completeness:** Was anything important missing?
- **Workflow:** Was the Socratic process helpful or frustrating?
- **Mode Selection:** Was the recommended mode (Context-Aware/Multi-Pass) appropriate?
- **Skills:** Were the invoked skills relevant?
- **Improvements:** What would you change about the process?
- **Highlights:** What was most valuable?
- **Action Items:** Lich improvements for next iteration

**Purpose:** Enable continuous improvement of the Lich system based on real user feedback.

---

## 📂 Complete Output Structure

```
architecture/
├── INDEX.md                      # Executive summary + links to all outputs
├── vision.md                     # Output 1
├── diagrams/
│   ├── layers.mmd               # Output 2
│   └── dependencies.mmd         # (optional)
├── principles.md                 # Output 3
├── domain/
│   ├── entities.md              # Output 4
│   └── use-cases.md             # Output 5
├── interfaces.md                 # Output 6
├── stack.md                      # Output 7
├── directory-structure.md        # Output 8
├── testing-strategy.md           # Output 9 (Step 1)
├── test-design.md                # Output 9.5 (Step 2)
├── adrs/                         # Output 10
│   ├── 001-example.md
│   └── 002-example.md
├── risks.md                      # Output 11
├── roadmap.md                    # Output 12
├── sprint-roadmap.md             # Output 13 (Phylactery Lich only)
├── skills-manifest.md            # Output 14
├── skullrender-compliance.md     # Output 15 (Phylactery Lich only)
└── feedback-report.md            # Output 16
```

---

## ✅ Lich Workflow Integration

### Phase 1: Socratic Dialogue
- Lich asks questions to understand the system
- Outputs 1, 4, 5 emerge from this dialogue

### Phase 2: Architecture Design
- Lich creates Outputs 2, 3, 6, 7, 8
- References `architecture-library.md`

### Phase 3: Planning & Risk Assessment
- Lich creates Outputs 9, 10, 11, 12

### Phase 4: Skill Orchestration
- Lich creates Output 14 (Skills Manifest)
- Identifies skill gaps
- Invokes skills in resolution order

### Phase 5: Compliance & Feedback (Phylactery Lich)
- Lich creates Output 15 (SkullRender Compliance - Phylactery Lich only)
- Lich creates Output 16 (User Feedback Report)
- User reviews and provides feedback
- Lich iterates if needed

---

## 🎯 Validation Checklist

Before delivering, the Lich verifies:
- [ ] All outputs are present (14 for Generic Lich, 16 for Phylactery Lich)
- [ ] `INDEX.md` links to all outputs correctly
- [ ] No circular references between documents
- [ ] Diagrams use valid Mermaid syntax
- [ ] ADRs follow the standard format
- [ ] Skills Manifest is aligned with Clean Architecture layers
- [ ] Test Design follows Testing Strategy
- [ ] Sprint roadmap aligns with evolutionary roadmap (Phylactery Lich only)
- [ ] Principles are enforceable and measurable
- [ ] User Feedback template is included
