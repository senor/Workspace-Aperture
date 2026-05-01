# Scanner Output Contract

The scanner writes the first stable Aperture data contract. The dashboard and future read-only MCP bridge should consume this shape instead of inventing separate project models.

The app derives its three product lenses from this contract: Projects, Workspace, and Brief. Fields such as `risks`, `aiReadiness`, `runtimeStatus`, `launchProfile`, and reference comparisons remain factual inputs; the dashboard decides how to group them into lens-specific signals.

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

Each project is discovered below `workspaceRoot` when it contains a known project marker such as `.git`, `package.json`, `go.mod`, `requirements.txt`, `pyproject.toml`, `Cargo.toml`, `pom.xml`, `build.gradle`, or `composer.json`. If `workspaceRoot` itself is a project, the scanner returns that project. Otherwise, it checks direct children first, then unwraps one level of non-project grouping folders so collections like `~/Far Out Quest/Far Out Quest Page` still surface as projects.

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
    },
    "changes": [
      {
        "path": "src/App.jsx",
        "status": "M"
      }
    ],
    "recentCommits": [
      {
        "sha": "...",
        "date": "2026-04-30T08:00:00+02:00",
        "message": "Commit message",
        "refs": ["HEAD -> main", "origin/main"]
      }
    ]
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
  "launchProfile": {
    "framework": "vite",
    "backend": "firebase",
    "auth": "none",
    "database": "firestore",
    "storage": "firebase-storage",
    "payments": "none",
    "aiApis": []
  },
  "runtimeStatus": {
    "state": "running",
    "checkedAt": "2026-04-30T18:00:00+00:00",
    "ports": [
      {
        "port": 5173,
        "url": "http://localhost:5173",
        "pid": 12345,
        "command": "node",
        "address": "127.0.0.1:5173",
        "confidence": "high",
        "source": "listening process cwd"
      }
    ],
    "detail": "Matched listening localhost ports to project process cwd."
  },
  "skippedChecks": [
    {
      "id": "payment_bypass",
      "title": "Payment bypass checks skipped",
      "reason": "No payment provider was detected."
    }
  ],
  "aiReadiness": {
    "score": 80,
    "checks": []
  },
  "risks": [
    {
      "id": "api_route_missing_obvious_auth",
      "severity": "medium",
      "title": "Sensitive handler has no obvious auth check",
      "detail": "A route/function appears to mutate or expose sensitive state, but no common auth check was found in this file.",
      "category": "api",
      "confidence": "low",
      "evidence": ["app/api/update/route.ts"],
      "fix": "Trace shared middleware before changing behavior; if none exists, verify the caller server-side before mutating data."
    }
  ]
}
```

## Field Notes

- `id` is deterministic for a project path and suitable for UI keys.
- `stack`, `package`, `scripts`, `runtime`, `git`, `docs`, `env`, and `ci` are factual scanner observations.
- `git.changes` is a bounded, read-only snapshot from `git status --porcelain`; `status` keeps the porcelain status code and `path` is the current path for renamed files.
- `git.recentCommits` is a bounded, read-only snapshot from local `git log` for compact history and source-signal views.
- `aiReadiness.score` is derived from explicit checklist items, not an opaque health score.
- `launchProfile` is a stack-aware detection summary. It should be treated as a scanner hint, not a full dependency graph.
- `runtimeStatus` is a best-effort snapshot of local listening TCP ports from the last scan. `running` means a listener was matched to the project path through process working-directory evidence; `stopped` means no match was found; `unknown` means the port probe could not run.
- `skippedChecks` explains why Aperture did not run irrelevant checks for a project, such as Supabase RLS checks when Supabase is absent.
- `risks` are local hygiene findings based on observable files, Git commands, and conservative static heuristics.
- `scanErrors` records inaccessible folders or scanner failures without stopping the scan.

## V1 Risk IDs

- `missing_readme`: no README-style file detected.
- `missing_test_script`: no package `test` script detected.
- `missing_env_example`: env files exist without `.env.example`, `.env.sample`, or `env.example`.
- `env_not_ignored`: an env file exists and `git check-ignore` reports it is not ignored.
- `env_ignore_unknown`: an env file exists but ignore status cannot be verified.
- `missing_ci`: no common CI configuration path detected.
- `supabase_service_role_exposed`: service-role credential reference found in likely client-facing code.
- `service_account_json_reference`: service account material or reference found in scanned text.
- `sensitive_browser_storage`: localStorage/sessionStorage appears near sensitive credentials or privilege flags.
- `client_controlled_admin_signal`: admin or role state appears near client-controlled data.
- `firebase_public_write_rules`: Firebase rules appear to allow public writes.
- `firebase_public_read_rules`: Firebase rules appear to allow public reads.
- `api_route_missing_obvious_auth`: an API route/function appears sensitive and no common auth check was found in the same file.

## Discovery Review State

Project lifecycle state is app metadata, not scanner output. The dashboard may persist a local state per scanner project ID:

```ts
projectState: "candidate" | "tracked" | "ignored" | "reference" | "archived" | "sleeping";
```

The scanner remains read-only and factual. The app decides which discovered projects enter the main workspace map.

## API Route Heuristic Limits

API route/function checks are deliberately conservative. They can identify suspicious files where sensitive actions appear without common auth terms in the same file. They cannot prove a route is vulnerable because auth may live in shared middleware, framework config, proxies, or provider rules. Findings should be shown with confidence and file evidence, using language like "no obvious auth check found."

## Contract Rules

- The scanner must stay read-only.
- The output should be deterministic for the same workspace state.
- New fields may be added, but existing V1 fields should not change meaning without a schema version bump.
- Dashboard and MCP code should treat missing or `null` values as unknown, not as failures.
