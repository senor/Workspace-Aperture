#!/usr/bin/env python3
"""Read-only workspace scanner for Aperture.

The scanner walks one level below a workspace root, identifies project folders,
and writes a deterministic JSON inventory that the dashboard and future MCP
bridge can consume.
"""

import argparse
import hashlib
import json
import os
import subprocess
from pathlib import Path
from typing import Any, Optional

SCHEMA_VERSION = "aperture.scan.v1"
DEFAULT_SEARCH_PATH = os.path.expanduser(os.environ.get("APERTURE_SEARCH_PATH", "~/dev"))
DEFAULT_OUTPUT_FILE = "projects.json"
PROJECT_MARKERS = {
    ".git",
    "package.json",
    "go.mod",
    "requirements.txt",
    "pyproject.toml",
    "Cargo.toml",
    "pom.xml",
    "build.gradle",
    "composer.json",
}
DOC_FILES = [
    "README.md",
    "README.mdx",
    "AGENTS.md",
    "CLAUDE.md",
    "ARCHITECTURE.md",
    "CONTRIBUTING.md",
]
ENV_EXAMPLE_FILES = [".env.example", ".env.sample", "env.example"]
CI_PATHS = [".github/workflows", ".gitlab-ci.yml", "circle.yml", ".circleci/config.yml", "azure-pipelines.yml"]
LOCKFILES = [
    ("pnpm-lock.yaml", "pnpm"),
    ("yarn.lock", "yarn"),
    ("package-lock.json", "npm"),
    ("bun.lockb", "bun"),
    ("bun.lock", "bun"),
]


def read_json(path: Path) -> dict[str, Any]:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {}


def run_command(path: Path, command: list[str]) -> tuple[int, str]:
    try:
        result = subprocess.run(
            command,
            cwd=path,
            check=False,
            capture_output=True,
            text=True,
            timeout=5,
        )
        return result.returncode, result.stdout.strip()
    except (OSError, subprocess.SubprocessError):
        return 1, ""


def stable_id(path: Path) -> str:
    digest = hashlib.sha1(str(path.resolve()).encode("utf-8")).hexdigest()[:10]
    slug = path.name.lower().replace(" ", "-")
    return f"{slug}-{digest}"


def list_names(path: Path) -> set[str]:
    try:
        return {item.name for item in path.iterdir()}
    except OSError:
        return set()


def is_project(path: Path) -> bool:
    names = list_names(path)
    return any(marker in names for marker in PROJECT_MARKERS)


def firebase_component_paths(root: Path) -> set[Path]:
    """Return root-level Firebase component folders that are not standalone projects."""
    firebase_json = read_json(root / "firebase.json")
    functions = firebase_json.get("functions")
    entries = functions if isinstance(functions, list) else [functions] if isinstance(functions, dict) else []
    paths: set[Path] = set()
    for entry in entries:
        if not isinstance(entry, dict):
            continue
        source = entry.get("source")
        if not isinstance(source, str) or not source:
            continue
        source_path = (root / source).resolve()
        try:
            source_path.relative_to(root.resolve())
        except ValueError:
            continue
        paths.add(source_path)
    return paths


def detect_package_manager(path: Path, package_json: dict[str, Any]) -> dict[str, Any]:
    declared = package_json.get("packageManager") if isinstance(package_json.get("packageManager"), str) else None
    lockfile_matches = [manager for filename, manager in LOCKFILES if (path / filename).exists()]

    inferred = None
    if declared and "@" in declared:
        inferred = declared.split("@", 1)[0]
    elif declared:
        inferred = declared
    elif lockfile_matches:
        inferred = lockfile_matches[0]

    return {
        "manager": inferred,
        "declared": declared,
        "lockfiles": lockfile_matches,
    }


def collect_stack(path: Path, package_json: dict[str, Any]) -> dict[str, list[str]]:
    names = list_names(path)
    languages: set[str] = set()
    frameworks: set[str] = set()
    tools: set[str] = set()

    dependencies = {}
    for key in ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"]:
        value = package_json.get(key)
        if isinstance(value, dict):
            dependencies.update(value)

    if "package.json" in names:
        languages.add("JavaScript")
        if "typescript" in dependencies or "tsconfig.json" in names:
            languages.add("TypeScript")
        if "react" in dependencies:
            frameworks.add("React")
        if "next" in dependencies:
            frameworks.add("Next.js")
        if "vite" in dependencies:
            tools.add("Vite")
        if "tailwindcss" in dependencies or "tailwind.config.js" in names or "tailwind.config.ts" in names:
            tools.add("Tailwind CSS")
        if "prisma" in dependencies or "@prisma/client" in dependencies or "prisma" in names:
            tools.add("Prisma")

    if "go.mod" in names:
        languages.add("Go")
    if "requirements.txt" in names or "pyproject.toml" in names:
        languages.add("Python")
    if "Cargo.toml" in names:
        languages.add("Rust")
    if "pom.xml" in names or "build.gradle" in names:
        languages.add("Java")
    if "composer.json" in names:
        languages.add("PHP")
    if ".git" in names:
        tools.add("Git")

    return {
        "languages": sorted(languages),
        "frameworks": sorted(frameworks),
        "tools": sorted(tools),
    }


