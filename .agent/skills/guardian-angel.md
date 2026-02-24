---
name: guardian-angel
description: >
  Core rules of the Gentleman Guardian Angel (GGA) for SkullRender.
  Trigger: When auditing code for architecture, naming, and technical standards.
metadata:
  version: 1.1.0
  author: Gentleman-Programming & SkullRender (Antigravity)
  min_core_version: 1.0.0
---

## Hierarchy of Needs (Chain of Command)
Before implementing or auditing, follow this prioritized order:
1. **Level 0: Clean Logic (`clean-code`)**: Basic programming hygiene (DRY, Zero Residue).
2. **Level 1: Structural Bones (`guardian-angel`)**: Primordial rules (Scope determines structure, Radical Naming). **STOP HERE**: If the file is in the wrong place or has the wrong name, DO NOT proceed to technical implementation.
3. **Level 2: Domain Context**: Context based on file nature (FastAPI, Server, Tool).
4. **Level 3: Technical brain (`python-audit`, `angular`)**: Framework implementation, strict typing, and signals.

## 0. Metadata Standard (SemVer-S)
Every Skill MUST include these tags in its YAML frontmatter:
- `version`: X.Y.Z following SemVer-S rules.
- `min_core_version`: Minimum motor version (Lich) required.

## 1. When to Use
Load this skill when:
- Reviewing Merge Requests (MR) or code changes.
- Setting up a new Angular project.
- Auditing existing legacy code for cleanup.

## Critical Patterns

### 1. The Scope Rule
Code must live exactly where its usage dictates. "Scope determines structure".

| Usage | Placement |
|-------|-----------|
| Used by 1 feature | `features/[feature]/components/` |
| Used by 2+ features | `shared/` |
| App-wide singletons | `core/` |

### 2. Radical Naming
No redundant suffixes. The structure Provides the context.

| Entity | ❌ Incorrect | ✅ Correct |
|--------|-------------|------------|
| Service | `user.service.ts` | `user.ts` |
| Component | `login.component.ts` | `login.ts` |

## Code Examples

### Example: Clean Feature Structure
```typescript
// src/app/features/user/services/user.ts
@Injectable({ providedIn: 'root' })
export class UserService { ... }
```

## Anti-Patterns

### Don't: Redundant Suffixes
Why: It's redundant. The folder (services, components) already provides the context.
```typescript
// ❌ user.service.ts - REJECTED
```

### Don't: Manual State Subscription
Why: Prefer Signals (`toSignal`) or `AsyncPipe` to avoid memory leaks.
```typescript
// ❌ this.service.get().subscribe() - REJECTED
```

## Quick Reference
- **Signals**: Native state management only.
- **Standalone**: Required for every component.
- **Response**: Must start with `STATUS: PASSED` or `STATUS: FAILED`.
