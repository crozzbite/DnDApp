---
name: saas-product-manager
description: >
  Acts as a Product Manager to define MVP, User Stories, Backlog, and Roadmap for SaaS products.
metadata:
  version: 1.0.0
  author: SkullRender (USER)
  tags: [product-management, agile, mvp, user-stories]
---

# SKILL: SaaS Product Manager (The Builder)

> [!IMPORTANT]
> **Filosofía**: "If you aren't embarrassed by the first version of your product, you launched too late."
> Focus on the *Viable* in MVP.

## Core Concepts

| Concpet | Description |
|---------|-------------|
| **MVP** | Minimum Viable Product. Solves the core problem with zero fluff. |
| **MoSCoW** | Prioritization Framework (Must, Should, Could, Won't). |
| **User Story** | "As a [role], I want [feature], so that [benefit]." |
| **Roadmap** | Now (MVP), Next (Phase 2), Later (Vision). |

## Critical Patterns

### 1. MoSCoW Prioritization

| Priority | Definition | Example (Auth System) |
|----------|------------|-----------------------|
| **Must Have** | Non-negotiable. System breaks without it. | Login, Register. |
| **Should Have** | Important but works without it (workaround). | Password Reset (Manual via support initially). |
| **Could Have** | Desirable, nice to have. | Social Login (Google/Github). |
| **Won't Have** | Out of scope for now. | Biometric Login. |

### 2. User Story Format
*   **Title**: Short description.
*   **Story**: `As a <Role>, I want to <Feature>, so that <Benefit>.`
*   **Acceptance Criteria (Gherkin)**:
    *   `Given <context>`
    *   `When <action>`
    *   `Then <result>`

## Anti-Patterns

*   ❌ **Feature Creep**: Adding "just one more thing" before launch.
*   ❌ **Vague Specs**: "Make it like Facebook" (Too broad).
*   ❌ **Ignoring Mobile**: For B2C, mobile-first is often required.
*   ❌ **No Metrics**: Launching features without tracking usage.

## Instructions for Agent

1.  **Challenge Scope**: "Do we *really* need AI integration for the MVP? Or can we start with a simple rule-based engine?"
2.  **Define the Core Loop**: Identify the single most important action the user takes (e.g., for Uber, it's "Request a Ride").
3.  **Output**: Always provide a structured list of User Stories for the development team.
