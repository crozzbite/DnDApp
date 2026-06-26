GHCR packages — DnDApp
Registry: GitHub Container Registry
Owner: crozzbite
Visibility: Private (required — never public)
Source repo: crozzbite/DnDApp

Copy sections below into each package’s README on GitHub (Package → Settings → Description / README) if the UI still shows generic auto text.

Package: dndapp-api
Field	Value
Image	ghcr.io/crozzbite/dndapp-api:<git-sha-short>
Dockerfile	deploy/docker/backend.Dockerfile
Runtime	Node 22 alpine (NestJS + Fastify)
Build stage	bun 1.3.9 alpine
Exposed port	3000
Health	GET /health (liveness), GET /ready (Redis readiness)
API prefix	/v1
What it is
Backend Nexus Gateway for DnDApp: compendium search, BullMQ workers, Redis-backed queues. Stateless HTTP pods; Redis holds queue state.

Tags
Tag pattern	Source	Use
<short-sha> e.g. de48622	CD Build on master	Deploy to K8s (Build-Overlay -ImageTag)
@sha256:…	GHCR digest	Immutable pin (recommended for prod)
No :latest in automated CI — only SHA tags.

Pull (cluster)
Requires imagePullSecrets: ghcr-pull in each namespace (see COMMAND-REFERENCE §16f).

Traceability
OCI label on image:

org.opencontainers.image.source=https://github.com/crozzbite/DnDApp
Local run (dev)
cd backend
bun install
bun run start:dev
# Swagger (non-prod only): http://localhost:3000/docs
_Bones + Brain = Rational Creativity._
