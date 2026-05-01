# Competitive Landscape Analysis: Workspace Aperture

Aperture sits at the intersection of local workspace observability, lightweight developer portals, local hygiene scanners, and AI context tooling. Its edge is not that it replaces any one category; it connects factual local project state with agent-ready context.

## Developer Portals

- **Backstage:** Strong service catalog for large organizations.
- **Compass:** SaaS-oriented developer experience and component health platform.

**Aperture gap/opportunity:** These tools are designed for teams, services, and cloud workflows. Aperture is for the solo or small-team builder working directly across local repos. It should be much lighter, local-first, and useful before any enterprise metadata system exists.

## AI Context Tools

- **Repomix and similar packers:** Convert a single repo into LLM-readable context.
- **Cursor, Claude Code, Codex, and IDE indexes:** Help agents understand the currently opened project.

**Aperture gap/opportunity:** Most AI tooling is repo-local. Aperture is workspace-wide. It can tell an agent which project is the reference, which conventions are common across the workspace, and what facts matter before coding starts.

## Health And Security Scanners

- **Snyk, SonarQube, Trivy, OSV-Scanner:** Stronger for vulnerability, dependency, and quality scanning.

**Aperture gap/opportunity:** Aperture should not compete as full SAST or vulnerability tooling. V1 should focus on local developer hygiene: dirty worktrees, missing docs, missing scripts, env-file risk, missing CI, and project drift.

## Home Lab Dashboards

- **Homepage, Dashy, Homarr:** Dashboards for running services and self-hosted infrastructure.

**Aperture gap/opportunity:** These tools show what is running. Aperture shows what is being built. The useful unit is not a service tile; it is a local project with stack, scripts, docs, risks, Git state, and agent context.

## Aperture Positioning

| Feature | Common Alternative | Aperture Approach |
| :--- | :--- | :--- |
| Data privacy | SaaS or cloud sync | Local-first by default |
| Scope | Single repo or enterprise catalog | Workspace-wide local project map |
| Agent support | Manual prompt context | Agent briefs and read-only MCP facts |
| Security posture | Full vulnerability scanning | Local hygiene signals |
| Governance | Team process and tickets | Reference-project differences for solo builders |
| Complexity | Heavy setup or one-off CLI | Lightweight local observability |

## Product Edge

Aperture should become the local workspace observability layer for agentic builders. Its strongest product wedge is the combination of:

- Projects, Workspace, and Brief lenses.
- One actionable cross-project Brief queue.
- Advisory reference differences.
- Setup and hygiene signals.
- Agent brief export.
- Read-only MCP bridge.

In short: Aperture is not Jira, not Snyk, not Backstage, and not a generic dashboard. It is a living map of a developer's local code workshop.
