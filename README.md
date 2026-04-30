# Aperture

Aperture is a local-first workspace map for solo and agentic developers. It helps you see what is going on across your local projects, understand where projects are drifting from your preferred patterns, and prepare compact context briefs for AI agents before they touch code.

The V1 product promise is simple: Aperture should calmly tell the truth about your workspace.

It should answer questions like:

- What projects live in this workspace?
- What stacks, package managers, scripts, docs, and Git states do they have?
- Which projects need attention today?
- Which projects drift from my reference project?
- Is this repo ready for an AI coding agent?
- What short brief should I give an agent before work starts?

## Current Status

This repository is currently a proof of concept, not yet a runnable full application.

It contains:

- `ApertureDashboard.jsx`: a React/Tailwind dashboard prototype with mock data.
- `scanner.py`: a read-only local scanner that writes the V1 `aperture.scan.v1` project inventory contract.
- `Docs/`: product, roadmap, setup, and positioning documents.

The repository now includes a runnable Vite React app scaffold. It does not yet include persisted storage or a real MCP server. Those are planned in the roadmap.

## Product Direction

Aperture V1 is centered on five pillars:

1. **Workspace Map**: factual inventory of local projects and their technical surface area.
2. **Today's Attention**: a prioritized view of recent changes, stale projects, risks, and missing context.
3. **Reference Project Drift**: compare projects against a chosen gold-standard project.
4. **AI-Readiness Checklist**: show whether a project has the docs, scripts, and setup clarity an AI agent needs.
5. **Agent Brief Export**: generate compact project context for Claude, Cursor, Codex, or an MCP client.

Aperture should favor explainable facts over abstract health scores. Scores may come later, but V1 should first build trust with concrete signals: stack, package manager, Git branch, dirty state, last commit, scripts, docs, env risk, and CI presence.

## Run The App

First-run path: scan a local folder. GitHub and GitLab connectors are planned, not implemented.


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

## How The Prototype Works

The current prototype has two pieces:

1. The Vite app renders the preserved React dashboard from `src/App.jsx` using mock data.
2. `scanner.py` can scan a local development folder and generate `public/projects.json` using the documented scanner contract. The dashboard loads that file automatically when present.

The dashboard fetches `/projects.json` at runtime and falls back to demo data when no generated scanner output exists.

## Canonical Docs

- Product strategy: `Docs/Aperture Project Overseer PRD.md`
- Execution roadmap: `Docs/Aperture Implementation Roadmap.md`
- Local setup guide: `Docs/Local Setup Guide.md`
- Scanner contract: `Docs/Scanner Output Contract.md`
- Competitive landscape: `Docs/Aperture Competitive Landscape.md`

## Trust Principles

- Local-first: project data stays on the user's machine.
- Read-only by default: observe, compare, explain, and brief before mutating anything.
- Factual before magical: prefer inspectable signals over vague AI-generated judgments.
- Agent-aware, not agent-reckless: MCP should begin as a read-only bridge.
