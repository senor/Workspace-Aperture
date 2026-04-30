import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Clock,
  Cpu,
  Dna,
  ExternalLink,
  FileJson,
  FolderOpen,
  GitCompareArrows,
  GitBranch,
  Info,
  LayoutDashboard,
  Moon,
  MoreHorizontal,
  Palette,
  Plus,
  RefreshCw,
  Save,
  Settings,
  ShieldAlert,
  Sun,
  Terminal,
  Radio,
  X,
  Zap,
} from 'lucide-react';

const DEMO_SCAN = {
  schemaVersion: 'aperture.scan.v1',
  workspaceRoot: '~/dev/demo-workspace',
  scanErrors: [],
  projects: [
    {
      id: 'aether-api-demo',
      name: 'aether-api',
      path: '~/dev/aether-api',
      stack: {
        languages: ['TypeScript'],
        frameworks: ['Node.js'],
        tools: ['Git', 'Prisma'],
      },
      package: { manager: 'pnpm', declared: 'pnpm@9.0.0', lockfiles: ['pnpm'] },
      scripts: { dev: 'tsx watch src/index.ts', build: 'tsc', test: 'vitest', lint: 'eslint .' },
      runtime: { engines: { node: '>=20' }, files: { '.nvmrc': '20' } },
      git: {
        isRepo: true,
        branch: 'main',
        dirty: false,
        lastCommit: { sha: 'demo', date: new Date().toISOString(), message: 'Harden API middleware' },
        changes: [],
        recentCommits: [
          { sha: 'demo-4', date: new Date().toISOString(), message: 'Harden API middleware', refs: ['HEAD -> main'] },
          { sha: 'demo-3', date: '2026-04-29T17:12:00+02:00', message: 'Add launch profile risk summary', refs: [] },
          { sha: 'demo-2', date: '2026-04-28T09:20:00+02:00', message: 'Document agent handoff flow', refs: [] },
        ],
      },
      docs: { files: ['README.md', 'AGENTS.md'], hasReadme: true, agentContextFiles: ['AGENTS.md'] },
      env: { files: [], examples: ['.env.example'], hasEnvFiles: false, hasExample: true },
      ci: { present: true, paths: ['.github/workflows'] },
      runtimeStatus: {
        state: 'running',
        checkedAt: new Date().toISOString(),
        ports: [{ port: 5173, url: 'http://localhost:5173', command: 'vite', pid: 12042, confidence: 'high', source: 'demo data' }],
        detail: 'Matched listening localhost ports to project process cwd.',
      },
      aiReadiness: { score: 100, checks: [] },
      risks: [],
    },
    {
      id: 'helios-web-demo',
      name: 'helios-web',
      path: '~/dev/helios-web',
      stack: {
        languages: ['JavaScript', 'TypeScript'],
        frameworks: ['React', 'Next.js'],
        tools: ['Git', 'Tailwind CSS'],
      },
      package: { manager: 'npm', declared: null, lockfiles: ['npm'] },
      scripts: { dev: 'next dev', build: 'next build' },
      runtime: { engines: {}, files: {} },
      git: {
        isRepo: true,
        branch: 'feature/auth-refactor',
        dirty: true,
        lastCommit: { sha: 'demo', date: '2026-04-28T11:00:00+02:00', message: 'Refactor auth shell' },
        changes: [
          { path: 'src/auth/session.ts', status: 'M' },
          { path: 'src/components/LoginPanel.tsx', status: 'M' },
          { path: 'src/routes/account.ts', status: 'A' },
          { path: '.env', status: '??' },
        ],
        recentCommits: [
          { sha: 'demo-9', date: '2026-04-28T11:00:00+02:00', message: 'Refactor auth shell', refs: ['HEAD -> feature/auth-refactor'] },
          { sha: 'demo-8', date: '2026-04-26T15:40:00+02:00', message: 'Introduce account route guard', refs: [] },
          { sha: 'demo-7', date: '2026-04-24T08:05:00+02:00', message: 'Polish onboarding states', refs: ['origin/main'] },
        ],
      },
      docs: { files: ['README.md'], hasReadme: true, agentContextFiles: [] },
      env: { files: [{ name: '.env', ignoredByGit: false }], examples: [], hasEnvFiles: true, hasExample: false },
      ci: { present: false, paths: [] },
      runtimeStatus: {
        state: 'stopped',
        checkedAt: new Date().toISOString(),
        ports: [],
        detail: 'No listening process cwd matched this project.',
      },
      aiReadiness: { score: 40, checks: [] },
      risks: [
        { id: 'env_not_ignored', severity: 'high', title: 'Env file is not ignored by Git', detail: '.env is present and not ignored.' },
        { id: 'missing_test_script', severity: 'medium', title: 'Test script missing', detail: 'No package test script was detected.' },
        { id: 'missing_ci', severity: 'low', title: 'CI config missing', detail: 'No common CI configuration path was detected.' },
      ],
    },
  ],
};

const severityStyles = {
  critical: 'bg-rose-600/15 text-rose-300 border-rose-500/40',
  high: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  medium: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  low: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
  info: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
};

const techColors = {
  JavaScript: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  TypeScript: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  React: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  'Next.js': 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  Python: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  Go: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
  Rust: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  Java: 'bg-red-500/20 text-red-300 border-red-500/30',
  PHP: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  Git: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30',
  default: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
};

const formatDate = (dateValue) => {
  if (!dateValue) return 'Unknown';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
};

const riskSeverityRank = { critical: 4, high: 3, medium: 2, low: 1, info: 0 };
const MANUAL_PROJECTS_STORAGE_KEY = 'aperture-manual-projects';
const PROJECT_STATES_STORAGE_KEY = 'aperture-project-states';
const SCANNER_CHECK_SCOPE = 'README, scripts, env, CI, and stack-aware launch checks';
const TRACKED_PROJECT_STATES = new Set(['tracked', 'reference']);
const PROJECT_STATE_LABELS = {
  candidate: 'Candidate',
  tracked: 'Tracked',
  ignored: 'Ignored',
  reference: 'Reference',
  archived: 'Archived',
  sleeping: 'Sleeping',
};

const APERTURE_THEMES = [
  { id: 'dark', label: 'Dark', swatch: '#020617', icon: Moon },
  { id: 'light', label: 'Light', swatch: '#eef2f7', icon: Sun },
  { id: 'signal', label: 'Signal Desk', swatch: '#22d3ee', icon: Activity },
  { id: 'paper', label: 'Paper Trail', swatch: '#9a5b22', icon: FileJson },
  { id: 'terminal', label: 'Terminal Glow', swatch: '#34d399', icon: Terminal },
];

const highestRisk = (project) => {
  const risks = project.risks ?? [];
  return risks.reduce((highest, risk) => {
    if (!highest) return risk;
    return (riskSeverityRank[risk.severity] ?? 0) > (riskSeverityRank[highest.severity] ?? 0) ? risk : highest;
  }, null);
};

const stackList = (project) => [
  ...(project.stack?.languages ?? []),
  ...(project.stack?.frameworks ?? []),
  ...(project.stack?.tools ?? []),
].filter(Boolean);

const fullStackSummary = (project) => {
  const groups = [
    ['Languages', project.stack?.languages ?? []],
    ['Frameworks', project.stack?.frameworks ?? []],
    ['Tools', project.stack?.tools ?? []],
  ];
  return groups
    .map(([label, values]) => `${label}: ${values.length ? values.join(', ') : 'None detected'}`)
    .join('\n');
};

const readinessSummary = (aiReadiness = {}) => {
  const checks = aiReadiness.checks ?? [];
  if (!checks.length) {
    return {
      label: `${aiReadiness.score ?? 0}% setup coverage`,
      detail: 'No checklist details in this dataset.',
      failed: [],
      passed: 0,
      total: 0,
    };
  }
  const failed = checks.filter((check) => !check.passed);
  const passed = checks.length - failed.length;
  return {
    label: failed.length ? `${failed.length} setup gap${failed.length === 1 ? '' : 's'}` : `${passed}/${checks.length} setup checks present`,
    detail: failed.length
      ? failed.map((check) => check.label).join('\n')
      : `All ${checks.length} setup checks are present.`,
    failed,
    passed,
    total: checks.length,
  };
};

const riskCategory = (risk) => {
  if (!risk) return 'Scanner evidence';
  if (risk.category) {
    return String(risk.category)
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }
  if (risk.id?.includes('env')) return 'Repo safety';
  if (risk.id?.includes('readme')) return 'Setup context';
  if (risk.id?.includes('test') || risk.id?.includes('ci')) return 'Project hygiene';
  return 'Scanner evidence';
};

const topRiskFinding = (risks = []) => risks.reduce((highest, risk) => {
  if (!highest) return risk;
  return (riskSeverityRank[risk.severity] ?? 0) > (riskSeverityRank[highest.severity] ?? 0) ? risk : highest;
}, null);

const topDriftFinding = (drift = []) => drift.reduce((highest, item) => {
  if (!highest) return item;
  return (riskSeverityRank[item.severity] ?? 0) > (riskSeverityRank[highest.severity] ?? 0) ? item : highest;
}, null);

const projectArchetype = (project, isReference = false) => {
  if (isReference) return 'Reference';
  const scripts = project.scripts ?? {};
  const stack = stackList(project);
  const hasAppScript = ['dev', 'start', 'serve'].some((name) => name in scripts);
  const hasBuild = 'build' in scripts;
  if (hasAppScript || project.ci?.present || hasBuild) return 'App';
  if (project.package?.manager && Object.keys(scripts).length > 0) return 'Library';
  if (stack.includes('Python') || Object.keys(project.runtime?.files ?? {}).length > 0) return 'Script';
  if (!project.git?.isRepo && !project.package?.manager) return 'Experiment';
  if (project.git?.isRepo) return 'Repository';
  return 'Project';
};

const conceptHelp = (type, { project, drift = [], isReference = false } = {}) => {
  const readiness = readinessSummary(project?.aiReadiness ?? {});
  const risk = topRiskFinding(project?.risks ?? []);
  const driftItem = topDriftFinding(drift);
  const help = {
    stack: {
      title: 'Stack',
      body: project ? fullStackSummary(project) : 'Languages, frameworks, and tools detected from local project files.',
    },
    readiness: {
      title: 'Setup readiness',
      body: project
        ? `${readiness.total ? `${readiness.passed}/${readiness.total} checks present.` : readiness.label}\n${readiness.detail}`
        : 'A checklist of setup signals that make the project easier for a person or coding agent to enter.',
    },
    risk: {
      title: 'Risk finding',
      body: risk
        ? `${riskCategory(risk)}: ${risk.title}\n${risk.detail}`
        : `No hygiene findings from ${SCANNER_CHECK_SCOPE}.`,
    },
    drift: {
      title: 'Reference differences',
      body: isReference
        ? 'This project is the reference. Other projects are compared against its conventions.'
        : driftItem
          ? `${drift.length} difference${drift.length === 1 ? '' : 's'} from the reference.\nTop difference: ${driftItem.category} - ${driftItem.detail}\nCurrent: ${driftItem.current}\nReference: ${driftItem.reference}`
          : 'Matches the reference on package, scripts, docs, env, CI, and runtime hints checked by Aperture.',
    },
    dirty: {
      title: 'Dirty worktree',
      body: project?.git?.dirty
        ? 'Git reports uncommitted local changes. Aperture only observes this state.'
        : project?.git?.isRepo ? 'Git worktree appears clean.' : 'This project is not currently detected as a Git repository.',
    },
    reference: {
      title: 'Reference project',
      body: 'The baseline project used for advisory comparisons. Differences are facts, not failures.',
    },
  };
  return help[type] ?? { title: 'Scanner evidence', body: 'A factual observation from local scanner output.' };
};

const drawerTabHelp = {
  overview: {
    title: 'Overview',
    body: 'Use this for the fastest read on project health: launch profile, skipped checks, setup readiness, and risks.',
  },
  source: {
    title: 'Source',
    body: 'Use this to inspect read-only Git state: branch, local changes, and recent commit history from the scanner.',
  },
  drift: {
    title: 'Drift',
    body: 'Use this to compare the project against the selected reference. Differences are advisory facts, not automatic failures.',
  },
  brief: {
    title: 'Brief',
    body: 'Use this when handing the project to an AI coding agent or returning later yourself. It compresses scanner facts into the minimum useful orientation.',
  },
};

const briefExplainers = {
  'Launch hygiene': {
    title: 'Launch hygiene',
    body: 'Stack-aware findings from scanned files, rules, routes, and sensitive patterns. Use this as a first review list before sharing or deploying.',
    kind: 'info',
  },
  'Skipped checks': {
    title: 'Skipped checks',
    body: 'Checks Aperture intentionally did not run because the matching provider or surface was not detected. Skipped is not the same as passed.',
    kind: 'info',
  },
  Reference: {
    title: 'Reference',
    body: 'Shows whether this project differs from your selected reference project in the areas Aperture compares.',
    kind: 'question',
  },
  'Inspect first': {
    title: 'Inspect first',
    body: 'Suggested files to open before making changes. They come from docs, agent context files, runtime hints, env examples, and CI paths.',
    kind: 'question',
  },
};

const explainerForBriefLine = (line) => {
  const label = String(line).split(':', 1)[0];
  return briefExplainers[label] ?? null;
};

const readableValue = (value) => {
  if (Array.isArray(value)) return value.length ? value.join(', ') : 'None';
  if (value === true) return 'Yes';
  if (value === false) return 'No';
  if (value === null || value === undefined || value === '') return 'None';
  return String(value);
};

const missingFrom = (referenceValues = [], currentValues = []) => {
  const current = new Set(currentValues);
  return referenceValues.filter((value) => !current.has(value));
};

const compareProjects = (project, referenceProject) => {
  if (!project || !referenceProject || project.id === referenceProject.id) return [];

  const drift = [];
  const addDrift = ({ id, category, current, reference, severity = 'medium', detail }) => {
    drift.push({
      id,
      category,
      current: readableValue(current),
      reference: readableValue(reference),
      severity,
      detail,
    });
  };

  if ((project.package?.manager ?? null) !== (referenceProject.package?.manager ?? null)) {
    addDrift({
      id: 'package-manager',
      category: 'Package manager',
      current: project.package?.manager,
      reference: referenceProject.package?.manager,
      detail: 'This project uses a different package manager than the reference.',
    });
  }

  const missingScripts = missingFrom(Object.keys(referenceProject.scripts ?? {}), Object.keys(project.scripts ?? {}));
  if (missingScripts.length > 0) {
    addDrift({
      id: 'scripts',
      category: 'Scripts',
      current: missingScripts.map((script) => `missing ${script}`),
      reference: Object.keys(referenceProject.scripts ?? {}),
      detail: 'Reference scripts are absent here.',
    });
  }

  if ((project.docs?.hasReadme ?? false) !== (referenceProject.docs?.hasReadme ?? false)) {
    addDrift({
      id: 'readme',
      category: 'Docs',
      current: project.docs?.hasReadme,
      reference: referenceProject.docs?.hasReadme,
      detail: 'README presence differs from the reference.',
    });
  }

  if ((referenceProject.docs?.agentContextFiles?.length ?? 0) > 0 && (project.docs?.agentContextFiles?.length ?? 0) === 0) {
    addDrift({
      id: 'agent-context',
      category: 'Agent context',
      current: project.docs?.agentContextFiles ?? [],
      reference: referenceProject.docs?.agentContextFiles ?? [],
      detail: 'The reference has agent context files that this project lacks.',
    });
  }

  if ((project.env?.hasExample ?? false) !== (referenceProject.env?.hasExample ?? false)) {
    addDrift({
      id: 'env-example',
      category: 'Environment',
      current: project.env?.hasExample,
      reference: referenceProject.env?.hasExample,
      severity: project.env?.hasEnvFiles && !project.env?.hasExample ? 'high' : 'medium',
      detail: 'Environment example coverage differs from the reference.',
    });
  }

  if ((project.ci?.present ?? false) !== (referenceProject.ci?.present ?? false)) {
    addDrift({
      id: 'ci',
      category: 'CI',
      current: project.ci?.present,
      reference: referenceProject.ci?.present,
      detail: 'CI presence differs from the reference.',
    });
  }

  const missingRuntimeFiles = missingFrom(Object.keys(referenceProject.runtime?.files ?? {}), Object.keys(project.runtime?.files ?? {}));
  if (missingRuntimeFiles.length > 0) {
    addDrift({
      id: 'runtime-files',
      category: 'Runtime',
      current: missingRuntimeFiles.map((file) => `missing ${file}`),
      reference: Object.keys(referenceProject.runtime?.files ?? {}),
      severity: 'low',
      detail: 'Runtime hint files from the reference are absent here.',
    });
  }

  return drift;
};

