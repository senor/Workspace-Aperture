# Project Structure

This repository should stay easy to scan in public. The codebase has one current product surface, a local dashboard, and one current data producer, the scanner. Future surfaces should be added only when their boundary is clear.

## Current Layout

```text
.
├── .github/
│   ├── ISSUE_TEMPLATE/
│   ├── workflows/
│   └── pull_request_template.md
├── Docs/
│   ├── Aperture Competitive Landscape.md
│   ├── Aperture Implementation Roadmap.md
│   ├── Aperture Project Overseer PRD.md
│   ├── Local Setup Guide.md
│   ├── Project Structure.md
│   ├── Public Architecture.md
│   ├── Public Comms Playbook.md
│   └── Scanner Output Contract.md
├── public/
│   └── projects.json
├── src/
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── scanner.py
├── package.json
└── README.md
```

## Directory Roles

### `.github/`

Public collaboration defaults: issue templates, pull request template, and CI.

### `Docs/`

Canonical product and architecture context. Docs should separate current behavior, V1 target behavior, and deferred ideas.

### `public/`

Static assets served by Vite. `projects.json` is generated scanner output for local development and demos.

### `src/`

React dashboard code. The dashboard should consume scanner data and local app state, not own a separate project truth model.

### `scanner.py`

Read-only local scanner. It owns factual project discovery and writes the `aperture.scan.v1` contract.

## Future Layout Candidates

Add these only when implementation arrives:

```text
src/
├── components/
├── data/
├── features/
├── lib/
└── styles/

mcp/
└── read-only-server/

fixtures/
└── scan-output/
```

Suggested meanings:

- `src/components/`: reusable UI primitives and layout pieces.
- `src/features/`: product views such as workspace map, drift, risk radar, and agent briefs.
- `src/data/`: scanner contract adapters and local app state.
- `src/lib/`: small pure utilities.
- `mcp/read-only-server/`: future MCP implementation that consumes the scanner contract.
- `fixtures/scan-output/`: redacted sample scanner outputs for tests and docs.

## Structure Rules

- Keep scanner contract changes documented in `Docs/Scanner Output Contract.md`.
- Keep generated or private local scan data out of public examples unless redacted.
- Prefer adding feature folders when UI behavior becomes meaningfully separable.
- Avoid adding cloud, auth, billing, or connector directories before those projects have an accepted plan.

