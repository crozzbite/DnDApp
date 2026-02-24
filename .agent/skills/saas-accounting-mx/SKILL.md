---
name: saas-accounting-mx
description: >
  Expert logic for Mexican SaaS accounting, SAT compliance, RESICO vs SAS, and fiscal strategy.
metadata:
  version: 1.0.0
  author: SkullRender (USER)
  tags: [accounting, mexico, sat, resico, sas]
---

# SKILL: SaaS Accounting & SAT Compliance (Mexico)

> [!IMPORTANT]
> **Filosofía**: "Sleep well at night. Be checking-account positive and tax-compliant."
> Strategic guidance, NOT binding legal advice.

## Core Regimes (The Menu)

| Regime | Target | Cap (MXN/yr) | ISR Rate | Deductions? |
|--------|--------|--------------|----------|-------------|
| **RESICO PF** | Solopreneurs | $3.5M | **1.0% - 2.5%** (Gross) | NO (ISR) / YES (IVA) |
| **SAS (RESICO PM)** | Startups | $35M | **30%** (Net Profit) | **YES** (Servers, Ads, Stripe) |
| **Persona Moral** | Scale-ups | Unlimited | 30% + Dividends | YES |

## Critical Decision Matrix

| Scenario | Recommend | Why |
|----------|-----------|-----|
| Single Founder, < $3.5M rev, Low Expenses | **RESICO PF** | Lowest tax rate. Simple. Cash-flow based. |
| Multiple Partners OR High Expenses | **SAS (RESICO PM)** | Legal protection. Deduct expenses. Online constitution ($0). |
| Revenue > $35M | **Régimen General** | Necessary growth step. |

## Invoicing (CFDI 4.0) for SaaS

*   **Clave ProdServ**:
    *   `81112200` (Software de aplicación) - Most common.
    *   `81111800` (Servicios de sistemas Informáticos).
*   **Clave Unidad**: `E48` (Unidad de servicio).
*   **Metodo Pago**: `PUE` (Pago en Una Sola Exhibición) for subscriptions.
*   **IVA**: Generally **16%**.
    *   *Note*: Export to foreign clients *can* be 0% (Art 29 LIVA) but requires strict validation.

## Anti-Patterns

*   ❌ **Mixing Finances**: Using personal card for company AWS bills.
*   ❌ **Ignoring IVA**: Spending all revenue without saving the 16% IVA you collected.
*   ❌ **Late Filings**: SAT fines are automated and expensive.
*   ❌ **Fake Invoices (Factureras)**: Never. Jail time risk.

## Instructions for Agent

1.  **Ask for Estimates**: "Projected annual revenue?", "Partners?", "Deductible expenses?".
2.  **Evaluate Regime**: Use the Matrix above.
3.  **Calculate Taxes (Estimate)**:
    *   **RESICO PF**: `Revenue * Rate`
    *   **RESICO PM**: `(Revenue - Expenses) * 30%`
4.  **Disclaimer**: Always remind the user to consult a certified accountant.