const createDriftMap = (projects, referenceProject) => {
  const entries = projects.map((project) => [project.id, compareProjects(project, referenceProject)]);
  return Object.fromEntries(entries);
};

const isRecentlyChanged = (project) => {
  const dateValue = project.git?.lastCommit?.date;
  if (!dateValue) return false;
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return false;
  return Date.now() - date.getTime() < 1000 * 60 * 60 * 24 * 7;
};

const createAttentionItems = (projects, driftMap = {}) => {
  const items = [];
  projects.forEach((project) => {
    if (project.git?.dirty) {
      items.push({ id: `${project.id}-dirty`, project, severity: 'medium', title: 'Dirty worktree', detail: `${project.name} has uncommitted local changes.` });
    }
    (project.risks ?? []).forEach((risk) => {
      items.push({ id: `${project.id}-${risk.id}`, project, severity: risk.severity, title: `${riskCategory(risk)}: ${risk.title}`, detail: risk.detail });
    });
    if ((project.aiReadiness?.score ?? 0) < 60) {
      items.push({ id: `${project.id}-agent-readiness`, project, severity: 'medium', title: 'Agent readiness is low', detail: `${project.name} is missing context an AI agent would need.` });
    }
    (driftMap[project.id] ?? []).forEach((drift) => {
      items.push({
        id: `${project.id}-drift-${drift.id}`,
        project,
        severity: drift.severity,
        title: `${drift.category} reference difference`,
        detail: drift.detail,
      });
    });
  });
  return items
    .sort((a, b) => (riskSeverityRank[b.severity] ?? 0) - (riskSeverityRank[a.severity] ?? 0))
    .slice(0, 6);
};

const splitList = (value) => value
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean);

const parseScripts = (value) => Object.fromEntries(
  value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const separatorIndex = line.indexOf(':');
      if (separatorIndex === -1) return [line, ''];
      return [line.slice(0, separatorIndex).trim(), line.slice(separatorIndex + 1).trim()];
    })
    .filter(([name]) => Boolean(name))
    .sort(([a], [b]) => a.localeCompare(b)),
);

const readSeenAttentionIds = () => {
  try {
    const saved = JSON.parse(localStorage.getItem('aperture-seen-attention') ?? '[]');
    return Array.isArray(saved) ? saved.filter((item) => typeof item === 'string') : [];
  } catch {
    return [];
  }
};

const readManualProjects = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(MANUAL_PROJECTS_STORAGE_KEY) ?? '[]');
    return Array.isArray(saved) ? saved.filter((project) => ['manual', 'browser-folder'].includes(project?.source) && project.id && project.name) : [];
  } catch {
    return [];
  }
};

const readProjectStates = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(PROJECT_STATES_STORAGE_KEY) ?? '{}');
    return saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {};
  } catch {
    return {};
  }
};

const PROJECT_MARKER_FILES = ['package.json', 'go.mod', 'requirements.txt', 'pyproject.toml', 'Cargo.toml', 'pom.xml', 'build.gradle', 'composer.json'];
const GENERATED_FOLDER_NAMES = new Set(['node_modules', 'dist', 'dist-company', 'dist-tools', 'build', 'coverage', 'out']);

const pathParts = (path) => String(path).split('/').filter(Boolean);
const basename = (path) => pathParts(path).at(-1) ?? '';
const dirname = (path) => pathParts(path).slice(0, -1).join('/');
const hasGeneratedFolder = (path) => pathParts(path).some((part) => GENERATED_FOLDER_NAMES.has(part));

const ensureReadPermission = async (handle) => {
  if (!handle?.queryPermission || !handle?.requestPermission) return true;
  try {
    if (await handle.queryPermission({ mode: 'read' }) === 'granted') return true;
    return await handle.requestPermission({ mode: 'read' }) === 'granted';
  } catch {
    return false;
  }
};

const readHandleFileText = async (directoryHandle, filename) => {
  try {
    if (!await ensureReadPermission(directoryHandle)) return '';
    const fileHandle = await directoryHandle.getFileHandle(filename);
    if (!await ensureReadPermission(fileHandle)) return '';
    const file = await fileHandle.getFile();
    return await file.text();
  } catch {
    return '';
  }
};

const hasDirectoryEntry = async (directoryHandle, name) => {
  try {
    if (!await ensureReadPermission(directoryHandle)) return false;
    await directoryHandle.getDirectoryHandle(name);
    return true;
  } catch {
    return false;
  }
};

const hasFileEntry = async (directoryHandle, name) => {
  try {
    if (!await ensureReadPermission(directoryHandle)) return false;
    await directoryHandle.getFileHandle(name);
    return true;
  } catch {
    return false;
  }
};

const listDirectoryChildren = async (directoryHandle) => {
  try {
    if (!await ensureReadPermission(directoryHandle)) {
      return { children: [], readable: false };
    }
    const children = [];
    if (directoryHandle.values) {
      for await (const entry of directoryHandle.values()) {
        children.push(entry);
      }
    } else if (directoryHandle.entries) {
      for await (const [, entry] of directoryHandle.entries()) {
        children.push(entry);
      }
    }
    return { children, readable: true };
  } catch {
    return { children: [], readable: false };
  }
};

const isBrowserProjectHandle = async (directoryHandle) => {
  const markers = ['package.json', 'go.mod', 'requirements.txt', 'pyproject.toml', 'Cargo.toml', 'pom.xml', 'build.gradle', 'composer.json'];
  if (await hasDirectoryEntry(directoryHandle, '.git')) return true;
  for (const marker of markers) {
    if (await hasFileEntry(directoryHandle, marker)) return true;
  }
  return false;
};

const browserProjectFromHandle = async (directoryHandle, pathParts = []) => {
  const packageText = await readHandleFileText(directoryHandle, 'package.json');
  let packageJson = {};
  try {
    packageJson = packageText ? JSON.parse(packageText) : {};
  } catch {
    packageJson = {};
  }
  const dependencies = {
    ...(packageJson.dependencies ?? {}),
    ...(packageJson.devDependencies ?? {}),
    ...(packageJson.peerDependencies ?? {}),
    ...(packageJson.optionalDependencies ?? {}),
  };
  const dependencyNames = new Set(Object.keys(dependencies));
  const languages = [];
  const frameworks = [];
  const tools = [];
  if (packageText) languages.push('JavaScript');
  if (dependencyNames.has('typescript')) languages.push('TypeScript');
  if (dependencyNames.has('react')) frameworks.push('React');
  if (dependencyNames.has('next')) frameworks.push('Next.js');
  if (dependencyNames.has('vite')) tools.push('Vite');
  if (await hasDirectoryEntry(directoryHandle, '.git')) tools.push('Git');
  const hasReadme = await hasFileEntry(directoryHandle, 'README.md') || await hasFileEntry(directoryHandle, 'README.mdx');
  const hasEnvExample = await hasFileEntry(directoryHandle, '.env.example') || await hasFileEntry(directoryHandle, '.env.sample');
  const hasCi = await hasDirectoryEntry(directoryHandle, '.github');
  const scripts = packageJson.scripts && typeof packageJson.scripts === 'object' ? packageJson.scripts : {};
  const profile = {
    framework: dependencyNames.has('next') ? 'next' : dependencyNames.has('vite') ? 'vite' : dependencyNames.has('react') ? 'react' : 'unknown',
    backend: dependencyNames.has('firebase') ? 'firebase' : dependencyNames.has('@supabase/supabase-js') ? 'supabase' : 'unknown',
    auth: dependencyNames.has('firebase') ? 'firebase' : dependencyNames.has('@supabase/supabase-js') ? 'supabase' : 'unknown',
    database: dependencyNames.has('firebase') ? 'firestore' : dependencyNames.has('@supabase/supabase-js') ? 'supabase-postgres' : 'unknown',
    storage: 'unknown',
    payments: dependencyNames.has('stripe') ? 'stripe' : 'none',
    aiApis: [
      dependencyNames.has('openai') ? 'OpenAI' : null,
      dependencyNames.has('@google/generative-ai') ? 'Gemini' : null,
      dependencyNames.has('@anthropic-ai/sdk') ? 'Anthropic' : null,
    ].filter(Boolean),
  };
  const pathLabel = [...pathParts, directoryHandle.name].filter(Boolean).join('/');
  return {
    id: `browser-${pathLabel}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    source: 'browser-folder',
    name: directoryHandle.name,
    path: pathLabel,
    stack: { languages, frameworks, tools },
    package: { manager: packageText ? 'browser-picked' : null, declared: packageJson.packageManager ?? null, lockfiles: [] },
    scripts,
    runtime: { engines: packageJson.engines ?? {}, files: {} },
    git: { isRepo: tools.includes('Git'), branch: null, dirty: null, lastCommit: null, changes: [], recentCommits: [] },
    docs: { files: hasReadme ? ['README.md'] : [], hasReadme, agentContextFiles: [] },
    env: { files: [], examples: hasEnvExample ? ['.env.example'] : [], hasEnvFiles: false, hasExample: hasEnvExample },
    ci: { present: hasCi, paths: hasCi ? ['.github'] : [] },
    projectState: 'candidate',
    runtimeStatus: {
      state: 'unknown',
      checkedAt: new Date().toISOString(),
      ports: [],
      detail: 'Browser folder selection cannot inspect local listening ports. Run scanner.py for runtime status.',
    },
    launchProfile: profile,
    skippedChecks: [
      { id: 'browser_limited_scan', title: 'Deep file checks skipped', reason: 'Browser folder selection can identify project candidates, but the Python scanner is still needed for full local evidence.' },
      ...(profile.payments === 'none' ? [{ id: 'payment_bypass', title: 'Payment bypass checks skipped', reason: 'No payment provider was detected.' }] : []),
    ],
    aiReadiness: {
      score: Math.round(([hasReadme, 'test' in scripts, 'lint' in scripts, hasEnvExample, hasCi].filter(Boolean).length / 5) * 100),
      checks: [],
    },
    risks: [
      ...(!hasReadme ? [{ id: 'missing_readme', severity: 'medium', title: 'README missing', detail: 'Browser folder scan did not find README.md.', category: 'setup' }] : []),
      ...(!('test' in scripts) ? [{ id: 'missing_test_script', severity: 'medium', title: 'Test script missing', detail: 'No package test script was detected.', category: 'setup' }] : []),
      ...(!hasCi ? [{ id: 'missing_ci', severity: 'low', title: 'CI config missing', detail: 'Browser folder scan did not find .github.', category: 'setup' }] : []),
    ],
  };
};

const scanBrowserDirectory = async (directoryHandle) => {
  const maxProjects = 80;
  const maxDepth = 4;
  const queue = [{ handle: directoryHandle, pathParts: [], depth: 0 }];
  const projects = [];
  const seen = new Set();
  const stats = {
    visited: 0,
    unreadable: 0,
    projectMarkers: 0,
    maxDepth,
  };

  while (queue.length && projects.length < maxProjects) {
    const { handle, pathParts, depth } = queue.shift();
    const key = [...pathParts, handle.name].join('/');
    if (seen.has(key)) continue;
    seen.add(key);
    stats.visited += 1;

    if (await isBrowserProjectHandle(handle)) {
      stats.projectMarkers += 1;
      projects.push(await browserProjectFromHandle(handle, pathParts));
      continue;
    }

    if (depth >= maxDepth) continue;

    const { children, readable } = await listDirectoryChildren(handle);
    if (!readable) {
      stats.unreadable += 1;
      continue;
    }
    for (const child of children) {
      if (child.kind !== 'directory' || child.name.startsWith('.')) continue;
      if (['node_modules', 'dist', 'dist-company', 'dist-tools', 'build', 'coverage', 'out'].includes(child.name)) continue;
      queue.push({ handle: child, pathParts: [...pathParts, handle.name], depth: depth + 1 });
    }
  }

  return { projects, stats };
};

const browserProjectsFromFileList = async (fileList) => {
  const files = Array.from(fileList ?? []).filter((file) => file.webkitRelativePath || file.name);
  const filesByPath = new Map(files.map((file) => [file.webkitRelativePath || file.name, file]));
  const markerRoots = [...new Set(files
    .map((file) => file.webkitRelativePath || file.name)
    .filter((path) => PROJECT_MARKER_FILES.includes(basename(path)) && !hasGeneratedFolder(path))
    .map(dirname)
    .filter(Boolean))]
    .sort((a, b) => a.length - b.length);

  const projectRoots = markerRoots.filter((root) => !markerRoots.some((parent) => parent !== root && root.startsWith(`${parent}/`)));
  const projects = [];

  for (const root of projectRoots.slice(0, 80)) {
    const name = basename(root);
    const packageFile = filesByPath.get(`${root}/package.json`);
    const packageText = packageFile ? await packageFile.text() : '';
    let packageJson = {};
    try {
      packageJson = packageText ? JSON.parse(packageText) : {};
    } catch {
      packageJson = {};
    }
    const dependencies = {
      ...(packageJson.dependencies ?? {}),
      ...(packageJson.devDependencies ?? {}),
      ...(packageJson.peerDependencies ?? {}),
      ...(packageJson.optionalDependencies ?? {}),
    };
    const dependencyNames = new Set(Object.keys(dependencies));
    const hasFile = (filename) => filesByPath.has(`${root}/${filename}`);
    const languages = [];
    const frameworks = [];
    const tools = [];
    if (packageText) languages.push('JavaScript');
    if (dependencyNames.has('typescript') || hasFile('tsconfig.json')) languages.push('TypeScript');
    if (dependencyNames.has('react')) frameworks.push('React');
    if (dependencyNames.has('next')) frameworks.push('Next.js');
    if (dependencyNames.has('vite')) tools.push('Vite');
    const hasReadme = hasFile('README.md') || hasFile('README.mdx');
    const hasEnvExample = hasFile('.env.example') || hasFile('.env.sample');
    const hasCi = files.some((file) => (file.webkitRelativePath || file.name).startsWith(`${root}/.github/`));
    const scripts = packageJson.scripts && typeof packageJson.scripts === 'object' ? packageJson.scripts : {};
    const profile = {
      framework: dependencyNames.has('next') ? 'next' : dependencyNames.has('vite') ? 'vite' : dependencyNames.has('react') ? 'react' : 'unknown',
      backend: dependencyNames.has('firebase') ? 'firebase' : dependencyNames.has('@supabase/supabase-js') ? 'supabase' : 'unknown',
      auth: dependencyNames.has('firebase') ? 'firebase' : dependencyNames.has('@supabase/supabase-js') ? 'supabase' : 'unknown',
      database: dependencyNames.has('firebase') ? 'firestore' : dependencyNames.has('@supabase/supabase-js') ? 'supabase-postgres' : 'unknown',
      storage: 'unknown',
      payments: dependencyNames.has('stripe') ? 'stripe' : 'none',
      aiApis: [
        dependencyNames.has('openai') ? 'OpenAI' : null,
        dependencyNames.has('@google/generative-ai') ? 'Gemini' : null,
        dependencyNames.has('@anthropic-ai/sdk') ? 'Anthropic' : null,
      ].filter(Boolean),
    };

    projects.push({
      id: `browser-${root}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      source: 'browser-folder',
      name,
      path: root,
      stack: { languages, frameworks, tools },
      package: { manager: packageText ? 'browser-picked' : null, declared: packageJson.packageManager ?? null, lockfiles: [] },
      scripts,
      runtime: { engines: packageJson.engines ?? {}, files: {} },
      git: { isRepo: false, branch: null, dirty: null, lastCommit: null, changes: [], recentCommits: [] },
      docs: { files: hasReadme ? ['README.md'] : [], hasReadme, agentContextFiles: [] },
      env: { files: [], examples: hasEnvExample ? ['.env.example'] : [], hasEnvFiles: false, hasExample: hasEnvExample },
      ci: { present: hasCi, paths: hasCi ? ['.github'] : [] },
      projectState: 'candidate',
      runtimeStatus: {
        state: 'unknown',
        checkedAt: new Date().toISOString(),
        ports: [],
        detail: 'Browser folder selection cannot inspect local listening ports. Run scanner.py for runtime status.',
      },
      launchProfile: profile,
      skippedChecks: [
        { id: 'browser_limited_scan', title: 'Deep file checks skipped', reason: 'Browser folder selection can identify project candidates, but the Python scanner is still needed for full local evidence.' },
        ...(profile.payments === 'none' ? [{ id: 'payment_bypass', title: 'Payment bypass checks skipped', reason: 'No payment provider was detected.' }] : []),
      ],
      aiReadiness: {
        score: Math.round(([hasReadme, 'test' in scripts, 'lint' in scripts, hasEnvExample, hasCi].filter(Boolean).length / 5) * 100),
        checks: [],
      },
      risks: [
        ...(!hasReadme ? [{ id: 'missing_readme', severity: 'medium', title: 'README missing', detail: 'Browser folder scan did not find README.md.', category: 'setup' }] : []),
        ...(!('test' in scripts) ? [{ id: 'missing_test_script', severity: 'medium', title: 'Test script missing', detail: 'No package test script was detected.', category: 'setup' }] : []),
        ...(!hasCi ? [{ id: 'missing_ci', severity: 'low', title: 'CI config missing', detail: 'Browser folder scan did not find .github.', category: 'setup' }] : []),
      ],
    });
  }

  return {
    projects,
    stats: {
      files: files.length,
      markerMatches: markerRoots.length,
      projectRoots: projectRoots.length,
    },
  };
};

