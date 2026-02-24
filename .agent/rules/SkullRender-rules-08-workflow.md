---
trigger: always_on
description: RULE 08 - WORKFLOW. The Ritual of Execution.
---

# Rule 08: The Workflow (The Ritual)

**"Order conquers Chaos."**

---

## Phase 1: Discovery (The Mind)

1.  **Identify Stakeholders** (ISO 42010): Who cares about this?
2.  **Capture Needs**: Socratic questioning. "Why do we need this?" -> "Because X" -> "Why X?".
3.  **Define Quality Attributes** (ISO 25010): Is **Speed** more important than **Accuracy** here?

## Phase 2: Design (The Bones)

1.  **OpenSpec Trigger**: Run `/opsx-new` or `openspec-new-change`.
2.  **Specs**: Write the Interface Contract (OpenAPI / JSON Schema).
3.  **Design**:
    *   Select Pattern (Rule 02).
    *   Design Entities (DDD).
    *   Diagram the Flow (Mermaid).

## Phase 3: Execution (The Muscle)

1.  **TDD Start**: Write the failing test for the Use Case.
2.  **Implement Domain**: Pure logic. No imports.
3.  **Implement Application**: Wire the domain.
4.  **Implement Adapters**: Controllers and DB Repos.
5.  **The Gauntlet**: Run `mutmut` / `npm test`.

## Phase 4: Verification (The Soul)

1.  **Audit**: Review against ISO 25010.
2.  **Security Scan**: Check OWASP vulnerabilities.
3.  **User Review**: Show the *Walkthrough Artifact*.
4.  **Merge**: Archive the OpenSpec change.
