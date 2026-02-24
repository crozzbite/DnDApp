---
name: phylactery-standards
description: The "Lich" Standard for Engineering Excellence (Mutation, Properties, Clean Arch).
---

# Phylactery Engineering Standards (The Lich Protocol)

**"We do not build to test. We test to build."**

This skill codifies the high-level engineering standards for the Phylactery project. It supersedes basic "clean code" rules by enforcing mathematical verification and strict architectural boundaries.

## 1. The Philosophy: Bones + Brain
- **Bones (Structure):** The Domain Model is immutable truth. It must be 100% covered, strictly typed, and protected by invariants.
- **Brain (Logic):** Use Cases orchestrate the bones. They must be observable, resilient (retry/backoff), and independent of infrastructure.
- **Rational Creativity:** Aesthetics serve function. Code must be "surgical" — minimal, precise, and effective.

### 1.1 Shell Protocol (PowerShell Compat)
- **Operator:** Use `;` (semicolon) for chaining, NOT `&&` (PowerShell 5.1 compatibility).
- **Context:** Use `Cwd` parameter in tools instead of `cd` command whenever possible.

## 2. Quality Gates (The Gauntlet)
No code merges without passing The Gauntlet.

### 🧬 Mutation Testing (Robustness)
- **Tool:** `mutmut` (Python) / `Stryker` (JS/TS)
- **Target:** >80% Killed Mutants in Domain Layer.
- **Why:** Coverage proves code ran. Mutation proves code *matters*.
- **Enforcement:** CI Pipeline fails if score drops.

### 🧠 The CTO Audit (Pre-Commit Questions)
Before delivering code, you MUST answer NO to these four:
1. **¿Rompe una invariante del dominio?** (Does it break a domain invariant?)
2. **¿Introduce un camino sin test?** (Does it introduce an untested path?)
3. **¿Mueve lógica a donde no va?** (Does it move logic where it doesn't belong?)
4. **¿Toca seguridad o pagos?** (Does it touch security or payments?)

### 🔮 Property-Based & Intent Testing (Invariants)
- **Tool:** `hypothesis` (Python) / `fast-check` (JS/TS)
- **Target:** Critical invariants must be tested against generated inputs.
- **Rule:** **Test the Rule, not the Type.** A test should document *why* a behavior exists (e.g., business lockouts), not just that a field is a string.

### 🛡️ Coverage Standards
- **Domain Layer:** 100% (Line & Branch). No exceptions.
- **Application Layer:** 80%. Mock external borders.
- **Infrastructure:** Integration tests for happy paths.

## 3. Architectural Constraints
- **Zero-Dependency Domain:** The `domain/` folder MUST NOT import from `application/`, `infrastructure/`, or external frameworks (except `pydantic`/`typing`).
- **Strict Interfaces:** Use Cases rely on Interfaces (`IUserRepository`), never implementation (`PostgresRepo`).
- **Zero "Any":** The type system is your skeleton. Do not break bones.

## 4. Observability & Resilience
- **Structured Logging:** All logs must be JSON with `correlation_id` and `event_type`.
- **Fail Gracefully:** Use "Zero-Pokemon" exception handling. Catch specific errors, retry transient ones (exponential backoff), and fail hard on invariants.

## 5. Collaboration Protocol (User Alignment)
This is how we work.
- **Evidence Over Trust:** Do not just claim it works. Prove it with a Compliance Matrix or a Mutation Report.
- **Socratic Evolution:** The plan is a living organism. If a gap is found (e.g., Native Apps), we pause, perform "Socratic Discovery", and restructure the Roadmap. We do not patch; we evolve.
- **The "High-Bar" Default:** Always assume the requirement is for "Staff Engineer" level quality (Enterprise Patterns) unless explicitly told to build a prototype.

### 5.1 Governance (The Law)
**"Code rots, but decisions endure."**
- **ADR Mandate:** ANY change to a Core Dependency version (Database, Framework, CSS Engine) requires an **Architectural Decision Record (ADR)**.
- **No Silent Changes:** If you change a version to fix a bug, you MUST document *why* that specific version was chosen over the previous one. Silence is forbidden.

---

**Trigger:** Apply this skill when reviewing code, designing tests, or refactoring `engine.py`.
**Auditor:** Phylactery Lich