const normalizeProjectState = (state) => (PROJECT_STATE_LABELS[state] ? state : 'candidate');

const applyProjectState = (project, savedStates = {}) => {
  if (project.source === 'manual') {
    return { ...project, projectState: normalizeProjectState(project.projectState ?? savedStates[project.id] ?? 'tracked') };
  }
  return { ...project, projectState: normalizeProjectState(savedStates[project.id] ?? 'candidate') };
};

const launchProfileSummary = (profile = {}) => {
  const parts = [
    profile.framework && profile.framework !== 'unknown' ? profile.framework : null,
    profile.backend && profile.backend !== 'unknown' ? profile.backend : null,
    profile.auth && profile.auth !== 'unknown' ? `${profile.auth} auth` : profile.auth === 'none' ? 'no auth' : null,
    profile.payments && profile.payments !== 'unknown' ? `${profile.payments} payments` : null,
  ].filter(Boolean);
  return parts.length ? parts.join(' / ') : 'Unknown launch surface';
};

const launchProfileRows = (profile = {}) => [
  ['Framework', profile.framework ?? 'unknown'],
  ['Backend', profile.backend ?? 'unknown'],
  ['Auth', profile.auth ?? 'unknown'],
  ['Database', profile.database ?? 'unknown'],
  ['Storage', profile.storage ?? 'unknown'],
  ['Payments', profile.payments ?? 'unknown'],
  ['AI APIs', profile.aiApis?.length ? profile.aiApis.join(', ') : 'none'],
];

const primaryRuntimePort = (runtimeStatus) => runtimeStatus?.ports?.[0] ?? null;

const runtimePortLabel = (port) => {
  if (!port) return 'localhost';
  if (port.url) {
    try {
      return new URL(port.url).host;
    } catch {
      return port.port ? `localhost:${port.port}` : String(port.url);
    }
  }
  return port.port ? `localhost:${port.port}` : 'localhost';
};

const runtimeStatusLabel = (runtimeStatus) => {
  const primary = primaryRuntimePort(runtimeStatus);
  if (!runtimeStatus?.state) return 'Runtime unknown';
  if (runtimeStatus.state === 'running' && primary) return `Running on ${runtimePortLabel(primary)}`;
  if (runtimeStatus.state === 'unknown') return 'Runtime unknown';
  return 'Not running';
};

const runtimeStatusDetail = (runtimeStatus) => {
  const primary = primaryRuntimePort(runtimeStatus);
  if (!runtimeStatus?.state) {
    return 'This scanner output was generated before runtime port detection existed. Run scanner.py again to refresh localhost status.';
  }
  if (runtimeStatus.state === 'running' && primary) {
    const process = [primary.command, primary.pid ? `pid ${primary.pid}` : null].filter(Boolean).join(' · ');
    return [
      process || null,
      primary.confidence ? `Confidence: ${primary.confidence}` : null,
      runtimeStatus.detail,
    ].filter(Boolean).join('\n');
  }
  if (runtimeStatus.state === 'unknown') {
    return runtimeStatus.detail || 'Aperture could not inspect listening localhost ports during the last scan.';
  }
  return runtimeStatus.detail || 'No matching listening localhost port was found during the last scan.';
};

const RuntimeStatusIndicator = ({ runtimeStatus, align = 'left', compact = false }) => {
  const primary = primaryRuntimePort(runtimeStatus);
  const isRunning = runtimeStatus?.state === 'running' && primary;
  const state = !runtimeStatus?.state || runtimeStatus.state === 'unknown' ? 'unknown' : isRunning ? 'running' : 'stopped';
  const stopCardClick = (event) => {
    event.stopPropagation();
  };

  return (
    <span className={`runtime-status runtime-status--${state} ${compact ? 'runtime-status--compact' : ''}`} onClick={stopCardClick}>
      <button
        type="button"
        className="runtime-status__trigger"
        aria-label={runtimeStatusLabel(runtimeStatus)}
      >
        <Radio size={compact ? 13 : 15} />
        {!compact && <span>{runtimeStatusLabel(runtimeStatus)}</span>}
      </button>
      <span className={`runtime-status__panel ${align === 'right' ? 'runtime-status__panel--right' : ''}`}>
        <strong>{runtimeStatusLabel(runtimeStatus)}</strong>
        {isRunning ? (
          <>
            <a href={primary.url} target="_blank" rel="noreferrer" className="runtime-status__link" onClick={stopCardClick}>
              {primary.url}
              <ExternalLink size={13} />
            </a>
            <span>{createLineBreaks(runtimeStatusDetail(runtimeStatus))}</span>
          </>
        ) : (
          <span>{createLineBreaks(runtimeStatusDetail(runtimeStatus))}</span>
        )}
      </span>
    </span>
  );
};

const launchHygieneRisks = (project) => (project.risks ?? [])
  .filter((risk) => risk.category && risk.category !== 'setup')
  .sort((a, b) => (riskSeverityRank[b.severity] ?? 0) - (riskSeverityRank[a.severity] ?? 0));

const looksNormalChecks = (project) => {
  const profile = project.launchProfile ?? {};
  const checks = [];
  const hasFirebase = profile.backend === 'firebase';
  const hasSupabase = profile.backend === 'supabase';
  const hasServiceRoleRisk = (project.risks ?? []).some((risk) => risk.id?.includes('service_role'));
  if (hasFirebase) {
    checks.push({
      title: 'Firebase web config can be public',
      detail: 'Firebase browser config is not a secret by itself; the important guardrail is rules and server-side privileges.',
    });
  }
  if (hasSupabase && !hasServiceRoleRisk) {
    checks.push({
      title: 'Supabase anon key is expected in browser apps',
      detail: 'The anon key is designed for client use when RLS and policies protect the data.',
    });
  }
  if (profile.payments === 'none') {
    checks.push({
      title: 'No payment surface detected',
      detail: 'Aperture did not find Stripe or Lemon Squeezy markers, so payment bypass work is not part of this pass.',
    });
  }
  if (profile.auth === 'none') {
    checks.push({
      title: 'No auth model detected',
      detail: 'User isolation is not assumed; launch hygiene focuses on public data boundaries and abuse risk.',
    });
  }
  return checks;
};

const createManualProject = (form) => {
  const docs = {
    files: form.hasReadme ? ['README.md'] : [],
    hasReadme: form.hasReadme,
    agentContextFiles: form.hasAgentContext ? ['AGENTS.md'] : [],
  };
  const scripts = parseScripts(form.scripts);
  const env = {
    files: [],
    examples: form.hasEnvExample ? ['.env.example'] : [],
    hasEnvFiles: false,
    hasExample: form.hasEnvExample,
  };
  const ci = {
    present: form.hasCi,
    paths: form.hasCi ? ['manual'] : [],
  };

  return {
    id: `manual-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    source: 'manual',
    name: form.name.trim(),
    path: form.path.trim() || 'Manual entry',
    stack: {
      languages: splitList(form.languages),
      frameworks: splitList(form.frameworks),
      tools: splitList(form.tools),
    },
    package: {
      manager: form.packageManager || null,
      declared: null,
      lockfiles: form.packageManager ? [form.packageManager] : [],
    },
    scripts,
    runtime: { engines: {}, files: {} },
    git: {
      isRepo: form.isGitRepo,
      branch: form.isGitRepo ? (form.branch.trim() || 'main') : null,
      dirty: false,
      lastCommit: null,
      changes: [],
      recentCommits: [],
    },
    projectState: 'tracked',
    docs,
    env,
    ci,
    runtimeStatus: {
      state: 'unknown',
      checkedAt: new Date().toISOString(),
      ports: [],
      detail: 'Manual entries do not include local process evidence. Run scanner.py for runtime status.',
    },
    launchProfile: {
      framework: form.frameworks.toLowerCase().includes('next') ? 'next' : form.tools.toLowerCase().includes('vite') ? 'vite' : form.frameworks.toLowerCase().includes('react') ? 'react' : 'unknown',
      backend: 'unknown',
      auth: 'unknown',
      database: 'unknown',
      storage: 'unknown',
      payments: 'none',
      aiApis: [],
    },
    skippedChecks: [
      { id: 'manual_scan', title: 'Deep launch checks skipped', reason: 'This is a manual entry, so Aperture has no local files to inspect.' },
      { id: 'payment_bypass', title: 'Payment bypass checks skipped', reason: 'No payment provider was entered for this project.' },
    ],
    aiReadiness: collectManualReadiness(docs, scripts, env),
    risks: collectManualRisks(docs, scripts, ci),
  };
};

const collectManualReadiness = (docs, scripts, env) => {
  const checks = [
    { id: 'readme', label: 'README present', passed: docs.hasReadme, evidence: docs.files },
    { id: 'agent_context', label: 'Agent context present', passed: Boolean(docs.agentContextFiles.length), evidence: docs.agentContextFiles },
    { id: 'test_script', label: 'Test command present', passed: 'test' in scripts, evidence: scripts.test },
    { id: 'lint_script', label: 'Lint command present', passed: 'lint' in scripts, evidence: scripts.lint },
    { id: 'env_example', label: 'Environment example present when env files exist', passed: true, evidence: env.examples },
  ];
  const passed = checks.filter((check) => check.passed).length;
  return { score: Math.round((passed / checks.length) * 100), checks };
};

const collectManualRisks = (docs, scripts, ci) => {
  const risks = [];
  if (!docs.hasReadme) {
    risks.push({ id: 'missing_readme', severity: 'medium', title: 'README missing', detail: 'Manual entry says this project has no README file.' });
  }
  if (!('test' in scripts)) {
    risks.push({ id: 'missing_test_script', severity: 'medium', title: 'Test script missing', detail: 'No test script was entered manually.' });
  }
  if (!ci.present) {
    risks.push({ id: 'missing_ci', severity: 'low', title: 'CI config missing', detail: 'Manual entry says no CI configuration is present.' });
  }
  return risks;
};

const createLineBreaks = (text) => String(text)
  .split('\n')
  .map((line, index) => (
    <React.Fragment key={`${line}-${index}`}>
      {index > 0 && <br />}
      {line}
    </React.Fragment>
  ));

const InfoPopover = ({ title, body, align = 'left', kind = 'question' }) => {
  const Icon = kind === 'info' ? Info : CircleHelp;
  return (
  <span className={`info-popover info-popover--${kind}`} onClick={(event) => event.stopPropagation()}>
    <span
      className="info-popover__trigger"
      tabIndex={0}
      role="button"
      aria-label={`${title}: ${String(body).replace(/\n/g, ' ')}`}
    >
      <Icon size={13} />
    </span>
    <span className={`info-popover__panel info-popover__panel--${align}`} role="tooltip">
      <span className="info-popover__title">{title}</span>
      <span className="info-popover__body">{createLineBreaks(body)}</span>
    </span>
  </span>
  );
};

const riskBreakdown = (projects) => {
  const counts = projects
    .flatMap((project) => project.risks ?? [])
    .reduce((current, risk) => {
      const category = riskCategory(risk);
      return { ...current, [category]: (current[category] ?? 0) + 1 };
    }, {});
  const entries = Object.entries(counts);
  return entries.length ? entries.map(([category, count]) => `${count} ${category.toLowerCase()}`).join(', ') : `No hygiene findings from ${SCANNER_CHECK_SCOPE}`;
};

const driftBreakdown = (projects, driftMap) => {
  const counts = projects
    .flatMap((project) => driftMap[project.id] ?? [])
    .reduce((current, drift) => ({ ...current, [drift.category]: (current[drift.category] ?? 0) + 1 }), {});
  const entries = Object.entries(counts);
  return entries.length ? entries.map(([category, count]) => `${count} ${category.toLowerCase()}`).join(', ') : 'No reference differences detected';
};

const statBreakdown = (projects, driftMap) => {
  const dirtyCount = projects.filter((project) => project.git?.dirty).length;
  const avgReadiness = projects.length
    ? Math.round(projects.reduce((sum, project) => sum + (project.aiReadiness?.score ?? 0), 0) / projects.length)
    : 0;
  const readinessGaps = projects.reduce((sum, project) => sum + readinessSummary(project.aiReadiness).failed.length, 0);
  return {
    projects: projects.length ? `${projects.length} local project${projects.length === 1 ? '' : 's'} mapped` : 'No projects mapped yet',
    readiness: `${avgReadiness}% average, ${readinessGaps} setup gap${readinessGaps === 1 ? '' : 's'}`,
    risks: riskBreakdown(projects),
    dirty: dirtyCount ? `${dirtyCount} project${dirtyCount === 1 ? '' : 's'} with uncommitted changes` : 'All detected Git worktrees appear clean',
    drift: driftBreakdown(projects, driftMap),
  };
};

const StatCard = ({ title, value, icon: Icon, tone = 'indigo', onClick, summary, help }) => {
  const toneClass = tone === 'rose' ? 'bg-rose-500/10 text-rose-400' : tone === 'emerald' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-indigo-500/10 text-indigo-400';
  const handleKeyDown = (event) => {
    if (!onClick || event.target !== event.currentTarget) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };
  return (
    <div
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-left ${onClick ? 'stat-card--action' : ''}`}
    >
      <div className="mb-3 flex items-start justify-between">
        <div className={`rounded-lg p-2 ${toneClass}`}>
          <Icon size={18} />
        </div>
        <div className="flex items-center gap-2">
          {help && <InfoPopover {...help} align="right" />}
          {onClick && <ChevronRight size={18} className="text-slate-500" />}
        </div>
      </div>
      <div className="text-2xl font-bold text-slate-100">{value}</div>
      <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</div>
      {summary && <div className="mt-2 text-xs font-medium leading-snug text-slate-500">{summary}</div>}
    </div>
  );
};

