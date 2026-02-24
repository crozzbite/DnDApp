---
name: sentry
description: Standards for proactive error auditing and issue correlation using Sentry MCP.
---

# Sentry Auditing Skill

Proactive error analysis and issue tracking for the SkullRender ecosystem.

## Core Mandates

1. **Correlation First**: Always correlate Sentry issues with local file paths and Git history when analyzing.
2. **Impact Analysis**: Prioritize issues based on frequency, user impact, and proximity to critical "Bones" (Security/Core).
3. **Contextual Debugging**: Use the `list_issues` and `get_issue` tools to fetch event tags and breadcrumbs before proposing a fix.

## Tool Usage Standards

### `sentry.list_issues`
- Use filters like `is:unresolved` to narrow down relevant audits.
- Map the `project` slug correctly from the centralized configuration.

### `sentry.get_event`
- Analyze the `stacktrace` to find exact lines in the local repository.
- Cross-reference with `FileSystem` skill to read the offending code.

## Troubleshooting

- **OAuth Errors**: Sentry via `mcp-remote` requires a valid Personal Access Token with `event:read`, `issue:read`, and `project:read`.
- **Project Slugs**: Ensure the project slug matches exactly what is configured in `mcp_config.py`.