def collect_scripts(package_json: dict[str, Any]) -> dict[str, str]:
    scripts = package_json.get("scripts")
    if not isinstance(scripts, dict):
        return {}
    return {str(key): str(scripts[key]) for key in sorted(scripts)}


def collect_git(path: Path) -> dict[str, Any]:
    if not (path / ".git").exists():
        return {
            "isRepo": False,
            "branch": None,
            "dirty": None,
            "lastCommit": None,
        }

    _, branch = run_command(path, ["git", "branch", "--show-current"])
    status_code, status = run_command(path, ["git", "status", "--porcelain"])
    commit_code, commit = run_command(path, ["git", "log", "-1", "--pretty=format:%H%x1f%cI%x1f%s"])

    last_commit = None
    if commit_code == 0 and commit:
        parts = commit.split("\x1f", 2)
        if len(parts) == 3:
            last_commit = {
                "sha": parts[0],
                "date": parts[1],
                "message": parts[2],
            }

    return {
        "isRepo": True,
        "branch": branch or None,
        "dirty": bool(status) if status_code == 0 else None,
        "lastCommit": last_commit,
    }


def collect_docs(path: Path) -> dict[str, Any]:
    present = [filename for filename in DOC_FILES if (path / filename).exists()]
    agent_context = [filename for filename in ["AGENTS.md", "CLAUDE.md", "ARCHITECTURE.md"] if (path / filename).exists()]
    return {
        "files": present,
        "hasReadme": any(filename.startswith("README") for filename in present),
        "agentContextFiles": agent_context,
    }


def is_git_ignored(path: Path, filename: str) -> Optional[bool]:
    if not (path / ".git").exists():
        return None
    code, _ = run_command(path, ["git", "check-ignore", "--quiet", filename])
    if code == 0:
        return True
    if code == 1:
        return False
    return None


def collect_env(path: Path) -> dict[str, Any]:
    env_files = sorted(
        item.name
        for item in path.iterdir()
        if item.is_file()
        and item.name.startswith(".env")
        and item.name not in ENV_EXAMPLE_FILES
    )
    examples = [filename for filename in ENV_EXAMPLE_FILES if (path / filename).exists()]
    files = [
        {
            "name": filename,
            "ignoredByGit": is_git_ignored(path, filename),
        }
        for filename in env_files
    ]
    return {
        "files": files,
        "examples": examples,
        "hasEnvFiles": bool(files),
        "hasExample": bool(examples),
    }


def collect_ci(path: Path) -> dict[str, Any]:
    present = [ci_path for ci_path in CI_PATHS if (path / ci_path).exists()]
    return {
        "present": bool(present),
        "paths": present,
    }


def collect_runtime(path: Path, package_json: dict[str, Any]) -> dict[str, Any]:
    engines = package_json.get("engines") if isinstance(package_json.get("engines"), dict) else {}
    files = {}
    for filename in [".nvmrc", ".node-version", ".python-version", "go.mod", "rust-toolchain"]:
        file_path = path / filename
        if file_path.exists() and file_path.is_file():
            try:
                files[filename] = file_path.read_text(encoding="utf-8").strip().splitlines()[0]
            except (OSError, IndexError):
                files[filename] = ""
    return {
        "engines": engines,
        "files": files,
    }


def collect_ai_readiness(docs: dict[str, Any], scripts: dict[str, str], env: dict[str, Any]) -> dict[str, Any]:
    checks = [
        {
            "id": "readme",
            "label": "README present",
            "passed": docs["hasReadme"],
            "evidence": docs["files"],
        },
        {
            "id": "agent_context",
            "label": "Agent context present",
            "passed": bool(docs["agentContextFiles"]),
            "evidence": docs["agentContextFiles"],
        },
        {
            "id": "test_script",
            "label": "Test command present",
            "passed": "test" in scripts,
            "evidence": scripts.get("test"),
        },
        {
            "id": "lint_script",
            "label": "Lint command present",
            "passed": "lint" in scripts,
            "evidence": scripts.get("lint"),
        },
        {
            "id": "env_example",
            "label": "Environment example present when env files exist",
            "passed": (not env["hasEnvFiles"]) or env["hasExample"],
            "evidence": env["examples"],
        },
    ]
    passed = sum(1 for check in checks if check["passed"])
    return {
        "score": round((passed / len(checks)) * 100),
        "checks": checks,
    }


