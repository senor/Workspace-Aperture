import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Dna, 
  Activity, 
  ShieldAlert, 
  Zap, 
  Search, 
  Settings, 
  ExternalLink,
  ChevronRight,
  GitBranch,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
  ArrowRightLeft,
  FileJson,
  Cpu,
  History
} from 'lucide-react';

// --- Mock Data ---

const PROJECTS = [
  {
    id: '1',
    name: 'Aether-API',
    path: '~/dev/aether-api',
    isReference: true,
    lastCommit: '12m ago',
    branch: 'main',
    healthScore: 98,
    dna: ['Node.js', 'TypeScript', 'Prisma', 'Redis', 'JWT'],
    pulse: [40, 70, 45, 90, 65, 80, 95], // Activity over 7 days
    aiReadiness: 100,
    status: 'stable',
    drift: [],
  },
  {
    id: '2',
    name: 'Helios-Frontend',
    path: '~/dev/helios-web',
    isReference: false,
    lastCommit: '2h ago',
    branch: 'feature/auth-refactor',
    healthScore: 82,
    dna: ['React', 'Next.js', 'Tailwind', 'Zustand'],
    pulse: [20, 30, 80, 40, 50, 60, 55],
    aiReadiness: 75,
    status: 'active',
    drift: [
      { category: 'Auth', current: 'Clerk', reference: 'JWT (Custom)', severity: 'warning' },
      { category: 'Node', current: 'v18.0', reference: 'v20.1', severity: 'info' }
    ],
  },
  {
    id: '3',
    name: 'Nebula-Service',
    path: '~/dev/nebula',
    isReference: false,
    lastCommit: '3d ago',
    branch: 'main',
    healthScore: 64,
    dna: ['Python', 'FastAPI', 'PostgreSQL'],
    pulse: [10, 5, 0, 5, 15, 10, 5],
    aiReadiness: 40,
    status: 'idle',
    drift: [
      { category: 'Linter', current: 'Flake8', reference: 'Ruff', severity: 'warning' },
      { category: 'Security', current: 'Plaintext Secret', reference: 'Env Encryption', severity: 'critical' }
    ],
  },
  {
    id: '4',
    name: 'Chronos-Bot',
    path: '~/dev/chronos',
    isReference: false,
    lastCommit: '5m ago',
    branch: 'main',
    healthScore: 92,
    dna: ['Go', 'gRPC', 'PostgreSQL'],
    pulse: [90, 85, 95, 100, 90, 80, 85],
    aiReadiness: 95,
    status: 'active',
    drift: [],
  }
];

// --- Components ---

