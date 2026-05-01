# Contributing To Aperture

Thanks for helping shape Aperture. This project is still early, so the best contributions make the product easier to trust: clearer facts, safer local behavior, better scanner evidence, and calmer public communication.

## Project Posture

Aperture is local-first and read-only by default. Contributions should preserve those constraints unless a roadmap item explicitly changes them.

Before opening a pull request, check:

- Does this keep workspace data local by default?
- Does this avoid mutating scanned projects?
- Is every warning or recommendation traceable to scanner data, files, or Git output?
- Does the UI distinguish current behavior from planned behavior?
- Does the change fit the V1 scanner contract or clearly propose a contract addition?

## Development Setup

```bash
npm install
npm run dev
```

Run a production build before larger pull requests:

```bash
npm run build
```

Generate local scanner data:

```bash
python3 scanner.py --root . --output public/projects.json
```

## Pull Request Shape

Prefer small, reviewable pull requests. Good PRs usually include:

- A short problem statement.
- A summary of changed behavior.
- Notes on scanner contract changes, if any.
- Screenshots for meaningful UI changes.
- Verification commands run locally.

## Areas That Need Care

- Scanner changes should stay deterministic and read-only.
- Risk Radar findings should use conservative language and evidence.
- Dashboard copy should avoid implying live connectors, hosted sync, billing, or write-capable MCP before those exist.
- New architecture docs should separate current, V1 target, and future ideas.

