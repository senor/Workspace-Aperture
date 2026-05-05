import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Copy,
  Cpu,
  Dna,
  ExternalLink,
  FileJson,
  FolderOpen,
  GitCompareArrows,
  GitBranch,
  Info,
  Link,
  Map,
  Moon,
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
          { sha: 'demo-2', date: '2026-04-28T09:20:00+02:00', message: 'Document project brief flow', refs: [] },
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

const severityTones = {
  critical: 'danger',
  high: 'danger',
  medium: 'warning',
  low: 'info',
  info: 'success',
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
const PROJECT_LIVE_LINKS_STORAGE_KEY = 'aperture-project-live-links';
const SCANNER_CHECK_SCOPE = 'README, scripts, env, CI, and stack-aware launch checks';
const TRACKED_PROJECT_STATES = new Set(['tracked']);
const RUNTIME_STATUS_FRESH_MS = 1000 * 60 * 5;
const PROJECT_STATE_LABELS = {
  candidate: 'Candidate',
  tracked: 'Tracked',
  ignored: 'Ignored',
  reference: 'Reference',
  archived: 'Archived',
  sleeping: 'Sleeping',
};
const SETTINGS_PROJECT_STATE_OPTIONS = [
  { value: 'tracked', label: 'Active' },
  { value: 'ignored', label: 'Hidden' },
];
const LIVE_ENVIRONMENT_OPTIONS = [
  { value: 'production', label: 'Production' },
  { value: 'staging', label: 'Staging' },
  { value: 'preview', label: 'Preview' },
  { value: 'other', label: 'Other' },
];
const LIVE_PROVIDER_OPTIONS = [
  { value: 'vercel', label: 'Vercel' },
  { value: 'netlify', label: 'Netlify' },
  { value: 'firebase', label: 'Firebase' },
  { value: 'github-pages', label: 'GitHub Pages' },
  { value: 'other', label: 'Other' },
];
const LIVE_CHECKLIST_ITEMS = [
  { id: 'favicon', label: 'Favicon', detail: 'Browser tab, bookmark, and shortcut recognition may be weak.' },
  { id: 'ogCard', label: 'OG card', detail: 'Shared links may render with missing, wrong, or generic previews.' },
  { id: 'seo', label: 'SEO', detail: 'Search engines and link previews may use weak title, description, canonical, or indexability metadata.' },
];
const STARTER_AGENTS_MD = `# Agent Instructions

## Project Context
- What this project does:
- Main entry points:
- Important architecture notes:

## Working Rules
- Preserve existing patterns unless there is a clear reason to change them.
- Do not edit generated files or secrets.
- Keep changes scoped to the requested task.

## Commands
- Install:
- Dev:
- Test:
- Build:

## Before Finishing
- Run the relevant tests or checks.
- Call out anything that could not be verified.
`;

const APERTURE_THEMES = [
  {
    id: 'base',
    label: 'Base Map',
    description: 'Warm graphite operations map with signal-orange marks.',
    swatch: '#1a1917',
    icon: Moon,
    mode: 'dark',
    shape: 'orbit',
    radius: 'soft',
    density: 'balanced',
    iconStroke: 2,
  },
  {
    id: 'daylight',
    label: 'Daylight',
    description: 'Bone and wash surfaces for long planning passes.',
    swatch: '#e8e4dc',
    icon: Sun,
    mode: 'light',
    shape: 'sun',
    radius: 'soft',
    density: 'balanced',
    iconStroke: 2,
  },
  {
    id: 'signal',
    label: 'Signal Desk',
    description: 'Blueprint console light for active operations.',
    swatch: '#5ac8fa',
    icon: Activity,
    mode: 'dark',
    shape: 'wave',
    radius: 'soft',
    density: 'balanced',
    iconStroke: 2.1,
  },
  {
    id: 'atlas',
    label: 'Atlas Room',
    description: 'Cool drafting table with hiroshi-blue surfaces and annotation marks.',
    swatch: '#d5ecf5',
    icon: Map,
    mode: 'light',
    shape: 'grid',
    radius: 'flat',
    density: 'compact',
    iconStroke: 1.8,
  },
  {
    id: 'vector',
    label: 'Vector Scope',
    description: 'Black-field vector display with pale phosphor lines.',
    swatch: '#d8ffd8',
    icon: Radio,
    mode: 'dark',
    shape: 'diamond',
    radius: 'flat',
    density: 'compact',
    iconStroke: 1.7,
  },
  {
    id: 'pocket',
    label: 'Pocket Terminal',
    description: 'Portable phosphor monitor with tight monospace controls.',
    swatch: '#30ff60',
    icon: Terminal,
    mode: 'dark',
    shape: 'terminal',
    radius: 'flat',
    density: 'compact',
    iconStroke: 1.9,
  },
];

const APERTURE_THEME_ALIASES = {
  dark: 'base',
  light: 'daylight',
  paper: 'atlas',
  terminal: 'pocket',
};

const normalizeThemeId = (themeId) => {
  const normalized = APERTURE_THEME_ALIASES[themeId] ?? themeId;
  return APERTURE_THEMES.some((option) => option.id === normalized) ? normalized : 'base';
};

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

const agentContextSummary = (project) => {
  const files = [
    ...(project.agentContext?.instructionFiles ?? []),
    ...(project.docs?.agentContextFiles ?? []),
  ].filter(Boolean);
  const uniqueFiles = [...new Set(files)];
  const skills = project.agentContext?.skills ?? project.skills ?? [];
  return {
    files: uniqueFiles,
    skills,
    hasInstructions: uniqueFiles.length > 0,
    hasSkills: skills.length > 0,
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
  return help[type] ?? { title: 'Scan evidence', body: 'A factual observation from the latest workspace scan.' };
};

const drawerTabHelp = {
  overview: {
    title: 'Overview',
    body: 'Use this for factual project identity, runtime, source, stack, package, and commands.',
  },
  signals: {
    title: 'Signals',
    body: 'Use this to inspect setup gaps, launch findings, skipped checks, hygiene findings, and dirty worktree state.',
  },
  brief: {
    title: 'Project brief',
    body: 'Project-specific context for another person, an automation, or future-you.',
  },
  settings: {
    title: 'Project settings',
    body: 'Project-owned metadata such as deployed URL mapping. Scanner facts remain read-only.',
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

const signalSort = (a, b) => {
  const severityDelta = (riskSeverityRank[b.severity] ?? 0) - (riskSeverityRank[a.severity] ?? 0);
  if (severityDelta) return severityDelta;
  const order = { risk: 0, agent: 1, setup: 2, dirty: 3, drift: 4 };
  return (order[a.kind] ?? 9) - (order[b.kind] ?? 9);
};

const createBriefSignalItems = (projects, driftMap = {}) => projects.flatMap((project) => {
  const setupItems = readinessSummary(project.aiReadiness).failed
    .filter((check) => check.id !== 'agent_context')
    .map((check) => ({
      id: `${project.id}-setup-${check.id}`,
      project,
      kind: 'setup',
      severity: 'medium',
      title: check.label,
      detail: check.evidence?.length ? `Evidence: ${check.evidence.join(', ')}` : 'Missing from latest workspace scan.',
      why: 'Shown because this setup signal is missing from the scanner checklist.',
      tab: 'signals',
    }));
  const agentContext = agentContextSummary(project);
  const agentItems = !agentContext.hasInstructions ? [{
    id: `${project.id}-agent-context`,
    project,
    kind: 'agent',
    severity: 'medium',
    title: 'No agent instructions',
    detail: 'Agents will enter this repo without project-specific rules, architecture notes, test expectations, or safe-change boundaries.',
    why: 'Without agent instructions, a coding agent has to infer conventions from the repo, increasing the chance of wrong commands, misplaced files, skipped tests, or changes that violate local patterns.',
    tab: 'signals',
  }] : [];
  const riskItems = (project.risks ?? []).map((risk, index) => ({
    id: `${project.id}-risk-${risk.id}-${index}`,
    project,
    kind: 'risk',
    severity: risk.severity,
    title: `${riskCategory(risk)}: ${risk.title}`,
    detail: risk.detail,
    why: riskWhyShown(risk),
    tab: 'signals',
  }));
  const dirtyItems = project.git?.dirty ? [{
    id: `${project.id}-dirty`,
    project,
    kind: 'dirty',
    severity: 'medium',
    icon: 'dirty',
    title: 'Dirty worktree',
    detail: `${project.name} has uncommitted local changes.`,
    why: 'Shown because Git reports uncommitted local changes in the latest scan.',
    tab: 'signals',
  }] : [];
  const driftItems = (driftMap[project.id] ?? []).map((drift) => ({
    id: `${project.id}-drift-${drift.id}`,
    project,
    kind: 'drift',
    severity: drift.severity,
    title: `${drift.category} reference difference`,
    detail: drift.detail,
    why: driftWhyShown(drift),
    tab: 'drift',
  }));
  return [...riskItems, ...agentItems, ...setupItems, ...dirtyItems, ...driftItems];
}).sort(signalSort);

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

const normalizeLiveEnvironment = (environment) => (
  LIVE_ENVIRONMENT_OPTIONS.some((option) => option.value === environment) ? environment : 'production'
);

const normalizeLiveProvider = (provider) => (
  LIVE_PROVIDER_OPTIONS.some((option) => option.value === provider) ? provider : 'other'
);

const normalizeLiveChecklist = (checklist = {}) => Object.fromEntries(
  LIVE_CHECKLIST_ITEMS.map((item) => [item.id, Boolean(checklist?.[item.id])]),
);

const normalizeLiveScan = (scan) => {
  if (!scan || typeof scan !== 'object') return null;
  const checks = scan.checks && typeof scan.checks === 'object' ? scan.checks : {};
  return {
    url: scan.url || '',
    finalUrl: scan.finalUrl || scan.url || '',
    status: scan.status ?? null,
    checkedAt: scan.checkedAt || new Date().toISOString(),
    error: scan.error || '',
    checks: Object.fromEntries(LIVE_CHECKLIST_ITEMS.map((item) => {
      const check = checks[item.id] ?? {};
      return [item.id, {
        passed: Boolean(check.passed),
        detail: check.detail || item.detail,
        evidence: check.evidence || '',
      }];
    })),
  };
};

const normalizeLiveUrl = (value) => {
  const trimmed = String(value ?? '').trim();
  if (!trimmed) return '';
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withProtocol);
    if (!['http:', 'https:'].includes(url.protocol)) return '';
    return url.toString();
  } catch {
    return '';
  }
};

const readProjectLiveLinks = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(PROJECT_LIVE_LINKS_STORAGE_KEY) ?? '{}');
    if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return {};
    return Object.fromEntries(Object.entries(saved).flatMap(([projectId, link]) => {
      const url = normalizeLiveUrl(link?.url);
      if (!url) return [];
      return [[projectId, {
        url,
        environment: normalizeLiveEnvironment(link?.environment),
        provider: normalizeLiveProvider(link?.provider),
        checklist: normalizeLiveChecklist(link?.checklist),
        scan: normalizeLiveScan(link?.scan),
        updatedAt: link?.updatedAt || new Date().toISOString(),
      }]];
    }));
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
      detail: 'Browser folder selection cannot inspect local app status. Refresh with a full workspace scan to detect running local apps.',
    },
    launchProfile: profile,
    skippedChecks: [
      { id: 'browser_limited_scan', title: 'Deep file checks skipped', reason: 'Browser folder selection can identify project candidates, but a full workspace scan is still needed for local runtime, Git, and hygiene evidence.' },
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
        detail: 'Browser folder selection cannot inspect local app status. Refresh with a full workspace scan to detect running local apps.',
      },
      launchProfile: profile,
      skippedChecks: [
        { id: 'browser_limited_scan', title: 'Deep file checks skipped', reason: 'Browser folder selection can identify project candidates, but a full workspace scan is still needed for local runtime, Git, and hygiene evidence.' },
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

const normalizeProjectState = (state) => {
  if (state === 'reference') return 'tracked';
  if (PROJECT_STATE_LABELS[state]) return state;
  return 'candidate';
};

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

const isUsableRuntimePort = (port) => {
  const value = Number(port?.port);
  return Number.isInteger(value) && value > 0 && value <= 65535;
};

const normalizeRuntimeStatus = (runtimeStatus) => {
  if (!runtimeStatus?.state) return runtimeStatus;
  const ports = (runtimeStatus.ports ?? []).filter(isUsableRuntimePort);
  if (runtimeStatus.state === 'running') {
    const checkedAt = runtimeStatus.checkedAt ? new Date(runtimeStatus.checkedAt).getTime() : NaN;
    const isFresh = Number.isFinite(checkedAt) && Date.now() - checkedAt <= RUNTIME_STATUS_FRESH_MS;
    if (!ports.length || !isFresh) {
      return {
        ...runtimeStatus,
        state: 'unknown',
        ports: [],
        detail: isFresh
          ? 'The last scan reported a running app, but the localhost evidence was invalid. Refresh the workspace scan to check again.'
          : 'Runtime evidence is stale. Refresh the workspace scan before opening a localhost link.',
      };
    }
  }
  return { ...runtimeStatus, ports };
};

const isRuntimeStatusStale = (runtimeStatus) => {
  if (runtimeStatus?.state !== 'running') return false;
  const checkedAt = runtimeStatus.checkedAt ? new Date(runtimeStatus.checkedAt).getTime() : NaN;
  return !Number.isFinite(checkedAt) || Date.now() - checkedAt > RUNTIME_STATUS_FRESH_MS;
};

const primaryRuntimePort = (runtimeStatus) => normalizeRuntimeStatus(runtimeStatus)?.ports?.[0] ?? null;

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

const runtimePortUrl = (port) => {
  if (!isUsableRuntimePort(port)) return '';
  if (port.url) {
    try {
      return new URL(port.url).toString();
    } catch {
      return '';
    }
  }
  return `http://localhost:${port.port}`;
};

const runtimeStatusLabel = (runtimeStatus) => {
  const normalized = normalizeRuntimeStatus(runtimeStatus);
  const primary = primaryRuntimePort(normalized);
  if (!normalized?.state) return 'Runtime unknown';
  if (normalized.state === 'running' && primary) return `Running on ${runtimePortLabel(primary)}`;
  if (normalized.state === 'unknown') return 'Runtime unknown';
  return 'Not running';
};

const runtimeStatusDetail = (runtimeStatus) => {
  const normalized = normalizeRuntimeStatus(runtimeStatus);
  const primary = primaryRuntimePort(normalized);
  if (!normalized?.state) {
    return 'This project needs a fresh workspace scan before Aperture can show local runtime status.';
  }
  if (normalized.state === 'running' && primary) {
    const process = [primary.command, primary.pid ? `pid ${primary.pid}` : null].filter(Boolean).join(' · ');
    return [
      process || null,
      primary.confidence ? `Confidence: ${primary.confidence}` : null,
      normalized.detail,
    ].filter(Boolean).join('\n');
  }
  if (normalized.state === 'unknown') {
    if (isRuntimeStatusStale(runtimeStatus) && (runtimeStatus.ports ?? []).some(isUsableRuntimePort)) {
      return [
        'Aperture matched this project to a localhost process in the last scan, but runtime evidence expires after five minutes.',
        'Rescan while the dev server is running to confirm the current port and pid.',
        'Detection works best when the server is started from the project root.',
      ].join('\n');
    }
    return normalized.detail || 'Aperture could not inspect listening localhost ports during the last scan.';
  }
  return normalized.detail || 'No matching listening localhost port was found during the last scan.';
};

const runtimeStatusCompactDetail = (runtimeStatus) => {
  const normalized = normalizeRuntimeStatus(runtimeStatus);
  const primary = primaryRuntimePort(normalized);
  if (normalized?.state === 'running' && primary) {
    return `Matched ${runtimePortLabel(primary)} in the latest scan.`;
  }
  if (normalized?.state === 'unknown' && isRuntimeStatusStale(runtimeStatus) && (runtimeStatus.ports ?? []).some(isUsableRuntimePort)) {
    return 'Last runtime match is stale. Rescan while the dev server is running from this project folder.';
  }
  if (normalized?.state === 'unknown') {
    return 'Runtime needs a fresh workspace scan.';
  }
  return 'No matching localhost process was found in the latest scan.';
};

const RuntimeStatusIndicator = ({ runtimeStatus, align = 'left', compact = false, onRefreshScan, refreshStatus }) => {
  const normalized = normalizeRuntimeStatus(runtimeStatus);
  const primary = primaryRuntimePort(normalized);
  const lastDetectedPrimary = (runtimeStatus?.ports ?? []).filter(isUsableRuntimePort)[0] ?? null;
  const actionPort = primary ?? lastDetectedPrimary;
  const actionUrl = runtimePortUrl(actionPort);
  const isRunning = normalized?.state === 'running' && primary;
  const canRefresh = typeof onRefreshScan === 'function';
  const isRefreshing = refreshStatus === 'refreshing';
  const state = !normalized?.state || normalized.state === 'unknown' ? 'unknown' : isRunning ? 'running' : 'stopped';
  const actionLabel = isRunning
    ? `Open ${runtimePortLabel(actionPort)}`
    : actionUrl
      ? `Open last detected ${runtimePortLabel(actionPort)}`
      : runtimeStatusLabel(normalized);
  const stopCardClick = (event) => {
    event.stopPropagation();
  };
  const TriggerTag = actionUrl ? 'a' : 'button';

  return (
    <span className={`runtime-status runtime-status--${state} ${compact ? 'runtime-status--compact' : ''}`} onClick={stopCardClick}>
      <TriggerTag
        {...(actionUrl ? { href: actionUrl, target: '_blank', rel: 'noreferrer' } : { type: 'button' })}
        className="runtime-status__trigger"
        aria-label={actionLabel}
        onClick={stopCardClick}
      >
        <Radio size={compact ? 13 : 15} />
        {!compact && <span>{runtimeStatusLabel(normalized)}</span>}
      </TriggerTag>
      <span className={`runtime-status__panel ${compact ? 'runtime-status__panel--compact' : ''} ${align === 'right' ? 'runtime-status__panel--right' : ''}`}>
        <strong>{runtimeStatusLabel(normalized)}</strong>
        {actionUrl ? (
          <>
            <a href={actionUrl} target="_blank" rel="noreferrer" className="runtime-status__link" onClick={stopCardClick}>
              {isRunning ? actionUrl : `Open last detected ${runtimePortLabel(actionPort)}`}
              <ExternalLink size={13} />
            </a>
            <span>{createLineBreaks(compact ? runtimeStatusCompactDetail(runtimeStatus) : runtimeStatusDetail(runtimeStatus))}</span>
            {!compact && !isRunning && <em className="runtime-status__hint">If this does not load, rescan while the dev server is running from this project folder.</em>}
            {canRefresh && (
              <button type="button" className="runtime-status__refresh" onClick={onRefreshScan} disabled={isRefreshing}>
                <RefreshCw size={12} />
                {isRefreshing ? 'Rescanning' : 'Rescan runtime'}
              </button>
            )}
          </>
        ) : (
          <>
            <span>{createLineBreaks(compact ? runtimeStatusCompactDetail(runtimeStatus) : runtimeStatusDetail(runtimeStatus))}</span>
            {canRefresh && (
              <button type="button" className="runtime-status__refresh" onClick={onRefreshScan} disabled={isRefreshing}>
                <RefreshCw size={12} />
                {isRefreshing ? 'Rescanning' : 'Rescan runtime'}
              </button>
            )}
          </>
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
      detail: 'Manual entries do not include local runtime evidence. Refresh with a full workspace scan to detect running local apps.',
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

const InfoPopover = ({ title, body, align = 'left', kind = 'question', stopClick = true }) => {
  const Icon = kind === 'info' ? Info : CircleHelp;
  const triggerRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [panelStyle, setPanelStyle] = useState(null);

  useEffect(() => {
    if (!open) return undefined;

    const positionPanel = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const width = Math.min(280, Math.max(220, window.innerWidth - 24));
      const leftTarget = align === 'right' ? rect.right - width : rect.left;
      setPanelStyle({
        '--info-popover-width': `${width}px`,
        left: `${Math.min(Math.max(12, leftTarget), window.innerWidth - width - 12)}px`,
        top: `${Math.min(rect.bottom + 9, window.innerHeight - 24)}px`,
      });
    };

    positionPanel();
    window.addEventListener('resize', positionPanel);
    window.addEventListener('scroll', positionPanel, true);
    return () => {
      window.removeEventListener('resize', positionPanel);
      window.removeEventListener('scroll', positionPanel, true);
    };
  }, [align, open]);

  const panel = open && panelStyle ? createPortal(
    <span className={`info-popover__panel info-popover__panel--${align} is-open`} role="tooltip" style={panelStyle}>
      <span className="info-popover__title">{title}</span>
      <span className="info-popover__body">{createLineBreaks(body)}</span>
    </span>,
    document.body,
  ) : null;

  return (
  <span className={`info-popover info-popover--${kind}`} onClick={stopClick ? (event) => event.stopPropagation() : undefined}>
    <span
      ref={triggerRef}
      className="info-popover__trigger"
      tabIndex={0}
      role="button"
      aria-label={`${title}: ${String(body).replace(/\n/g, ' ')}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <Icon size={13} />
    </span>
    {panel}
  </span>
  );
};

const ThemePreviewShape = ({ shape }) => {
  switch (shape) {
    case 'sun':
      return (
        <>
          <path d="M6 22 L26 22 M16 22 A6 6 0 0 0 16 10 A6 6 0 0 0 16 22 Z" fill="none" stroke="var(--art-accent)" strokeWidth="2" strokeLinecap="round" />
          <circle cx="16" cy="14" r="2" fill="var(--art-bone)" />
        </>
      );
    case 'wave':
      return <path d="M4 16 L10 8 L18 24 L28 12" fill="none" stroke="var(--art-accent)" strokeWidth="2" strokeLinejoin="round" />;
    case 'grid':
      return (
        <>
          <path d="M8 8 H24 V24 H8 Z" fill="none" stroke="var(--art-accent)" strokeWidth="2" />
          <path d="M8 16 H24 M16 8 V24" fill="none" stroke="var(--art-bone)" strokeWidth="1.5" />
        </>
      );
    case 'diamond':
      return (
        <>
          <path d="M16 6 L26 16 L16 26 L6 16 Z" fill="none" stroke="var(--art-accent)" strokeWidth="2" strokeLinejoin="round" />
          <circle cx="16" cy="16" r="1.5" fill="var(--art-bone)" />
        </>
      );
    case 'terminal':
      return <path d="M8 12 L14 16 L8 20 M16 20 L24 20" fill="none" stroke="var(--art-accent)" strokeWidth="2" strokeLinejoin="round" />;
    case 'orbit':
    default:
      return (
        <>
          <circle cx="16" cy="16" r="8" fill="none" stroke="var(--art-accent)" strokeWidth="2" />
          <circle cx="16" cy="16" r="3" fill="none" stroke="var(--art-bone)" strokeWidth="2" />
        </>
      );
  }
};

const ThemeSwitcher = ({ theme, onThemeChange }) => {
  const [open, setOpen] = useState(false);
  const pickerRef = useRef(null);
  const activeTheme = APERTURE_THEMES.find((option) => option.id === normalizeThemeId(theme)) ?? APERTURE_THEMES[0];

  useEffect(() => {
    if (!open) return undefined;
    const handlePointerDown = (event) => {
      if (pickerRef.current?.contains(event.target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [open]);

  return (
    <div ref={pickerRef} className="theme-picker">
      <button
        type="button"
        className={`theme-picker__trigger ${open ? 'is-open' : ''}`}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label="Choose vibe"
        title="Choose vibe"
      >
        <Palette className="theme-picker__trigger-icon" size={16} />
      </button>

      {open && (
        <div className="theme-picker__popover">
          <div className="theme-picker__header">
            <span>Vibes</span>
          </div>
          {APERTURE_THEMES.map((option) => {
            return (
            <button
              key={option.id}
              type="button"
              className={`theme-picker__item ${normalizeThemeId(theme) === option.id ? 'is-active' : ''}`}
              onClick={() => {
                onThemeChange(option.id);
              }}
            >
              <span
                className="theme-picker__item-art"
                style={{
                  '--mock-bg': option.mode === 'light' ? '#f4f0e6' : '#222220',
                  '--mock-bone': option.mode === 'light' ? '#2a2826' : '#c8c4b8',
                  '--mock-accent': option.swatch,
                }}
              >
                <span className="theme-picker__art-preview">
                  <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
                    <ThemePreviewShape shape={option.shape} />
                  </svg>
                </span>
              </span>
              <span className="theme-picker__item-copy">
                <strong>{option.label}</strong>
                <small>{option.description}</small>
              </span>
            </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

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

const SettingsButton = ({ open, onClick }) => (
  <button
    type="button"
    className={`attention-trigger ${open ? 'is-open' : ''}`}
    onClick={onClick}
    aria-label="Settings"
    title="Settings"
  >
    <Settings size={18} />
  </button>
);

const groupedSetupGaps = (items) => Object.entries(items.reduce((groups, item) => ({
  ...groups,
  [item.title]: [...(groups[item.title] ?? []), item],
}), {})).sort((a, b) => b[1].length - a[1].length);

const tabForBriefItem = (item) => {
  if (item.tab) return item.tab;
  if (item.kind === 'dirty') return 'signals';
  if (item.kind === 'drift') return 'drift';
  return 'signals';
};

const BriefItemButton = ({ item, onSelectProject }) => (
  <button
    type="button"
    className={`brief-item ${severityStyles[item.severity] || severityStyles.medium}`}
    onClick={() => onSelectProject(item.project, tabForBriefItem(item))}
  >
    <span>
      <strong>{item.title}</strong>
      <small>{item.detail}</small>
      {item.why && <small>{item.why}</small>}
    </span>
    <em>{item.project.name}</em>
  </button>
);

const BriefMoment = ({ eyebrow, title, copy, icon: Icon, tone = 'info' }) => (
  <article className={`brief-moment brief-moment--${tone}`}>
    <div className="brief-moment__icon" aria-hidden="true">{Icon && <Icon size={20} />}</div>
    <span>{eyebrow}</span>
    <h3>{title}</h3>
    <p>{copy}</p>
  </article>
);

const BriefMetric = ({ icon: Icon, label, value, detail }) => (
  <div className="brief-metric">
    <Icon size={17} />
    <span>{label}</span>
    <strong>{value}</strong>
    {detail && <small>{detail}</small>}
  </div>
);

const BriefMetricButton = ({ icon: Icon, label, value, detail, onClick }) => (
  <button type="button" className="brief-metric brief-metric--button" onClick={onClick}>
    <Icon size={17} />
    <span>{label}</span>
    <strong>{value}</strong>
    {detail && <small>{detail}</small>}
  </button>
);

const CopyableHandoff = ({ text, label = 'brief text', heading = null }) => {
  const [copied, setCopied] = useState(false);
  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="copyable-handoff">
      <div className="copyable-handoff__bar">
        {heading}
        <button type="button" className="copyable-handoff__copy" onClick={copyText}>
          <Copy size={14} />
          {copied ? 'Copied' : `Copy ${label}`}
        </button>
      </div>
      <pre>{text}</pre>
    </div>
  );
};

const CopyStarterAgentsButton = ({ className = '' }) => {
  const [copied, setCopied] = useState(false);
  const copyStarter = async () => {
    try {
      await navigator.clipboard.writeText(STARTER_AGENTS_MD);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };
  return (
    <button type="button" className={`copy-starter-agents ${className}`} onClick={copyStarter}>
      <Copy size={15} /> {copied ? 'Copied starter' : 'Copy starter AGENTS.md'}
    </button>
  );
};

const ProjectSignalLine = ({ tone = 'info', icon: Icon, eyebrow, title, detail, meta, side }) => (
  <div className={`project-drawer__signal-line project-drawer__signal-line--${tone}`}>
    {Icon && <Icon size={16} className="project-drawer__signal-icon" />}
    <div className="project-drawer__signal-copy">
      {eyebrow && <div className="project-drawer__signal-eyebrow">{eyebrow}</div>}
      <div className="project-drawer__drift-title">{title}</div>
      {detail && <div className="project-drawer__drift-detail">{detail}</div>}
      {meta && <div className="project-drawer__why">{meta}</div>}
    </div>
    {side && <div className="project-drawer__tag">{side}</div>}
  </div>
);

const WorkspaceSignalStrip = ({ stats }) => {
  const readinessTone = stats.avgReadiness >= 80 ? 'success' : stats.avgReadiness >= 55 ? 'warning' : 'danger';
  const signals = [
    { id: 'projects', label: 'Projects', value: stats.totalProjects, detail: 'mapped', icon: FolderOpen, tone: 'info' },
    { id: 'setup', label: 'Ready', value: `${stats.avgReadiness}%`, detail: 'setup', icon: Cpu, tone: readinessTone },
    { id: 'risks', label: 'Risks', value: stats.riskCount, detail: 'findings', icon: ShieldAlert, tone: stats.riskCount ? 'danger' : 'success' },
    { id: 'dirty', label: 'Dirty', value: stats.dirtyCount, detail: 'worktrees', icon: GitBranch, tone: stats.dirtyCount ? 'warning' : 'success' },
    { id: 'drift', label: 'Drift', value: stats.driftCount, detail: 'differences', icon: GitCompareArrows, tone: stats.driftCount ? 'warning' : 'success' },
  ];

  return (
    <section className="workspace-signal-strip" aria-label="Workspace signals">
      <div className="workspace-signal-strip__label">Workspace signals</div>
      <div className="workspace-signal-strip__items">
        {signals.map((signal) => {
          const Icon = signal.icon;
          return (
            <div
              key={signal.id}
              className={`workspace-signal-mini workspace-signal-mini--${signal.tone}`}
            >
              <Icon size={17} />
              <span>
                <strong>{signal.value}</strong>
                <small>{signal.label}</small>
              </span>
              <em>{signal.detail}</em>
            </div>
          );
        })}
      </div>
    </section>
  );
};

const SetupRequiredState = ({
  eyebrow,
  title,
  detail,
  hasKnownProjects,
  onOpenSettings,
  onShowScannerHelp,
  onAddManualProject,
}) => (
  <section className="setup-required">
    <div className="setup-required__marker">
      <span />
      <div className="section-kicker">{eyebrow}</div>
    </div>
    <div className="setup-required__body">
      <FolderOpen size={42} />
      <h2>{title}</h2>
      <p>{detail}</p>
      <div className="setup-required__actions">
        {hasKnownProjects ? (
          <button type="button" onClick={onOpenSettings} className="manual-submit justify-center">
            <Settings size={16} /> Open Settings
          </button>
        ) : (
          <>
            <button type="button" onClick={onShowScannerHelp} className="manual-submit justify-center">
              <Terminal size={16} /> Show Scan Command
            </button>
            <button type="button" onClick={onAddManualProject} className="manual-submit justify-center">
              <Save size={16} /> Add Manually
            </button>
          </>
        )}
      </div>
    </div>
  </section>
);

const BriefView = ({
  projects,
  signalItems,
  focus,
  onSelectProject,
  onOpenFocus,
  hasKnownProjects,
  onOpenSettings,
  onShowScannerHelp,
  onAddManualProject,
}) => {
  const setupGapItems = signalItems.filter((item) => item.kind === 'setup');
  const agentItems = signalItems.filter((item) => item.kind === 'agent');
  const riskItems = signalItems.filter((item) => item.kind === 'risk');
  const dirtyItems = signalItems.filter((item) => item.kind === 'dirty');
  const driftItems = signalItems.filter((item) => item.kind === 'drift');
  const setupGroups = groupedSetupGaps(setupGapItems);
  const highRiskItems = riskItems.filter((item) => ['critical', 'high'].includes(item.severity));
  const priorityItems = signalItems.slice(0, 10);
  const activeFocus = ['priority', 'agent', 'setup', 'risk', 'git', 'drift'].includes(focus) ? focus : 'priority';
  const filteredItems = activeFocus === 'priority'
    ? priorityItems
    : activeFocus === 'agent'
      ? agentItems
      : activeFocus === 'setup'
        ? setupGapItems
        : activeFocus === 'risk'
          ? riskItems
          : activeFocus === 'git'
            ? dirtyItems
            : driftItems;
  const filters = [
    { id: 'priority', label: 'Priority', icon: AlertTriangle, count: priorityItems.length },
    { id: 'agent', label: 'Agent', icon: FileJson, count: agentItems.length },
    { id: 'setup', label: 'Setup', icon: Cpu, count: setupGapItems.length },
    { id: 'risk', label: 'Risk', icon: ShieldAlert, count: riskItems.length },
    { id: 'git', label: 'Git', icon: GitBranch, count: dirtyItems.length },
    { id: 'drift', label: 'Drift', icon: GitCompareArrows, count: driftItems.length },
  ];
  const agentBriefLines = [
    `Start with ${priorityItems[0]?.project.name ?? 'the cleanest mapped project'}: ${priorityItems[0]?.title ?? 'no priority blockers surfaced'}.`,
    `${highRiskItems.length} high-priority finding${highRiskItems.length === 1 ? '' : 's'}; ${riskItems.length} total risk signal${riskItems.length === 1 ? '' : 's'} are not equally weighted.`,
    agentItems.length ? `${agentItems.length} project${agentItems.length === 1 ? '' : 's'} have no agent instructions; add local rules before assigning agent work.` : 'Agent instructions are present for mapped projects.',
    setupGroups[0] ? `${setupGroups[0][1].length} project${setupGroups[0][1].length === 1 ? '' : 's'} share "${setupGroups[0][0]}".` : 'No repeated setup gap is blocking project setup.',
    dirtyItems.length ? `Review Git state for ${dirtyItems[0].project.name} first.` : 'No dirty worktrees need review.',
    driftItems.length ? 'Use reference differences as advisory context, not a launch blocker.' : 'No reference differences surfaced.',
  ];
  const agentBriefText = [
    'Workspace brief',
    '',
    ...agentBriefLines,
  ].join('\n');
  const riskLead = riskItems[0];
  const dirtyLead = dirtyItems[0];
  const driftLead = driftItems[0];

  if (!projects.length) {
    return (
      <SetupRequiredState
        eyebrow="Workspace Brief"
        title="No brief available yet"
        detail={hasKnownProjects
          ? 'Track at least one candidate project before Aperture can rank next moves.'
          : 'Add a project first. Brief is the action layer, so it needs mapped project evidence before it can prioritize anything.'}
        hasKnownProjects={hasKnownProjects}
        onOpenSettings={onOpenSettings}
        onShowScannerHelp={onShowScannerHelp}
        onAddManualProject={onAddManualProject}
      />
    );
  }

  return (
    <section className="workspace-brief">
      <div className="workspace-brief__hero">
        <div className="workspace-brief__copy">
          <h2>What should happen next</h2>
          <p>Actionable setup, risk, Git, and reference signals translated into one cross-project queue.</p>
        </div>
        <div className="workspace-brief__score">
          <span>{signalItems.length}</span>
          <small>open signals</small>
        </div>
      </div>

      <section className="brief-metrics" aria-label="Brief snapshot">
        <BriefMetric icon={FolderOpen} label="Mapped" value={projects.length} detail="projects" />
        <BriefMetricButton icon={FileJson} label="Agent" value={agentItems.length} detail="missing" onClick={() => onOpenFocus('agent')} />
        <BriefMetricButton icon={Cpu} label="Setup" value={setupGapItems.length} detail="gaps" onClick={() => onOpenFocus('setup')} />
        <BriefMetricButton icon={ShieldAlert} label="Risk" value={highRiskItems.length} detail={`${riskItems.length} total`} onClick={() => onOpenFocus('risk')} />
        <BriefMetricButton icon={GitBranch} label="Git" value={dirtyItems.length} detail="dirty" onClick={() => onOpenFocus('git')} />
      </section>

      <section className="brief-moments" aria-label="Brief highlights">
        <BriefMoment
          eyebrow="Agent context"
          title={agentItems.length ? `${agentItems.length} project${agentItems.length === 1 ? '' : 's'} have no agent instructions` : 'Agent instructions present'}
          copy={agentItems.length ? 'Agents will enter these repos without local rules or workflow expectations.' : 'Mapped projects have project-specific guidance for agent work.'}
          icon={FileJson}
          tone={agentItems.length ? 'warning' : 'success'}
        />
        <BriefMoment
          eyebrow="Launch pressure"
          title={riskLead?.title || 'No launch risk detected'}
          copy={riskLead ? `${riskLead.project.name}: ${riskLead.detail}` : 'The current scan is not flagging missing CI, exposed env files, or similar launch hygiene issues.'}
          icon={ShieldAlert}
          tone={riskLead ? 'warning' : 'success'}
        />
        <BriefMoment
          eyebrow="Project state"
          title={dirtyLead?.title || driftLead?.title || 'No local drag'}
          copy={dirtyLead ? dirtyLead.detail : driftLead ? `${driftLead.project.name}: ${driftLead.detail}` : 'Worktrees and reference markers are calm enough to keep moving.'}
          icon={dirtyLead ? GitBranch : GitCompareArrows}
          tone={dirtyLead || driftLead ? 'danger' : 'success'}
        />
      </section>

      <section className="brief-panel brief-panel--queue">
        <div className="brief-panel__heading">
          <h3><AlertTriangle size={15} /> Action Queue</h3>
          <span>{filteredItems.length}</span>
        </div>
        <div className="brief-filter-row" aria-label="Brief filters">
          {filters.map((filter) => {
            const Icon = filter.icon;
            return (
              <button
                key={filter.id}
                type="button"
                className={`brief-filter ${activeFocus === filter.id ? 'is-active' : ''}`}
                onClick={() => onOpenFocus(filter.id)}
              >
                <Icon size={14} />
                <span>{filter.label}</span>
                <em>{filter.count}</em>
              </button>
            );
          })}
        </div>
        <div className="brief-queue-list">
          {filteredItems.length ? filteredItems.map((item) => (
            <BriefItemButton key={item.id} item={item} onSelectProject={onSelectProject} />
          )) : <div className="brief-empty"><CheckCircle2 size={18} /> No signals in this filter.</div>}
        </div>
        {agentItems.length > 0 && activeFocus === 'agent' && (
          <div className="brief-agent-actions">
            <CopyStarterAgentsButton />
          </div>
        )}
      </section>

      <section className="brief-panel brief-panel--handoff">
        <div className="brief-panel__heading">
          <h3><FileJson size={15} /> Workspace Brief</h3>
          <span>Summary</span>
        </div>
        <CopyableHandoff text={agentBriefText} label="brief" />
      </section>
    </section>
  );
};

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
      <p className="mt-2 max-w-sm text-sm text-slate-500">Checking for workspace scan data.</p>
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
            <p className="mt-1 text-xs font-bold text-slate-500">Saved in this browser and merged with workspace scan data.</p>
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
                <p>Best for a new local project. Refresh the workspace scan, then reload Aperture so the project list is updated.</p>
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
          Create a local workspace scan to map a folder without uploading a file snapshot into the browser.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <SetupCard icon={FolderOpen} title="Local folder scan" detail="Scan a projects folder, then refresh the dashboard." className="lg:col-span-2">
          <button type="button" onClick={onShowScannerHelp} className="manual-submit w-full justify-center">
            <Terminal size={16} /> Show Scan Command
          </button>
          <div className="mt-3 text-xs font-bold text-slate-500">A browser folder picker would read thousands of files as an upload-style snapshot, so Aperture creates a local workspace scan instead.</div>
        </SetupCard>

        <SetupCard icon={Terminal} title="Run workspace scan" detail="Use this when you want deeper Git, env, CI, and launch evidence." className="lg:col-span-2">
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

const liveOptionLabel = (options, value) => options.find((option) => option.value === value)?.label ?? 'Other';

const projectLiveUrl = (project, liveLinks = {}) => liveLinks[project.id]?.url ?? '';

const liveProjectStatus = (project) => {
  const launchRisk = launchHygieneRisks(project)[0];
  const topRisk = launchRisk ?? topRiskFinding(project.risks ?? []);
  const setup = readinessSummary(project.aiReadiness);
  const setupGap = setup.failed[0];
  if (topRisk) {
    return {
      tone: severityTones[topRisk.severity] || 'warning',
      title: topRisk.title,
      detail: topRisk.detail,
      label: topRisk.severity ?? 'review',
      tab: 'signals',
      icon: ShieldAlert,
    };
  }
  if (project.git?.dirty) {
    return {
      tone: 'warning',
      title: 'Local worktree has uncommitted changes',
      detail: 'Check whether the live surface is ahead of or behind local work before sharing.',
      label: 'dirty',
      tab: 'overview',
      icon: GitBranch,
    };
  }
  if (setupGap) {
    return {
      tone: 'info',
      title: setupGap.label,
      detail: 'Setup context is incomplete for this project.',
      label: 'setup',
      tab: 'signals',
      icon: Cpu,
    };
  }
  return {
    tone: 'success',
    title: 'No local launch blockers in the current scan',
    detail: 'Aperture is not seeing setup, hygiene, or worktree issues for this mapped project.',
    label: 'steady',
    tab: 'overview',
    icon: CheckCircle2,
  };
};

const hasLiveAttention = (project) => {
  const status = liveProjectStatus(project);
  return status.tone !== 'success';
};

const liveMetricsSummary = (project, liveLink) => {
  const connected = Boolean(liveLink?.url);
  const scan = normalizeLiveScan(liveLink?.scan);
  const checklist = scan
    ? Object.fromEntries(LIVE_CHECKLIST_ITEMS.map((item) => [item.id, Boolean(scan.checks?.[item.id]?.passed)]))
    : normalizeLiveChecklist(liveLink?.checklist);
  const checklistCompleted = Object.values(checklist).filter(Boolean).length;
  const missingChecklistItems = LIVE_CHECKLIST_ITEMS.filter((item) => !checklist[item.id]);
  const setup = readinessSummary(project.aiReadiness);
  const setupScore = project.aiReadiness?.score ?? 0;
  const launchRisks = launchHygieneRisks(project);
  const topRisk = launchRisks[0] ?? topRiskFinding(project.risks ?? []);
  const runtime = normalizeRuntimeStatus(project.runtimeStatus);
  const runtimeRunning = runtime?.state === 'running' && Boolean(primaryRuntimePort(runtime));
  const gitDirty = Boolean(project.git?.dirty);
  const providerKnown = connected && liveLink.provider && liveLink.provider !== 'other';
  const score = Math.min(100, Math.round(
    (connected ? 25 : 0)
    + (providerKnown ? 10 : 0)
    + (launchRisks.length ? 0 : 25)
    + Math.min(20, setupScore * 0.2)
    + (gitDirty ? 0 : 10)
    + (runtimeRunning ? 10 : 0),
  ));
  const gaps = [
    !connected ? 'No URL attached' : null,
    connected && !providerKnown ? 'Provider unknown' : null,
    launchRisks.length ? `${launchRisks.length} launch finding${launchRisks.length === 1 ? '' : 's'}` : null,
    setup.failed.length ? setup.label : null,
    gitDirty ? 'Dirty worktree' : null,
    !runtimeRunning ? 'Local runtime not running' : null,
  ].filter(Boolean);

  return {
    score,
    gaps,
    setup,
    topRisk,
    runtimeRunning,
    gitDirty,
    providerKnown,
    checklist: {
      values: checklist,
      completed: checklistCompleted,
      total: LIVE_CHECKLIST_ITEMS.length,
      missing: missingChecklistItems.length,
      missingItems: missingChecklistItems,
    },
  };
};

const ProjectLiveSettings = ({ project, liveLink, onSaveLiveLink, onClearLiveLink, onToggleLiveChecklist, focusOnOpen = false }) => {
  const [draft, setDraft] = useState({
    url: liveLink?.url ?? '',
    environment: liveLink?.environment ?? 'production',
    provider: liveLink?.provider ?? 'other',
  });
  const [status, setStatus] = useState('idle');
  const urlInputRef = useRef(null);

  useEffect(() => {
    setDraft({
      url: liveLink?.url ?? '',
      environment: liveLink?.environment ?? 'production',
      provider: liveLink?.provider ?? 'other',
    });
    setStatus('idle');
  }, [liveLink?.url, liveLink?.environment, liveLink?.provider, project.id]);

  useEffect(() => {
    if (focusOnOpen) {
      window.requestAnimationFrame(() => urlInputRef.current?.focus());
    }
  }, [focusOnOpen, project.id]);

  const normalizedUrl = normalizeLiveUrl(draft.url);
  const hasExistingUrl = Boolean(liveLink?.url);
  const canSave = Boolean(normalizedUrl);

  const save = (event) => {
    event.preventDefault();
    if (!canSave) {
      setStatus('invalid');
      return;
    }
    onSaveLiveLink(project.id, {
      url: normalizedUrl,
      environment: normalizeLiveEnvironment(draft.environment),
      provider: normalizeLiveProvider(draft.provider),
    });
    setDraft((current) => ({ ...current, url: normalizedUrl }));
    setStatus('saved');
  };

  const clear = () => {
    onClearLiveLink(project.id);
    setDraft((current) => ({ ...current, url: '' }));
    setStatus('cleared');
  };

  return (
    <section className="project-drawer__panel project-live-settings">
      <div className="project-drawer__section-heading">
        <h3><Link size={14} /> Live Surface</h3>
        <span>{hasExistingUrl ? liveOptionLabel(LIVE_ENVIRONMENT_OPTIONS, liveLink.environment) : 'Not connected'}</span>
      </div>
      <form className="project-live-settings__form" onSubmit={save}>
        <label className="manual-field">
          <span>Primary live URL</span>
          <input
            ref={urlInputRef}
            value={draft.url}
            onChange={(event) => {
              setDraft((current) => ({ ...current, url: event.target.value }));
              setStatus('idle');
            }}
            placeholder="https://example.com"
          />
        </label>
        <div className="project-live-settings__selectors">
          <label className="manual-field">
            <span>Environment</span>
            <select value={draft.environment} onChange={(event) => setDraft((current) => ({ ...current, environment: event.target.value }))}>
              {LIVE_ENVIRONMENT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label className="manual-field">
            <span>Provider</span>
            <select value={draft.provider} onChange={(event) => setDraft((current) => ({ ...current, provider: event.target.value }))}>
              {LIVE_PROVIDER_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
        </div>
        {hasExistingUrl && (
          <div className="project-live-checklist project-live-checklist--settings" aria-label={`${project.name} live checklist`}>
            {LIVE_CHECKLIST_ITEMS.map((item) => (
              <label key={item.id} className="project-live-checklist__item">
                <input
                  type="checkbox"
                  checked={Boolean(liveLink?.checklist?.[item.id])}
                  onChange={(event) => onToggleLiveChecklist(project.id, item.id, event.target.checked)}
                />
                <span>
                  <strong>{item.label}</strong>
                  <small>{item.detail}</small>
                </span>
              </label>
            ))}
          </div>
        )}
        <div className="project-live-settings__actions">
          <button type="submit" className="manual-submit" disabled={!draft.url.trim()}>
            <Save size={16} /> Save Live URL
          </button>
          {hasExistingUrl && (
            <>
              <a className="project-live-settings__open" href={liveLink.url} target="_blank" rel="noreferrer">
                <ExternalLink size={15} /> Open live
              </a>
              <button type="button" className="project-live-settings__clear" onClick={clear}>
                <X size={15} /> Clear
              </button>
            </>
          )}
        </div>
        {status === 'invalid' && <div className="project-live-settings__status is-error">Enter a valid http or https URL.</div>}
        {status === 'saved' && <div className="project-live-settings__status">Live surface saved for {project.name}.</div>}
        {status === 'cleared' && <div className="project-live-settings__status">Live surface removed.</div>}
      </form>
    </section>
  );
};

const LiveProjectRow = ({ project, liveLink, selected, onSelect, onOpenProject, onAttachUrl }) => {
  const connected = Boolean(liveLink?.url);
  const metrics = liveMetricsSummary(project, liveLink);
  const status = connected && metrics.checklist.missing ? {
    tone: 'warning',
    title: `${metrics.checklist.missing} live checklist gap${metrics.checklist.missing === 1 ? '' : 's'}`,
    detail: `${metrics.checklist.missingItems.map((item) => item.label).join(', ')} still need review.`,
    label: 'checklist',
    tab: 'settings',
    icon: AlertTriangle,
  } : connected ? liveProjectStatus(project) : {
    tone: 'info',
    title: 'No deployed URL attached',
    detail: 'Connect the production, staging, or preview URL to track this local project as a live surface.',
    label: 'connect',
    tab: 'settings',
    icon: Link,
  };
  const StatusIcon = status.icon;
  const host = connected ? new URL(liveLink.url).host : 'Not connected';
  const lastActivity = sourceActivityDate(project);
  const provider = connected ? liveOptionLabel(LIVE_PROVIDER_OPTIONS, liveLink.provider) : 'No provider';
  const environment = connected ? liveOptionLabel(LIVE_ENVIRONMENT_OPTIONS, liveLink.environment) : 'Local only';
  const runtimeLabel = metrics.runtimeRunning ? runtimeStatusLabel(project.runtimeStatus) : 'Not running';
  const readinessLabel = metrics.gaps.length ? `${metrics.gaps.length} tracked gap${metrics.gaps.length === 1 ? '' : 's'}` : 'Live signals steady';
  return (
    <article
      className={`live-project-row ${connected ? 'is-connected' : ''} ${selected ? 'is-selected' : ''} live-project-row--${status.tone}`}
      onClick={() => onSelect(project)}
      onKeyDown={(event) => openCardFromKeyboard(event, project, onSelect)}
      role="button"
      tabIndex={0}
      aria-label={`Select ${project.name} live state`}
    >
      <div className="live-project-row__topline">
        <span className="live-project-row__eyebrow">{environment}</span>
        <span className={`live-project-row__state live-project-row__state--${metrics.score >= 80 ? 'good' : metrics.score >= 50 ? 'watch' : 'risk'}`}>
          {readinessLabel}
        </span>
      </div>

      <div className="live-project-row__hero">
        <div className="live-project-row__identity">
          <h3>{project.name}</h3>
          <p>{project.path}</p>
        </div>
        <div className="live-project-row__score" aria-label={`${metrics.score}% live ready`}>
          <span>{metrics.score}<small>%</small></span>
          <em>live ready</em>
        </div>
      </div>

      <div className="live-project-row__facts">
        <div>
          <span>Surface</span>
          <strong>{host}</strong>
        </div>
        <div>
          <span>Provider</span>
          <strong>{provider}</strong>
        </div>
        <div>
          <span>Local</span>
          <strong>{runtimeLabel}</strong>
        </div>
        <div>
          <span>Updated</span>
          <strong>{formatDate(lastActivity)}</strong>
        </div>
        <span className="live-project-row__meter"><i style={{ width: `${Math.max(5, metrics.score)}%` }} /></span>
      </div>

      <div className="live-project-row__signal">
        <StatusIcon size={16} />
        <span>
          <strong>{status.title}</strong>
          <small>{status.detail}</small>
        </span>
      </div>

      <div className="live-project-row__actions">
        {connected ? (
          <a href={liveLink.url} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()}>
            <ExternalLink size={15} /> Open live
          </a>
        ) : (
          <button type="button" onClick={(event) => { event.stopPropagation(); onAttachUrl(project); }}>
            <Link size={15} /> Attach URL
          </button>
        )}
        <button type="button" onClick={(event) => { event.stopPropagation(); onOpenProject(project, connected ? status.tab : 'settings'); }}>
          <FolderOpen size={15} /> Project
        </button>
      </div>
    </article>
  );
};

const LiveStateSidebar = ({ project, liveLink, onOpenProject, onAttachUrl, onToggleLiveChecklist }) => {
  if (!project) {
    return (
      <aside className="live-state-sidebar">
        <div className="live-state-sidebar__empty">
          <Link size={20} />
          <strong>Select a project</strong>
          <span>Live checklist details appear here.</span>
        </div>
      </aside>
    );
  }

  const connected = Boolean(liveLink?.url);
  const metrics = liveMetricsSummary(project, liveLink);
  const host = connected ? new URL(liveLink.url).host : 'No URL attached';
  const missingItems = connected ? metrics.checklist.missingItems : LIVE_CHECKLIST_ITEMS;

  return (
    <aside className="live-state-sidebar" aria-label={`${project.name} live state`}>
      <div className="live-state-sidebar__header">
        <span>{connected ? liveOptionLabel(LIVE_ENVIRONMENT_OPTIONS, liveLink.environment) : 'Local only'}</span>
        <h3>{project.name}</h3>
        <a href={connected ? liveLink.url : undefined} target="_blank" rel="noreferrer" aria-disabled={!connected} onClick={(event) => { if (!connected) event.preventDefault(); }}>
          <ExternalLink size={14} /> {host}
        </a>
      </div>

      <div className="live-state-sidebar__score">
        <strong>{metrics.checklist.completed}/{metrics.checklist.total}</strong>
        <span>live checks complete</span>
      </div>

      <section className="live-state-sidebar__section">
        <h4>Live Checklist</h4>
        {connected && (
          <div className={`live-scan-status ${liveLink.scan?.error ? 'is-error' : ''}`}>
            {liveLink.scan?.checkedAt
              ? `Auto-scanned ${formatDate(liveLink.scan.checkedAt)}${liveLink.scan.status ? ` · HTTP ${liveLink.scan.status}` : ''}`
              : 'Auto-scan will run for this URL.'}
            {liveLink.scan?.error ? ` ${liveLink.scan.error}` : ''}
          </div>
        )}
        <div className="project-live-checklist project-live-checklist--sidebar">
          {LIVE_CHECKLIST_ITEMS.map((item) => (
            <label key={item.id} className="project-live-checklist__item">
              <input
                type="checkbox"
                checked={Boolean(metrics.checklist.values?.[item.id])}
                disabled
                onChange={(event) => onToggleLiveChecklist(project.id, item.id, event.target.checked)}
              />
              <span>
                <strong>{item.label}</strong>
                <small>{liveLink?.scan?.checks?.[item.id]?.detail || item.detail}</small>
                {liveLink?.scan?.checks?.[item.id]?.evidence && <em>{liveLink.scan.checks[item.id].evidence}</em>}
              </span>
            </label>
          ))}
        </div>
      </section>

      <section className="live-state-sidebar__section">
        <h4>Why It Matters</h4>
        <div className="live-state-sidebar__consequences">
          {missingItems.length ? missingItems.map((item) => (
            <div key={item.id}>
              <strong>{item.label}</strong>
              <span>{item.detail}</span>
            </div>
          )) : (
            <div>
              <strong>Live basics are covered</strong>
              <span>Favicon, OG card, and SEO readiness are marked complete for this surface.</span>
            </div>
          )}
        </div>
      </section>

      <div className="live-state-sidebar__actions">
        {connected ? (
          <a href={liveLink.url} target="_blank" rel="noreferrer">
            <ExternalLink size={15} /> Open live
          </a>
        ) : (
          <button type="button" onClick={() => onAttachUrl(project)}>
            <Link size={15} /> Attach URL
          </button>
        )}
        <button type="button" onClick={() => onOpenProject(project, 'settings')}>
          <Settings size={15} /> Project settings
        </button>
      </div>
    </aside>
  );
};

const LiveView = ({ projects, liveLinks, onOpenProject, onAttachUrl, onToggleLiveChecklist, onApplyLiveScan, hasKnownProjects, onOpenSettings, onShowScannerHelp, onAddManualProject }) => {
  const connectedProjects = projects.filter((project) => projectLiveUrl(project, liveLinks));
  const unconnectedProjects = projects.filter((project) => !projectLiveUrl(project, liveLinks));
  const [selectedProjectId, setSelectedProjectId] = useState(() => connectedProjects[0]?.id ?? projects[0]?.id ?? '');
  useEffect(() => {
    if (!projects.length) {
      setSelectedProjectId('');
      return;
    }
    if (!projects.some((project) => project.id === selectedProjectId)) {
      setSelectedProjectId(connectedProjects[0]?.id ?? projects[0]?.id ?? '');
    }
  }, [connectedProjects, projects, selectedProjectId]);
  useEffect(() => {
    let cancelled = false;
    const staleAfterMs = 1000 * 60 * 60 * 12;
    connectedProjects.forEach((project) => {
      const liveLink = liveLinks[project.id];
      const checkedAt = liveLink?.scan?.checkedAt ? new Date(liveLink.scan.checkedAt).getTime() : 0;
      if (!liveLink?.url || (Number.isFinite(checkedAt) && Date.now() - checkedAt < staleAfterMs)) return;
      fetch('/api/live-check', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ url: liveLink.url }),
      })
        .then(async (response) => {
          const data = await response.json().catch(() => ({}));
          if (!response.ok) throw new Error(data?.error || 'Live check failed.');
          return data;
        })
        .then((scan) => {
          if (!cancelled) onApplyLiveScan(project.id, scan);
        })
        .catch((error) => {
          if (!cancelled) {
            onApplyLiveScan(project.id, {
              url: liveLink.url,
              checkedAt: new Date().toISOString(),
              error: error.message || 'Live check failed.',
            });
          }
        });
    });
    return () => {
      cancelled = true;
    };
  }, [connectedProjects, liveLinks, onApplyLiveScan]);
  const selectedLiveProject = projects.find((project) => project.id === selectedProjectId) ?? connectedProjects[0] ?? projects[0] ?? null;
  const attentionProjects = connectedProjects.filter((project) => hasLiveAttention(project) || liveMetricsSummary(project, liveLinks[project.id]).gaps.length > 0);
  const attentionProjectIds = new Set(attentionProjects.map((project) => project.id));
  const metricTotals = connectedProjects.reduce((totals, project) => {
    const summary = liveMetricsSummary(project, liveLinks[project.id]);
    return {
      score: totals.score + summary.score,
      gaps: totals.gaps + summary.gaps.length,
      launchFindings: totals.launchFindings + launchHygieneRisks(project).length,
      completed: totals.completed + summary.checklist.completed,
      total: totals.total + summary.checklist.total,
    };
  }, { score: 0, gaps: 0, launchFindings: 0, completed: 0, total: 0 });
  const stats = [
    { label: 'Live surfaces', value: connectedProjects.length, icon: Link },
    { label: 'Checklist done', value: `${metricTotals.completed}/${metricTotals.total || 0}`, icon: CheckCircle2 },
    { label: 'Checklist gaps', value: metricTotals.gaps, icon: AlertTriangle },
    { label: 'Not connected', value: unconnectedProjects.length, icon: CircleHelp },
  ];

  if (!projects.length) {
    return (
      <SetupRequiredState
        eyebrow="Live"
        title="No projects mapped yet"
        detail={hasKnownProjects
          ? 'Move projects into the active workspace map before attaching deployed URLs.'
          : 'Add or scan local projects first. Live connects deployed surfaces back to local project records.'}
        hasKnownProjects={hasKnownProjects}
        onOpenSettings={onOpenSettings}
        onShowScannerHelp={onShowScannerHelp}
        onAddManualProject={onAddManualProject}
      />
    );
  }

  return (
    <section className="live-view">
      <div className="live-view__header">
        <div>
          <div className="text-xs font-black uppercase tracking-[0.28em] text-indigo-300">Live</div>
          <h2>Deployed surfaces</h2>
          <p>Track the live-surface basics for every deployed project: favicon, social preview card, and SEO readiness.</p>
        </div>
        <div className="live-view__stats">
          {stats.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label}>
                <Icon size={17} />
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {connectedProjects.length === 0 && (
        <section className="live-empty">
          <div>
            <Link size={24} />
            <h3>No live projects connected yet</h3>
            <p>Attach a deployed URL to any local project to see its live surface here.</p>
          </div>
        </section>
      )}

      <div className="live-workbench">
        <div className="live-workbench__main">
          {connectedProjects.length > 0 && (
            <section className="live-section">
              <div className="live-section__heading">
                <h3>Connected</h3>
                <span>{connectedProjects.length}</span>
              </div>
              <div className="live-project-list">
                {[...attentionProjects, ...connectedProjects.filter((project) => !attentionProjectIds.has(project.id))].map((project) => (
                  <LiveProjectRow
                    key={project.id}
                    project={project}
                    liveLink={liveLinks[project.id]}
                    selected={project.id === selectedLiveProject?.id}
                    onSelect={(selectedProject) => setSelectedProjectId(selectedProject.id)}
                    onOpenProject={onOpenProject}
                    onAttachUrl={onAttachUrl}
                  />
                ))}
              </div>
            </section>
          )}

          <section className="live-section">
            <div className="live-section__heading">
              <h3>Ready to connect</h3>
              <span>{unconnectedProjects.length}</span>
            </div>
            {unconnectedProjects.length > 0 ? (
              <div className="live-project-list">
                {unconnectedProjects.map((project) => (
                  <LiveProjectRow
                    key={project.id}
                    project={project}
                    liveLink={null}
                    selected={project.id === selectedLiveProject?.id}
                    onSelect={(selectedProject) => setSelectedProjectId(selectedProject.id)}
                    onOpenProject={onOpenProject}
                    onAttachUrl={onAttachUrl}
                  />
                ))}
              </div>
            ) : (
              <div className="live-section__empty">All mapped projects have a live URL attached.</div>
            )}
          </section>
        </div>

        <LiveStateSidebar
          project={selectedLiveProject}
          liveLink={selectedLiveProject ? liveLinks[selectedLiveProject.id] : null}
          onOpenProject={onOpenProject}
          onAttachUrl={onAttachUrl}
          onToggleLiveChecklist={onToggleLiveChecklist}
        />
      </div>
    </section>
  );
};

const AgentContextPanel = ({ project }) => {
  const summary = agentContextSummary(project);
  return (
    <section>
      <div className="project-drawer__section-heading project-drawer__section-heading--subtle">
        <h3><FileJson size={14} /> Agent Context</h3>
        <span>{summary.hasInstructions ? `${summary.files.length} file${summary.files.length === 1 ? '' : 's'}` : 'Missing'}</span>
      </div>
      {summary.hasInstructions ? (
        <div className="agent-context-panel agent-context-panel--ready">
          <ProjectSignalLine
            tone="success"
            icon={CheckCircle2}
            title="Agent instructions are present"
            detail="Agents have project-specific context before making changes."
            meta={`Found: ${summary.files.slice(0, 3).join(', ')}${summary.files.length > 3 ? `, +${summary.files.length - 3} more` : ''}`}
          />
          {summary.hasSkills && (
            <ProjectSignalLine
              tone="info"
              icon={FileJson}
              title={`${summary.skills.length} repo-local skill${summary.skills.length === 1 ? '' : 's'} detected`}
              detail="Aperture surfaces these as read-only project context; editing and execution stay in the IDE or agent tool."
            />
          )}
        </div>
      ) : (
        <div className="agent-context-panel agent-context-panel--missing">
          <ProjectSignalLine
            tone="warning"
            icon={AlertTriangle}
            title="No agent instructions"
            detail="Agents will enter this repo without project-specific rules, architecture notes, test expectations, or safe-change boundaries."
            meta="Add an AGENTS.md-style file with project rules, commands, and safe-change boundaries."
          />
          <CopyStarterAgentsButton />
          {summary.hasSkills && (
            <ProjectSignalLine
              tone="info"
              icon={FileJson}
              title={`${summary.skills.length} repo-local skill${summary.skills.length === 1 ? '' : 's'} detected`}
              detail="Skills are visible, but this project still lacks general agent instructions."
            />
          )}
        </div>
      )}
    </section>
  );
};

const SignalDisclosure = ({ title, count, children, defaultOpen = false }) => (
  <details className="signal-disclosure" open={defaultOpen}>
    <summary>
      <span>{title}</span>
      {count !== undefined && <strong>{count}</strong>}
    </summary>
    <div className="signal-disclosure__body">
      {children}
    </div>
  </details>
);

const setupActionLabel = (label = '') => {
  const normalized = String(label).replace(/\s+present\b/i, '').trim();
  if (!normalized) return 'Complete setup item';
  return `Add ${normalized.charAt(0).toLowerCase()}${normalized.slice(1)}`;
};

const ProjectSignalsDashboard = ({ project, checks, launchRisks, risks, normalChecks, skippedChecks }) => {
  const setup = readinessSummary(project.aiReadiness);
  const agentContext = agentContextSummary(project);
  const failedChecks = setup.failed;
  const prioritySignals = [
    ...failedChecks.slice(0, 2).map((check) => ({
      key: `setup-${check.id}`,
      tone: 'warning',
      icon: AlertTriangle,
      eyebrow: 'Setup',
      title: setupActionLabel(check.label),
      detail: 'Complete this before relying on handoff or automation.',
    })),
    ...(!agentContext.hasInstructions ? [{
      key: 'agent-context',
      tone: 'warning',
      icon: FileJson,
      eyebrow: 'Agent context',
      title: 'Add project instructions',
      detail: 'Capture repo rules, commands, and safe-change boundaries.',
    }] : []),
    ...launchRisks.slice(0, 2).map((risk) => ({
      key: `launch-${risk.id}-${risk.detail}`,
      tone: severityTones[risk.severity] || 'info',
      icon: AlertTriangle,
      eyebrow: riskCategory(risk),
      title: risk.title,
      detail: risk.fix || risk.detail,
      side: risk.severity,
    })),
    ...risks.slice(0, 2).map((risk) => ({
      key: `risk-${risk.id}-${risk.detail}`,
      tone: severityTones[risk.severity] || 'info',
      icon: ShieldAlert,
      eyebrow: riskCategory(risk),
      title: risk.title,
      detail: risk.detail,
    })),
  ].slice(0, 4);

  return (
    <div className="project-signals">
      <section className="signals-overview">
        <div className="signals-overview__card signals-overview__card--setup">
          <Cpu size={16} />
          <span>Setup</span>
          <strong>{setup.label}</strong>
          <div className="project-drawer__meter">
            <div style={{ width: `${project.aiReadiness?.score ?? 0}%` }} />
          </div>
        </div>
        <div className="signals-overview__card">
          <FileJson size={16} />
          <span>Agent context</span>
          <strong>{agentContext.hasInstructions ? `${agentContext.files.length} file${agentContext.files.length === 1 ? '' : 's'}` : 'Missing'}</strong>
          <small>{agentContext.hasSkills ? `${agentContext.skills.length} skill${agentContext.skills.length === 1 ? '' : 's'} visible` : 'No repo-local skills'}</small>
        </div>
        <div className="signals-overview__card">
          <ShieldAlert size={16} />
          <span>Findings</span>
          <strong>{launchRisks.length + risks.length}</strong>
          <small>{launchRisks.length} before sharing · {risks.length} hygiene</small>
        </div>
      </section>

      <section>
        <div className="project-drawer__section-heading project-drawer__section-heading--subtle">
          <h3><Zap size={14} /> Next Actions</h3>
          <span>{prioritySignals.length}</span>
        </div>
        <div className="project-drawer__stack">
          {prioritySignals.length > 0 ? prioritySignals.map((signal) => (
            <ProjectSignalLine
              key={signal.key}
              tone={signal.tone}
              icon={signal.icon}
              eyebrow={signal.eyebrow}
              title={signal.title}
              detail={signal.detail}
              side={signal.side}
            />
          )) : (
            <ProjectSignalLine
              tone="success"
              icon={CheckCircle2}
              title="No priority signal needs action."
              detail="Setup, agent context, and hygiene checks are currently quiet."
            />
          )}
        </div>
      </section>

      <AgentContextPanel project={project} />

      <section className="signals-evidence">
        <div className="project-drawer__section-heading project-drawer__section-heading--subtle">
          <h3><CircleHelp size={14} /> Evidence</h3>
        </div>
        <SignalDisclosure title="Setup checklist" count={`${setup.passed}/${setup.total || checks.length}`} defaultOpen={failedChecks.length > 0}>
          <div className="project-drawer__check-grid project-drawer__check-grid--compact">
            {checks.length > 0 ? checks.map((check) => (
              <div key={check.id} className="project-drawer__check">
                {check.passed ? <CheckCircle2 size={15} className="text-emerald-400" /> : <AlertTriangle size={15} className="text-amber-400" />}
                <span>{check.label}</span>
              </div>
            )) : <span className="project-drawer__muted-line">No setup signal details in this dataset.</span>}
          </div>
        </SignalDisclosure>

        <SignalDisclosure title="Fix before sharing" count={launchRisks.length} defaultOpen={launchRisks.length > 0}>
          <div className="project-drawer__stack">
            {launchRisks.length > 0 ? launchRisks.map((risk) => (
              <ProjectSignalLine
                key={`${risk.id}-${risk.detail}`}
                tone={severityTones[risk.severity] || 'info'}
                icon={AlertTriangle}
                eyebrow={riskCategory(risk)}
                title={risk.title}
                detail={risk.detail}
                meta={risk.fix}
                side={risk.severity}
              />
            )) : (
              <ProjectSignalLine tone="success" icon={CheckCircle2} title="No stack-aware launch findings detected." />
            )}
          </div>
        </SignalDisclosure>

        <SignalDisclosure title="Hygiene signals" count={risks.length}>
          <div className="project-drawer__stack">
            {risks.length > 0 ? risks.map((risk) => (
              <ProjectSignalLine
                key={`${risk.id}-${risk.detail}`}
                tone={severityTones[risk.severity] || 'info'}
                icon={ShieldAlert}
                eyebrow={riskCategory(risk)}
                title={risk.title}
                detail={risk.detail}
                meta={riskWhyShown(risk)}
              />
            )) : (
              <ProjectSignalLine tone="success" icon={CheckCircle2} title={`No hygiene findings from ${SCANNER_CHECK_SCOPE}.`} />
            )}
          </div>
        </SignalDisclosure>

        <SignalDisclosure title="Normalized signals" count={normalChecks.length}>
          <div className="project-drawer__stack">
            {normalChecks.length > 0 ? normalChecks.map((check) => (
              <ProjectSignalLine
                key={check.title}
                tone="success"
                icon={CheckCircle2}
                title={check.title}
                detail={check.detail}
              />
            )) : (
              <ProjectSignalLine tone="info" icon={CheckCircle2} title="No stack-specific normalizations apply yet." />
            )}
          </div>
        </SignalDisclosure>

        <SignalDisclosure title="Skipped checks" count={skippedChecks.length}>
          <div className="project-drawer__stack">
            {skippedChecks.length > 0 ? skippedChecks.map((check) => (
              <ProjectSignalLine
                key={check.id}
                tone="info"
                icon={CircleHelp}
                title={check.title}
                detail={check.reason}
              />
            )) : (
              <ProjectSignalLine tone="success" icon={CheckCircle2} title="No checks were skipped for this project profile." />
            )}
          </div>
        </SignalDisclosure>
      </section>
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
  if (highestRisk(project)?.severity === 'high') return <span className="h-2 w-2 rounded-full bg-rose-500" aria-label="High severity workspace finding" />;
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

const riskWhyShown = (risk) => `Shown because workspace evidence matched ${riskCategory(risk).toLowerCase()}: ${risk.detail}`;

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

const ExperimentalProjectCard = ({ project, onSelect, drift = [], isReference, onRefreshScan, scanRefreshStatus }) => {
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
    {
      key: 'setup',
      active: readiness < 80,
      className: readiness < 80 ? 'is-active' : '',
      label: readiness < 80 ? `${setup.failed.length} setup gap${setup.failed.length === 1 ? '' : 's'}` : 'Setup signals present',
      detail: setup.detail,
      help: conceptHelp('readiness', { project, drift, isReference }),
    },
  ];
  const primarySignal = signalItems.find((item) => item.active) ?? signalItems[0];

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
          <RuntimeStatusIndicator runtimeStatus={project.runtimeStatus} align="right" compact onRefreshScan={onRefreshScan} refreshStatus={scanRefreshStatus} />
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
        <div className="project-card-exp__score" aria-label={`${readiness}% setup ready`}>
          <span>{readiness}<small>%</small></span>
          <em>setup ready</em>
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
          <InfoPopover {...primarySignal.help} />
          <small>{primarySignal.detail}</small>
        </span>
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

const DiscoveryReview = ({ candidates, onCommitProjectStates, onDefer }) => {
  const [draftStates, setDraftStates] = useState({});
  const selectedIds = candidates.filter((project) => draftStates[project.id] !== 'ignored').map((project) => project.id);
  const workspaceCount = selectedIds.length;
  const deferredCount = candidates.length - workspaceCount;
  const commitLabel = workspaceCount
    ? `Finish setup · ${workspaceCount} selected`
    : 'Finish with none selected';
  const toggleProject = (projectId) => {
    setDraftStates((current) => ({
      ...current,
      [projectId]: current[projectId] === 'ignored' ? 'tracked' : 'ignored',
    }));
  };
  const trackAll = () => {
    setDraftStates(Object.fromEntries(candidates.map((project) => [project.id, 'tracked'])));
  };
  const hideAll = () => {
    setDraftStates(Object.fromEntries(candidates.map((project) => [project.id, 'ignored'])));
  };
  const finishSetup = () => {
    onCommitProjectStates(Object.fromEntries(candidates.map((project) => [project.id, draftStates[project.id] ?? 'tracked'])));
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
            <button type="button" onClick={hideAll}>Hide all</button>
            <button type="button" onClick={onDefer}>Skip all for now</button>
          </div>
        </div>

        {candidates.length > 0 && (
          <div className="setup-wizard__list">
            {candidates.map((project) => {
              const selected = draftStates[project.id] !== 'ignored';
              return (
                <label key={project.id} className={`setup-candidate ${selected ? 'is-selected' : ''}`}>
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleProject(project.id)}
                  />
                  <span className="setup-candidate__check" aria-hidden="true">
                    {selected && <CheckCircle2 size={18} />}
                  </span>
                  <span className="setup-candidate__identity">
                    <strong>{project.name}</strong>
                    <small>{project.path}</small>
                  </span>
                  <span className="setup-candidate__meta">
                    <span>{stackList(project).slice(0, 2).join(' / ') || 'Unknown stack'}</span>
                    <span>{selected ? 'Active' : 'Hidden'} · {(project.risks ?? []).length} finding{(project.risks ?? []).length === 1 ? '' : 's'}</span>
                  </span>
                </label>
              );
            })}
          </div>
        )}

        <div className="setup-wizard__finish">
          <div>
            <strong>{selectionLabel}</strong>
            <span>{deferredCount ? `${deferredCount} candidate${deferredCount === 1 ? '' : 's'} will be hidden.` : 'All candidates have a decision.'}</span>
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

const ProjectDrawer = ({
  project,
  open,
  onClose,
  drift = [],
  referenceProject,
  isReference,
  liveLink,
  onSaveLiveLink,
  onClearLiveLink,
  onToggleLiveChecklist,
  onRefreshScan,
  scanRefreshStatus,
  initialTab = 'overview',
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const risks = project.risks ?? [];
  const launchRisks = launchHygieneRisks(project);
  const normalChecks = looksNormalChecks(project);
  const skippedChecks = project.skippedChecks ?? [];
  const checks = project.aiReadiness?.checks ?? [];
  const briefText = agentBriefLines(project, drift).join('\n');
  const stack = stackList(project);
  const tabs = [
    { id: 'overview', label: 'Overview', icon: FolderOpen },
    { id: 'signals', label: 'Signals', icon: ShieldAlert },
    { id: 'brief', label: 'Brief', icon: FileJson },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];
  useEffect(() => {
    if (open) {
      setActiveTab(initialTab);
    }
  }, [initialTab, open, project.id]);

  return (
    <>
      <button className={`attention-drawer__scrim ${open ? 'is-open' : ''}`} type="button" aria-label={`Close ${project.name}`} onClick={onClose} aria-hidden={!open} tabIndex={open ? 0 : -1} />
      <aside className={`project-drawer ${open ? 'is-open' : ''}`} aria-label={`${project.name} details`} aria-hidden={!open}>
        <div className="attention-drawer__header">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-100">
              <FolderOpen className="text-indigo-400" /> {project.name}
              <RuntimeStatusIndicator runtimeStatus={project.runtimeStatus} align="right" compact onRefreshScan={onRefreshScan} refreshStatus={scanRefreshStatus} />
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
              <button
                key={tab.id}
                type="button"
                className={`project-drawer__tab ${activeTab === tab.id ? 'is-active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="project-drawer__tab-label">
                  <Icon size={14} />
                  {tab.label}
                </span>
                <InfoPopover {...drawerTabHelp[tab.id]} align={tab.id === 'brief' ? 'right' : 'left'} stopClick={false} />
              </button>
            );
          })}
        </nav>

        <div className="project-drawer__body custom-scrollbar">
          {activeTab === 'signals' ? (
            <ProjectSignalsDashboard
              project={project}
              checks={checks}
              launchRisks={launchRisks}
              risks={risks}
              normalChecks={normalChecks}
              skippedChecks={skippedChecks}
            />
          ) : activeTab === 'brief' ? (
            <section className="project-drawer__panel">
              <CopyableHandoff
                text={briefText}
                label="project brief"
                heading={<h3 className="copyable-handoff__title"><FileJson size={14} /> Project Brief</h3>}
              />
            </section>
          ) : activeTab === 'settings' ? (
            <>
              <section className="project-drawer__panel project-settings-panel">
                <div className="project-drawer__section-heading">
                  <h3><Settings size={14} /> Project Settings</h3>
                  <span>{project.source === 'manual' ? 'Manual' : 'Scanner + metadata'}</span>
                </div>
                <div className="project-settings-summary">
                  <div>
                    <span>Display name</span>
                    <strong>{project.name}</strong>
                  </div>
                  <div>
                    <span>Lifecycle</span>
                    <strong>{PROJECT_STATE_LABELS[project.projectState] ?? 'Tracked'}</strong>
                  </div>
                  <div>
                    <span>Local source</span>
                    <strong>{project.source === 'manual' ? 'Manual entry' : 'Workspace scan'}</strong>
                  </div>
                </div>
                <p className="project-settings-note">
                  Project settings store local app metadata. Scanner facts such as path, Git state, stack, and scripts remain read-only.
                </p>
              </section>
              <ProjectLiveSettings
                project={project}
                liveLink={liveLink}
                onSaveLiveLink={onSaveLiveLink}
                onClearLiveLink={onClearLiveLink}
                onToggleLiveChecklist={onToggleLiveChecklist}
                focusOnOpen={open && initialTab === 'settings'}
              />
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
                    <RuntimeStatusIndicator runtimeStatus={project.runtimeStatus} align="right" onRefreshScan={onRefreshScan} refreshStatus={scanRefreshStatus} />
                  </div>
                </div>
              </section>

              <section className="project-drawer__panel project-drawer__panel--launch">
                <div className="project-drawer__section-heading">
                  <h3><Dna size={14} /> Project Shape</h3>
                  <span>{PROJECT_STATE_LABELS[project.projectState] ?? 'Tracked'}</span>
                </div>
                <div className="launch-profile-grid">
                  <div className="launch-profile-item">
                    <span>Stack</span>
                    <strong>{stack.slice(0, 4).join(' / ') || 'Unknown'}</strong>
                  </div>
                  <div className="launch-profile-item">
                    <span>Package</span>
                    <strong>{project.package?.manager ?? 'None'}</strong>
                  </div>
                  {launchProfileRows(project.launchProfile).map(([label, value]) => (
                    <div key={label} className="launch-profile-item">
                      <span>{label}</span>
                      <strong>{value}</strong>
                    </div>
                  ))}
                </div>
              </section>

              <section className="project-drawer__panel">
                <div className="project-drawer__section-heading project-drawer__section-heading--subtle">
                  <h3>
                    <GitCompareArrows size={14} /> Reference Differences
                    <InfoPopover {...briefExplainers.Reference} />
                  </h3>
                  <span>vs. {referenceProject?.name ?? 'reference'}</span>
                </div>
                {isReference ? (
                  <div className="project-drawer__empty">
                    This project is the current reference. Other projects are compared against it.
                  </div>
                ) : drift.length > 0 ? (
                  <div className="project-drawer__stack">
                    {drift.slice(0, 4).map((item) => (
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
                  <div className="project-drawer__empty text-emerald-300">
                    <CheckCircle2 className="mx-auto mb-2" /> Matches the reference on package, scripts, docs, env, CI, and runtime hints checked by Aperture.
                  </div>
                )}
              </section>

              <ProjectSourceSignal project={project} onRefreshScan={onRefreshScan} refreshStatus={scanRefreshStatus} />

              <section className="project-drawer__panel">
                <div className="project-drawer__section-heading project-drawer__section-heading--subtle">
                  <h3><Terminal size={14} /> Useful Commands</h3>
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
            <p className="settings-modal__setting-copy">Choose what appears in Projects. Reference is controlled only by the dropdown above.</p>
          </div>
          <div className="settings-project-list">
            {allProjects.length > 0 ? allProjects.map((project) => (
              <div key={project.id} className="settings-project-row">
                <div className="min-w-0">
                  <strong>{project.name}</strong>
                  <span>{project.id === referenceProjectId ? 'Reference · ' : ''}{TRACKED_PROJECT_STATES.has(project.projectState) ? 'Active' : 'Hidden'} · {launchProfileSummary(project.launchProfile)}</span>
                </div>
                <select
                  className="settings-project-row__select"
                  value={TRACKED_PROJECT_STATES.has(project.projectState) ? 'tracked' : 'ignored'}
                  onChange={(event) => onSetProjectState(project.id, event.target.value)}
                >
                  {SETTINGS_PROJECT_STATE_OPTIONS.map(({ value, label }) => (
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
const hasGitSnapshot = (project) => Array.isArray(project.git?.changes) && Array.isArray(project.git?.recentCommits);
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
  if (project.git?.dirty && !hasGitSnapshot(project)) return 'Dirty (stale scan)';
  if (project.git?.dirty) return `${dirtyCount(project)} change${dirtyCount(project) === 1 ? '' : 's'}`;
  return 'Clean';
};

const summarizeChangedGroups = (changes = []) => {
  if (!changes.length) return 'No local changes';
  const groups = changes.reduce((totals, change) => {
    const label = gitStatusMeta(change.status).label;
    return { ...totals, [label]: (totals[label] ?? 0) + 1 };
  }, {});
  return Object.entries(groups).map(([label, count]) => `${count} ${label.toLowerCase()}`).join(' · ');
};

const ProjectSourceSignal = ({ project, onRefreshScan, refreshStatus }) => {
  const [expandedCommitId, setExpandedCommitId] = useState(null);
  const changes = gitChanges(project);
  const commits = gitCommits(project);
  const visibleCommits = commits.slice(0, 10);
  const hasStaleGitSnapshot = project.git?.isRepo && !hasGitSnapshot(project);
  const hasUncapturedDirtyState = project.git?.dirty && changes.length === 0;

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
          <div>
            <span>Local changes</span>
            <strong>{summarizeChangedGroups(changes)}</strong>
          </div>
        </div>
        {(hasStaleGitSnapshot || hasUncapturedDirtyState) && (
          <div className="source-empty source-empty--dirty">
            <strong>{hasStaleGitSnapshot ? 'This Git snapshot is stale and missing changed-file/history detail.' : 'Git reports uncommitted changes, but this scan did not include the changed-file list.'}</strong>
            <span>Refresh the workspace scan from this dev server, or run <code>npm run scan</code> in the workspace.</span>
            <div className="source-empty__actions">
              <button type="button" onClick={onRefreshScan} disabled={refreshStatus === 'refreshing'}>
                {refreshStatus === 'refreshing' ? 'Rescanning' : 'Rescan Git state'}
              </button>
              <em>{refreshStatus === 'updated' ? 'Git snapshot refreshed.' : refreshStatus === 'missing' ? 'No workspace scan found.' : refreshStatus === 'error' ? 'Rescan failed.' : 'Waiting for workspace scan.'}</em>
            </div>
          </div>
        )}
      </section>

      <section className="source-zone source-zone--pulse">
        <div className="source-zone__heading">
          <span>Pulse Graph</span>
          <small>Last {Math.min(10, commits.length)} · {formatDate(sourceActivityDate(project))}</small>
        </div>
        {visibleCommits.length > 0 ? (
          <div className="source-pulse">
            {visibleCommits.map((commit, index) => (
              <button
                key={`${commit.sha}-${index}`}
                type="button"
                className={`source-commit ${expandedCommitId === commit.sha ? 'is-expanded' : ''}`}
                aria-expanded={expandedCommitId === commit.sha}
                onClick={() => setExpandedCommitId((current) => (current === commit.sha ? null : commit.sha))}
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
                  {expandedCommitId === commit.sha && (
                    <span className="source-commit__detail">
                      <span><b>Full SHA</b><code>{commit.sha || 'unknown'}</code></span>
                      <span><b>When</b>{formatDate(commit.date)}</span>
                      {commit.refs?.length > 0 && <span><b>Refs</b>{commit.refs.map((ref) => ref.replace('HEAD -> ', '')).join(', ')}</span>}
                      <span><b>Work note</b>{index === 0 ? 'Latest captured commit. Pair this with current dirty files before making changes.' : 'Recent commit from scanner history. Full diff is not captured in this scan.'}</span>
                    </span>
                  )}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="source-empty">{project.git?.isRepo ? 'No recent commit history captured. Refresh the workspace scan to check again.' : 'Git history appears when a repo is detected.'}</div>
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

const AppHeader = ({ addProjectOpen, onToggleAddProject, theme, onThemeChange, settingsOpen, onOpenSettings }) => (
  <header className="app-header">
    <div className="app-header__brand" aria-label="Aperture local workspace map">
      <div className="app-header__mark">
        <span className="app-header__mark-grid" />
        <span className="app-header__mark-node app-header__mark-node--one" />
        <span className="app-header__mark-node app-header__mark-node--active" />
        <span className="app-header__mark-focus app-header__mark-focus--tl" />
        <span className="app-header__mark-focus app-header__mark-focus--br" />
      </div>
      <div className="app-header__brand-text">
        <strong>Aperture</strong>
        <span>Local workspace map</span>
      </div>
    </div>

    <div className="app-header__actions">
      <AddProjectButton
        open={addProjectOpen}
        onClick={onToggleAddProject}
      />
      <ThemeSwitcher
        theme={theme}
        onThemeChange={onThemeChange}
      />
      <SettingsButton
        open={settingsOpen}
        onClick={onOpenSettings}
      />
    </div>
  </header>
);

const Sidebar = ({ activeSection, collapsed, onSectionChange, onToggleCollapsed }) => (
  <aside className={`app-sidebar ${collapsed ? 'is-collapsed' : ''}`}>
    <nav className="app-sidebar__nav" aria-label="Primary">
      {[
        { name: 'Projects', icon: FolderOpen, active: activeSection === 'projects', onClick: () => onSectionChange('projects') },
        { name: 'Brief', icon: FileJson, active: activeSection === 'brief', onClick: () => onSectionChange('brief') },
        { name: 'Live', icon: Link, active: activeSection === 'live', onClick: () => onSectionChange('live') },
      ].map((item) => (
        <button
          key={item.name}
          type="button"
          title={item.name}
          aria-label={item.name}
          onClick={item.onClick}
          className={`app-sidebar__item ${item.active ? 'is-active' : ''}`}
        >
          <item.icon size={20} />
          <span>{item.name}</span>
        </button>
      ))}
    </nav>

    <button
      type="button"
      className="app-sidebar__collapse"
      onClick={onToggleCollapsed}
      aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
    >
      {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      <span>{collapsed ? 'Expand' : 'Collapse'}</span>
    </button>
  </aside>
);

export default function App() {
  const [scan, setScan] = useState(null);
  const [dataStatus, setDataStatus] = useState('loading');
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectDrawerOpen, setProjectDrawerOpen] = useState(false);
  const [projectDrawerInitialTab, setProjectDrawerInitialTab] = useState('overview');
  const [activeSection, setActiveSection] = useState('projects');
  const [briefFocus, setBriefFocus] = useState('priority');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('aperture-sidebar-collapsed') === 'true');
  const [theme, setTheme] = useState(() => normalizeThemeId(localStorage.getItem('aperture-theme') || localStorage.getItem('aperture-theme-mode') || 'base'));
  const [addProjectOpen, setAddProjectOpen] = useState(false);
  const [manualProjectFormOpen, setManualProjectFormOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [manualProjects, setManualProjects] = useState(readManualProjects);
  const [projectStates, setProjectStates] = useState(readProjectStates);
  const [projectLiveLinks, setProjectLiveLinks] = useState(readProjectLiveLinks);
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
    const activeTheme = APERTURE_THEMES.find((option) => option.id === normalizeThemeId(theme)) ?? APERTURE_THEMES[0];
    document.documentElement.dataset.theme = activeTheme.mode;
    document.documentElement.dataset.vibe = activeTheme.id;
    document.documentElement.dataset.radius = activeTheme.radius;
    document.documentElement.dataset.density = activeTheme.density;
    document.documentElement.style.setProperty('--ap-icon-stroke', activeTheme.iconStroke);
    localStorage.setItem('aperture-theme', activeTheme.id);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('aperture-sidebar-collapsed', String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  useEffect(() => {
    localStorage.setItem(MANUAL_PROJECTS_STORAGE_KEY, JSON.stringify(manualProjects));
  }, [manualProjects]);

  useEffect(() => {
    localStorage.setItem(PROJECT_STATES_STORAGE_KEY, JSON.stringify(projectStates));
  }, [projectStates]);

  useEffect(() => {
    localStorage.setItem(PROJECT_LIVE_LINKS_STORAGE_KEY, JSON.stringify(projectLiveLinks));
  }, [projectLiveLinks]);

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
  const refreshScanData = async () => {
    setScanRefreshStatus('refreshing');
    try {
      let response = await fetch('/api/rescan', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ root: scan?.workspaceRoot || undefined }),
      });
      if (response.status === 404 || response.status === 405) {
        response = await fetch('/projects.json', { cache: 'no-store' });
      }
      const contentType = response.headers.get('content-type') ?? '';
      if (!response.ok || !contentType.includes('application/json')) {
        throw new Error(response.status === 404 ? 'missing' : 'error');
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
    setFolderPickerMessage('Run this workspace scan command, then refresh: python3 scanner.py --root "/path/to/projects" --output public/projects.json');
  };
  const showSection = (section) => {
    setActiveSection(section);
    setSettingsOpen(false);
  };
  const openBrief = (focus = 'priority') => {
    const focusAliases = {
      risks: 'risk',
      dirty: 'git',
    };
    setBriefFocus(focusAliases[focus] || focus);
    showSection('brief');
  };
  const openSettings = () => {
    setSettingsOpen(true);
  };
  const saveProjectLiveLink = (projectId, liveLink) => {
    setProjectLiveLinks((current) => ({
      ...current,
      [projectId]: {
        url: normalizeLiveUrl(liveLink.url),
        environment: normalizeLiveEnvironment(liveLink.environment),
        provider: normalizeLiveProvider(liveLink.provider),
        checklist: normalizeLiveChecklist(current[projectId]?.checklist),
        scan: normalizeLiveScan(current[projectId]?.scan),
        updatedAt: new Date().toISOString(),
      },
    }));
  };
  const applyProjectLiveScan = (projectId, scan) => {
    setProjectLiveLinks((current) => {
      const existing = current[projectId];
      if (!existing?.url) return current;
      const normalizedScan = normalizeLiveScan(scan) ?? {
        url: existing.url,
        checkedAt: new Date().toISOString(),
        error: 'Live check failed.',
        checks: {},
      };
      return {
        ...current,
        [projectId]: {
          ...existing,
          scan: normalizedScan,
          checklist: Object.fromEntries(LIVE_CHECKLIST_ITEMS.map((item) => [
            item.id,
            Boolean(normalizedScan.checks?.[item.id]?.passed),
          ])),
          updatedAt: new Date().toISOString(),
        },
      };
    });
  };
  const clearProjectLiveLink = (projectId) => {
    setProjectLiveLinks((current) => {
      const next = { ...current };
      delete next[projectId];
      return next;
    });
  };
  const toggleProjectLiveChecklist = (projectId, checklistId, checked) => {
    setProjectLiveLinks((current) => {
      const existing = current[projectId];
      if (!existing?.url) return current;
      return {
        ...current,
        [projectId]: {
          ...existing,
          checklist: {
            ...normalizeLiveChecklist(existing.checklist),
            [checklistId]: Boolean(checked),
          },
          updatedAt: new Date().toISOString(),
        },
      };
    });
  };
  const setProjectState = (projectId, state) => {
    const normalized = normalizeProjectState(state);
    setProjectStates((current) => ({ ...current, [projectId]: normalized }));
    if (projectId === referenceProjectId && !TRACKED_PROJECT_STATES.has(normalized)) {
      const fallback = projects.find((project) => project.id !== projectId);
      setReferenceProjectId(fallback?.id ?? '');
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
      ...Object.fromEntries(candidateProjects.map((project) => [project.id, 'ignored'])),
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

  const signalItems = useMemo(() => createBriefSignalItems(projects, driftMap), [projects, driftMap]);
  const openProjectDrawer = (project, initialTab = 'overview') => {
    if (projectCloseTimer.current) {
      window.clearTimeout(projectCloseTimer.current);
      projectCloseTimer.current = null;
    }
    setProjectDrawerInitialTab(initialTab);
    setSelectedProject(project);
    window.requestAnimationFrame(() => {
      setProjectDrawerOpen(true);
    });
  };
  const attachLiveUrl = (project) => {
    openProjectDrawer(project, 'settings');
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
    return { totalProjects: projects.length, riskCount, driftCount, dirtyCount, avgReadiness, signalCount: signalItems.length };
  }, [projects, driftMap, signalItems.length]);
  const emptyWorkspaceTitle = allProjects.length ? 'No projects selected' : 'No projects found';
  const emptyWorkspaceDetail = allProjects.length
    ? 'Finish setup with active projects, or reopen Settings to move hidden projects into the workspace map.'
    : 'The workspace scan is live, but it did not include any projects. Try a broader root folder or add one manually.';
  const glossaryHelp = {
    title: 'Lens glossary',
    body: [
      'Risk: local hygiene evidence from workspace checks.',
      'Drift: factual differences from the selected reference project.',
      'Setup readiness: checklist coverage for whether projects are easy to run and understand.',
      'Dirty worktree: Git reports uncommitted local changes.',
      'Scanner evidence: observed local files or Git metadata; read-only.',
    ].join('\n'),
  };

  return (
    <div className="aperture-app h-screen bg-slate-950 font-sans text-slate-300 selection:bg-indigo-500/30">
      <AppHeader
        addProjectOpen={addProjectOpen}
        onToggleAddProject={() => setAddProjectOpen((value) => !value)}
        theme={theme}
        onThemeChange={setTheme}
        settingsOpen={settingsOpen}
        onOpenSettings={openSettings}
      />
      <div className="app-frame">
        <Sidebar
          activeSection={activeSection}
          collapsed={sidebarCollapsed}
          onSectionChange={showSection}
          onToggleCollapsed={() => setSidebarCollapsed((value) => !value)}
        />
        <main className="flex flex-1 flex-col overflow-hidden">
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

              {activeSection === 'brief' && (
                <BriefView
                  projects={projects}
                  signalItems={signalItems}
                  focus={briefFocus}
                  onSelectProject={openProjectDrawer}
                  onOpenFocus={openBrief}
                  hasKnownProjects={allProjects.length > 0}
                  onOpenSettings={openSettings}
                  onShowScannerHelp={handleShowScannerHelp}
                  onAddManualProject={() => setManualProjectFormOpen(true)}
                />
              )}

              {activeSection === 'live' && (
                <LiveView
                  projects={projects}
                  liveLinks={projectLiveLinks}
                  onOpenProject={openProjectDrawer}
                  onAttachUrl={attachLiveUrl}
                  onToggleLiveChecklist={toggleProjectLiveChecklist}
                  onApplyLiveScan={applyProjectLiveScan}
                  hasKnownProjects={allProjects.length > 0}
                  onOpenSettings={openSettings}
                  onShowScannerHelp={handleShowScannerHelp}
                  onAddManualProject={() => setManualProjectFormOpen(true)}
                />
              )}

              {activeSection === 'projects' && (
                <section>
                  <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                      <h2 className="flex items-center gap-3 text-2xl font-black tracking-tight text-slate-100">
                        Projects
                        <InfoPopover {...glossaryHelp} />
                      </h2>
                      <p className="mt-1 text-sm italic text-slate-500">Mapped local workspace from {workspaceRootLabel}.</p>
                    </div>
                    <div className="text-xs font-bold uppercase tracking-widest text-slate-500">{projects.length} mapped</div>
                  </div>

                  <WorkspaceSignalStrip stats={stats} />

                  {projects.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3">
                      {projects.map((project) => (
                        <ExperimentalProjectCard
                          key={project.id}
                          project={project}
                          drift={driftMap[project.id] ?? []}
                          isReference={project.id === referenceProject?.id}
                          onSelect={openProjectDrawer}
                          onRefreshScan={refreshScanData}
                          scanRefreshStatus={scanRefreshStatus}
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
                              <Terminal size={16} /> Show Scan Command
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
              )}

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
      </div>

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

      {selectedProject && (
        <ProjectDrawer
          project={selectedProject}
          open={projectDrawerOpen}
          drift={driftMap[selectedProject.id] ?? []}
          referenceProject={referenceProject}
          isReference={selectedProject?.id === referenceProject?.id}
          liveLink={projectLiveLinks[selectedProject.id]}
          onSaveLiveLink={saveProjectLiveLink}
          onClearLiveLink={clearProjectLiveLink}
          onToggleLiveChecklist={toggleProjectLiveChecklist}
          initialTab={projectDrawerInitialTab}
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