const StatCard = ({ title, value, icon: Icon, trend }) => (
  <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
    <div className="flex justify-between items-start mb-2">
      <div className="p-2 bg-indigo-500/10 rounded-lg">
        <Icon size={18} className="text-indigo-400" />
      </div>
      {trend && (
        <span className={`text-xs font-medium ${trend > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <div className="text-2xl font-bold text-slate-100">{value}</div>
    <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mt-1">{title}</div>
  </div>
);

const PulseGraph = ({ data, color = "#6366f1" }) => {
  const max = Math.max(...data);
  const width = 100;
  const height = 30;
  const step = width / (data.length - 1);
  
  const points = data.map((val, i) => {
    const x = i * step;
    const y = height - (val / max) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width="100%" height={height} className="overflow-visible">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        className="opacity-80"
      />
    </svg>
  );
};

const DNAIcon = ({ tech }) => {
  const colors = {
    'Node.js': 'bg-green-500/20 text-green-400 border-green-500/30',
    'TypeScript': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'React': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    'Go': 'bg-sky-500/20 text-sky-400 border-sky-500/30',
    'Python': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    'default': 'bg-slate-500/20 text-slate-400 border-slate-500/30'
  };
  const colorClass = colors[tech] || colors['default'];
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-tight ${colorClass}`}>
      {tech}
    </span>
  );
};

const ProjectCard = ({ project, onSelect }) => {
  const isHealthy = project.healthScore > 80;
  const isStruggling = project.healthScore < 70;

  return (
    <div 
      onClick={() => onSelect(project)}
      className="group bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-xl p-5 transition-all cursor-pointer relative overflow-hidden"
    >
      {project.isReference && (
        <div className="absolute top-0 right-0 px-3 py-1 bg-indigo-600 text-[10px] font-black text-white uppercase rounded-bl-lg">
          Reference
        </div>
      )}
      
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-100 group-hover:text-indigo-400 transition-colors flex items-center gap-2">
            {project.name}
            {project.drift.some(d => d.severity === 'critical') && (
              <ShieldAlert size={16} className="text-rose-500" />
            )}
          </h3>
          <p className="text-xs text-slate-500 font-mono flex items-center gap-1 mt-1">
            <FolderOpen size={12} /> {project.path}
          </p>
        </div>
        <div className={`text-sm font-mono font-bold ${isHealthy ? 'text-emerald-400' : isStruggling ? 'text-rose-400' : 'text-amber-400'}`}>
          {project.healthScore}%
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="space-y-1">
          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest flex items-center gap-1">
            <Dna size={10} /> Architecture DNA
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {project.dna.slice(0, 3).map(t => <DNAIcon key={t} tech={t} />)}
            {project.dna.length > 3 && <span className="text-[10px] text-slate-500 font-bold">+{project.dna.length - 3}</span>}
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest flex items-center gap-1">
            <Activity size={10} /> Pulse (7d)
          </div>
          <div className="h-8 flex items-end">
            <PulseGraph data={project.pulse} color={isStruggling ? '#f43f5e' : '#6366f1'} />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-slate-800/50 pt-4 mt-auto">
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <GitBranch size={12} className="text-indigo-400" />
            <span className="font-mono">{project.branch}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Clock size={12} className="text-slate-500" />
            <span>{project.lastCommit}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <div className={`w-2 h-2 rounded-full ${project.status === 'active' ? 'bg-indigo-500 animate-pulse' : project.status === 'stable' ? 'bg-emerald-500' : 'bg-slate-700'}`} />
        </div>
      </div>
    </div>
  );
};

const DriftModal = ({ project, onClose }) => {
  if (!project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <ArrowRightLeft className="text-indigo-400" /> Pattern Alignment Audit
            </h2>
            <p className="text-sm text-slate-500 mt-1">Comparing <span className="text-indigo-400 font-bold">{project.name}</span> vs. <span className="text-emerald-400 font-bold">Reference (Aether-API)</span></p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-100 p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <Settings size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {project.drift.length > 0 ? (
              project.drift.map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-slate-800/30 rounded-xl border border-slate-800">
                  <div className={`p-2 rounded-lg ${item.severity === 'critical' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'}`}>
                    {item.severity === 'critical' ? <ShieldAlert size={20} /> : <AlertTriangle size={20} />}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-black uppercase text-slate-500 tracking-widest">{item.category}</div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-rose-400 font-mono text-sm">{item.current}</span>
                      <ChevronRight size={14} className="text-slate-600" />
                      <span className="text-emerald-400 font-mono text-sm">{item.reference}</span>
                    </div>
                  </div>
                  <button className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 group">
                    Sync <ArrowRightLeft size={12} className="group-hover:rotate-180 transition-transform" />
                  </button>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="p-4 bg-emerald-500/10 rounded-full text-emerald-500 mb-4">
                  <CheckCircle2 size={48} />
                </div>
                <h3 className="text-lg font-bold text-slate-100">Perfect Alignment</h3>
                <p className="text-sm text-slate-500 max-w-xs mt-2">This project's DNA perfectly matches your Reference standards. No drift detected.</p>
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800 flex gap-4">
            <div className="flex-1 bg-indigo-500/5 p-4 rounded-xl border border-indigo-500/20">
               <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                 <Cpu size={14} /> AI Readiness
               </h4>
               <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                 <div className="bg-indigo-500 h-full rounded-full transition-all duration-1000" style={{ width: `${project.aiReadiness}%` }} />
               </div>
               <div className="flex justify-between mt-2">
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter italic">Context quality</span>
                 <span className="text-xs font-bold text-slate-100">{project.aiReadiness}%</span>
               </div>
            </div>
            <div className="flex-1 bg-slate-800/20 p-4 rounded-xl border border-slate-800">
               <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                 <History size={14} /> Last Scan
               </h4>
               <div className="text-sm font-bold text-slate-300">Today, 2:45 PM</div>
               <div className="text-[10px] text-slate-500 font-bold uppercase mt-1">Found 124 files • 28 patterns</div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-900/80 border-t border-slate-800 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-slate-400 hover:text-slate-100 transition-colors">Dismiss</button>
          <button className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-lg shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2">
            Commit Changes <ExternalLink size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

const Sidebar = () => (
  <div className="w-20 lg:w-64 bg-slate-950 border-r border-slate-800 flex flex-col items-center lg:items-stretch py-8 transition-all">
    <div className="px-6 mb-12 flex items-center gap-3">
      <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
        <Zap size={20} className="text-white fill-current" />
      </div>
      <span className="text-xl font-black text-white tracking-tighter hidden lg:inline">APERTURE</span>
    </div>
    
    <nav className="flex-1 px-4 space-y-2">
      {[
        { name: 'Fleet', icon: LayoutDashboard, active: true },
        { name: 'Patterns', icon: Dna, active: false },
        { name: 'Security', icon: ShieldAlert, active: false },
        { name: 'Activity', icon: Activity, active: false },
        { name: 'Settings', icon: Settings, active: false },
      ].map(item => (
        <button key={item.name} className={`w-full flex items-center justify-center lg:justify-start gap-4 p-3 rounded-xl transition-all ${item.active ? 'bg-indigo-600/10 text-indigo-400' : 'text-slate-500 hover:bg-slate-900 hover:text-slate-300'}`}>
          <item.icon size={20} />
          <span className="font-bold text-sm hidden lg:inline">{item.name}</span>
        </button>
      ))}
    </nav>

    <div className="p-4 lg:px-6">
       <div className="bg-slate-900 rounded-xl p-4 hidden lg:block border border-slate-800">
         <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">MCP STATUS</div>
         <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
           <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
           Connected
         </div>
       </div>
    </div>
  </div>
);

export default function App() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = useMemo(() => {
    return PROJECTS.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery]);

  const stats = {
    totalProjects: PROJECTS.length,
    fleetHealth: Math.round(PROJECTS.reduce((acc, p) => acc + p.healthScore, 0) / PROJECTS.length),
    activeAgents: 3,
    patternsDetected: 142
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-300 font-sans selection:bg-indigo-500/30">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-950/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative w-full">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search workspace projects, DNA or stacks..." 
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all text-slate-100"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-6 ml-8">
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-950 bg-slate-800 flex items-center justify-center">
                  <Cpu size={14} className="text-indigo-400" />
                </div>
              ))}
            </div>
            <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-indigo-600/20">
              New Project
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
          
          {/* Stats Overview */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Projects" value={stats.totalProjects} icon={FolderOpen} />
            <StatCard title="Fleet Health" value={`${stats.fleetHealth}%`} icon={ShieldAlert} trend={12} />
            <StatCard title="Active Agents" value={stats.activeAgents} icon={Cpu} />
            <StatCard title="Pattern Library" value={stats.patternsDetected} icon={FileJson} trend={5} />
          </section>

          {/* Fleet Grid */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black text-slate-100 tracking-tight flex items-center gap-3">
                  Workspace Fleet
                  <span className="px-2 py-0.5 bg-slate-800 text-[10px] rounded uppercase text-slate-500 tracking-tighter">Local-First</span>
                </h2>
                <p className="text-sm text-slate-500 mt-1 italic">Single lens over your active developer environment.</p>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-bold text-slate-400 hover:text-slate-100 transition-colors">Sort: Health</button>
                <button className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-bold text-slate-400 hover:text-slate-100 transition-colors">Filter: React</button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProjects.map(project => (
                <ProjectCard 
                  key={project.id} 
                  project={project} 
                  onSelect={setSelectedProject} 
                />
              ))}
              
              {/* Add Project Card Placeholder */}
              <div className="border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center p-8 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all group cursor-pointer">
                <div className="p-3 bg-slate-900 rounded-full text-slate-600 group-hover:text-indigo-400 group-hover:bg-indigo-500/10 transition-all mb-4">
                  <FolderOpen size={24} />
                </div>
                <div className="text-sm font-bold text-slate-500 group-hover:text-indigo-400">Map Directory</div>
                <div className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-1">Expand the fleet</div>
              </div>
            </div>
          </section>

          {/* Workspace Pulse Heatmap */}
          <section className="bg-slate-900/30 border border-slate-800 p-6 rounded-2xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                 <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                   <Activity size={18} className="text-indigo-400" /> Workspace Pulse
                 </h3>
                 <p className="text-xs text-slate-500 font-bold tracking-tight">Active hours detected across 8 concurrent repositories.</p>
              </div>
              <div className="text-xs text-slate-500 font-bold flex gap-4 uppercase tracking-widest">
                <div className="flex items-center gap-1"><span className="w-2 h-2 bg-slate-800 rounded" /> Less</div>
                <div className="flex items-center gap-1"><span className="w-2 h-2 bg-indigo-500 rounded" /> More</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {Array.from({ length: 52 * 5 }).map((_, i) => {
                const opacity = Math.random() > 0.7 ? (Math.random() > 0.5 ? 'bg-indigo-500/80' : 'bg-indigo-500/40') : 'bg-slate-800';
                return (
                  <div key={i} className={`w-3.5 h-3.5 rounded-sm ${opacity} transition-colors hover:ring-2 hover:ring-indigo-400 cursor-help`} />
                );
              })}
            </div>
          </section>
        </div>
      </main>

      <DriftModal 
        project={selectedProject} 
        onClose={() => setSelectedProject(null)} 
      />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }
      `}</style>
    </div>
  );
}