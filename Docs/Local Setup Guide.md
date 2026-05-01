# Aperture Local Setup Guide

Aperture has a runnable Vite React dashboard and a read-only local scanner. The dashboard loads generated scanner output from `public/projects.json` when that file exists, then falls back to demo data for first-run exploration.

## Requirements

- Node.js and npm.
- Python 3 if you want to run the scanner.

## Install Dependencies

From the repository root:

```bash
npm install
```

## Run The Dashboard

Start the local development server:

```bash
npm run dev
```

Then open the local Vite URL printed in your terminal. The dashboard currently renders the preserved prototype UI from `src/App.jsx`.
Generate scanner output first if you want to see your real workspace instead of demo data.

## Build The App

To verify the production build:

```bash
npm run build
```

The build output is written to `dist/`, which is ignored by Git.

## First-Run Choices

The dashboard starts with a concise empty state when no `public/projects.json` exists. The current usable path is **Add local folder** by running the scanner. GitHub and GitLab are shown as planned connector paths, but they are not implemented yet.

## Run The Scanner

The scanner writes the V1 `aperture.scan.v1` contract, and the dashboard loads it from `public/projects.json` when present.

Run the scanner against the folder where your projects live, such as `~/dev` or `~/src`:

```bash
python3 scanner.py --root ~/dev --output public/projects.json
```

You can also set `APERTURE_SEARCH_PATH` and omit `--root`:

```bash
APERTURE_SEARCH_PATH=~/src python3 scanner.py
```

The scanner detects project markers such as `.git`, `package.json`, `go.mod`, `requirements.txt`, `pyproject.toml`, `Cargo.toml`, `pom.xml`, `build.gradle`, and `composer.json`. It collects stack, package manager, scripts, runtime hints, Git state, docs, env signals, CI presence, AI-readiness checks, and local hygiene risks.

## Current Data Connection Status

The dashboard fetches `/projects.json` at runtime. In local development, generate that file at `public/projects.json`. If the file is missing, the dashboard falls back to demo data.

Current flow:

1. Run the scanner.
2. Generate `public/projects.json`.
3. Start or refresh the dashboard.
4. Review the Projects, Workspace, and Brief lenses from factual scanner output.

## Next Engineering Step

Follow Phase 4 in `Docs/Aperture Implementation Roadmap.md`: deepen the three V1 lenses, especially reference differences, lifecycle labels, richer hygiene signals, and agent briefs.
