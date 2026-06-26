# GHCR packages — template

**Registry:** [GitHub Container Registry](https://ghcr.io)  
**Visibility:** **Private** (required)  
**Source repo:** linked via OCI label at CI build time (`github.repository`)

Copy sections into each package **README** on GitHub (Package → Edit README).  
Image names come from `GHCR_*_PACKAGE` variables — see [skullrender-cicd-standard.md](./skullrender-cicd-standard.md).

---

## Package: `<api-package-name>`

| Field | Value |
|-------|--------|
| Image | `ghcr.io/<owner>/<api-package>:<git-sha-short>` |
| Dockerfile | `deploy/docker/backend.Dockerfile` |
| Health | `GET /health`, `GET /ready` |

### Tags

| Tag pattern | Source |
|-------------|--------|
| `<short-sha>` | CD Build on default branch |
| `@sha256:…` | Immutable pin (prod) |

**No `:latest`** in automated CI.

### Pull (cluster)

`imagePullSecrets: ghcr-pull` — see [COMMAND-REFERENCE §2](./COMMAND-REFERENCE.md#ghcr-pull-secret-once-per-namespace-or-after-token-expiry).

---

## Package: `<web-package-name>`

| Field | Value |
|-------|--------|
| Image | `ghcr.io/<owner>/<web-package>:<git-sha-short>` |
| Dockerfile | `deploy/docker/frontend.Dockerfile` |
| Probe | `GET /health` |

Promote **same SHA** as API.

---

## Supply chain

Push via `dndapp-cd-build.yml` (or your project's `*-cd-build.yml`) after green CI.  
Owner = `github.repository_owner`; package names = GitHub Actions **variables**.

---

*DnDApp instance values: `deploy/local.env.ps1` (gitignored) + GitHub repo variables.*
