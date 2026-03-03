# Architectural Decision Record (ADR-003): External Asset Nexus for Heavy Media

## Status: Accepted (Culmination of Phase 4.1.6 and Phase 4.4)

## Context

The **DnDApp** contains over 2.6GB of PDF grimorios and high-resolution media. Storing these in a Git repository (GitHub) is suboptimal for performance, repository size, and clone times.

## Decision

1.  **Capability Culmination**: The `pdf-manuals-ingestor` will evolve to become the primary client for the **External Asset Nexus**.
2.  **Storage Engine**: We will use **Cloudflare R2** (or S3-compatible storage) as the definitive home for large assets (+2GB).
3.  **Hybrid Indexing**:
    - Indexation via `index.json` (Local and Cloud).
    - Dynamic resolution of URLs (Local fallback for dev, CDN for production).
4.  **Migration Path**: Implementation of `nexus-sync.ts` script to automate ingestion from local assets to R2.

## Consequences

- Decreased Git repository size (Lighter Bones).
- Faster CI/CD cycles (no heavy asset builds).
- Requires CDN connectivity for full experience.
- Added cost for storage/transit (mitigated by R2 Free Tier).

## Verification

- `organs-connectors.spec.md` updated with technical requirements.
- `tasks.md` marked as culminating the ingestor phase.