const ThemeSwitcher = ({ theme, onThemeChange }) => {
  const [open, setOpen] = useState(false);
  const activeTheme = APERTURE_THEMES.find((option) => option.id === theme) ?? APERTURE_THEMES[0];

  return (
    <div className="theme-picker">
      <button
        type="button"
        className={`theme-picker__trigger ${open ? 'is-open' : ''}`}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label="Choose theme"
        title="Choose theme"
      >
        <Palette size={18} />
        <span className="theme-picker__swatch" style={{ '--theme-swatch': activeTheme.swatch }} />
      </button>

      {open && (
        <div className="theme-picker__popover">
          {APERTURE_THEMES.map((option) => {
            const Icon = option.icon;
            return (
            <button
              key={option.id}
              type="button"
              className={`theme-picker__item ${theme === option.id ? 'is-active' : ''}`}
              onClick={() => {
                onThemeChange(option.id);
                setOpen(false);
              }}
            >
              <span className="theme-picker__item-swatch" style={{ '--theme-swatch': option.swatch }}>
                <Icon size={13} />
              </span>
              {option.label}
            </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

const AttentionButton = ({ count, unseenCount, open, onClick }) => (
  <button
    type="button"
    className={`attention-trigger ${open ? 'is-open' : ''}`}
    onClick={onClick}
    aria-label={`${count} attention item${count === 1 ? '' : 's'}`}
    title="Today's Attention"
  >
    <Activity size={18} />
    <span className="hidden text-xs font-black uppercase tracking-widest lg:inline">Attention</span>
    <span className="attention-trigger__count">{count}</span>
    {unseenCount > 0 && <span className="attention-trigger__dot" />}
  </button>
);

const AddProjectButton = ({ open, onClick }) => (
  <button
    type="button"
    className={`attention-trigger ${open ? 'is-open' : ''}`}
    onClick={onClick}
    aria-label="Add project"
    title="Add project"
  >
    <Plus size={18} />
    <span className="hidden text-xs font-black uppercase tracking-widest lg:inline">Add</span>
  </button>
);

const AttentionDrawer = ({ open, items, unseenIds, onClose, onSelectProject }) => (
  <>
    <button className={`attention-drawer__scrim ${open ? 'is-open' : ''}`} type="button" aria-label="Close attention feed" onClick={onClose} aria-hidden={!open} tabIndex={open ? 0 : -1} />
    <aside className={`attention-drawer ${open ? 'is-open' : ''}`} aria-hidden={!open}>
      <div className="attention-drawer__header">
        <div>
          <div className="text-xs font-black uppercase tracking-[0.24em] text-indigo-300">Today's Attention</div>
          <h2 className="mt-1 text-xl font-black tracking-tight text-slate-100">Scanner feed</h2>
          <p className="mt-1 text-xs font-bold text-slate-500">Prioritized scanner facts, not automated fixes.</p>
        </div>
        <button type="button" className="attention-drawer__close" onClick={onClose} aria-label="Close attention feed">
          <X size={18} />
        </button>
      </div>

      <div className="attention-drawer__body custom-scrollbar">
        {items.length > 0 ? items.map((item) => {
          const isNew = unseenIds.has(item.id);
          return (
            <button
              key={item.id}
              onClick={() => onSelectProject(item.project)}
              className={`attention-item ${severityStyles[item.severity] || severityStyles.low}`}
            >
              <div className="flex items-start gap-3">
                <div className="relative mt-0.5">
                  {item.severity === 'high' ? <ShieldAlert size={18} /> : <AlertTriangle size={18} />}
                  {isNew && <span className="attention-item__new-dot" />}
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm font-bold">
                    {item.title}
                    {isNew && <span className="attention-item__new-label">New</span>}
                  </div>
                  <div className="mt-1 text-xs opacity-80">{item.detail}</div>
                  <div className="mt-2 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest opacity-70">
                    {item.project.name} <ChevronRight size={12} />
                  </div>
                </div>
              </div>
            </button>
          );
        }) : (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-6 text-center text-emerald-300">
            <CheckCircle2 className="mx-auto mb-2" /> No attention items detected.
          </div>
        )}
      </div>
    </aside>
  </>
);

const InsightDrawer = ({ open, title, subtitle, emptyLabel, items, onClose, onSelectProject }) => (
  <>
    <button className={`attention-drawer__scrim ${open ? 'is-open' : ''}`} type="button" aria-label={`Close ${title}`} onClick={onClose} aria-hidden={!open} tabIndex={open ? 0 : -1} />
    <aside className={`attention-drawer ${open ? 'is-open' : ''}`} aria-hidden={!open}>
      <div className="attention-drawer__header">
        <div>
          <div className="text-xs font-black uppercase tracking-[0.24em] text-indigo-300">Workspace Signal</div>
          <h2 className="mt-1 text-xl font-black tracking-tight text-slate-100">{title}</h2>
          <p className="mt-1 text-xs font-bold text-slate-500">{subtitle}</p>
        </div>
        <button type="button" className="attention-drawer__close" onClick={onClose} aria-label={`Close ${title}`}>
          <X size={18} />
        </button>
      </div>

      <div className="attention-drawer__body custom-scrollbar">
        {items.length > 0 ? items.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectProject(item.project)}
            className={`attention-item ${severityStyles[item.severity] || severityStyles.low}`}
          >
            <div className="flex items-start gap-3">
              {item.icon === 'dirty' ? <GitBranch size={18} /> : item.severity === 'high' ? <ShieldAlert size={18} /> : <AlertTriangle size={18} />}
              <div>
                <div className="text-sm font-bold">{item.title}</div>
                <div className="mt-1 text-xs opacity-80">{item.detail}</div>
                <div className="mt-2 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest opacity-70">
                  {item.project.name} <ChevronRight size={12} />
                </div>
              </div>
            </div>
          </button>
        )) : (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-6 text-center text-emerald-300">
            <CheckCircle2 className="mx-auto mb-2" /> {emptyLabel}
          </div>
        )}
      </div>
    </aside>
  </>
);

const ApertureAnalyzer = () => (
  <div className="flex min-h-[520px] items-center justify-center">
    <div className="relative flex flex-col items-center text-center">
      <div className="relative mb-8 h-32 w-32">
        <div className="absolute inset-0 rounded-full border border-indigo-500/20" />
        <div className="absolute inset-3 rounded-full border border-cyan-400/10" />
        <div className="aperture-loop absolute inset-0 rounded-full border border-transparent border-t-indigo-400 border-r-cyan-300" />
        <div className="aperture-loop aperture-loop-slow absolute inset-5 rounded-full border border-transparent border-b-emerald-300 border-l-indigo-300" />
        <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-300 shadow-[0_0_36px_rgba(129,140,248,0.75)]" />
        <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-xl" />
      </div>
      <div className="text-xs font-black uppercase tracking-[0.4em] text-indigo-300">Analyzing</div>
      <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-100">Finding your workspace signal</h2>
      <p className="mt-2 max-w-sm text-sm text-slate-500">Checking for generated scanner data.</p>
    </div>
  </div>
);

const SetupCard = ({ icon: Icon, title, detail, children, disabled, className = '' }) => (
  <div className={`rounded-2xl border p-5 ${disabled ? 'border-slate-800 bg-slate-900/30 opacity-70' : 'border-indigo-500/30 bg-indigo-500/5'} ${className}`}>
    <div className="mb-4 flex items-start gap-3">
      <div className={`rounded-xl p-2 ${disabled ? 'bg-slate-800 text-slate-500' : 'bg-indigo-500/10 text-indigo-300'}`}>
        <Icon size={20} />
      </div>
      <div>
        <h3 className="font-bold text-slate-100">{title}</h3>
        <p className="mt-1 text-sm text-slate-500">{detail}</p>
      </div>
    </div>
    {children}
  </div>
);

const ManualProjectDrawer = ({ open, onClose, onAddProject }) => {
  const [form, setForm] = useState({
    name: '',
    path: '',
    languages: '',
    frameworks: '',
    tools: '',
    packageManager: 'npm',
    scripts: 'dev: npm run dev\nbuild: npm run build',
    isGitRepo: true,
    branch: 'main',
    hasReadme: true,
    hasAgentContext: false,
    hasCi: false,
    hasEnvExample: false,
  });

  const setField = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const canSubmit = form.name.trim().length > 0;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!canSubmit) return;
    onAddProject(createManualProject(form));
    setForm((current) => ({ ...current, name: '', path: '' }));
  };

  return (
    <>
      <button className={`attention-drawer__scrim ${open ? 'is-open' : ''}`} type="button" aria-label="Close manual project form" onClick={onClose} aria-hidden={!open} tabIndex={open ? 0 : -1} />
      <aside className={`attention-drawer manual-project-drawer ${open ? 'is-open' : ''}`} aria-hidden={!open}>
        <div className="attention-drawer__header">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.24em] text-indigo-300">Manual Project</div>
            <h2 className="mt-1 text-xl font-black tracking-tight text-slate-100">Add project</h2>
            <p className="mt-1 text-xs font-bold text-slate-500">Saved in this browser and merged with scanner output.</p>
          </div>
          <button type="button" className="attention-drawer__close" onClick={onClose} aria-label="Close manual project form">
            <X size={18} />
          </button>
        </div>

        <form className="attention-drawer__body custom-scrollbar space-y-5" onSubmit={handleSubmit}>
          <label className="manual-field">
            <span>Name</span>
            <input value={form.name} onChange={(event) => setField('name', event.target.value)} placeholder="My Project" autoFocus />
          </label>

          <label className="manual-field">
            <span>Path or URL</span>
            <input value={form.path} onChange={(event) => setField('path', event.target.value)} placeholder="~/dev/my-project" />
          </label>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="manual-field">
              <span>Languages</span>
              <input value={form.languages} onChange={(event) => setField('languages', event.target.value)} placeholder="TypeScript, Python" />
            </label>
            <label className="manual-field">
              <span>Package</span>
              <select value={form.packageManager} onChange={(event) => setField('packageManager', event.target.value)}>
                <option value="">None</option>
                <option value="npm">npm</option>
                <option value="pnpm">pnpm</option>
                <option value="yarn">yarn</option>
                <option value="bun">bun</option>
              </select>
            </label>
          </div>

          <label className="manual-field">
            <span>Frameworks</span>
            <input value={form.frameworks} onChange={(event) => setField('frameworks', event.target.value)} placeholder="React, Next.js" />
          </label>

          <label className="manual-field">
            <span>Tools</span>
            <input value={form.tools} onChange={(event) => setField('tools', event.target.value)} placeholder="Git, Tailwind CSS, Prisma" />
          </label>

          <label className="manual-field">
            <span>Scripts</span>
            <textarea value={form.scripts} onChange={(event) => setField('scripts', event.target.value)} rows={5} placeholder="test: npm test" />
          </label>

          <div className="rounded-xl border border-slate-800 bg-slate-800/20 p-4">
            <div className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">Signals</div>
            <div className="grid gap-3 md:grid-cols-2">
              {[
                ['isGitRepo', 'Git repo'],
                ['hasReadme', 'README'],
                ['hasAgentContext', 'Agent context'],
                ['hasCi', 'CI present'],
                ['hasEnvExample', 'Env example'],
              ].map(([field, label]) => (
                <label key={field} className="manual-check">
                  <input type="checkbox" checked={form[field]} onChange={(event) => setField(field, event.target.checked)} />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>

          {form.isGitRepo && (
            <label className="manual-field">
              <span>Branch</span>
              <input value={form.branch} onChange={(event) => setField('branch', event.target.value)} placeholder="main" />
            </label>
          )}

          <button type="submit" className="manual-submit" disabled={!canSubmit}>
            <Save size={16} /> Add Project
          </button>
        </form>
      </aside>
    </>
  );
};

const AddProjectDrawer = ({ open, workspaceRoot, onClose, onAddManualProject }) => {
  const scanRoot = workspaceRoot || '~/dev';
  const scanRootArg = /\s/.test(scanRoot) ? `"${scanRoot.replace(/"/g, '\\"')}"` : scanRoot;
  const scanCommand = `python3 scanner.py --root ${scanRootArg} --output public/projects.json`;

  return (
    <>
      <button className={`attention-drawer__scrim ${open ? 'is-open' : ''}`} type="button" aria-label="Close add project panel" onClick={onClose} aria-hidden={!open} tabIndex={open ? 0 : -1} />
      <aside className={`attention-drawer add-project-drawer ${open ? 'is-open' : ''}`} aria-hidden={!open}>
        <div className="attention-drawer__header">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.24em] text-indigo-300">Add Project</div>
            <h2 className="mt-1 text-xl font-black tracking-tight text-slate-100">Bring in new work</h2>
            <p className="mt-1 text-xs font-bold text-slate-500">Rescan for real local evidence, or add a quick manual placeholder.</p>
          </div>
          <button type="button" className="attention-drawer__close" onClick={onClose} aria-label="Close add project panel">
            <X size={18} />
          </button>
        </div>

        <div className="attention-drawer__body custom-scrollbar">
          <div className="add-project-flow">
            <section className="add-project-card add-project-card--primary">
              <div className="add-project-card__icon">
                <RefreshCw size={20} />
              </div>
              <div>
                <h3>Rescan workspace</h3>
                <p>Best for a new local project. Run the scanner again, then refresh Aperture so the generated project list is reloaded.</p>
              </div>
              <div className="add-project-command">{scanCommand}</div>
              <button type="button" className="manual-submit" onClick={() => window.location.reload()}>
                <RefreshCw size={16} /> Refresh after rescan
              </button>
            </section>

            <section className="add-project-card">
              <div className="add-project-card__icon">
                <Save size={20} />
              </div>
              <div>
                <h3>Add manually</h3>
                <p>Use this for a temporary entry, a repo outside the scanned root, or something that does not exist on disk yet.</p>
              </div>
              <button
                type="button"
                className="manual-submit"
                onClick={() => {
                  onClose();
                  onAddManualProject();
                }}
              >
                <Save size={16} /> Add manually
              </button>
            </section>
          </div>
        </div>
      </aside>
    </>
  );
};

const EmptyState = ({ onAddManualProject, onShowScannerHelp }) => {
  const [scanRoot, setScanRoot] = useState('~/dev');
  const scanCommand = `python3 scanner.py --root ${scanRoot || '~/dev'} --output public/projects.json`;

  return (
    <div className="mx-auto flex min-h-[640px] max-w-5xl flex-col justify-center px-4 py-12">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-300 ring-1 ring-indigo-500/30">
          <Zap size={26} />
        </div>
        <div className="text-xs font-black uppercase tracking-[0.35em] text-indigo-300">Aperture</div>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-100">Point Aperture at your projects</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-slate-500">
          Use the local scanner to map a folder without uploading a file snapshot into the browser.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <SetupCard icon={FolderOpen} title="Local folder scan" detail="Run scanner.py against a projects folder, then refresh the dashboard." className="lg:col-span-2">
          <button type="button" onClick={onShowScannerHelp} className="manual-submit w-full justify-center">
            <Terminal size={16} /> Show Scanner Command
          </button>
          <div className="mt-3 text-xs font-bold text-slate-500">A browser folder picker would read thousands of files as an upload-style snapshot, so Aperture uses the local scanner instead.</div>
        </SetupCard>

        <SetupCard icon={Terminal} title="Run local scanner" detail="Use this when you want deeper Git, env, CI, and launch evidence." className="lg:col-span-2">
          <label className="manual-field">
            <span>Projects root</span>
            <input value={scanRoot} onChange={(event) => setScanRoot(event.target.value)} placeholder="~/dev" />
          </label>
          <div className="mt-3 rounded-xl border border-slate-800 bg-slate-950/70 p-3 font-mono text-xs text-slate-300">
            {scanCommand}
          </div>
          <div className="mt-3 text-xs text-slate-500">Refresh after the command writes public/projects.json.</div>
        </SetupCard>

        <SetupCard icon={Save} title="Add manually" detail="Create a local dashboard entry without scanning disk.">
          <button type="button" onClick={onAddManualProject} className="manual-submit w-full justify-center">
            <Save size={16} /> New Project
          </button>
        </SetupCard>

        <SetupCard icon={GitBranch} title="Connect GitHub" detail="Planned path for remote repo inventory." disabled>
          <button className="w-full rounded-xl border border-slate-800 px-4 py-3 text-sm font-bold text-slate-500" disabled>
            Coming later
          </button>
        </SetupCard>

        <SetupCard icon={FileJson} title="Connect GitLab" detail="Planned for teams using GitLab-hosted repos." disabled>
          <button className="w-full rounded-xl border border-slate-800 px-4 py-3 text-sm font-bold text-slate-500" disabled>
            Coming later
          </button>
        </SetupCard>
      </div>
    </div>
  );
};

const TechPill = ({ tech }) => (
  <span className={`rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight ${techColors[tech] || techColors.default}`}>
    {tech}
  </span>
);

const StatusDot = ({ project }) => {
  if (project.git?.dirty) return <span className="h-2 w-2 rounded-full bg-amber-400" aria-label="Dirty worktree" />;
  if (highestRisk(project)?.severity === 'high') return <span className="h-2 w-2 rounded-full bg-rose-500" aria-label="High severity scanner finding" />;
  if (isRecentlyChanged(project)) return <span className="h-2 w-2 rounded-full bg-indigo-500" aria-label="Recently changed" />;
  return <span className="h-2 w-2 rounded-full bg-emerald-500" aria-label={`No hygiene findings from ${SCANNER_CHECK_SCOPE}`} />;
};

const openCardFromKeyboard = (event, project, onSelect) => {
  if (event.target !== event.currentTarget) return;
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    onSelect(project);
  }
};

const riskMeaning = (risk) => {
  if (!risk) return `Checked ${SCANNER_CHECK_SCOPE}`;
  if (risk.id?.includes('env')) return 'Inspect repository safety';
  if (risk.id?.includes('test')) return 'Validation path is unclear';
  if (risk.id?.includes('readme')) return 'Setup context may be missing';
  if (risk.id?.includes('ci')) return 'Automation path is unclear';
  return 'Scanner evidence needs review';
};

const driftMeaning = (drift) => {
  if (!drift.length) return 'No reference differences in checked areas';
  const top = topDriftFinding(drift);
  return `${top.category} differs from reference`;
};

const driftWhyShown = (item) => `Shown because ${item.category.toLowerCase()} differs from the selected reference project. This is an advisory difference, not a failure.`;

const riskWhyShown = (risk) => `Shown because scanner evidence matched ${riskCategory(risk).toLowerCase()}: ${risk.detail}`;

const suggestedFilesForProject = (project) => {
  const files = [
    ...(project.docs?.files ?? []),
    ...(project.docs?.agentContextFiles ?? []),
    ...Object.keys(project.runtime?.files ?? {}),
    ...(project.env?.examples ?? []),
    ...(project.ci?.paths ?? []),
  ];
  return [...new Set(files)].slice(0, 6);
};

const agentBriefLines = (project, drift = []) => {
  const stack = stackList(project);
  const risk = topRiskFinding(project.risks ?? []);
  const launchRisks = launchHygieneRisks(project);
  const setup = readinessSummary(project.aiReadiness);
  const scripts = Object.keys(project.scripts ?? {});
  const files = suggestedFilesForProject(project);
  const skipped = project.skippedChecks ?? [];
  return [
    `Project: ${project.name}`,
    `Path: ${project.path}`,
    `Stack: ${stack.length ? stack.join(', ') : 'Unknown'}`,
    `Launch profile: ${launchProfileSummary(project.launchProfile)}`,
    `Runtime: ${runtimeStatusLabel(project.runtimeStatus)}${primaryRuntimePort(project.runtimeStatus)?.url ? ` (${primaryRuntimePort(project.runtimeStatus).url})` : ''}`,
    `Package: ${project.package?.manager ?? 'None'}; scripts: ${scripts.length ? scripts.join(', ') : 'none detected'}`,
    `Git: ${project.git?.isRepo ? `${project.git?.branch ?? 'detached'}; ${project.git?.dirty ? 'dirty worktree' : 'clean worktree'}` : 'not a Git repo'}`,
    `Setup: ${setup.total ? `${setup.passed}/${setup.total} checks present` : `${project.aiReadiness?.score ?? 0}% coverage`}`,
    `Top risk: ${risk ? `${riskCategory(risk)} - ${risk.title}` : `No hygiene findings from ${SCANNER_CHECK_SCOPE}`}`,
    `Launch hygiene: ${launchRisks.length ? `${launchRisks.length} stack-aware finding${launchRisks.length === 1 ? '' : 's'}; ${launchRisks[0].title}` : 'No stack-aware launch findings'}`,
    `Skipped checks: ${skipped.length ? skipped.map((item) => item.title).join('; ') : 'none'}`,
    `Reference: ${drift.length ? `${drift.length} difference${drift.length === 1 ? '' : 's'}; ${driftMeaning(drift)}` : 'No reference differences detected'}`,
    `Inspect first: ${files.length ? files.join(', ') : 'README, package metadata, and project entrypoints if present'}`,
  ];
};

const ExperimentalProjectCard = ({ project, onSelect, drift = [], isReference }) => {
  const stack = stackList(project);
  const risk = topRiskFinding(project.risks ?? []);
  const readiness = project.aiReadiness?.score ?? 0;
  const setup = readinessSummary(project.aiReadiness);
  const archetype = projectArchetype(project, isReference);
  const riskLabel = risk ? `${riskCategory(risk)}: ${risk.title}` : 'No hygiene findings';
  const driftLabel = isReference ? 'Reference project' : drift.length ? `${drift.length} reference difference${drift.length === 1 ? '' : 's'}` : 'No reference differences';
  const scriptsCount = Object.keys(project.scripts ?? {}).length;
  const branchLabel = project.git?.branch ?? (project.git?.isRepo ? 'detached' : 'not git');
  const signalItems = [
    {
      key: 'risk',
      active: Boolean(risk),
      className: risk ? 'is-active is-risk' : '',
      label: riskLabel,
      detail: riskMeaning(risk),
      help: conceptHelp('risk', { project, drift, isReference }),
    },
    {
      key: 'drift',
      active: Boolean(drift.length) || isReference,
      className: drift.length ? 'is-active is-drift' : '',
      label: driftLabel,
      detail: driftMeaning(drift),
      help: conceptHelp('drift', { project, drift, isReference }),
    },
    {
      key: 'dirty',
      active: Boolean(project.git?.dirty),
      className: project.git?.dirty ? 'is-active is-dirty' : '',
      label: project.git?.dirty ? 'Dirty worktree' : 'Clean worktree',
      detail: project.git?.dirty ? 'Uncommitted local changes' : project.git?.isRepo ? 'No uncommitted changes detected' : 'Not detected as Git',
      help: conceptHelp('dirty', { project, drift, isReference }),
    },
  ];
  const primarySignal = signalItems.find((item) => item.active) ?? signalItems[0];
  const hiddenSignals = signalItems.filter((item) => item.key !== primarySignal.key);

  return (
    <article
      onClick={() => onSelect(project)}
      onKeyDown={(event) => openCardFromKeyboard(event, project, onSelect)}
      className="project-card-exp"
      role="button"
      tabIndex={0}
      aria-label={`Open ${project.name}`}
    >
      <div className="project-card-exp__topline">
        <span className="project-card-exp__eyebrow">
          {archetype}
          {isReference && <InfoPopover {...conceptHelp('reference', { project, drift, isReference })} />}
        </span>
        <span className="project-card-exp__top-actions">
          <RuntimeStatusIndicator runtimeStatus={project.runtimeStatus} align="right" compact />
          <span className={`project-card-exp__state project-card-exp__state--${readiness >= 80 ? 'good' : readiness >= 50 ? 'watch' : 'risk'}`}>
            {setup.label}
            <InfoPopover {...conceptHelp('readiness', { project, drift, isReference })} align="right" />
          </span>
        </span>
      </div>

      <div className="project-card-exp__hero">
        <div className="project-card-exp__identity">
          <h3>{project.name}</h3>
          <p>{project.path}</p>
        </div>
        <div className="project-card-exp__score">
          <span>{readiness}</span>
          <small>%</small>
        </div>
      </div>

      <div className="project-card-exp__facts">
        <div className="project-card-exp__fact">
          <span>Stack <InfoPopover {...conceptHelp('stack', { project, drift, isReference })} /></span>
          <strong>{stack.slice(0, 3).join(' / ') || 'Unknown'}</strong>
        </div>
        <div className="project-card-exp__fact">
          <span>Branch</span>
          <strong>{branchLabel}</strong>
        </div>
        <div className="project-card-exp__fact">
          <span>Package</span>
          <strong>{project.package?.manager ?? 'None'} · {scriptsCount} scripts</strong>
        </div>
        <div className="project-card-exp__readiness">
          <span style={{ width: `${Math.max(5, Math.min(100, readiness))}%` }} />
        </div>
      </div>

      <div className="project-card-exp__signals">
        <span className={primarySignal.className}>
          {primarySignal.label}
          <small>{primarySignal.detail}</small>
          <InfoPopover {...primarySignal.help} />
        </span>
        <details className="project-card-exp__signal-more">
          <summary>{hiddenSignals.length} more signal{hiddenSignals.length === 1 ? '' : 's'}</summary>
          <div>
            {hiddenSignals.map((item) => (
              <span key={item.key} className={item.className}>
                {item.label}
                <small>{item.detail}</small>
                <InfoPopover {...item.help} />
              </span>
            ))}
          </div>
        </details>
      </div>

      <div className="project-card-exp__footer">
        <span>Open project</span>
        <span className="project-card-exp__open">
          <ChevronRight size={15} />
        </span>
      </div>
    </article>
  );
};

const ProjectCard = ({ project, onSelect, drift = [], isReference }) => {
  const stack = stackList(project);
  const risk = topRiskFinding(project.risks ?? []);
  const readiness = project.aiReadiness?.score ?? 0;
  const setup = readinessSummary(project.aiReadiness);
  const archetype = projectArchetype(project, isReference);
  const riskLabel = risk ? `${riskCategory(risk)}: ${risk.title}` : 'No hygiene findings';
  const driftLabel = isReference ? 'Reference project' : drift.length ? `${drift.length} reference difference${drift.length === 1 ? '' : 's'}` : 'No reference differences';
  return (
    <article
      onClick={() => onSelect(project)}
      onKeyDown={(event) => openCardFromKeyboard(event, project, onSelect)}
      className="group relative rounded-xl border border-slate-800 bg-slate-900 p-5 text-left transition-all hover:border-indigo-500/50 hover:bg-slate-900/80"
      role="button"
      tabIndex={0}
      aria-label={`Open ${project.name}`}
    >
      {risk?.severity === 'high' && (
        <div className="absolute right-0 top-0 rounded-bl-lg bg-rose-600 px-3 py-1 text-[10px] font-black uppercase text-white">
          {riskCategory(risk)}
        </div>
      )}
      {isReference && (
        <div className="absolute right-0 top-0 rounded-bl-lg bg-indigo-600 px-3 py-1 text-[10px] font-black uppercase text-white">
          Reference
        </div>
      )}

      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
            {archetype}
            {isReference && <InfoPopover {...conceptHelp('reference', { project, drift, isReference })} />}
          </div>
          <h3 className="flex items-center gap-2 truncate text-lg font-bold text-slate-100 transition-colors group-hover:text-indigo-400">
            {project.name}
            {risk && <ShieldAlert size={16} className={risk.severity === 'high' ? 'text-rose-500' : 'text-amber-400'} />}
            {drift.length > 0 && <GitCompareArrows size={16} className={topDriftFinding(drift)?.severity === 'high' ? 'text-rose-400' : 'text-amber-400'} />}
          </h3>
          <p className="mt-1 flex items-center gap-1 truncate font-mono text-xs text-slate-500">
            <FolderOpen size={12} /> {project.path}
          </p>
        </div>
        <div className="text-right">
          <div className={`flex items-center justify-end gap-1 font-mono text-sm font-bold ${setup.failed.length ? 'text-amber-400' : 'text-emerald-400'}`}>
            {setup.total ? `${setup.passed}/${setup.total}` : `${readiness}%`}
            <InfoPopover {...conceptHelp('readiness', { project, drift, isReference })} align="right" />
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Setup checks</div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4">
        <div>
          <div className="mb-2 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            <Dna size={10} /> Stack <InfoPopover {...conceptHelp('stack', { project, drift, isReference })} />
          </div>
          <div className="flex flex-wrap gap-1">
            {stack.slice(0, 4).map((tech) => <TechPill key={tech} tech={tech} />)}
            {stack.length === 0 && <span className="text-xs text-slate-600">Unknown</span>}
            {stack.length > 4 && <span className="text-[10px] font-bold text-slate-500">+{stack.length - 4}</span>}
          </div>
        </div>
        <div>
          <div className="mb-2 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            <FileJson size={10} /> Package
          </div>
          <div className="font-mono text-sm font-bold text-slate-300">{project.package?.manager ?? 'None'}</div>
          <div className="mt-1 text-xs text-slate-500">{Object.keys(project.scripts ?? {}).length} scripts</div>
          <div className={`mt-1 flex items-center gap-1 text-xs font-bold ${drift.length ? 'text-amber-400' : 'text-emerald-400'}`}>
            {driftLabel}
            <InfoPopover {...conceptHelp('drift', { project, drift, isReference })} align="right" />
          </div>
        </div>
      </div>

      <div className="mb-5 grid gap-2">
        <div className={`evidence-line ${risk ? 'evidence-line--risk' : 'evidence-line--good'}`}>
          <div>
            <strong>{riskLabel}</strong>
            <span>{riskMeaning(risk)}</span>
          </div>
          <InfoPopover {...conceptHelp('risk', { project, drift, isReference })} align="right" />
        </div>
        <div className={`evidence-line ${project.git?.dirty ? 'evidence-line--dirty' : 'evidence-line--good'}`}>
          <div>
            <strong>{project.git?.dirty ? 'Dirty worktree' : 'Clean worktree'}</strong>
            <span>{project.git?.dirty ? 'Uncommitted local changes detected' : project.git?.isRepo ? 'No uncommitted changes detected' : 'Not detected as Git'}</span>
          </div>
          <InfoPopover {...conceptHelp('dirty', { project, drift, isReference })} align="right" />
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-slate-800/50 pt-4">
        <div className="flex min-w-0 gap-4">
          <div className="flex min-w-0 items-center gap-1.5 text-xs text-slate-400">
            <GitBranch size={12} className="text-indigo-400" />
            <span className="truncate font-mono">{project.git?.branch ?? (project.git?.isRepo ? 'detached' : 'not git')}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Clock size={12} className="text-slate-500" />
            <span>{formatDate(project.git?.lastCommit?.date)}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-500 transition-colors group-hover:text-indigo-400">
            Open <ChevronRight size={12} />
          </span>
          <StatusDot project={project} />
        </div>
      </div>
    </article>
  );
};

const DiscoveryReview = ({ candidates, onCommitProjectStates, onDefer }) => {
  const [openMenuId, setOpenMenuId] = useState(null);
  const [draftStates, setDraftStates] = useState({});
  const stagedCount = Object.values(draftStates).filter(Boolean).length;
  const workspaceCount = Object.values(draftStates).filter((state) => state === 'tracked' || state === 'reference').length;
  const deferredCount = candidates.length - stagedCount;
  const commitLabel = workspaceCount
    ? `Finish setup · ${workspaceCount} selected`
    : 'Finish with none selected';
  const stageProject = (projectId, state) => {
    setDraftStates((current) => ({ ...current, [projectId]: state }));
    setOpenMenuId(null);
  };
  const trackAll = () => {
    setDraftStates(Object.fromEntries(candidates.map((project) => [project.id, 'tracked'])));
    setOpenMenuId(null);
  };
  const finishSetup = () => {
    onCommitProjectStates(Object.fromEntries(candidates.map((project) => [project.id, draftStates[project.id] ?? 'sleeping'])));
  };
  const selectionLabel = workspaceCount
    ? `${workspaceCount} selected for the workspace`
    : 'Nothing selected yet';

  return (
    <>
      <div className="setup-wizard__scrim" />
      <section className="setup-wizard" role="dialog" aria-modal="true" aria-labelledby="setup-wizard-title">
        <div className="setup-wizard__hero">
          <div>
            <div className="setup-wizard__eyebrow">Discovery review</div>
            <h2 id="setup-wizard-title">Aperture found your workspace</h2>
            <p>
              Pick what belongs in the workspace map, then finish setup. Aperture will not guess which project matters most.
            </p>
          </div>
          <div className="setup-wizard__count">
            <strong>{candidates.length}</strong>
            <span>new candidate{candidates.length === 1 ? '' : 's'}</span>
          </div>
        </div>

        <div className="setup-wizard__toolbar">
          <span>{candidates.length} candidate{candidates.length === 1 ? '' : 's'} found</span>
          <div>
            <button type="button" onClick={trackAll}>Track all</button>
            <button type="button" onClick={onDefer}>Skip all for now</button>
          </div>
        </div>

        {candidates.length > 0 && (
          <div className="setup-wizard__list">
            {candidates.map((project) => (
              <article key={project.id} className={`setup-candidate ${draftStates[project.id] ? 'is-selected' : ''}`}>
                <div className="setup-candidate__identity">
                  <h3>{project.name}</h3>
                  <p>{project.path}</p>
                </div>
                <div className="setup-candidate__meta">
                  <span>{stackList(project).slice(0, 2).join(' / ') || 'Unknown stack'}</span>
                  <span>{draftStates[project.id] ? PROJECT_STATE_LABELS[draftStates[project.id]] : `${(project.risks ?? []).length} finding${(project.risks ?? []).length === 1 ? '' : 's'}`}</span>
                </div>
                <div className="setup-candidate__actions">
                  <button type="button" className="setup-candidate__track" onClick={() => stageProject(project.id, 'tracked')}>
                    Track
                  </button>
                  <button type="button" onClick={() => stageProject(project.id, 'reference')}>
                    Reference
                  </button>
                  <div className="setup-candidate__more">
                    <button
                      type="button"
                      aria-label={`More actions for ${project.name}`}
                      aria-expanded={openMenuId === project.id}
                      onClick={() => setOpenMenuId((current) => (current === project.id ? null : project.id))}
                    >
                      <MoreHorizontal size={18} />
                    </button>
                    {openMenuId === project.id && (
                      <div className="setup-candidate__menu">
                        {['sleeping', 'archived', 'ignored'].map((state) => (
                          <button
                            key={state}
                            type="button"
                            onClick={() => stageProject(project.id, state)}
                          >
                            {PROJECT_STATE_LABELS[state]}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="setup-wizard__finish">
          <div>
            <strong>{selectionLabel}</strong>
            <span>{deferredCount ? `${deferredCount} candidate${deferredCount === 1 ? '' : 's'} will be marked sleeping.` : 'All candidates have a decision.'}</span>
          </div>
          <button type="button" className="setup-wizard__done" onClick={finishSetup}>
            <CheckCircle2 size={15} />
            {commitLabel}
          </button>
        </div>
      </section>
    </>
  );
};

const ProjectDrawer = ({ project, open, onClose, drift = [], referenceProject, isReference, onRefreshScan, scanRefreshStatus }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const risks = project.risks ?? [];
  const launchRisks = launchHygieneRisks(project);
  const normalChecks = looksNormalChecks(project);
  const skippedChecks = project.skippedChecks ?? [];
  const checks = project.aiReadiness?.checks ?? [];
  const briefLines = agentBriefLines(project, drift);
  const tabs = [
    { id: 'overview', label: 'Overview', icon: ShieldAlert },
    { id: 'source', label: 'Source', icon: GitBranch },
    { id: 'drift', label: 'Drift', icon: GitCompareArrows },
    { id: 'brief', label: 'Brief', icon: FileJson },
  ];
  return (
    <>
      <button className={`attention-drawer__scrim ${open ? 'is-open' : ''}`} type="button" aria-label={`Close ${project.name}`} onClick={onClose} aria-hidden={!open} tabIndex={open ? 0 : -1} />
      <aside className={`project-drawer ${open ? 'is-open' : ''}`} aria-label={`${project.name} details`} aria-hidden={!open}>
        <div className="attention-drawer__header">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-100">
              <FolderOpen className="text-indigo-400" /> {project.name}
              <RuntimeStatusIndicator runtimeStatus={project.runtimeStatus} align="right" compact />
            </h2>
            <p className="mt-1 font-mono text-sm text-slate-500">{project.path}</p>
          </div>
          <button type="button" onClick={onClose} className="attention-drawer__close" aria-label={`Close ${project.name}`}>
            <X size={18} />
          </button>
        </div>

        <nav className="project-drawer__tabs" aria-label={`${project.name} detail tabs`}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <div key={tab.id} className={`project-drawer__tab ${activeTab === tab.id ? 'is-active' : ''}`}>
                <button
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon size={14} />
                  {tab.label}
                </button>
                <InfoPopover {...drawerTabHelp[tab.id]} align={tab.id === 'brief' ? 'right' : 'left'} />
              </div>
            );
          })}
        </nav>

        <div className="project-drawer__body custom-scrollbar">
          {activeTab === 'source' ? (
            <ProjectSourceSignal project={project} onRefreshScan={onRefreshScan} refreshStatus={scanRefreshStatus} />
          ) : activeTab === 'drift' ? (
            <>
              <section className="project-drawer__panel project-drawer__panel--readiness">
                <div className="project-drawer__section-heading">
                  <h3><Cpu size={14} /> Setup Readiness</h3>
                  <span>{readinessSummary(project.aiReadiness).label}</span>
                </div>
                <div className="project-drawer__meter">
                  <div style={{ width: `${project.aiReadiness?.score ?? 0}%` }} />
                </div>
                <div className="project-drawer__check-grid">
                  {checks.length > 0 ? checks.map((check) => (
                    <div key={check.id} className="project-drawer__check">
                      {check.passed ? <CheckCircle2 size={15} className="text-emerald-400" /> : <AlertTriangle size={15} className="text-amber-400" />}
                      <span>{check.label}</span>
                    </div>
                  )) : <span className="text-sm text-slate-500">No checklist details in this dataset.</span>}
                </div>
              </section>

              <section>
                <div className="project-drawer__section-heading project-drawer__section-heading--subtle">
                  <h3>
                    <GitCompareArrows size={14} /> Reference Differences
                    <InfoPopover {...briefExplainers.Reference} />
                  </h3>
                  <span>
                    vs. {referenceProject?.name ?? 'reference'}
                  </span>
                </div>
                {isReference ? (
                  <div className="project-drawer__panel project-drawer__empty">
                    This project is the current reference. Other projects are compared against it.
                  </div>
                ) : drift.length > 0 ? (
                  <div className="project-drawer__stack">
                    {drift.map((item) => (
                      <div key={item.id} className={`project-drawer__drift-card ${severityStyles[item.severity] || severityStyles.medium}`}>
                        <div className="project-drawer__drift-head">
                          <div>
                            <div className="project-drawer__drift-title">{item.category}</div>
                            <div className="project-drawer__drift-detail">{item.detail}</div>
                            <div className="project-drawer__why">{driftWhyShown(item)}</div>
                          </div>
                          <div className="project-drawer__tag">Advisory</div>
                        </div>
                        <div className="project-drawer__diff-row">
                          <span className="project-drawer__diff-value project-drawer__diff-value--current">{item.current}</span>
                          <ChevronRight size={13} className="project-drawer__diff-arrow" />
                          <span className="project-drawer__diff-value project-drawer__diff-value--reference">{item.reference}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="project-drawer__panel project-drawer__empty text-emerald-300">
                    <CheckCircle2 className="mx-auto mb-2" /> Matches the reference on package, scripts, docs, env, CI, and runtime hints checked by Aperture.
                  </div>
                )}
              </section>
            </>
          ) : activeTab === 'brief' ? (
            <>
              <section className="project-drawer__panel">
                <div className="project-drawer__section-heading project-drawer__section-heading--subtle">
                  <h3>
                    <FileJson size={14} /> Agent Brief Preview
                    <InfoPopover
                      title="Agent brief"
                      body="Use this when handing the project to an AI coding agent or returning later yourself. It is generated from observed project metadata, risks, drift, scripts, and suggested files."
                    />
                  </h3>
                </div>
                <div className="agent-brief-preview">
                  {briefLines.map((line) => (
                    <BriefLine key={line} line={line} />
                  ))}
                </div>
              </section>

              <section className="project-drawer__panel">
                <div className="project-drawer__section-heading project-drawer__section-heading--subtle">
                  <h3><FileJson size={14} /> Useful Commands</h3>
                </div>
                <div className="project-drawer__command-grid">
                  {Object.entries(project.scripts ?? {}).length > 0 ? Object.entries(project.scripts).map(([name, command]) => (
                    <div key={name} className="rounded-lg bg-slate-950/50 p-3 font-mono text-xs">
                      <span className="text-indigo-300">{name}</span><span className="text-slate-600">: </span><span className="text-slate-300">{command}</span>
                    </div>
                  )) : <span className="text-sm text-slate-500">No package scripts detected.</span>}
                </div>
              </section>
            </>
          ) : (
            <>
          <section className="project-drawer__stats">
            <div className="project-drawer__stat">
              <div className="project-drawer__label">Branch</div>
              <div className="project-drawer__value font-mono">{project.git?.branch ?? 'Unknown'}</div>
            </div>
            <div className="project-drawer__stat">
              <div className="project-drawer__label">Worktree</div>
              <div className={`project-drawer__value ${project.git?.dirty ? 'text-amber-400' : 'text-emerald-400'}`}>{project.git?.dirty ? 'Dirty' : project.git?.isRepo ? 'Clean' : 'Not a Git repo'}</div>
            </div>
            <div className="project-drawer__stat">
              <div className="project-drawer__label">Last Commit</div>
              <div className="project-drawer__value">{formatDate(project.git?.lastCommit?.date)}</div>
            </div>
            <div className="project-drawer__stat">
              <div className="project-drawer__label">Runtime</div>
              <div className="project-drawer__value">
                <RuntimeStatusIndicator runtimeStatus={project.runtimeStatus} align="right" />
              </div>
            </div>
          </section>

          <section className="project-drawer__panel project-drawer__panel--launch">
            <div className="project-drawer__section-heading">
              <h3><ShieldAlert size={14} /> Detected Launch Profile</h3>
              <span>{PROJECT_STATE_LABELS[project.projectState] ?? 'Tracked'}</span>
            </div>
            <div className="launch-profile-grid">
              {launchProfileRows(project.launchProfile).map(([label, value]) => (
                <div key={label} className="launch-profile-item">
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="project-drawer__section-heading project-drawer__section-heading--subtle">
              <h3>
                <AlertTriangle size={14} /> Fix Before Sharing
                <InfoPopover {...briefExplainers['Launch hygiene']} />
              </h3>
              <span>{launchRisks.length} finding{launchRisks.length === 1 ? '' : 's'}</span>
            </div>
            <div className="project-drawer__stack">
              {launchRisks.length > 0 ? launchRisks.map((risk) => (
                <div key={`${risk.id}-${risk.detail}`} className={`project-drawer__drift-card ${severityStyles[risk.severity] || severityStyles.low}`}>
                  <div className="project-drawer__drift-head">
                    <div>
                      <div className="project-drawer__drift-title">{risk.title}</div>
                      <div className="project-drawer__drift-detail">{risk.detail}</div>
                      <div className="project-drawer__why">
                        Confidence: {risk.confidence ?? 'medium'}{risk.evidence?.length ? ` · Evidence: ${risk.evidence.join(', ')}` : ''}
                      </div>
                      {risk.fix && <div className="project-drawer__fix">{risk.fix}</div>}
                    </div>
                    <div className="project-drawer__tag">{riskCategory(risk)}</div>
                  </div>
                </div>
              )) : (
                <div className="project-drawer__panel project-drawer__empty text-emerald-300">
                  <CheckCircle2 className="mx-auto mb-2" /> No stack-aware launch findings detected.
                </div>
              )}
            </div>
          </section>

          <section>
            <div className="project-drawer__section-heading project-drawer__section-heading--subtle">
              <h3><CheckCircle2 size={14} /> Looks Normal</h3>
            </div>
            <div className="project-drawer__stack">
              {normalChecks.length > 0 ? normalChecks.map((check) => (
                <div key={check.title} className="project-drawer__normal-card">
                  <div className="project-drawer__drift-title">{check.title}</div>
                  <div className="project-drawer__drift-detail">{check.detail}</div>
                </div>
              )) : (
                <div className="project-drawer__panel project-drawer__empty">
                  No stack-specific normalizations apply yet.
                </div>
              )}
            </div>
          </section>

          <section>
            <div className="project-drawer__section-heading project-drawer__section-heading--subtle">
              <h3>
                <CircleHelp size={14} /> Skipped Checks
                <InfoPopover {...briefExplainers['Skipped checks']} />
              </h3>
            </div>
            <div className="project-drawer__stack">
              {skippedChecks.length > 0 ? skippedChecks.map((check) => (
                <div key={check.id} className="project-drawer__skipped-card">
                  <div className="project-drawer__drift-title">{check.title}</div>
                  <div className="project-drawer__drift-detail">{check.reason}</div>
                </div>
              )) : (
                <div className="project-drawer__panel project-drawer__empty text-emerald-300">
                  <CheckCircle2 className="mx-auto mb-2" /> No checks were skipped for this project profile.
                </div>
              )}
            </div>
          </section>

          <section className="project-drawer__panel project-drawer__panel--readiness">
            <div className="project-drawer__section-heading">
              <h3><Cpu size={14} /> Setup Readiness</h3>
              <span>{readinessSummary(project.aiReadiness).label}</span>
            </div>
            <div className="project-drawer__meter">
              <div style={{ width: `${project.aiReadiness?.score ?? 0}%` }} />
            </div>
            <div className="project-drawer__check-grid">
              {checks.length > 0 ? checks.map((check) => (
                <div key={check.id} className="project-drawer__check">
                  {check.passed ? <CheckCircle2 size={15} className="text-emerald-400" /> : <AlertTriangle size={15} className="text-amber-400" />}
                  <span>{check.label}</span>
                </div>
              )) : <span className="text-sm text-slate-500">No checklist details in this dataset.</span>}
            </div>
          </section>

          <section>
            <div className="project-drawer__section-heading project-drawer__section-heading--subtle">
              <h3>
                <GitCompareArrows size={14} /> Reference Differences
                <InfoPopover {...briefExplainers.Reference} />
              </h3>
              <span>
                vs. {referenceProject?.name ?? 'reference'}
              </span>
            </div>
            {isReference ? (
              <div className="project-drawer__panel project-drawer__empty">
                This project is the current reference. Other projects are compared against it.
              </div>
            ) : drift.length > 0 ? (
              <div className="project-drawer__stack">
                {drift.map((item) => (
                  <div key={item.id} className={`project-drawer__drift-card ${severityStyles[item.severity] || severityStyles.medium}`}>
                    <div className="project-drawer__drift-head">
                      <div>
                        <div className="project-drawer__drift-title">{item.category}</div>
                        <div className="project-drawer__drift-detail">{item.detail}</div>
                        <div className="project-drawer__why">{driftWhyShown(item)}</div>
                      </div>
                      <div className="project-drawer__tag">Advisory</div>
                    </div>
                    <div className="project-drawer__diff-row">
                      <span className="project-drawer__diff-value project-drawer__diff-value--current">{item.current}</span>
                      <ChevronRight size={13} className="project-drawer__diff-arrow" />
                      <span className="project-drawer__diff-value project-drawer__diff-value--reference">{item.reference}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="project-drawer__panel project-drawer__empty text-emerald-300">
                <CheckCircle2 className="mx-auto mb-2" /> Matches the reference on package, scripts, docs, env, CI, and runtime hints checked by Aperture.
              </div>
            )}
          </section>

          <section>
            <div className="project-drawer__section-heading project-drawer__section-heading--subtle">
              <h3><ShieldAlert size={14} /> Risk Radar</h3>
            </div>
            <div className="project-drawer__stack">
              {risks.length > 0 ? risks.map((risk) => (
                <div key={`${risk.id}-${risk.detail}`} className={`project-drawer__drift-card ${severityStyles[risk.severity] || severityStyles.low}`}>
                  <div className="project-drawer__drift-title">{riskCategory(risk)}: {risk.title}</div>
                  <div className="project-drawer__drift-detail">{risk.detail}</div>
                  <div className="project-drawer__why">{riskWhyShown(risk)}</div>
                </div>
              )) : (
                <div className="project-drawer__panel project-drawer__empty text-emerald-300">
                  <CheckCircle2 className="mx-auto mb-2" /> No hygiene findings from {SCANNER_CHECK_SCOPE}.
                </div>
              )}
            </div>
          </section>

          <section className="project-drawer__panel">
            <div className="project-drawer__section-heading project-drawer__section-heading--subtle">
              <h3>
                <FileJson size={14} /> Agent Brief Preview
                <InfoPopover
                  title="Agent brief"
                  body="Use this when handing the project to an AI coding agent or returning later yourself. It is generated from observed project metadata, risks, drift, scripts, and suggested files."
                />
              </h3>
            </div>
            <div className="agent-brief-preview">
              {briefLines.map((line) => (
                <BriefLine key={line} line={line} />
              ))}
            </div>
          </section>

          <section className="project-drawer__panel">
            <div className="project-drawer__section-heading project-drawer__section-heading--subtle">
              <h3><FileJson size={14} /> Useful Commands</h3>
            </div>
            <div className="project-drawer__command-grid">
              {Object.entries(project.scripts ?? {}).length > 0 ? Object.entries(project.scripts).map(([name, command]) => (
                <div key={name} className="rounded-lg bg-slate-950/50 p-3 font-mono text-xs">
                  <span className="text-indigo-300">{name}</span><span className="text-slate-600">: </span><span className="text-slate-300">{command}</span>
                </div>
              )) : <span className="text-sm text-slate-500">No package scripts detected.</span>}
            </div>
          </section>
            </>
          )}
        </div>
      </aside>
    </>
  );
};

const SettingsModal = ({ open, projects, allProjects, referenceProjectId, onReferenceProjectChange, onSetProjectState, onClose }) => (
  <>
    <button className={`settings-modal__scrim ${open ? 'is-open' : ''}`} type="button" aria-label="Close settings" onClick={onClose} aria-hidden={!open} tabIndex={open ? 0 : -1} />
    <section className={`settings-modal ${open ? 'is-open' : ''}`} role="dialog" aria-modal="true" aria-labelledby="settings-title" aria-hidden={!open}>
      <div className="settings-modal__header">
        <div>
          <div className="text-xs font-black uppercase tracking-[0.24em] text-indigo-300">Settings</div>
          <h2 id="settings-title" className="mt-1 text-xl font-black tracking-tight text-slate-100">Workspace preferences</h2>
          <p className="mt-1 text-xs font-bold text-slate-500">Configure how Aperture compares and presents this workspace.</p>
        </div>
        <button type="button" className="attention-drawer__close" onClick={onClose} aria-label="Close settings">
          <X size={18} />
        </button>
      </div>

      <div className="settings-modal__body">
        <div className="settings-modal__setting">
          <div>
            <h3 className="settings-modal__setting-title">
              <GitCompareArrows size={16} /> Reference Project
            </h3>
            <p className="settings-modal__setting-copy">Choose the gold-standard project. Drift remains advisory and read-only.</p>
          </div>
          <select
            className="settings-modal__select"
            value={referenceProjectId}
            onChange={(event) => onReferenceProjectChange(event.target.value)}
            disabled={projects.length === 0}
          >
            {projects.length > 0 ? projects.map((project) => (
              <option key={project.id} value={project.id}>{project.name}</option>
            )) : (
              <option value="">No projects available</option>
            )}
          </select>
        </div>
        <div className="settings-modal__setting">
          <div>
            <h3 className="settings-modal__setting-title">
              <FolderOpen size={16} /> Discovery Management
            </h3>
            <p className="settings-modal__setting-copy">Manage tracked, ignored, archived, sleeping, and reference projects from the latest scanner data.</p>
          </div>
          <div className="settings-project-list">
            {allProjects.length > 0 ? allProjects.map((project) => (
              <div key={project.id} className="settings-project-row">
                <div className="min-w-0">
                  <strong>{project.name}</strong>
                  <span>{PROJECT_STATE_LABELS[project.projectState] ?? 'Candidate'} · {launchProfileSummary(project.launchProfile)}</span>
                </div>
                <select
                  value={project.projectState}
                  onChange={(event) => onSetProjectState(project.id, event.target.value)}
                >
                  {Object.entries(PROJECT_STATE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            )) : (
              <div className="text-sm font-bold text-slate-500">No projects discovered yet.</div>
            )}
          </div>
        </div>
      </div>
    </section>
  </>
);

const gitChanges = (project) => Array.isArray(project.git?.changes) ? project.git.changes : [];
const gitCommits = (project) => Array.isArray(project.git?.recentCommits) ? project.git.recentCommits : [];
const dirtyCount = (project) => gitChanges(project).length || (project.git?.dirty ? 1 : 0);
const sourceActivityDate = (project) => project.git?.lastCommit?.date ?? gitCommits(project)[0]?.date;
const shortSha = (sha) => (sha ? String(sha).slice(0, 7) : 'unknown');

const gitStatusMeta = (status = '') => {
  const normalized = String(status).trim();
  if (normalized.includes('??')) return { label: 'Untracked', tone: 'new' };
  if (normalized.includes('A')) return { label: 'Added', tone: 'new' };
  if (normalized.includes('D')) return { label: 'Deleted', tone: 'removed' };
  if (normalized.includes('R')) return { label: 'Renamed', tone: 'moved' };
  if (normalized.includes('M')) return { label: 'Modified', tone: 'modified' };
  return { label: normalized || 'Changed', tone: 'modified' };
};

const sourceStateLabel = (project) => {
  if (!project.git?.isRepo) return 'Not Git';
  if (project.git?.dirty) return `${dirtyCount(project)} change${dirtyCount(project) === 1 ? '' : 's'}`;
  return 'Clean';
};

const ProjectSourceSignal = ({ project, onRefreshScan, refreshStatus }) => {
  const changes = gitChanges(project);
  const commits = gitCommits(project);
  const hasUncapturedDirtyState = project.git?.dirty && changes.length === 0;
  const changedGroups = changes.reduce((groups, change) => {
    const meta = gitStatusMeta(change.status);
    return {
      ...groups,
      [meta.label]: [...(groups[meta.label] ?? []), { ...change, meta }],
    };
  }, {});

  return (
    <div className="source-signal">
      <div className="source-signal__summary">
        <div>
          <span>Repository</span>
          <strong>{project.git?.isRepo ? project.git?.branch ?? 'detached' : 'Not Git'}</strong>
        </div>
        <div>
          <span>Worktree Pulse</span>
          <strong>{sourceStateLabel(project)}</strong>
        </div>
      </div>

      <section className="source-zone">
        <div className="source-zone__heading">
          <span>Repository Signal</span>
          <small>Read-only</small>
        </div>
        <div className="source-git-overview">
          <div>
            <span>Branch</span>
            <strong>{project.git?.branch ?? (project.git?.isRepo ? 'detached' : 'not git')}</strong>
          </div>
          <div>
            <span>Worktree</span>
            <strong className={project.git?.dirty ? 'is-dirty' : ''}>{project.git?.dirty ? 'Dirty' : project.git?.isRepo ? 'Clean' : 'Not Git'}</strong>
          </div>
          <div>
            <span>Last commit</span>
            <strong>{formatDate(sourceActivityDate(project))}</strong>
          </div>
        </div>
      </section>

      <section className="source-zone">
        <div className="source-zone__heading">
          <span>Change Lens</span>
          <small>{project.name}</small>
        </div>
        {!project.git?.isRepo ? (
          <div className="source-empty">This project is not detected as a Git repository.</div>
        ) : changes.length > 0 ? (
          <div className="source-change-groups">
            {Object.entries(changedGroups).map(([label, items]) => (
              <div key={label} className="source-change-group">
                <div className="source-change-group__label">{label} <span>{items.length}</span></div>
                {items.map((change) => (
                  <button
                    key={`${change.status}-${change.path}`}
                    type="button"
                    className={`source-change source-change--${change.meta.tone}`}
                  >
                    <span>{basename(change.path)}</span>
                    <small>{dirname(change.path)}</small>
                  </button>
                ))}
              </div>
            ))}
          </div>
        ) : hasUncapturedDirtyState ? (
          <div className="source-empty source-empty--dirty">
            <strong>Git reports uncommitted changes, but this scan did not include the changed-file list.</strong>
            <span>Run the local scanner, then refresh scan data here. A future Git connector could fill this directly.</span>
            <div className="source-empty__actions">
              <button type="button" onClick={onRefreshScan} disabled={refreshStatus === 'refreshing'}>
                {refreshStatus === 'refreshing' ? 'Refreshing' : 'Refresh scan data'}
              </button>
              <em>{refreshStatus === 'updated' ? 'Scan data refreshed.' : refreshStatus === 'missing' ? 'No generated projects.json found.' : refreshStatus === 'error' ? 'Refresh failed.' : 'Git connector not connected.'}</em>
            </div>
          </div>
        ) : (
          <div className="source-empty">No local changes detected.</div>
        )}
      </section>

      <section className="source-zone source-zone--pulse">
        <div className="source-zone__heading">
          <span>Pulse Graph</span>
          <small>{formatDate(sourceActivityDate(project))}</small>
        </div>
        {commits.length > 0 ? (
          <div className="source-pulse">
            {commits.map((commit, index) => (
              <button
                key={`${commit.sha}-${index}`}
                type="button"
                className="source-commit"
              >
                <span className={`source-commit__node ${index === 0 ? 'is-head' : ''}`} />
                <span className="source-commit__copy">
                  <strong>{commit.message || 'Untitled commit'}</strong>
                  <small>{shortSha(commit.sha)} · {formatDate(commit.date)}</small>
                  {commit.refs?.length > 0 && (
                    <span className="source-commit__refs">
                      {commit.refs.slice(0, 2).map((ref) => <em key={ref}>{ref.replace('HEAD -> ', '')}</em>)}
                    </span>
                  )}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="source-empty">{project.git?.isRepo ? 'No recent commit history captured. Run the local scanner again.' : 'Git history appears when a repo is detected.'}</div>
        )}
      </section>
    </div>
  );
};

const BriefLine = ({ line }) => {
  const explainer = explainerForBriefLine(line);
  return (
    <div className="agent-brief-preview__line">
      <span>{line}</span>
      {explainer && <InfoPopover {...explainer} align="right" />}
    </div>
  );
};

const Sidebar = ({ settingsOpen, onOpenSettings }) => (
  <aside className="flex w-20 flex-col items-center border-r border-slate-800 bg-slate-950 py-8 transition-all">
    <div className="mb-12 flex h-10 w-10 items-center justify-center border border-indigo-500/30 bg-indigo-500/10 text-indigo-300">
      <Zap size={20} />
    </div>

    <nav className="flex-1 space-y-2 px-3">
      {[
        { name: 'Workspace', icon: LayoutDashboard, active: !settingsOpen },
        { name: 'Attention', icon: AlertTriangle, active: false },
        { name: 'Settings', icon: Settings, active: settingsOpen, onClick: onOpenSettings },
      ].map((item) => (
        <button
          key={item.name}
          type="button"
          title={item.name}
          aria-label={item.name}
          onClick={item.onClick}
          className={`flex h-11 w-11 items-center justify-center transition-all ${item.active ? 'bg-indigo-600/10 text-indigo-400' : 'text-slate-500 hover:bg-slate-900 hover:text-slate-300'}`}
        >
          <item.icon size={20} />
        </button>
      ))}
    </nav>
  </aside>
);

export default function App() {
  const [scan, setScan] = useState(null);
  const [dataStatus, setDataStatus] = useState('loading');
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectDrawerOpen, setProjectDrawerOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('aperture-theme') || localStorage.getItem('aperture-theme-mode') || 'dark');
  const [attentionOpen, setAttentionOpen] = useState(false);
  const [insightDrawer, setInsightDrawer] = useState(null);
  const [addProjectOpen, setAddProjectOpen] = useState(false);
  const [manualProjectFormOpen, setManualProjectFormOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [manualProjects, setManualProjects] = useState(readManualProjects);
  const [projectStates, setProjectStates] = useState(readProjectStates);
  const [seenAttentionIds, setSeenAttentionIds] = useState(readSeenAttentionIds);
  const [referenceProjectId, setReferenceProjectId] = useState(() => localStorage.getItem('aperture-reference-project') || '');
  const [folderPickerMessage, setFolderPickerMessage] = useState('');
  const [scanRefreshStatus, setScanRefreshStatus] = useState('idle');
  const projectCloseTimer = useRef(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/projects.json', { cache: 'no-store' })
      .then(async (response) => {
        const contentType = response.headers.get('content-type') ?? '';
        if (!response.ok || !contentType.includes('application/json')) {
          throw new Error('No generated projects.json found.');
        }
        return response.json();
      })
      .then((data) => {
        if (!cancelled && data?.schemaVersion === 'aperture.scan.v1' && Array.isArray(data.projects)) {
          setScan(data);
          setDataStatus('live');
        }
      })
      .catch(() => {
        if (!cancelled) {
          setScan({ ...DEMO_SCAN, projects: [] });
          setDataStatus('empty');
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme === 'light' || theme === 'paper' ? 'light' : 'dark';
    if (['signal', 'paper', 'terminal'].includes(theme)) {
      document.documentElement.dataset.vibe = theme;
    } else {
      delete document.documentElement.dataset.vibe;
    }
    localStorage.setItem('aperture-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(MANUAL_PROJECTS_STORAGE_KEY, JSON.stringify(manualProjects));
  }, [manualProjects]);

  useEffect(() => {
    localStorage.setItem(PROJECT_STATES_STORAGE_KEY, JSON.stringify(projectStates));
  }, [projectStates]);

  useEffect(() => {
    if (!settingsOpen && !addProjectOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setSettingsOpen(false);
        setAddProjectOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [settingsOpen, addProjectOpen]);

  useEffect(() => () => {
    if (projectCloseTimer.current) {
      window.clearTimeout(projectCloseTimer.current);
    }
  }, []);

  const allProjects = useMemo(
    () => [...(scan?.projects ?? []), ...manualProjects].map((project) => applyProjectState(project, projectStates)),
    [scan?.projects, manualProjects, projectStates],
  );
  const candidateProjects = useMemo(() => allProjects.filter((project) => project.projectState === 'candidate'), [allProjects]);
  const projects = useMemo(() => allProjects.filter((project) => TRACKED_PROJECT_STATES.has(project.projectState)), [allProjects]);
  const workspaceRootLabel = scan?.workspaceRoot ?? (manualProjects.length ? 'Manual entries' : '');
  const shouldShowDashboard = dataStatus === 'live' || manualProjects.length > 0;
  const displayedDataStatus = dataStatus === 'live' ? 'Generated projects.json' : dataStatus === 'loading' ? 'Analyzing' : manualProjects.length ? 'Manual entries' : 'No workspace yet';
  const refreshScanData = async () => {
    setScanRefreshStatus('refreshing');
    try {
      const response = await fetch('/projects.json', { cache: 'no-store' });
      const contentType = response.headers.get('content-type') ?? '';
      if (!response.ok || !contentType.includes('application/json')) {
        throw new Error('missing');
      }
      const data = await response.json();
      if (data?.schemaVersion !== 'aperture.scan.v1' || !Array.isArray(data.projects)) {
        throw new Error('invalid');
      }
      setScan(data);
      setDataStatus('live');
      setSelectedProject((current) => {
        if (!current) return current;
        const refreshed = [...data.projects, ...manualProjects].find((project) => project.id === current.id);
        return refreshed ? applyProjectState(refreshed, projectStates) : current;
      });
      setScanRefreshStatus('updated');
    } catch (error) {
      setScanRefreshStatus(error?.message === 'missing' ? 'missing' : 'error');
    }
  };
  const handleAddManualProject = (project) => {
    setManualProjects((current) => [...current, project]);
    setProjectStates((current) => ({ ...current, [project.id]: 'tracked' }));
    setDataStatus((status) => (status === 'loading' ? 'empty' : status));
    setManualProjectFormOpen(false);
  };
  const handleShowScannerHelp = () => {
    setFolderPickerMessage('Run a workspace rescan, then refresh: python3 scanner.py --root "/path/to/projects" --output public/projects.json');
  };
  const setProjectState = (projectId, state) => {
    setProjectStates((current) => ({ ...current, [projectId]: normalizeProjectState(state) }));
    if (state === 'reference') {
      setReferenceProjectId(projectId);
    }
  };
  const commitCandidateStates = (statesByProject) => {
    setProjectStates((current) => ({
      ...current,
      ...Object.fromEntries(Object.entries(statesByProject).map(([projectId, state]) => [projectId, normalizeProjectState(state)])),
    }));
  };
  const deferCandidates = () => {
    setProjectStates((current) => ({
      ...current,
      ...Object.fromEntries(candidateProjects.map((project) => [project.id, 'sleeping'])),
    }));
  };
  const referenceProject = useMemo(() => {
    if (!projects.length) return null;
    return projects.find((project) => project.id === referenceProjectId) ?? projects[0];
  }, [projects, referenceProjectId]);
  useEffect(() => {
    if (!projects.length) return;
    if (!referenceProjectId || !projects.some((project) => project.id === referenceProjectId)) {
      setReferenceProjectId(projects[0].id);
    }
  }, [projects, referenceProjectId]);
  useEffect(() => {
    if (referenceProject?.id) {
      localStorage.setItem('aperture-reference-project', referenceProject.id);
    }
  }, [referenceProject?.id]);
  const driftMap = useMemo(() => createDriftMap(projects, referenceProject), [projects, referenceProject]);
  const ProjectCardComponent = ExperimentalProjectCard;

  const attentionItems = useMemo(() => createAttentionItems(projects, driftMap), [projects, driftMap]);
  const riskItems = useMemo(() => projects.flatMap((project) => (project.risks ?? []).map((risk) => ({
    id: `${project.id}-${risk.id}`,
    project,
    severity: risk.severity,
    title: `${riskCategory(risk)}: ${risk.title}`,
    detail: risk.detail,
  }))), [projects]);
  const dirtyItems = useMemo(() => projects.filter((project) => project.git?.dirty).map((project) => ({
    id: `${project.id}-dirty`,
    project,
    severity: 'medium',
    icon: 'dirty',
    title: 'Dirty worktree',
    detail: `${project.name} has uncommitted local changes.`,
  })), [projects]);
  const driftItems = useMemo(() => projects.flatMap((project) => (driftMap[project.id] ?? []).map((drift) => ({
    id: `${project.id}-drift-${drift.id}`,
    project,
    severity: drift.severity,
    title: `${drift.category} reference difference`,
    detail: drift.detail,
  }))), [projects, driftMap]);
  const seenAttentionSet = useMemo(() => new Set(seenAttentionIds), [seenAttentionIds]);
  const unseenAttentionIds = useMemo(
    () => new Set(attentionItems.filter((item) => !seenAttentionSet.has(item.id)).map((item) => item.id)),
    [attentionItems, seenAttentionSet],
  );
  const closeAttention = () => {
    const ids = attentionItems.map((item) => item.id);
    setSeenAttentionIds(ids);
    localStorage.setItem('aperture-seen-attention', JSON.stringify(ids));
    setAttentionOpen(false);
  };
  const openProjectDrawer = (project) => {
    if (projectCloseTimer.current) {
      window.clearTimeout(projectCloseTimer.current);
      projectCloseTimer.current = null;
    }
    setSelectedProject(project);
    window.requestAnimationFrame(() => {
      setProjectDrawerOpen(true);
    });
  };
  const closeProjectDrawer = () => {
    if (projectCloseTimer.current) {
      window.clearTimeout(projectCloseTimer.current);
    }
    setProjectDrawerOpen(false);
    projectCloseTimer.current = window.setTimeout(() => {
      setSelectedProject(null);
      projectCloseTimer.current = null;
    }, 420);
  };
  const stats = useMemo(() => {
    const riskCount = projects.reduce((sum, project) => sum + (project.risks?.length ?? 0), 0);
    const driftCount = projects.reduce((sum, project) => sum + (driftMap[project.id]?.length ?? 0), 0);
    const dirtyCount = projects.filter((project) => project.git?.dirty).length;
    const avgReadiness = projects.length
      ? Math.round(projects.reduce((sum, project) => sum + (project.aiReadiness?.score ?? 0), 0) / projects.length)
      : 0;
    return { totalProjects: projects.length, riskCount, driftCount, dirtyCount, avgReadiness };
  }, [projects, driftMap]);
  const statSummaries = useMemo(() => statBreakdown(projects, driftMap), [projects, driftMap]);
  const emptyWorkspaceTitle = allProjects.length ? 'No projects selected' : 'No projects found';
  const emptyWorkspaceDetail = allProjects.length
    ? 'Finish setup with tracked projects, or reopen Settings to move sleeping candidates into the workspace map.'
    : 'The scanner output is live, but it did not include any projects. Try a broader root folder or add one manually.';
  const glossaryHelp = {
    title: 'Workspace Map glossary',
    body: [
      'Risk: local hygiene evidence from scanner checks.',
      'Drift: factual differences from the selected reference project.',
      'Setup readiness: checklist coverage for agent and human handoff.',
      'Dirty worktree: Git reports uncommitted local changes.',
      'Scanner evidence: observed local files or Git metadata; read-only.',
    ].join('\n'),
  };

  return (
    <div className="aperture-app flex h-screen bg-slate-950 font-sans text-slate-300 selection:bg-indigo-500/30">
      <Sidebar
        projects={projects}
        attentionItems={attentionItems}
        unseenAttentionIds={unseenAttentionIds}
        settingsOpen={settingsOpen}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenAttention={() => setAttentionOpen(true)}
        onSelectProject={openProjectDrawer}
      />
      <main className="flex flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-10 flex min-h-20 flex-wrap items-center justify-between gap-4 border-b border-slate-800 bg-slate-950/50 px-4 backdrop-blur-md md:px-8">
          <div className="flex flex-1 items-center gap-3">
            <div className="text-xs font-black uppercase tracking-[0.28em] text-indigo-300">Aperture</div>
          </div>
          <div className="hidden text-right md:block">
            <div className="text-xs font-bold uppercase tracking-widest text-slate-500">Data Source</div>
            <div className={`text-sm font-bold ${dataStatus === 'live' ? 'text-emerald-400' : dataStatus === 'loading' ? 'text-indigo-300' : 'text-amber-400'}`}>
              {displayedDataStatus}
            </div>
          </div>
          <AddProjectButton
            open={addProjectOpen}
            onClick={() => setAddProjectOpen((value) => !value)}
          />
          <AttentionButton
            count={attentionItems.length}
            unseenCount={unseenAttentionIds.size}
            open={attentionOpen}
            onClick={() => {
              if (attentionOpen) {
                closeAttention();
              } else {
                setAttentionOpen(true);
              }
            }}
          />
          <ThemeSwitcher
            theme={theme}
            onThemeChange={setTheme}
          />
        </header>
        <div className="flex-1 space-y-10 overflow-y-auto p-4 custom-scrollbar md:p-8">
          {dataStatus === 'loading' && !manualProjects.length && <ApertureAnalyzer />}

          {!shouldShowDashboard && dataStatus === 'empty' && (
            <EmptyState
              onAddManualProject={() => setManualProjectFormOpen(true)}
              onShowScannerHelp={handleShowScannerHelp}
            />
          )}
          {folderPickerMessage && (
            <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-4 text-sm font-bold text-sky-300">
              {folderPickerMessage}
            </div>
          )}

          {shouldShowDashboard && (
            <>
              {candidateProjects.length > 0 && (
                <DiscoveryReview
                  candidates={candidateProjects}
                  onCommitProjectStates={commitCandidateStates}
                  onDefer={deferCandidates}
                />
              )}

              <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-5">
                <StatCard title="Projects Mapped" value={stats.totalProjects} icon={FolderOpen} summary={statSummaries.projects} help={{ title: 'Projects mapped', body: 'Projects currently shown from generated scanner output plus manual entries.' }} />
                <StatCard title="Avg Setup Readiness" value={`${stats.avgReadiness}%`} icon={Cpu} tone="emerald" summary={statSummaries.readiness} help={conceptHelp('readiness')} />
                <StatCard title="Risk Findings" value={stats.riskCount} icon={ShieldAlert} tone={stats.riskCount ? 'rose' : 'emerald'} summary={statSummaries.risks} help={conceptHelp('risk')} onClick={() => setInsightDrawer('risks')} />
                <StatCard title="Dirty Worktrees" value={stats.dirtyCount} icon={GitBranch} tone={stats.dirtyCount ? 'rose' : 'emerald'} summary={statSummaries.dirty} help={conceptHelp('dirty')} onClick={() => setInsightDrawer('dirty')} />
                <StatCard title="Reference Differences" value={stats.driftCount} icon={GitCompareArrows} tone={stats.driftCount ? 'rose' : 'emerald'} summary={statSummaries.drift} help={conceptHelp('drift')} onClick={() => setInsightDrawer('drift')} />
              </section>

              <section>
                <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  <div>
                    <h2 className="flex items-center gap-3 text-2xl font-black tracking-tight text-slate-100">
                      Workspace Map
                      <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] uppercase tracking-tighter text-slate-500">Local-first</span>
                      <InfoPopover {...glossaryHelp} />
                    </h2>
                    <p className="mt-1 text-sm italic text-slate-500">Factual scanner output from {workspaceRootLabel}.</p>
                  </div>
                  <div className="text-xs font-bold uppercase tracking-widest text-slate-500">Schema {scan?.schemaVersion ?? 'aperture.scan.v1'}</div>
                </div>

              {projects.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3">
                  {projects.map((project) => (
                    <ProjectCardComponent
                      key={project.id}
                      project={project}
                      drift={driftMap[project.id] ?? []}
                      isReference={project.id === referenceProject?.id}
                      onSelect={openProjectDrawer}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-800 p-12 text-center">
                  <FolderOpen className="mx-auto mb-4 text-slate-600" size={36} />
                  <h3 className="text-lg font-bold text-slate-200">{emptyWorkspaceTitle}</h3>
                  <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{emptyWorkspaceDetail}</p>
                  <div className="mt-5 flex flex-wrap justify-center gap-3">
                    {allProjects.length > 0 ? (
                      <button type="button" onClick={() => setSettingsOpen(true)} className="manual-submit justify-center">
                        <Settings size={16} /> Open Settings
                      </button>
                    ) : (
                      <>
                        <button type="button" onClick={handleShowScannerHelp} className="manual-submit justify-center">
                          <Terminal size={16} /> Show Scanner Command
                        </button>
                        <button type="button" onClick={() => setManualProjectFormOpen(true)} className="manual-submit justify-center">
                          <Save size={16} /> Add Manually
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
              </section>

              {scan?.scanErrors?.length > 0 && (
                <section className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
                  <h3 className="mb-3 font-bold text-amber-300">Scan Errors</h3>
                  <div className="space-y-2">
                    {scan.scanErrors.map((error) => (
                      <div key={`${error.path}-${error.message}`} className="font-mono text-xs text-amber-100">{error.path}: {error.message}</div>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </main>

      <ManualProjectDrawer
        open={manualProjectFormOpen}
        onClose={() => setManualProjectFormOpen(false)}
        onAddProject={handleAddManualProject}
      />

      <AddProjectDrawer
        open={addProjectOpen}
        workspaceRoot={scan?.workspaceRoot}
        onClose={() => setAddProjectOpen(false)}
        onAddManualProject={() => setManualProjectFormOpen(true)}
      />

      <SettingsModal
        open={settingsOpen}
        projects={projects}
        allProjects={allProjects}
        referenceProjectId={referenceProject?.id ?? ''}
        onReferenceProjectChange={setReferenceProjectId}
        onSetProjectState={setProjectState}
        onClose={() => setSettingsOpen(false)}
      />

      <AttentionDrawer
        open={attentionOpen}
        items={attentionItems}
        unseenIds={unseenAttentionIds}
        onClose={closeAttention}
        onSelectProject={(project) => {
          openProjectDrawer(project);
          closeAttention();
        }}
      />

      <InsightDrawer
        open={insightDrawer === 'risks'}
        title="Risk Findings"
        subtitle="Local hygiene findings grouped by project."
        emptyLabel={`No hygiene findings from ${SCANNER_CHECK_SCOPE}.`}
        items={riskItems}
        onClose={() => setInsightDrawer(null)}
        onSelectProject={(project) => {
          openProjectDrawer(project);
          setInsightDrawer(null);
        }}
      />

      <InsightDrawer
        open={insightDrawer === 'dirty'}
        title="Dirty Worktrees"
        subtitle="Projects with uncommitted local changes."
        emptyLabel="No dirty worktrees detected."
        items={dirtyItems}
        onClose={() => setInsightDrawer(null)}
        onSelectProject={(project) => {
          openProjectDrawer(project);
          setInsightDrawer(null);
        }}
      />

      <InsightDrawer
        open={insightDrawer === 'drift'}
        title="Reference Differences"
        subtitle={`Compared against ${referenceProject?.name ?? 'the current reference'}.`}
        emptyLabel="No reference differences detected."
        items={driftItems}
        onClose={() => setInsightDrawer(null)}
        onSelectProject={(project) => {
          openProjectDrawer(project);
          setInsightDrawer(null);
        }}
      />

      {selectedProject && (
        <ProjectDrawer
          project={selectedProject}
          open={projectDrawerOpen}
          drift={driftMap[selectedProject.id] ?? []}
          referenceProject={referenceProject}
          isReference={selectedProject?.id === referenceProject?.id}
          onRefreshScan={refreshScanData}
          scanRefreshStatus={scanRefreshStatus}
          onClose={closeProjectDrawer}
        />
      )}

      <style>{`
        @keyframes aperture-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .aperture-loop {
          animation: aperture-spin 1.8s linear infinite;
        }
        .aperture-loop-slow {
          animation-duration: 2.8s;
          animation-direction: reverse;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #334155; }
      `}</style>
    </div>
  );
}