def collect_risks(docs: dict[str, Any], scripts: dict[str, str], env: dict[str, Any], ci: dict[str, Any]) -> list[dict[str, Any]]:
    risks: list[dict[str, Any]] = []

    if not docs["hasReadme"]:
        risks.append({
            "id": "missing_readme",
            "severity": "medium",
            "title": "README missing",
            "detail": "Project has no README file for setup or orientation.",
        })

    if "test" not in scripts:
        risks.append({
            "id": "missing_test_script",
            "severity": "medium",
            "title": "Test script missing",
            "detail": "No package test script was detected.",
        })

    if env["hasEnvFiles"] and not env["hasExample"]:
        risks.append({
            "id": "missing_env_example",
            "severity": "medium",
            "title": "Environment example missing",
            "detail": "Env files exist, but no .env.example or equivalent was detected.",
        })

    for env_file in env["files"]:
        if env_file["ignoredByGit"] is False:
            risks.append({
                "id": "env_not_ignored",
                "severity": "high",
                "title": "Env file is not ignored by Git",
                "detail": f"{env_file['name']} is present and git check-ignore did not mark it ignored.",
            })
        elif env_file["ignoredByGit"] is None:
            risks.append({
                "id": "env_ignore_unknown",
                "severity": "low",
                "title": "Env ignore status unknown",
                "detail": f"{env_file['name']} is present, but ignore status could not be verified.",
            })

    if not ci["present"]:
        risks.append({
            "id": "missing_ci",
            "severity": "low",
            "title": "CI config missing",
            "detail": "No common CI configuration path was detected.",
        })

    return risks


def scan_project(path: Path) -> dict[str, Any]:
    package_json = read_json(path / "package.json") if (path / "package.json").exists() else {}
    scripts = collect_scripts(package_json)
    docs = collect_docs(path)
    env = collect_env(path)
    ci = collect_ci(path)
    git = collect_git(path)

    return {
        "id": stable_id(path),
        "name": path.name,
        "path": str(path.resolve()),
        "stack": collect_stack(path, package_json),
        "package": detect_package_manager(path, package_json),
        "scripts": scripts,
        "runtime": collect_runtime(path, package_json),
        "git": git,
        "docs": docs,
        "env": env,
        "ci": ci,
        "aiReadiness": collect_ai_readiness(docs, scripts, env),
        "risks": collect_risks(docs, scripts, env, ci),
    }


def scan_workspace(root: Path) -> dict[str, Any]:
    projects: list[dict[str, Any]] = []
    errors: list[dict[str, str]] = []
    excluded_component_paths = firebase_component_paths(root)

    try:
        children = sorted(root.iterdir(), key=lambda item: item.name.lower())
    except OSError as error:
        return {
            "schemaVersion": SCHEMA_VERSION,
            "workspaceRoot": str(root.resolve()),
            "projects": [],
            "scanErrors": [{"path": str(root), "message": str(error)}],
        }

    for child in children:
        if not child.is_dir() or child.name.startswith("."):
            continue
        try:
            if child.resolve() in excluded_component_paths and not (child / ".git").exists():
                continue
            if is_project(child):
                projects.append(scan_project(child))
        except OSError as error:
            errors.append({"path": str(child.resolve()), "message": str(error)})

    return {
        "schemaVersion": SCHEMA_VERSION,
        "workspaceRoot": str(root.resolve()),
        "projects": projects,
        "scanErrors": errors,
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Scan a local workspace for Aperture project facts.")
    parser.add_argument("--root", default=DEFAULT_SEARCH_PATH, help="Workspace root to scan. Defaults to APERTURE_SEARCH_PATH or ~/dev.")
    parser.add_argument("--output", default=DEFAULT_OUTPUT_FILE, help="JSON output path. Defaults to projects.json.")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    root = Path(args.root).expanduser()
    output = Path(args.output).expanduser()
    results = scan_workspace(root)

    output.write_text(json.dumps(results, indent=2, sort_keys=False) + "\n", encoding="utf-8")

    project_count = len(results["projects"])
    error_count = len(results["scanErrors"])
    print(f"Scanned {results['workspaceRoot']}")
    print(f"Found {project_count} project{'s' if project_count != 1 else ''}.")
    if error_count:
        print(f"Recorded {error_count} scan error{'s' if error_count != 1 else ''}.")
    print(f"Data saved to {output}")


if __name__ == "__main__":
    main()
