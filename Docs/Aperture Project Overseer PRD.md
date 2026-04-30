# Aperture Product Strategy

## Product Promise

Aperture is a local-first workspace map for solo and agentic developers. It gives builders a factual view of their project fleet, highlights drift from trusted reference patterns, and produces compact context briefs for AI agents.

The product should feel like a living map of a code workshop: quiet, useful, local, and trustworthy.

## Theme Switcher

Aperture should include a compact FOQ-style theme switcher early: a default vibe, light/dark mode, tint dots, and a small set of special themes. The control should live in the application chrome and persist locally.

Theme choices should keep Aperture calm and operational. Color should clarify state and hierarchy, not become a novelty skin. The goal is a workspace that feels alive without feeling loud.

## Audience

- **Solo builders** managing many active, sleeping, experimental, and production projects.
- **Agentic developers** using tools like Claude, Cursor, Codex, or other coding agents that need concise workspace context.
- **Architectural orchestrators** who want their projects to follow consistent conventions without maintaining an enterprise developer portal.

## Core Problems

- **Context fragmentation**: the user forgets which project uses which stack, package manager, scripts, docs, and deployment assumptions.
- **Pattern drift**: similar projects solve auth, linting, testing, env management, or documentation differently without intent.
- **Agentic isolation**: coding agents start from the currently opened repo and miss useful workspace-level patterns.
- **Invisible local risk**: stale projects, dirty worktrees, env files, missing docs, and absent scripts hide until they become expensive.

## V1 Feature Pillars

### 1. Workspace Map

Aperture should inventory local projects and show factual project state:

- Detected stack and frameworks.
- Package manager and language/runtime hints.
- Git branch, dirty state, and last commit date.
- Available scripts such as test, lint, build, and dev.
- Documentation and setup files.
- CI and environment-file signals.

### 2. Today's Attention

Aperture should prioritize what is worth noticing now:

- Recently changed projects.
- Stale projects that may need review.
- Dirty worktrees.
- Missing setup or agent context files.
- Risk radar findings.
- New drift from the reference project.

This view should be factual and explainable, not a vague alarm feed.

### 3. Reference Project Drift

The user should be able to mark one project as a reference project. Aperture should compare other projects against that reference and surface drift such as:

- Package manager mismatch.
- Runtime or framework version mismatch.
- Missing scripts present in the reference.
- Missing docs or agent context files.
- Different lint/test/CI conventions.
- Environment hygiene differences.

V1 drift is advisory. The product should support triage language such as intentional, ignored, unresolved, or recommended, but should not auto-change code.

### 4. AI-Readiness Checklist

Aperture should show whether a project is legible to an AI coding agent:

- Has a README or setup guide.
- Has an agent context file such as `AGENTS.md`, `CLAUDE.md`, or `ARCHITECTURE.md`.
- Has test, lint, build, and dev commands where applicable.
- Has `.env.example` or equivalent setup hints.
- Has clear package/runtime indicators.

The checklist should make missing context obvious before an agent starts work.

### 5. Agent Brief Export

For any project, Aperture should generate a compact brief containing:

- Project name and path.
- Detected stack and package manager.
- Useful commands.
- Recent activity and Git state.
- AI-readiness status.
- Risk radar findings.
- Relevant drift from the reference project.
- Suggested files for an agent to inspect first.

The brief should be copyable/exportable in V1 and exposed through MCP later.

## Risk Radar

Aperture should not try to replace Snyk, SonarQube, Trivy, or full SAST tools. V1 risk radar should focus on local developer hygiene:

- `.env` exists but is not ignored.
- `.env.example` is missing when env files exist.
- Key-looking files or obvious secret-looking strings are present.
- CI is missing from projects that appear production-like.
- Test or lint scripts are absent.

Risk items must be explainable and traceable to files or observable metadata.

## Deferred Features

The following are intentionally out of scope for V1:

- Automatic code mutation or auto-fixes.
- “Commit Changes” or “Sync” actions that modify repositories.
- Full SAST or vulnerability scanning.
- Complex AST pattern extraction.
- SQLite knowledge graph.
- Multi-agent orchestration.
- MCP tools that write to disk.
- Abstract health scores as the primary interface.

These ideas may return after Aperture earns trust as a read-only observer.

## Trust Principles

- **Local-first**: no workspace data leaves the user machine by default.
- **Read-only first**: observe, compare, explain, and brief before mutating anything.
- **Facts before scores**: show concrete signals before derived ratings.
- **Explainable findings**: every warning should tell the user why it exists.
- **Agent-safe context**: MCP begins as a read-only interface for facts and briefs.

## Success Criteria

Aperture V1 is successful when a new user can point it at a workspace and quickly understand:

- What projects exist.
- Which projects changed recently.
- Which projects need attention.
- Which projects drift from a chosen reference.
- Which projects are ready for AI-assisted work.
- What context an agent should receive before starting.
