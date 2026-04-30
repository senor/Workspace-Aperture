# Scanner Output Contract

The scanner writes the first stable Aperture data contract. The dashboard and future read-only MCP bridge should consume this shape instead of inventing separate project models.

## Top-Level Shape

```json
{
  "schemaVersion": "aperture.scan.v1",
  "workspaceRoot": "/absolute/path/to/workspace",
  "projects": [],
  "scanErrors": []
}
```

## Project Shape

Each project is discovered below `workspaceRoot` when it contains a known project marker such as `.git`, `package.json`, `go.mod`, `requirements.txt`, `pyproject.toml`, `Cargo.toml`, `pom.xml`, `build.gradle`, or `composer.json`. The scanner checks direct children first, then unwraps one level of non-project grouping folders so collections like `~/Far Out Quest/Far Out Quest Page` still surface as projects.

Some folders with project markers are implementation components, not workspace projects. For example, a root-level Firebase `functions` source listed by `workspaceRoot/firebase.json` should be treated as part of that Firebase app unless it is its own Git repository.

```json
{
  "id": "stable-project-id",
  "name": "project-folder-name",
  "path": "/absolute/path/to/project",
  "stack": {
    "languages": ["TypeScript"],
    "frameworks": ["React"],
    "tools": ["Git", "Tailwind CSS", "Vite"]
  },
  "package": {
    "manager": "npm",
    "declared": "npm@11.6.2",
    "lockfiles": ["npm"]
  },
  "scripts": {
    "build": "vite build",
    "dev": "vite"
  },
  "runtime": {
    "engines": {},
    "files": {}
  },
  "git": {
    "isRepo": true,
    "branch": "main",
    "dirty": false,
    "lastCommit": {
      "sha": "...",
      "date": "2026-04-30T08:00:00+02:00",
      "message": "Commit message"
    }
  },
  "docs": {
    "files": ["README.md"],
    "hasReadme": true,
    "agentContextFiles": []
  },
  "env": {
    "files": [{ "name": ".env", "ignoredByGit": true }],
    "examples": [".env.example"],
    "hasEnvFiles": true,
    "hasExample": true
  },
  "ci": {
    "present": true,
    "paths": [".github/workflows"]
  },
  "aiReadiness": {
    "score": 80,
    "checks": []
  },
  "risks": []
}
```

## Field Notes

- `id` is deterministic for a project path and suitable for UI keys.
- `stack`, `package`, `scripts`, `runtime`, `git`, `docs`, `env`, and `ci` are factual scanner observations.
- `aiReadiness.score` is derived from explicit checklist items, not an opaque health score.
- `risks` are local hygiene findings based on observable files or Git commands.
- `scanErrors` records inaccessible folders or scanner failures without stopping the scan.

## V1 Risk IDs

- `missing_readme`: no README-style file detected.
- `missing_test_script`: no package `test` script detected.
- `missing_env_example`: env files exist without `.env.example`, `.env.sample`, or `env.example`.
- `env_not_ignored`: an env file exists and `git check-ignore` reports it is not ignored.
- `env_ignore_unknown`: an env file exists but ignore status cannot be verified.
- `missing_ci`: no common CI configuration path detected.

## Contract Rules

- The scanner must stay read-only.
- The output should be deterministic for the same workspace state.
- New fields may be added, but existing V1 fields should not change meaning without a schema version bump.
- Dashboard and MCP code should treat missing or `null` values as unknown, not as failures.
