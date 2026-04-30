import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Clock,
  Cpu,
  Dna,
  FileJson,
  FolderOpen,
  GitCompareArrows,
  GitBranch,
  LayoutDashboard,
  Moon,
  Palette,
  Plus,
  Save,
  Settings,
  ShieldAlert,
  Sun,
  Terminal,
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
      },
      docs: { files: ['README.md', 'AGENTS.md'], hasReadme: true, agentContextFiles: ['AGENTS.md'] },
      env: { files: [], examples: ['.env.example'], hasEnvFiles: false, hasExample: true },
      ci: { present: true, paths: ['.github/workflows'] },
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
      },
      docs: { files: ['README.md'], hasReadme: true, agentContextFiles: [] },
      env: { files: [{ name: '.env', ignoredByGit: false }], examples: [], hasEnvFiles: true, hasExample: false },
      ci: { present: false, paths: [] },
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
  high: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  medium: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  low: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
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

const stackList = (project) => [
  ...(project.stack?.languages ?? []),
  ...(project.stack?.frameworks ?? []),
  ...(project.stack?.tools ?? []),
];

const riskSeverityRank = { high: 3, medium: 2, low: 1 };
const MANUAL_PROJECTS_STORAGE_KEY = 'aperture-manual-projects';

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
      items.push({ id: `${project.id}-${risk.id}`, project, severity: risk.severity, title: risk.title, detail: risk.detail });
    });
    if ((project.aiReadiness?.score ?? 0) < 60) {
      items.push({ id: `${project.id}-agent-readiness`, project, severity: 'medium', title: 'Agent readiness is low', detail: `${project.name} is missing context an AI agent would need.` });
    }
    (driftMap[project.id] ?? []).forEach((drift) => {
      items.push({
        id: `${project.id}-drift-${drift.id}`,
        project,
        severity: drift.severity,
        title: `${drift.category} drift`,
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
    return Array.isArray(saved) ? saved.filter((project) => project?.source === 'manual' && project.id && project.name) : [];
  } catch {
    return [];
  }
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
    },
    docs,
    env,
    ci,
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

const StatCard = ({ title, value, icon: Icon, tone = 'indigo', onClick }) => {
  const toneClass = tone === 'rose' ? 'bg-rose-500/10 text-rose-400' : tone === 'emerald' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-indigo-500/10 text-indigo-400';
  const Component = onClick ? 'button' : 'div';
  return (
    <Component onClick={onClick} className={`rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-left ${onClick ? 'stat-card--action' : ''}`}>
      <div className="mb-3 flex items-start justify-between">
        <div className={`rounded-lg p-2 ${toneClass}`}>
          <Icon size={18} />
        </div>
        {onClick && <ChevronRight size={18} className="text-slate-500" />}
      </div>
      <div className="text-2xl font-bold text-slate-100">{value}</div>
      <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</div>
    </Component>
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

const AttentionDrawer = ({ open, items, unseenIds, onClose, onSelectProject }) => (
  <>
    {open && <button className="attention-drawer__scrim" type="button" aria-label="Close attention feed" onClick={onClose} />}
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
    {open && <button className="attention-drawer__scrim" type="button" aria-label={`Close ${title}`} onClick={onClose} />}
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

const SetupCard = ({ icon: Icon, title, detail, children, disabled }) => (
  <div className={`rounded-2xl border p-5 ${disabled ? 'border-slate-800 bg-slate-900/30 opacity-70' : 'border-indigo-500/30 bg-indigo-500/5'}`}>
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
      {open && <button className="attention-drawer__scrim" type="button" aria-label="Close manual project form" onClick={onClose} />}
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

const EmptyState = ({ onAddManualProject }) => (
  <div className="mx-auto flex min-h-[640px] max-w-5xl flex-col justify-center px-4 py-12">
    <div className="mb-8 text-center">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-300 ring-1 ring-indigo-500/30">
        <Zap size={26} />
      </div>
      <div className="text-xs font-black uppercase tracking-[0.35em] text-indigo-300">Aperture</div>
      <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-100">Map your first workspace</h1>
      <p className="mx-auto mt-3 max-w-xl text-sm text-slate-500">
        Start with a local folder. GitHub and GitLab connectors can come later.
      </p>
    </div>

    <div className="grid gap-4 lg:grid-cols-4">
      <SetupCard icon={FolderOpen} title="Add local folder" detail="Recommended for the PoC. Scan repos already on disk.">
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 font-mono text-xs text-slate-300">
          python3 scanner.py --root ~/dev --output public/projects.json
        </div>
        <div className="mt-3 text-xs text-slate-500">Then refresh the dashboard.</div>
      </SetupCard>

      <SetupCard icon={Plus} title="Add manually" detail="Create a local dashboard entry without scanning disk.">
        <button type="button" onClick={onAddManualProject} className="manual-submit w-full justify-center">
          <Plus size={16} /> New Project
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

    <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/40 p-4 text-sm text-slate-400">
      <div className="flex items-center gap-2 font-bold text-slate-300"><Terminal size={16} /> Current startup path</div>
      <p className="mt-1 text-slate-500">Aperture is local-first today: generate `public/projects.json`, then the dashboard becomes live.</p>
    </div>
  </div>
);

const TechPill = ({ tech }) => (
  <span className={`rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight ${techColors[tech] || techColors.default}`}>
    {tech}
  </span>
);

const StatusDot = ({ project }) => {
  if (project.git?.dirty) return <span className="h-2 w-2 rounded-full bg-amber-400" title="Dirty worktree" />;
  if (highestRisk(project)?.severity === 'high') return <span className="h-2 w-2 rounded-full bg-rose-500" title="High risk" />;
  if (isRecentlyChanged(project)) return <span className="h-2 w-2 rounded-full bg-indigo-500" title="Recently changed" />;
  return <span className="h-2 w-2 rounded-full bg-emerald-500" title="No urgent signals" />;
};

const ProjectCard = ({ project, onSelect, drift = [], isReference }) => {
  const stack = stackList(project);
  const risk = highestRisk(project);
  const readiness = project.aiReadiness?.score ?? 0;
  const highDrift = drift.some((item) => item.severity === 'high');
  return (
    <button
      onClick={() => onSelect(project)}
      className="group relative rounded-xl border border-slate-800 bg-slate-900 p-5 text-left transition-all hover:border-indigo-500/50 hover:bg-slate-900/80"
    >
      {risk?.severity === 'high' && (
        <div className="absolute right-0 top-0 rounded-bl-lg bg-rose-600 px-3 py-1 text-[10px] font-black uppercase text-white">
          Risk
        </div>
      )}
      {isReference && (
        <div className="absolute right-0 top-0 rounded-bl-lg bg-indigo-600 px-3 py-1 text-[10px] font-black uppercase text-white">
          Reference
        </div>
      )}

      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="flex items-center gap-2 truncate text-lg font-bold text-slate-100 transition-colors group-hover:text-indigo-400">
            {project.name}
            {risk && <ShieldAlert size={16} className={risk.severity === 'high' ? 'text-rose-500' : 'text-amber-400'} />}
            {drift.length > 0 && <GitCompareArrows size={16} className={highDrift ? 'text-rose-400' : 'text-amber-400'} />}
          </h3>
          <p className="mt-1 flex items-center gap-1 truncate font-mono text-xs text-slate-500">
            <FolderOpen size={12} /> {project.path}
          </p>
        </div>
        <div className="text-right">
          <div className={`font-mono text-sm font-bold ${readiness >= 80 ? 'text-emerald-400' : readiness >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
            {readiness}%
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-600">AI ready</div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4">
        <div>
          <div className="mb-2 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            <Dna size={10} /> Stack
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
          <div className={`mt-1 text-xs font-bold ${drift.length ? 'text-amber-400' : 'text-emerald-400'}`}>
            {isReference ? 'Reference' : `${drift.length} drift`}
          </div>
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
    </button>
  );
};

const ProjectDrawer = ({ project, onClose, drift = [], referenceProject, isReference }) => {
  const risks = project.risks ?? [];
  const checks = project.aiReadiness?.checks ?? [];
  return (
    <>
      <button className="attention-drawer__scrim" type="button" aria-label={`Close ${project.name}`} onClick={onClose} />
      <aside className="project-drawer is-open" aria-label={`${project.name} details`}>
        <div className="attention-drawer__header">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-100">
              <FolderOpen className="text-indigo-400" /> {project.name}
            </h2>
            <p className="mt-1 font-mono text-sm text-slate-500">{project.path}</p>
          </div>
          <button type="button" onClick={onClose} className="attention-drawer__close" aria-label={`Close ${project.name}`}>
            <X size={18} />
          </button>
        </div>

        <div className="project-drawer__body custom-scrollbar">
          <section className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-slate-800 bg-slate-800/20 p-4">
              <div className="text-xs font-bold uppercase tracking-widest text-slate-500">Branch</div>
              <div className="mt-2 font-mono text-sm font-bold text-slate-200">{project.git?.branch ?? 'Unknown'}</div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-800/20 p-4">
              <div className="text-xs font-bold uppercase tracking-widest text-slate-500">Worktree</div>
              <div className={`mt-2 text-sm font-bold ${project.git?.dirty ? 'text-amber-400' : 'text-emerald-400'}`}>{project.git?.dirty ? 'Dirty' : project.git?.isRepo ? 'Clean' : 'Not a Git repo'}</div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-800/20 p-4">
              <div className="text-xs font-bold uppercase tracking-widest text-slate-500">Last Commit</div>
              <div className="mt-2 text-sm font-bold text-slate-200">{formatDate(project.git?.lastCommit?.date)}</div>
            </div>
          </section>

          <section className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-400"><Cpu size={14} /> AI Readiness</h3>
              <span className="text-sm font-bold text-slate-100">{project.aiReadiness?.score ?? 0}%</span>
            </div>
            <div className="mb-4 h-2 overflow-hidden rounded-full bg-slate-800">
              <div className="h-full rounded-full bg-indigo-500" style={{ width: `${project.aiReadiness?.score ?? 0}%` }} />
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              {checks.length > 0 ? checks.map((check) => (
                <div key={check.id} className="flex items-center gap-2 text-sm text-slate-300">
                  {check.passed ? <CheckCircle2 size={15} className="text-emerald-400" /> : <AlertTriangle size={15} className="text-amber-400" />}
                  {check.label}
                </div>
              )) : <span className="text-sm text-slate-500">No checklist details in this dataset.</span>}
            </div>
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between gap-4">
              <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                <GitCompareArrows size={14} /> Reference Drift
              </h3>
              <span className="text-xs font-bold text-slate-500">
                vs. {referenceProject?.name ?? 'reference'}
              </span>
            </div>
            {isReference ? (
              <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-5 text-sm text-indigo-200">
                This project is the current reference. Other projects are compared against it.
              </div>
            ) : drift.length > 0 ? (
              <div className="space-y-3">
                {drift.map((item) => (
                  <div key={item.id} className={`rounded-xl border p-4 ${severityStyles[item.severity] || severityStyles.medium}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-sm font-bold">{item.category}</div>
                        <div className="mt-1 text-xs opacity-80">{item.detail}</div>
                      </div>
                      <div className="text-right text-[10px] font-black uppercase tracking-widest opacity-70">Advisory</div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2 font-mono text-xs">
                      <span className="rounded bg-slate-950/40 px-2 py-1 text-rose-200">{item.current}</span>
                      <ChevronRight size={13} className="opacity-60" />
                      <span className="rounded bg-slate-950/40 px-2 py-1 text-emerald-200">{item.reference}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-6 text-center text-emerald-300">
                <CheckCircle2 className="mx-auto mb-2" /> No reference drift detected.
              </div>
            )}
          </section>

          <section>
            <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500"><ShieldAlert size={14} /> Risk Radar</h3>
            <div className="space-y-3">
              {risks.length > 0 ? risks.map((risk) => (
                <div key={`${risk.id}-${risk.detail}`} className={`rounded-xl border p-4 ${severityStyles[risk.severity] || severityStyles.low}`}>
                  <div className="text-sm font-bold">{risk.title}</div>
                  <div className="mt-1 text-xs opacity-80">{risk.detail}</div>
                </div>
              )) : (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-6 text-center text-emerald-300">
                  <CheckCircle2 className="mx-auto mb-2" /> No scanner risks detected.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-slate-800 bg-slate-800/20 p-4">
            <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500"><FileJson size={14} /> Useful Commands</h3>
            <div className="grid gap-2 md:grid-cols-2">
              {Object.entries(project.scripts ?? {}).length > 0 ? Object.entries(project.scripts).map(([name, command]) => (
                <div key={name} className="rounded-lg bg-slate-950/50 p-3 font-mono text-xs">
                  <span className="text-indigo-300">{name}</span><span className="text-slate-600">: </span><span className="text-slate-300">{command}</span>
                </div>
              )) : <span className="text-sm text-slate-500">No package scripts detected.</span>}
            </div>
          </section>
        </div>
      </aside>
    </>
  );
};

const Sidebar = () => (
  <aside className="flex w-20 flex-col items-center border-r border-slate-800 bg-slate-950 py-8 transition-all lg:w-64 lg:items-stretch">
    <div className="mb-12 flex items-center gap-3 px-6">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
        <Zap size={20} className="fill-current text-white" />
      </div>
      <span className="hidden text-xl font-black tracking-tighter text-white lg:inline">APERTURE</span>
    </div>

    <nav className="flex-1 space-y-2 px-4">
      {[
        { name: 'Workspace', icon: LayoutDashboard, active: true },
        { name: 'Attention', icon: AlertTriangle, active: false },
        { name: 'Risk Radar', icon: ShieldAlert, active: false },
        { name: 'Agent Briefs', icon: FileJson, active: false },
        { name: 'Settings', icon: Settings, active: false },
      ].map((item) => (
        <button key={item.name} className={`flex w-full items-center justify-center gap-4 rounded-xl p-3 transition-all lg:justify-start ${item.active ? 'bg-indigo-600/10 text-indigo-400' : 'text-slate-500 hover:bg-slate-900 hover:text-slate-300'}`}>
          <item.icon size={20} />
          <span className="hidden text-sm font-bold lg:inline">{item.name}</span>
        </button>
      ))}
    </nav>

    <div className="px-6">
      <div className="hidden rounded-xl border border-slate-800 bg-slate-900 p-4 lg:block">
        <div className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-500">MCP Bridge</div>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
          <div className="h-1.5 w-1.5 rounded-full bg-slate-600" />
          Planned read-only
        </div>
      </div>
    </div>
  </aside>
);

export default function App() {
  const [scan, setScan] = useState(null);
  const [dataStatus, setDataStatus] = useState('loading');
  const [selectedProject, setSelectedProject] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('aperture-theme') || localStorage.getItem('aperture-theme-mode') || 'dark');
  const [attentionOpen, setAttentionOpen] = useState(false);
  const [insightDrawer, setInsightDrawer] = useState(null);
  const [manualProjectFormOpen, setManualProjectFormOpen] = useState(false);
  const [manualProjects, setManualProjects] = useState(readManualProjects);
  const [seenAttentionIds, setSeenAttentionIds] = useState(readSeenAttentionIds);
  const [referenceProjectId, setReferenceProjectId] = useState(() => localStorage.getItem('aperture-reference-project') || '');

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

  const projects = useMemo(() => [...(scan?.projects ?? []), ...manualProjects], [scan?.projects, manualProjects]);
  const workspaceRootLabel = scan?.workspaceRoot ?? (manualProjects.length ? 'Manual entries' : '');
  const shouldShowDashboard = dataStatus === 'live' || manualProjects.length > 0;
  const displayedDataStatus = dataStatus === 'live' ? 'Generated projects.json' : dataStatus === 'loading' ? 'Analyzing' : manualProjects.length ? 'Manual entries' : 'No workspace yet';
  const handleAddManualProject = (project) => {
    setManualProjects((current) => [...current, project]);
    setDataStatus((status) => (status === 'loading' ? 'empty' : status));
    setManualProjectFormOpen(false);
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

  const attentionItems = useMemo(() => createAttentionItems(projects, driftMap), [projects, driftMap]);
  const riskItems = useMemo(() => projects.flatMap((project) => (project.risks ?? []).map((risk) => ({
    id: `${project.id}-${risk.id}`,
    project,
    severity: risk.severity,
    title: risk.title,
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
    title: `${drift.category} drift`,
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
  const stats = useMemo(() => {
    const riskCount = projects.reduce((sum, project) => sum + (project.risks?.length ?? 0), 0);
    const driftCount = projects.reduce((sum, project) => sum + (driftMap[project.id]?.length ?? 0), 0);
    const dirtyCount = projects.filter((project) => project.git?.dirty).length;
    const avgReadiness = projects.length
      ? Math.round(projects.reduce((sum, project) => sum + (project.aiReadiness?.score ?? 0), 0) / projects.length)
      : 0;
    return { totalProjects: projects.length, riskCount, driftCount, dirtyCount, avgReadiness };
  }, [projects, driftMap]);

  return (
    <div className="aperture-app flex h-screen bg-slate-950 font-sans text-slate-300 selection:bg-indigo-500/30">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-10 flex min-h-20 items-center justify-between gap-4 border-b border-slate-800 bg-slate-950/50 px-4 backdrop-blur-md md:px-8">
          <div className="flex flex-1 items-center gap-3">
            <div className="text-xs font-black uppercase tracking-[0.28em] text-indigo-300">Aperture</div>
          </div>
          <div className="hidden text-right md:block">
            <div className="text-xs font-bold uppercase tracking-widest text-slate-500">Data Source</div>
            <div className={`text-sm font-bold ${dataStatus === 'live' ? 'text-emerald-400' : dataStatus === 'loading' ? 'text-indigo-300' : 'text-amber-400'}`}>
              {displayedDataStatus}
            </div>
          </div>
          <button type="button" className="attention-trigger" onClick={() => setManualProjectFormOpen(true)} aria-label="Add project manually" title="Add project manually">
            <Plus size={18} />
            <span className="hidden text-xs font-black uppercase tracking-widest lg:inline">Add</span>
          </button>
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

          {!shouldShowDashboard && dataStatus === 'empty' && <EmptyState onAddManualProject={() => setManualProjectFormOpen(true)} />}

          {shouldShowDashboard && (
            <>
          <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-5">
            <StatCard title="Projects Mapped" value={stats.totalProjects} icon={FolderOpen} />
            <StatCard title="Avg AI Readiness" value={`${stats.avgReadiness}%`} icon={Cpu} tone="emerald" />
            <StatCard title="Risk Findings" value={stats.riskCount} icon={ShieldAlert} tone={stats.riskCount ? 'rose' : 'emerald'} onClick={() => setInsightDrawer('risks')} />
            <StatCard title="Dirty Worktrees" value={stats.dirtyCount} icon={GitBranch} tone={stats.dirtyCount ? 'rose' : 'emerald'} onClick={() => setInsightDrawer('dirty')} />
            <StatCard title="Reference Drift" value={stats.driftCount} icon={GitCompareArrows} tone={stats.driftCount ? 'rose' : 'emerald'} onClick={() => setInsightDrawer('drift')} />
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="flex items-center gap-2 text-lg font-bold text-slate-100">
                  <GitCompareArrows size={18} className="text-indigo-300" /> Reference Project
                </h3>
                <p className="mt-1 text-sm text-slate-500">Choose the gold-standard project. Drift stays advisory and read-only.</p>
              </div>
              <select
                className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm font-bold text-slate-200 outline-none transition-colors focus:border-indigo-500/60"
                value={referenceProject?.id ?? ''}
                onChange={(event) => setReferenceProjectId(event.target.value)}
              >
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
            </div>
          </section>

          <section>
              <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <h2 className="flex items-center gap-3 text-2xl font-black tracking-tight text-slate-100">
                    Workspace Map
                    <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] uppercase tracking-tighter text-slate-500">Local-first</span>
                  </h2>
                  <p className="mt-1 text-sm italic text-slate-500">Factual scanner output from {workspaceRootLabel}.</p>
                </div>
                <div className="text-xs font-bold uppercase tracking-widest text-slate-500">Schema {scan?.schemaVersion ?? 'aperture.scan.v1'}</div>
              </div>

              {projects.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3">
                  {projects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      drift={driftMap[project.id] ?? []}
                      isReference={project.id === referenceProject?.id}
                      onSelect={setSelectedProject}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-800 p-12 text-center">
                  <FolderOpen className="mx-auto mb-4 text-slate-600" size={36} />
                  <h3 className="text-lg font-bold text-slate-200">No projects mapped</h3>
                  <p className="mt-2 text-sm text-slate-500">Generate a fresh scanner output.</p>
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

      <AttentionDrawer
        open={attentionOpen}
        items={attentionItems}
        unseenIds={unseenAttentionIds}
        onClose={closeAttention}
        onSelectProject={(project) => {
          setSelectedProject(project);
          closeAttention();
        }}
      />

      <InsightDrawer
        open={insightDrawer === 'risks'}
        title="Risk Findings"
        subtitle="Local hygiene findings grouped by project."
        emptyLabel="No risk findings detected."
        items={riskItems}
        onClose={() => setInsightDrawer(null)}
        onSelectProject={(project) => {
          setSelectedProject(project);
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
          setSelectedProject(project);
          setInsightDrawer(null);
        }}
      />

      <InsightDrawer
        open={insightDrawer === 'drift'}
        title="Reference Drift"
        subtitle={`Compared against ${referenceProject?.name ?? 'the current reference'}.`}
        emptyLabel="No reference drift detected."
        items={driftItems}
        onClose={() => setInsightDrawer(null)}
        onSelectProject={(project) => {
          setSelectedProject(project);
          setInsightDrawer(null);
        }}
      />

      {selectedProject && (
        <ProjectDrawer
          project={selectedProject}
          drift={driftMap[selectedProject.id] ?? []}
          referenceProject={referenceProject}
          isReference={selectedProject?.id === referenceProject?.id}
          onClose={() => setSelectedProject(null)}
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
