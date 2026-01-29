
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, 
  Activity, 
  Cpu, 
  Terminal, 
  Cloud, 
  Github, 
  Zap, 
  Trophy,
  History,
  Trash2,
  AlertTriangle,
  ListTodo,
  Plus,
  CheckCircle2,
  Circle,
  BookOpen,
  GraduationCap,
  Link as LinkIcon,
  PlayCircle,
  FileText,
  Globe,
  Network,
  Lock,
  Calendar,
  ChevronLeft,
  Search,
  Filter,
  Sparkles,
  Clock,
  ExternalLink,
  Kanban
} from 'lucide-react';
import { AppState, Lab, LabCategory, CATEGORIES, ChecklistItem, Resource, RESOURCE_TYPES, Project, ProjectStatus, PROJECT_STATUSES } from './types';
import { applyDecay, updateStreak } from './utils/syncLogic';
import { BentoCard } from './components/BentoCard';
import { getDaysDiff } from './utils/dateUtils';

const STORAGE_KEY = 'cloudsec_mastery_state';

// Per user request, start with 0 projects
const INITIAL_PROJECTS: Project[] = [];

const INITIAL_STATE: AppState = {
  syncPercentage: 100,
  labs: [],
  maintenanceMode: false,
  lastDecayTimestamp: new Date().toISOString(),
  journeyStartDate: new Date().toISOString(),
  streak: 0,
  lastStreakUpdateDate: null,
  securityChecklist: [],
  resourceVault: [],
  projects: INITIAL_PROJECTS
};

