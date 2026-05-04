# Aperture

Aperture is a local-first single pane of glass for solo builders. It maps your projects, detects their stacks, and adds stack-aware launch hygiene so you can see what needs attention before sharing with users or handing work to an agent.

The V1 product promise is simple: Aperture should calmly tell the truth about your workspace.

It should answer questions like:

- What projects live in this workspace?
- What stacks, package managers, scripts, docs, and Git states do they have?
- Which projects need attention today?
- Which projects drift from my reference project?
- What can leak or bite me before I share this project?
- Which checks do not apply because this project does not use that stack?
- Is this repo ready for an AI coding agent?
- What short brief should I give an agent before work starts?

## Current Status

This repository is currently a proof of concept with a runnable local dashboard.

It contains:

- `ApertureDashboard.jsx`: a React/Tailwind dashboard prototype with mock data.
- `scanner.py`: a read-only local scanner that writes the V1 `aperture.scan.v1` project inventory contract, including stack-aware launch profile hints.
- `Docs/`: product, roadmap, setup, and positioning documents.

The repository now includes a runnable Vite React app scaffold. It does not yet include a real MCP server, hosted scanning, billing, ZIP upload, or GitHub connector. Those are deferred.

## Product Direction

Aperture V1 is centered on two opinionated lenses:

1. **Projects**: the project map plus per-project overview, signals, drift, and brief lenses.
2. **Brief**: the action layer for prioritized setup, risk, Git, and reference signals plus copyable workspace brief text.

Workspace-level signals such as setup readiness, dirty worktrees, reference drift, launch hygiene, skipped checks, and risk findings support those lenses. They are not separate destinations.

Aperture should favor explainable facts over abstract health scores. Scores may come later, but V1 should first build trust with concrete signals: stack, package manager, Git branch, dirty state, last commit, scripts, docs, env risk, CI presence, launch profile, skipped checks, and traceable hygiene findings.

## Run The App

First-run path: scan a local projects folder, review discovered project candidates, then decide what enters the workspace map. GitHub and GitLab connectors are planned, not implemented, and should eventually reuse the same discovery review pattern.


Install dependencies and start the dashboard:

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

Generate local workspace data:

```bash
python3 scanner.py --root ~/dev --output public/projects.json
```

Scan this repo directly:

```bash
python3 scanner.py --root . --output /tmp/aperture-projects.json
```

### Runtime Detection

Aperture detects running local apps by matching listening `localhost` ports to the server process working directory. For best results:

- Start the dev server from the project root, for example `cd "/Users/mashi/Workspace Aperture" && npm run dev`.
- Rescan while the dev server is running.
- Use the dashboard's runtime rescan action when a project shows stale runtime evidence.

Runtime status is a short-lived local snapshot. It expires quickly because ports and PIDs can be reused.

## How The Prototype Works

The current prototype has two pieces:

1. The Vite app renders the preserved React dashboard from `src/App.jsx` using mock data.
2. `scanner.py` can scan a local development folder and generate `public/projects.json` using the documented scanner contract. The dashboard loads that file automatically when present.

The dashboard fetches `/projects.json` at runtime and falls back to a concise setup state when no generated scanner output exists. Reference differences and launch hygiene appear as read-only signals inside the Projects and Brief lenses.

## Launch Hygiene Notes

Launch Hygiene is deliberately contextual:

- Firebase browser config is not treated as a secret by itself; Firestore and Storage rules matter more.
- Supabase anon keys are expected in browser apps; service-role keys are critical if exposed.
- If no auth provider is detected, Aperture skips user-isolation checks and focuses on public writes, abuse, and sensitive public data.
- API route/function checks are static heuristics. Aperture flags "no obvious auth check found" with confidence labels and file evidence; deeper tracing and fixes belong in future IDE or agent integrations.
- Payment bypass checks are skipped when no payment provider is detected.

## Canonical Docs

- Product strategy: `Docs/Aperture Project Overseer PRD.md`
- Execution roadmap: `Docs/Aperture Implementation Roadmap.md`
- Local setup guide: `Docs/Local Setup Guide.md`
- Scanner contract: `Docs/Scanner Output Contract.md`
- Public architecture: `Docs/Public Architecture.md`
- Public comms playbook: `Docs/Public Comms Playbook.md`
- Repository structure: `Docs/Project Structure.md`
- Competitive landscape: `Docs/Aperture Competitive Landscape.md`

## Public Project Structure

The repository now includes the first public collaboration scaffold:

- `CONTRIBUTING.md`: contribution posture and PR expectations.
- `SECURITY.md`: local-data and scanner-output security principles.
- `.github/ISSUE_TEMPLATE/`: bug, feature, and scanner-signal issue templates.
- `.github/pull_request_template.md`: review checklist for public PRs.
- `.github/workflows/ci.yml`: build verification for pushes and pull requests.

## Trust Principles

- Local-first: project data stays on the user's machine.
- Read-only by default: observe, compare, explain, and brief before mutating anything.
- Factual before magical: prefer inspectable signals over vague AI-generated judgments.
- Agent-aware, not agent-reckless: MCP should begin as a read-only bridge.
