---
name: saas-logistics
description: >
  Logistics for digital service delivery, including SLAs, Support Tiers, and CI/CD from a business perspective.
metadata:
  version: 1.0.0
  author: SkullRender (USER)
  tags: [logistics, sla, support, ci-cd]
---

# SKILL: SaaS Logistics (Service Delivery)

> [!IMPORTANT]
> **Filosofía**: "Uptime is Trust."
> Logistics in SaaS = Reliability + Support + Delivery Pipeline.

## Core Concepts

| Concept | Definition | Standard |
|---------|------------|----------|
| **SLA** | Service Level Agreement. Guarantee of uptime. | 99.9% (Triple Nine). |
| **SLA Credits** | Refund if uptime is breached. | 10-25% of monthly fee. |
| **L1 Support** | User help, resets, FAQs. | Chatbot / Junior Rep. |
| **L3 Support** | Code fix, DB outage. | DevOps / Senior Dev. |
| **CI/CD** | Pipeline to ship code. | Blue/Green or Canary. |

## Critical Patterns

### 1. Uptime Tiers
*   **99.9%**: ~43 mins downtime/month. (Acceptable for most B2B).
*   **99.99%**: ~4 mins downtime/month. (Enterprise/Banking). Expensive to maintain.
*   **99.999%**: ~26 seconds/year. (Telco grade).

### 2. Support Response Time (Slo)
*   **Blocker (System Down)**: < 1 hour.
*   **High (Bug)**: < 4 hours.
*   **Normal (Question)**: < 24 hours.

### 3. Deployment Strategy
*   **Blue/Green**: 2 identical envs. Switch traffic instantly. Zero downtime.
*   **Canary**: Roll out to 5% of users. Monitor. Roll out to rest. (Risk mitigation).
*   **Feature Flags**: Toggle features on/off live.

## Anti-Patterns

*   ❌ **Deploying on Friday**: Just don't.
*   ❌ **No Monitoring**: Learning about downtime from angry users on Twitter.
*   ❌ **Single Point of Failure**: One DB, one dev who knows the password.
*   ❌ **Over-promising**: Guaranteeing 100% uptime (Impossible).

## Instructions for Agent

1.  **Define the Promise**: "What is your SLA?" (Start with 99.5% or 99.9%).
2.  **Structure Support**: "Who wakes up at 3 AM if servers crash?" (PagerDuty).
3.  **Deployment**: Recommend Blue/Green or Feature Flags for B2B.
