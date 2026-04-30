#!/usr/bin/env python3
"""Read-only workspace scanner for Aperture.

The scanner walks a workspace root, unwraps one level of non-project grouping
folders, identifies project folders, and writes a deterministic JSON inventory
that the dashboard and future MCP bridge can consume.
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
SCAN_EXCLUDED_DIRS = {
    ".git",
    ".next",
    ".turbo",
    ".vercel",
    "build",
    "coverage",
    "dist",
    "node_modules",
    "out",
}
TEXT_EXTENSIONS = {
    ".cjs",
    ".css",
    ".env",
    ".go",
    ".html",
    ".js",
    ".json",
    ".jsx",
    ".mjs",
    ".py",
    ".rules",
    ".sql",
    ".toml",
    ".ts",
    ".tsx",
    ".yaml",
    ".yml",
}
SENSITIVE_ROUTE_WORDS = [
    "admin",
    "delete",
    "insert",
    "isadmin",
    "ownerid",
    "payment_status",
    "plan",
    "role",
    "setdoc",
    "stripe",
    "update",
    "userid",
    ".add(",
    ".delete(",
    ".insert(",
    ".set(",
    ".update(",
]
AUTH_CHECK_WORDS = [
    "auth()",
    "context.auth",
    "currentuser",
    "getauth",
    "getserversession",
    "getuser",
    "jsonwebtoken",
    "requireauth",
    "session",
    "supabase.auth",
    "verifyidtoken",
    "verifytoken",
]


def read_json(path: Path) -> dict[str, Any]:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {}


def relative_path(root: Path, path: Path) -> str:
    try:
        return str(path.relative_to(root))
    except ValueError:
        return str(path)


def dependencies_from_package(package_json: dict[str, Any]) -> dict[str, str]:
    dependencies: dict[str, str] = {}
    for key in ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"]:
        value = package_json.get(key)
        if isinstance(value, dict):
            dependencies.update({str(name): str(version) for name, version in value.items()})
    return dependencies


def collect_text_files(path: Path, max_files: int = 220) -> list[tuple[Path, str]]:
    files: list[tuple[Path, str]] = []
    try:
        walker = path.rglob("*")
        for item in walker:
            if len(files) >= max_files:
                break
            if any(part in SCAN_EXCLUDED_DIRS for part in item.parts):
                continue
            if not item.is_file():
                continue
            if item.suffix not in TEXT_EXTENSIONS and item.name not in ["firebase.json", "supabase.toml"]:
                continue
            try:
                content = item.read_text(encoding="utf-8", errors="ignore")
            except OSError:
                continue
            if item.name == "scanner.py" and "def collect_launch_profile" in content and "def collect_launch_risks" in content:
                continue
            files.append((item, content[:160_000]))
    except OSError:
        return files
    return files


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


def visible_directories(path: Path) -> list[Path]:
    try:
        return sorted(
            (item for item in path.iterdir() if item.is_dir() and not item.name.startswith(".")),
            key=lambda item: item.name.lower(),
        )
    except OSError:
        return []


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


def should_skip_component(path: Path, excluded_component_paths: set[Path]) -> bool:
    return path.resolve() in excluded_component_paths and not (path / ".git").exists()


def discover_project_paths(root: Path) -> tuple[list[Path], list[dict[str, str]]]:
    projects: list[Path] = []
    errors: list[dict[str, str]] = []
    seen: set[Path] = set()
    root_excluded_component_paths = firebase_component_paths(root)

    def add_project(path: Path) -> None:
        resolved = path.resolve()
        if resolved in seen:
            return
        seen.add(resolved)
        projects.append(path)

    for child in visible_directories(root):
        try:
            if should_skip_component(child, root_excluded_component_paths):
                continue
            if is_project(child):
                add_project(child)
                continue

            nested_excluded_component_paths = firebase_component_paths(child)
            for nested in visible_directories(child):
                if should_skip_component(nested, nested_excluded_component_paths):
                    continue
                if is_project(nested):
                    add_project(nested)
        except OSError as error:
            errors.append({"path": str(child.resolve()), "message": str(error)})

    return sorted(projects, key=lambda item: str(item.resolve()).lower()), errors


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

    dependencies = dependencies_from_package(package_json)

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


def collect_launch_profile(path: Path, package_json: dict[str, Any], text_files: list[tuple[Path, str]]) -> dict[str, Any]:
    names = list_names(path)
    dependencies = dependencies_from_package(package_json)
    dependency_names = set(dependencies)
    combined = "\n".join(content.lower() for _, content in text_files)

    framework = "unknown"
    if "next" in dependency_names or any(name.startswith("next.config.") for name in names):
        framework = "next"
    elif "vite" in dependency_names or any(name.startswith("vite.config.") for name in names):
        framework = "vite"
    elif "react" in dependency_names:
        framework = "react"

    has_firebase = (
        "firebase" in dependency_names
        or "firebase-admin" in dependency_names
        or "firebase.json" in names
        or "firestore.rules" in names
        or "storage.rules" in names
        or "firebase/" in combined
    )
    has_supabase = (
        "@supabase/supabase-js" in dependency_names
        or "supabase" in names
        or "supabase_url" in combined
        or "supabase.auth" in combined
    )
    has_custom_api = (
        "express" in dependency_names
        or "fastify" in dependency_names
        or any("/api/" in relative_path(path, file_path).replace("\\", "/") for file_path, _ in text_files)
        or any(part in names for part in ["api", "server", "routes"])
    )

    if has_firebase:
        backend = "firebase"
    elif has_supabase:
        backend = "supabase"
    elif has_custom_api:
        backend = "custom"
    else:
        backend = "none" if package_json else "unknown"

    if "firebase/auth" in combined or "getauth" in combined:
        auth = "firebase"
    elif has_supabase and "supabase.auth" in combined:
        auth = "supabase"
    elif "@clerk/" in combined or any(name.startswith("@clerk/") for name in dependency_names):
        auth = "clerk"
    elif "auth0" in combined or any("auth0" in name for name in dependency_names):
        auth = "auth0"
    else:
        auth = "none" if backend in ["firebase", "supabase", "custom", "none"] else "unknown"

    if "firestore" in combined or "firestore.rules" in names:
        database = "firestore"
    elif has_supabase:
        database = "supabase-postgres"
    elif any(name in dependency_names for name in ["@prisma/client", "mongoose", "pg", "mysql2"]):
        database = "custom"
    else:
        database = "none" if backend in ["none", "custom"] else "unknown"

    if "firebase/storage" in combined or "storage.rules" in names:
        storage = "firebase-storage"
    elif "supabase.storage" in combined:
        storage = "supabase-storage"
    elif "@aws-sdk/client-s3" in dependency_names or "aws_s3_bucket" in combined or "s3_bucket" in combined:
        storage = "s3"
    else:
        storage = "none"

    if "stripe" in dependency_names or "stripe_" in combined or "stripe." in combined:
        payments = "stripe"
    elif "lemonsqueezy" in combined or "lemon_squeezy" in combined:
        payments = "lemonsqueezy"
    else:
        payments = "none"

    ai_apis: set[str] = set()
    if "openai" in dependency_names or "openai_api_key" in combined:
        ai_apis.add("OpenAI")
    if "@google/generative-ai" in dependency_names or "gemini_api_key" in combined:
        ai_apis.add("Gemini")
    if "@anthropic-ai/sdk" in dependency_names or "anthropic_api_key" in combined:
        ai_apis.add("Anthropic")

    return {
        "framework": framework,
        "backend": backend,
        "auth": auth,
        "database": database,
        "storage": storage,
        "payments": payments,
        "aiApis": sorted(ai_apis),
    }


def launch_risk(
    risk_id: str,
    severity: str,
    title: str,
    detail: str,
    category: str,
    confidence: str,
    evidence: list[str],
    fix: str,
) -> dict[str, Any]:
    return {
        "id": risk_id,
        "severity": severity,
        "title": title,
        "detail": detail,
        "category": category,
        "confidence": confidence,
        "evidence": evidence,
        "fix": fix,
    }


def collect_launch_risks(path: Path, launch_profile: dict[str, Any], text_files: list[tuple[Path, str]]) -> list[dict[str, Any]]:
    risks: list[dict[str, Any]] = []

    for file_path, content in text_files:
        rel = relative_path(path, file_path)
        normalized_path = rel.replace("\\", "/").lower()
        lowered = content.lower()

        if "supabase_service_role" in lowered or "service_role_key" in lowered or "service_role=" in lowered or "service_role:" in lowered:
            is_client_file = normalized_path.startswith(("src/", "app/", "pages/", "components/"))
            risks.append(launch_risk(
                "supabase_service_role_exposed" if is_client_file else "supabase_service_role_present",
                "critical" if is_client_file else "high",
                "Supabase service role key reference found",
                "A service-role credential can bypass row-level security and should only live in server-only environments.",
                "secrets",
                "high" if is_client_file else "medium",
                [rel],
                "Move service-role usage into a server-only function and expose only the anon key to browser code.",
            ))

        if "private_key" in lowered and ("service_account" in lowered or "firebase-adminsdk" in lowered):
            risks.append(launch_risk(
                "service_account_json_reference",
                "critical",
                "Service account credential reference found",
                "Service account material is highly privileged and should not be committed or bundled.",
                "secrets",
                "high",
                [rel],
                "Store service account credentials in deployment secrets and keep only a documented env example in the repo.",
            ))

        storage_lines = [line.lower().replace(" ", "") for line in content.splitlines() if "localstorage" in line.lower() or "sessionstorage" in line.lower()]
        if storage_lines:
            sensitive_terms = [
                term
                for term in ["apikey", "api_key", "secret", "token", "isadmin", "role", "plan"]
                if any(term in line for line in storage_lines)
            ]
            if sensitive_terms:
                risks.append(launch_risk(
                    "sensitive_browser_storage",
                    "medium",
                    "Sensitive browser storage pattern",
                    f"Browser storage appears to handle sensitive flags or credentials: {', '.join(sorted(set(sensitive_terms)))}.",
                    "frontend",
                    "medium",
                    [rel],
                    "Keep credentials and privileged role/entitlement decisions server-side; store only non-sensitive UI preferences in browser storage.",
                ))

        if ("isadmin" in lowered or "admin" in lowered) and any(term in lowered for term in ["localstorage", "sessionstorage", "request.body", "body.", "metadata"]):
            risks.append(launch_risk(
                "client_controlled_admin_signal",
                "medium",
                "Admin or role signal may be client-controlled",
                "The file references admin/role state near browser storage or request body data.",
                "auth",
                "low",
                [rel],
                "Verify roles on the server or in database rules, and avoid trusting client-provided admin flags.",
            ))

        if file_path.name in ["firestore.rules", "storage.rules"] or normalized_path.endswith(".rules"):
            compact = " ".join(lowered.split())
            if "allow read, write: if true" in compact or "allow write: if true" in compact:
                risks.append(launch_risk(
                    "firebase_public_write_rules",
                    "high",
                    "Firebase rules allow public writes",
                    "Rules appear to allow unauthenticated writes, which can expose the project to spam, overwrite, or quota abuse.",
                    "database" if "firestore" in file_path.name else "storage",
                    "high",
                    [rel],
                    "Require authenticated or narrowly scoped writes, and add collection/bucket-specific validation rules.",
                ))
            elif "allow read: if true" in compact:
                risks.append(launch_risk(
                    "firebase_public_read_rules",
                    "medium",
                    "Firebase rules allow public reads",
                    "Public reads may be intentional, but sensitive collections or files should be protected explicitly.",
                    "database" if "firestore" in file_path.name else "storage",
                    "medium",
                    [rel],
                    "Confirm this data is meant to be public; otherwise require auth or owner checks in rules.",
                ))

        is_api_route = (
            "/api/" in normalized_path
            or normalized_path.startswith("functions/src/")
            or normalized_path.startswith("supabase/functions/")
            or normalized_path.startswith("server/")
            or normalized_path.startswith("routes/")
        )
        if is_api_route:
            has_sensitive_action = any(word in lowered.replace(" ", "") for word in SENSITIVE_ROUTE_WORDS)
            has_auth_check = any(word in lowered.replace(" ", "") for word in AUTH_CHECK_WORDS)
            if has_sensitive_action and not has_auth_check:
                risks.append(launch_risk(
                    "api_route_missing_obvious_auth",
                    "medium",
                    "Sensitive handler has no obvious auth check",
                    "A route/function appears to mutate or expose sensitive state, but no common auth check was found in this file.",
                    "api",
                    "low",
                    [rel],
                    "Trace shared middleware before changing behavior; if none exists, verify the caller server-side before mutating data.",
                ))

    return risks


def collect_skipped_checks(launch_profile: dict[str, Any]) -> list[dict[str, str]]:
    skipped: list[dict[str, str]] = []
    if launch_profile.get("backend") != "supabase":
        skipped.append({
            "id": "supabase_rls",
            "title": "Supabase RLS checks skipped",
            "reason": "Supabase was not detected in this project.",
        })
    if launch_profile.get("backend") != "firebase":
        skipped.append({
            "id": "firebase_rules",
            "title": "Firebase rules checks skipped",
            "reason": "Firebase was not detected in this project.",
        })
    if launch_profile.get("auth") == "none":
        skipped.append({
            "id": "user_isolation",
            "title": "User isolation checks skipped",
            "reason": "No auth provider was detected, so Aperture focused on public data and abuse risks.",
        })
    if launch_profile.get("payments") == "none":
        skipped.append({
            "id": "payment_bypass",
            "title": "Payment bypass checks skipped",
            "reason": "No payment provider was detected.",
        })
    if not launch_profile.get("aiApis"):
        skipped.append({
            "id": "ai_api_proxying",
            "title": "AI API proxy checks skipped",
            "reason": "No OpenAI, Gemini, or Anthropic API surface was detected.",
        })
    return skipped


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
            "category": "setup",
        })

    if "test" not in scripts:
        risks.append({
            "id": "missing_test_script",
            "severity": "medium",
            "title": "Test script missing",
            "detail": "No package test script was detected.",
            "category": "setup",
        })

    if env["hasEnvFiles"] and not env["hasExample"]:
        risks.append({
            "id": "missing_env_example",
            "severity": "medium",
            "title": "Environment example missing",
            "detail": "Env files exist, but no .env.example or equivalent was detected.",
            "category": "setup",
        })

    for env_file in env["files"]:
        if env_file["ignoredByGit"] is False:
            risks.append({
                "id": "env_not_ignored",
                "severity": "high",
                "title": "Env file is not ignored by Git",
                "detail": f"{env_file['name']} is present and git check-ignore did not mark it ignored.",
                "category": "secrets",
            })
        elif env_file["ignoredByGit"] is None:
            risks.append({
                "id": "env_ignore_unknown",
                "severity": "low",
                "title": "Env ignore status unknown",
                "detail": f"{env_file['name']} is present, but ignore status could not be verified.",
                "category": "setup",
            })

    if not ci["present"]:
        risks.append({
            "id": "missing_ci",
            "severity": "low",
            "title": "CI config missing",
            "detail": "No common CI configuration path was detected.",
            "category": "setup",
        })

    return risks


def scan_project(path: Path) -> dict[str, Any]:
    package_json = read_json(path / "package.json") if (path / "package.json").exists() else {}
    text_files = collect_text_files(path)
    scripts = collect_scripts(package_json)
    docs = collect_docs(path)
    env = collect_env(path)
    ci = collect_ci(path)
    git = collect_git(path)
    launch_profile = collect_launch_profile(path, package_json, text_files)
    risks = [
        *collect_risks(docs, scripts, env, ci),
        *collect_launch_risks(path, launch_profile, text_files),
    ]

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
        "launchProfile": launch_profile,
        "skippedChecks": collect_skipped_checks(launch_profile),
        "aiReadiness": collect_ai_readiness(docs, scripts, env),
        "risks": risks,
    }


def scan_workspace(root: Path) -> dict[str, Any]:
    projects: list[dict[str, Any]] = []

    try:
        root.resolve(strict=True)
    except OSError as error:
        return {
            "schemaVersion": SCHEMA_VERSION,
            "workspaceRoot": str(root.resolve()),
            "projects": [],
            "scanErrors": [{"path": str(root), "message": str(error)}],
        }

    if is_project(root):
        project_paths, errors = [root], []
    else:
        project_paths, errors = discover_project_paths(root)
    for project_path in project_paths:
        try:
            projects.append(scan_project(project_path))
        except OSError as error:
            errors.append({"path": str(project_path.resolve()), "message": str(error)})

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