export default function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'vault'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<LabCategory | 'All'>('All');
  const [showProjectForm, setShowProjectForm] = useState(false);

  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (!parsed.securityChecklist) parsed.securityChecklist = [];
      if (!parsed.resourceVault) parsed.resourceVault = [];
      if (!parsed.projects) parsed.projects = INITIAL_PROJECTS;
      if (!parsed.journeyStartDate) parsed.journeyStartDate = new Date().toISOString();
      return parsed;
    }
    return INITIAL_STATE;
  });

  const [labName, setLabName] = useState('');
  const [category, setCategory] = useState<LabCategory>('AWS');
  const [githubLink, setGithubLink] = useState('');
  const [decayAmount, setDecayAmount] = useState<number>(0);
  
  const [newItemText, setNewItemText] = useState('');
  
  const [resTitle, setResTitle] = useState('');
  const [resType, setResType] = useState<Resource['type']>('Course');
  const [resLink, setResLink] = useState('');

  // Project Form State
  const [projName, setProjName] = useState('');
  const [projSkills, setProjSkills] = useState('');
  const [projStatus, setProjStatus] = useState<ProjectStatus>('Planned');
  const [projDate, setProjDate] = useState(new Date().toISOString().split('T')[0]);
  const [projGithub, setProjGithub] = useState('');

  // Calculate Lab Debt
  const labDebt = useMemo(() => {
    const daysSinceStart = getDaysDiff(new Date(state.journeyStartDate), new Date()) + 1;
    const debt = daysSinceStart - state.labs.length;
    return Math.max(0, debt);
  }, [state.journeyStartDate, state.labs.length]);

  useEffect(() => {
    setState(prev => {
      const decayedState = applyDecay(prev);
      const diff = prev.syncPercentage - decayedState.syncPercentage;
      
      if (diff > 0) {
        setDecayAmount(diff);
        setTimeout(() => setDecayAmount(0), 4000);
      }
      
      return updateStreak(decayedState);
    });
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const handleLogLab = (e: React.FormEvent) => {
    e.preventDefault();
    if (!labName || !githubLink) return;

    const newLab: Lab = {
      id: crypto.randomUUID(),
      name: labName,
      category,
      githubLink,
      timestamp: new Date().toISOString()
    };

    setState(prev => ({
      ...prev,
      labs: [newLab, ...prev.labs],
      syncPercentage: Math.min(100, prev.syncPercentage + 25)
    }));

    setLabName('');
    setGithubLink('');
  };

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projName || !projSkills) return;

    const newProject: Project = {
      id: crypto.randomUUID(),
      name: projName,
      skills: projSkills,
      status: projStatus,
      date: projDate,
      githubLink: projStatus === 'Completed' ? projGithub : undefined
    };

    setState(prev => ({
      ...prev,
      projects: [...prev.projects, newProject]
    }));

    setProjName('');
    setProjSkills('');
    setProjStatus('Planned');
    setProjDate(new Date().toISOString().split('T')[0]);
    setProjGithub('');
    setShowProjectForm(false);
  };

  const deleteProject = (id: string) => {
    setState(prev => ({
      ...prev,
      projects: prev.projects.filter(p => p.id !== id)
    }));
  };

  const addResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resTitle.trim()) return;

    const newRes: Resource = {
      id: crypto.randomUUID(),
      title: resTitle.trim(),
      type: resType,
      link: resLink.trim(),
      completed: false
    };

    setState(prev => ({
      ...prev,
      resourceVault: [...prev.resourceVault, newRes]
    }));
    setResTitle('');
    setResLink('');
  };

  const toggleResource = (id: string) => {
    setState(prev => ({
      ...prev,
      resourceVault: prev.resourceVault.map(r => 
        r.id === id ? { ...r, completed: !r.completed } : r
      )
    }));
  };

  const deleteResource = (id: string) => {
    setState(prev => ({
      ...prev,
      resourceVault: prev.resourceVault.filter(r => r.id !== id)
    }));
  };

  const getCategoryIcon = (cat: LabCategory) => {
    switch(cat) {
      case 'AWS':
      case 'Azure':
      case 'GCP': return <Cloud className="w-3 h-3" />;
      case 'Network': return <Network className="w-3 h-3" />;
      case 'AppSec': return <Lock className="w-3 h-3" />;
      case 'Mandarin': return <Globe className="w-3 h-3" />;
      default: return <Terminal className="w-3 h-3" />;
    }
  };

  const resourceStats = useMemo(() => {
    const total = state.resourceVault.length;
    const completed = state.resourceVault.filter(r => r.completed).length;
    const progress = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { total, completed, progress };
  }, [state.resourceVault]);

  const syncHealthColor = useMemo(() => {
    if (state.syncPercentage > 80) return 'text-pink-500';
    if (state.syncPercentage > 40) return 'text-blue-500';
    return 'text-red-400';
  }, [state.syncPercentage]);

  const filteredLabs = useMemo(() => {
    return state.labs.filter(lab => {
      const matchesSearch = lab.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'All' || lab.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [state.labs, searchTerm, filterCategory]);

  const getStatusStyle = (status: ProjectStatus) => {
    switch (status) {
      case 'Completed': return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'In Progress': return 'bg-pink-100 text-pink-600 border-pink-200';
      default: return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  };

  const getStatusIcon = (status: ProjectStatus) => {
    switch (status) {
      case 'Completed': return <CheckCircle2 className="w-3 h-3" />;
      case 'In Progress': return <Clock className="w-3 h-3" />;
      default: return <Circle className="w-3 h-3" />;
    }
  };

  const renderDashboard = () => (
    <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-500 pb-20">
      {/* 1. Sync Health */}
      <BentoCard title="SYSTEM SYNC HEALTH" icon={<Activity className="w-5 h-5" />} className="lg:row-span-1">
        <div className="flex flex-col items-center justify-center w-full h-full py-2 relative">
          {decayAmount > 0 && (
            <div className="absolute top-0 right-0 z-20 pointer-events-none">
              <div className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1 rounded-full border border-red-100 shadow-sm animate-float-decay">
                <AlertTriangle className="w-3 h-3" />
                <span className="text-[10px] font-black font-mono">-{decayAmount}% SYNC DECAY</span>
              </div>
            </div>
          )}
          <div className="relative w-48 h-48 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
              <circle cx="96" cy="96" r="86" fill="none" stroke="currentColor" strokeWidth="12" className="text-slate-200/50" />
              <circle cx="96" cy="96" r="86" fill="none" stroke="currentColor" strokeWidth="12" strokeDasharray={540} strokeDashoffset={540 - (540 * state.syncPercentage) / 100} strokeLinecap="round" className={`${syncHealthColor} transition-all duration-1000 ease-out`} />
            </svg>
            <div className={`flex flex-col items-center justify-center z-10 ${decayAmount > 0 ? 'animate-sync-glitch' : ''}`}>
              {labDebt === 0 ? (
                <>
                  <Sparkles className="text-pink-500 w-8 h-8 mb-1 animate-pulse" />
                  <span className="text-sm font-black text-pink-600 uppercase tracking-tighter text-center leading-none">Legend ✨</span>
                </>
              ) : (
                <>
                  <span className="text-5xl font-black font-mono text-slate-800 tracking-tighter leading-none">{labDebt}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">Labs Owed 🌸</span>
                </>
              )}
            </div>
          </div>
          <div className="mt-6 flex flex-col items-center gap-1">
             <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 uppercase">
                <Calendar className="w-3 h-3" /> Journey: {new Date(state.journeyStartDate).toLocaleDateString()}
             </div>
             <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
               Sync Status: {state.syncPercentage}%
             </div>
          </div>
        </div>
      </BentoCard>

      {/* 2. Project Pipeline */}
      <BentoCard title="SECURITY PROJECT PIPELINE" icon={<Kanban className="w-5 h-5" />} className="lg:col-span-2">
        <div className="flex flex-col h-full space-y-4">
          <div className="flex justify-between items-center shrink-0">
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Master Milestones</span>
             <button 
                onClick={() => setShowProjectForm(!showProjectForm)}
                className="flex items-center gap-1 text-[10px] font-black text-blue-500 uppercase tracking-widest hover:bg-blue-50 px-2 py-1 rounded-lg transition-colors"
              >
                <Plus className="w-3 h-3" /> Add New Project
              </button>
          </div>

          {showProjectForm && (
            <form onSubmit={handleAddProject} className="bg-white/60 border border-blue-100 rounded-2xl p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input 
                  type="text" value={projName} onChange={e => setProjName(e.target.value)} placeholder="Project Name..."
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pink-400 font-medium"
                />
                <input 
                  type="text" value={projSkills} onChange={e => setProjSkills(e.target.value)} placeholder="Skills (e.g. IAM, VPC)..."
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pink-400 font-medium"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <select 
                  value={projStatus} onChange={e => setProjStatus(e.target.value as ProjectStatus)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none font-medium"
                >
                  {PROJECT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <input 
                  type="date" value={projDate} onChange={e => setProjDate(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none font-medium"
                />
                {projStatus === 'Completed' ? (
                  <input 
                    type="url" value={projGithub} onChange={e => setProjGithub(e.target.value)} placeholder="GitHub URL..."
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none font-medium"
                  />
                ) : (
                  <div className="w-full bg-slate-50/50 border border-dashed border-slate-200 rounded-xl px-3 py-2 text-[10px] text-slate-300 flex items-center italic">Link available on completion</div>
                )}
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-pink-500 text-white rounded-xl py-2 font-bold text-xs hover:bg-pink-600 transition-all">CREATE PROJECT</button>
                <button type="button" onClick={() => setShowProjectForm(false)} className="px-4 bg-slate-200 text-slate-600 rounded-xl py-2 font-bold text-xs hover:bg-slate-300 transition-all">CANCEL</button>
              </div>
            </form>
          )}

          <div className="overflow-y-auto max-h-[220px] space-y-2 pr-2 custom-scrollbar flex-1">
            {state.projects.length === 0 ? (
              <div className="text-center py-10 text-slate-300 font-mono text-[10px] uppercase border border-dashed border-slate-200 rounded-2xl">No projects in pipeline.</div>
            ) : (
              state.projects.map(project => (
                <div key={project.id} className="group flex items-center justify-between bg-white/50 border border-white/60 p-3 rounded-2xl hover:bg-white transition-all">
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-slate-800 text-sm leading-tight truncate">{project.name}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase border flex items-center gap-1 ${getStatusStyle(project.status)}`}>
                        {getStatusIcon(project.status)} {project.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase">{new Date(project.date).toLocaleDateString()}</span>
                      <p className="text-[10px] font-medium text-slate-400 truncate">Skills: {project.skills}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {project.status === 'Completed' && project.githubLink && (
                      <a href={project.githubLink} target="_blank" rel="noopener noreferrer" className="p-2 bg-blue-50 text-blue-500 rounded-xl hover:bg-blue-100 transition-all" title="View Repository">
                        <Github className="w-4 h-4" />
                      </a>
                    )}
                    <button onClick={() => deleteProject(project.id)} className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-400 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </BentoCard>

      {/* 3. Resource Tracker */}
      <BentoCard title="RESOURCE TRACKER" icon={<BookOpen className="w-5 h-5" />} className="lg:col-span-1">
        <div className="flex flex-col h-full space-y-4">
          <div className="space-y-1">
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mastery Status</span>
              <span className="text-sm font-bold text-blue-500 font-mono">{resourceStats.progress}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div className="h-full bg-blue-400 transition-all duration-700" style={{ width: `${resourceStats.progress}%` }} />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[200px] space-y-2 pr-2 custom-scrollbar">
            {state.resourceVault.slice(0, 5).map(res => (
              <div key={res.id} className="flex items-center gap-3 p-2 bg-white/40 rounded-xl border border-white/50">
                <div className={res.completed ? 'text-blue-500' : 'text-slate-300'}>
                  {res.completed ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                </div>
                <span className={`text-xs font-bold truncate ${res.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{res.title}</span>
              </div>
            ))}
            <button 
              onClick={() => setCurrentView('vault')}
              className="w-full py-2 text-[10px] font-black text-blue-500 uppercase tracking-widest hover:bg-blue-50 rounded-lg transition-colors"
            >
              Open Resource Vault →
            </button>
          </div>
        </div>
      </BentoCard>

      {/* 4. Maintenance Mode */}
      <BentoCard title="MAINTENANCE PROTOCOL" icon={<Cpu className="w-5 h-5" />}>
          <div className="flex flex-col justify-between h-full gap-4">
            <p className="text-xs text-slate-500 leading-relaxed font-medium">Exam mode pauses the daily sync decay protocol.</p>
            <button 
              onClick={() => setState(s => ({...s, maintenanceMode: !s.maintenanceMode}))}
              className={`flex items-center justify-between px-4 py-3 rounded-2xl border transition-all duration-300 ${state.maintenanceMode ? 'bg-pink-500 text-white border-pink-600 shadow-lg' : 'bg-white/50 text-slate-600 border-slate-200 hover:border-pink-300'}`}
            >
              <span className="font-bold text-[10px] uppercase tracking-widest">{state.maintenanceMode ? 'Exam Active' : 'Standby'}</span>
              <div className={`w-8 h-5 rounded-full relative transition-colors ${state.maintenanceMode ? 'bg-white/30' : 'bg-slate-200'}`}>
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${state.maintenanceMode ? 'right-0.5' : 'left-0.5'}`} />
              </div>
            </button>
          </div>
      </BentoCard>

      {/* 5. Add Lab Form */}
      <BentoCard title="DECRYPT NEW LAB" icon={<Terminal className="w-5 h-5" />} className="lg:col-span-1">
        <form onSubmit={handleLogLab} className="space-y-4">
          <input 
            type="text" value={labName} onChange={e => setLabName(e.target.value)} placeholder="Lab Title..."
            className="w-full bg-white/60 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-pink-400 transition-all font-medium"
          />
          <div className="grid grid-cols-2 gap-4">
            <select 
              value={category} onChange={e => setCategory(e.target.value as LabCategory)}
              className="w-full bg-white/60 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pink-400 appearance-none font-medium"
            >
              {CATEGORIES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <input 
              type="url" value={githubLink} onChange={e => setGithubLink(e.target.value)} placeholder="Github/Ref..."
              className="w-full bg-white/60 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-pink-400 transition-all font-medium"
            />
          </div>
          <button type="submit" className="w-full bg-slate-800 text-white font-bold py-3 rounded-xl hover:bg-slate-700 transition-all flex items-center justify-center gap-2 group shadow-lg">
            COMMIT DEPLOYMENT <Zap className="w-4 h-4 text-pink-400 group-hover:scale-125 transition-transform" />
          </button>
        </form>
      </BentoCard>

      {/* 6. Recent Labs */}
      <BentoCard title="LATEST DEPLOYMENTS" icon={<History className="w-5 h-5" />} className="lg:col-span-2 overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-4 shrink-0">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Showing 7 Recent Sessions</span>
          <button 
            onClick={() => setCurrentView('vault')}
            className="text-[10px] font-black text-pink-500 uppercase tracking-widest hover:underline"
          >
            See Full History →
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 overflow-hidden">
          {state.labs.slice(0, 7).map(lab => (
            <div key={lab.id} className="group bg-white/50 border border-slate-200/50 rounded-2xl p-3 flex items-center justify-between hover:bg-white hover:border-pink-200 transition-all">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center text-pink-500 font-bold text-[10px] shrink-0">
                  {getCategoryIcon(lab.category)}
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-slate-800 text-[11px] leading-tight mb-0.5 truncate">{lab.name}</h4>
                  <div className="flex items-center gap-2 text-[9px] font-mono text-slate-400 uppercase tracking-tighter">
                    <span>{lab.category}</span>
                    <span className="opacity-50">•</span>
                    <span>{new Date(lab.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <a href={lab.githubLink} target="_blank" rel="noopener noreferrer" className="p-1.5 text-slate-400 hover:text-pink-500 hover:bg-pink-50 rounded-lg transition-all"><Github className="w-3.5 h-3.5" /></a>
            </div>
          ))}
          {state.labs.length === 0 && (
            <div className="col-span-full text-center py-6 text-slate-400 font-mono text-[10px] uppercase">No logs detected.</div>
          )}
        </div>
      </BentoCard>
    </main>
  );

  const renderVault = () => (
    <div className="animate-in slide-in-from-bottom-4 fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
        <button 
          onClick={() => setCurrentView('dashboard')}
          className="flex items-center gap-2 px-4 py-2 bg-white/60 border border-white/80 rounded-2xl text-slate-600 font-bold text-sm hover:bg-white transition-all shadow-sm"
        >
          <ChevronLeft className="w-4 h-4" /> BACK TO DASHBOARD
        </button>
        
        <div className="flex flex-1 max-w-2xl gap-4 w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search archive..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/60 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-blue-400 transition-all font-medium"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select 
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as any)}
              className="pl-10 pr-8 py-2 bg-white/60 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-blue-400 appearance-none font-bold text-slate-600"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Col: All Resources */}
        <div className="lg:col-span-1 space-y-8">
          <BentoCard title="MASTER RESOURCE VAULT" icon={<BookOpen className="w-5 h-5" />}>
            <div className="space-y-4">
              <form onSubmit={addResource} className="space-y-2 pb-4 border-b border-slate-100">
                <input 
                  type="text" value={resTitle} onChange={e => setResTitle(e.target.value)} placeholder="Course Title..."
                  className="w-full bg-white/60 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none font-medium"
                />
                <div className="flex gap-2">
                  <select 
                    value={resType} onChange={e => setResType(e.target.value as any)}
                    className="bg-white/60 border border-slate-200 rounded-xl px-2 py-2 text-[10px] font-black uppercase"
                  >
                    {RESOURCE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <button type="submit" className="flex-1 bg-blue-500 text-white rounded-xl py-2 font-bold text-xs hover:bg-blue-600 transition-all">ADD ENTRY</button>
                </div>
              </form>
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {state.resourceVault.map(res => (
                  <div key={res.id} className={`group p-3 rounded-xl border transition-all ${res.completed ? 'bg-blue-50/40 border-blue-100' : 'bg-white/40 border-white/50'}`}>
                    <div className="flex items-center justify-between">
                      <button onClick={() => toggleResource(res.id)} className="flex items-center gap-3 min-w-0">
                        <div className={res.completed ? 'text-blue-500' : 'text-slate-300'}>
                          {res.completed ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                        </div>
                        <span className={`text-xs font-bold truncate max-w-[120px] ${res.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{res.title}</span>
                      </button>
                      <button onClick={() => deleteResource(res.id)} className="opacity-0 group-hover:opacity-100 text-red-300 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </BentoCard>
        </div>

        {/* Right Col: Full Lab History */}
        <div className="lg:col-span-3">
          <BentoCard title="CENTRAL DEPLOYMENT ARCHIVE" icon={<History className="w-5 h-5" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredLabs.length === 0 ? (
                <div className="col-span-full py-20 text-center">
                  <History className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-400 font-mono text-xs uppercase">No logs match your current filter parameters.</p>
                </div>
              ) : (
                filteredLabs.map(lab => (
                  <div key={lab.id} className="bg-white/60 border border-white/80 rounded-2xl p-4 hover:border-blue-300 transition-all group">
                    <div className="flex justify-between items-start mb-3">
                      <div className="p-2 bg-blue-50 rounded-xl text-blue-500">
                        {getCategoryIcon(lab.category)}
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">{new Date(lab.timestamp).toLocaleDateString()}</span>
                    </div>
                    <h4 className="font-black text-slate-800 text-sm mb-1 leading-tight">{lab.name}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">{lab.category}</p>
                    <div className="flex items-center justify-between">
                      <a 
                        href={lab.githubLink} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-xs font-bold text-blue-500 hover:underline flex items-center gap-1"
                      >
                        <Github className="w-3 h-3" /> DOCS
                      </a>
                      <button 
                        onClick={() => setState(s => ({...s, labs: s.labs.filter(l => l.id !== lab.id)}))}
                        className="opacity-0 group-hover:opacity-100 p-2 text-red-300 hover:text-red-500 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </BentoCard>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen px-4 py-10 md:px-12 lg:px-24">
      {/* Header */}
      <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="text-pink-500 w-8 h-8" />
            <h1 className="text-4xl font-black font-poppins text-slate-800 tracking-tighter uppercase leading-none">CloudSec Master</h1>
          </div>
          <p className="text-[10px] text-slate-400 font-black tracking-[0.2em] uppercase">Security Operations & Intelligence Dashboard</p>
        </div>
        
        <div className="flex items-center gap-6 bg-white/40 p-4 rounded-3xl border border-white/60 shadow-sm backdrop-blur-md">
          <div className="text-center px-4 border-r border-slate-200">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Active Streak</div>
            <div className="text-2xl font-black text-pink-500 font-mono flex items-center gap-1 justify-center">
              <Zap className={`w-5 h-5 fill-current ${state.streak > 0 ? 'text-pink-500' : 'text-slate-300'}`} /> {state.streak}
            </div>
          </div>
          <div className="text-center px-4">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Mastery Level</div>
            <div className="text-2xl font-black text-slate-800 font-mono">{resourceStats.progress}%</div>
          </div>
        </div>
      </header>

      {currentView === 'dashboard' ? renderDashboard() : renderVault()}

      {/* Footer */}
      <footer className="mt-20 border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest gap-4">
        <div className="flex items-center gap-2"><ShieldCheck className="w-3 h-3 text-pink-500" /> AUTHENTICATED SYSTEM</div>
        <div className="flex gap-8">
          <button onClick={() => setCurrentView('dashboard')} className={`hover:text-pink-500 transition-colors ${currentView === 'dashboard' ? 'text-pink-500 underline underline-offset-4 decoration-2' : ''}`}>DASHBOARD</button>
          <button onClick={() => setCurrentView('vault')} className={`hover:text-blue-500 transition-colors ${currentView === 'vault' ? 'text-blue-500 underline underline-offset-4 decoration-2' : ''}`}>ARCHIVE VAULT</button>
        </div>
        <div className="font-mono uppercase tracking-tighter italic">"THE ARCHITECT BUILDS; THE SECURITY ANALYST VERIFIES."</div>
      </footer>
    </div>
  );
}
