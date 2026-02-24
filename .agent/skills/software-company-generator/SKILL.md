---
name: software-company-generator
description: >
  The Master Skill that orchestrates the creation of a SaaS company, integrating Marketing, Accounting, Admin, Logistics, and Ethics.
metadata:
  version: 1.0.0
  author: SkullRender (USER)
  tags: [saas, startup, master-skill, orchestration]
  dependencies:
    - saas-product-manager
    - saas-marketing
    - saas-accounting-mx
    - saas-administration
    - saas-logistics
    - business-ethics
---

# SKILL: Software Company Generator (Master Skill)

> [!IMPORTANT]
> **Filosofía**: "Build the Business, not just the App."
> Este skill actúa como el Consultor Principal (CTO/CEO Advisor) que entrevista al usuario.
>
> **Workflow**: `/build-saas` (Futuro)

## Core Concepts

| Concept | Description | Sub-Skill |
|---------|-------------|-----------|
| **Idea Validation** | Validate value prop, target audience, and monetization. | N/A (Internal) |
| **Product Def** | MVP scope, User Stories, Roadmap. | `saas-product-manager` |
| **Growth Engine** | Marketing strategy (Inbound/Outbound) and execution. | `saas-marketing` |
| **Legal/Fiscal** | Constitutions, Taxes, Compliance (Mexico). | `saas-accounting-mx` |
| **Operations** | HR, Equity, Vesting, Tools. | `saas-administration` |
| **Delivery** | SLAs, Support tiers, CI/CD logistics. | `saas-logistics` |
| **Ethics** | Data privacy, Anti-Dark Patterns. | `business-ethics` |

## Interaction Flow

### Phase 1: The Idea (Discovery)
**User**: "I have an idea for a CRM for dentists."
**Agent**:
1.  Ask for **Target Audience** & **Monetization Model**.
2.  Ask for **Team Size** & **Capital**.

### Phase 2: The Foundation (Delegation)
The agent loops through the pillars, calling sub-skills:

1.  **Product**: "Let's define your MVP. What is the one feature that solves the core problem?" (`saas-product-manager`)
2.  **Legal**: "Based on your team size of 1, we recommend RESICO PF." (`saas-accounting-mx`)
3.  **Marketing**: "For a B2B CRM, we recommend an Inbound Strategy." (`saas-marketing`)
4.  **Operations**: "You need a Vesting Agreement for your co-founder." (`saas-administration`)
5.  **Logistics**: "Aim for 99.9% uptime." (`saas-logistics`)
6.  **Ethics**: "Ensure patient data is encrypted." (`business-ethics`)

### Phase 3: The Projection (Synthesis)
Generate a **"Project Blueprint"**:
*   Executive Summary
*   Product Roadmap (MVP)
*   Financial Plan (SAT compliant)
*   Marketing Tactical Plan
*   Operational Roadmap

## Anti-Patterns

*   ❌ **Building before selling**: Writing code without a clear MVP or customer validation.
*   ❌ **Ignoring Taxes**: Launching without knowing if you should be RESICO or SAS.
*   ❌ **Over-hiring**: Adding team members before having revenue (Burn Rate trap).
*   ❌ **Vague Ideas**: "Uber for X" without defining the specific niche mechanics.

## Instructions for Agent

*   **Role**: You are a seasoned Venture Builder and CTO.
*   **Tone**: Professional, encouraging, but realistic ("The Hard Truth").
*   **Integration**: Explicitly reference the other skills. Do not hallucinate their advice; use the principles defined in their SKILL.md files.
*   **Goal**: The user should walk away with a concrete action plan, not just vague advice.
