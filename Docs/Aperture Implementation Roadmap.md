# Aperture Implementation Roadmap

This roadmap is the canonical execution plan for Aperture. The PRD explains what and why; this document explains what to build next.

## Current State

Aperture is a proof of concept:

- The repository now has a runnable Vite React app scaffold.
- `src/App.jsx` preserves the original React/Tailwind dashboard prototype with mock data.
- `scanner.py` scans one local folder level and writes a basic `projects.json`.
- There is no real scanner contract, dashboard data integration, database, or MCP server yet.

## Phase 0: Reframe Docs And Product Contract

**Goal:** Make the project direction clear before implementation expands.

**Deliverables:**

- Add root `README.md` as the project entry point.
- Rewrite the PRD around the V1 product pillars.
- Replace the old roadmap with this phased execution plan.
- Align setup and competitive docs with the local workspace observability positioning.

**Acceptance criteria:**

- A contributor can understand the product in under two minutes from `README.md`.
- Docs distinguish current prototype, V1 target, and future/deferred vision.
- Docs do not promise V1 auto-fixes, full SAST, SQLite graph, or write-capable MCP.

## Phase 1: Scaffold A Runnable App

**Status:** Complete.

**Goal:** Turn the dashboard prototype into a real local app shell.

**Deliverables:**

- Create a Vite React app in this repository.
- Install and configure React, Tailwind, and `lucide-react`.
- Move the dashboard into the app entry point without changing core behavior.
- Preserve the current mock data until scanner output is ready.

**Acceptance criteria:**

- `npm install` and `npm run dev` start the dashboard locally.
- The dashboard renders the same core prototype views as today.
- The codebase has a normal app structure and package manifest.

## Phase 2: Define And Upgrade Scanner Output

**Status:** Complete.

**Goal:** Make `projects.json` the first stable data contract.

**Deliverables:**

- Define a documented project scan shape for V1.
- Upgrade `scanner.py` to collect factual signals: path, stack, package manager, Git branch, dirty state, last commit, scripts, docs, env signals, and CI presence.
- Keep the scanner read-only and local.
- Handle inaccessible or non-project folders gracefully.

**Acceptance criteria:**

- Running the scanner produces deterministic JSON for discovered projects.
- Each finding is based on observable files or Git commands.
- Scanner output can support Workspace Map, AI-readiness, Risk Radar, and Drift views.

## Phase 3: Connect Dashboard To Real Data

**Status:** Complete.

**Goal:** Replace mock project data with scanner output.

**Deliverables:**

- Import or fetch generated `projects.json` in the app.
- Keep a small fallback sample dataset for first-run/demo behavior.
- Update cards and details to render the V1 project scan shape.
- Remove or relabel fake-only concepts such as active agents and mock MCP connected status.

**Acceptance criteria:**

- Dashboard renders real scanner output.
- Empty and missing-data states are clear.
- No UI element implies a live MCP connection or mutation capability before those exist.

## Phase 4: Build V1 Product Features

**Status:** Next.

**Goal:** Add the product behaviors that make Aperture useful before MCP.

**Deliverables:**

- Theme switcher: add a compact FOQ-style vibe control for mode, tint, and special themes.
- Workspace Map: project inventory and factual metadata.
- Today's Attention: prioritized notices for recent changes, dirty state, stale projects, missing docs, risks, and drift.
- Reference Project Drift: compare projects against one selected reference project.
- AI-Readiness Checklist: docs, scripts, env example, and setup clarity.
- Risk Radar: local hygiene checks such as env risk, missing example env, missing scripts, and missing CI.
- Project lifecycle labels: active, sleeping, archived, experimental, production, and reference.

**Acceptance criteria:**

- Findings are explainable and traceable to scanner output.
- Drift is advisory and does not mutate projects.
- The primary UI favors facts and checklists over abstract health scores.

## Phase 5: Add Agent Brief Export

**Goal:** Give users compact, reusable context for AI coding agents.

**Deliverables:**

- Generate a project-level agent brief from scanner and dashboard data.
- Include stack, commands, Git state, docs, risks, drift, and suggested files to inspect.
- Provide copy/export behavior from the UI.

**Acceptance criteria:**

- The brief is useful as a prompt preface for Claude, Cursor, Codex, or similar agents.
- The brief is concise and avoids dumping whole source files.
- The brief contains only local facts and clearly labeled recommendations.

## Phase 6: Add Read-Only MCP Bridge

**Goal:** Expose Aperture facts to AI agents through MCP without write access.

**Deliverables:**

- Implement read-only MCP tools for listing projects, summarizing the workspace, showing risks, comparing against the reference project, and generating an agent brief.
- Reuse the scanner output contract rather than inventing a separate data model.
- Document local MCP setup once working.

**Acceptance criteria:**

- MCP tools do not modify files or repositories.
- Agent responses are grounded in scanner data.
- The UI and docs clearly communicate read-only MCP behavior.

## Future Phases

Future work may include SQLite persistence, richer pattern extraction, community recipes, deeper dependency/security integrations, and safe assisted fixes. These should only follow after the read-only local workflow is trustworthy.
