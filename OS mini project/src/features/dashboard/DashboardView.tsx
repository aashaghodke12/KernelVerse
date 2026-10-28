import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Play,
  ArrowRight,
  ShieldCheck,
  Cpu,
  RefreshCw,
  Layers,
  HardDrive,
  Award,
  BookOpen,
  Trophy,
  BrainCircuit,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { UserProgress } from '../../types';
import { getAllLessons } from '../../data/topicsData';
import { Banker3DScene } from '../banker/components/Banker3DScene';
import { DEFAULT_BANKER_STATE } from '../../algorithms/bankerAlgorithm';

interface DashboardViewProps {
  progress: UserProgress;
}

const ACTIVITY_DATA = [
  { day: 'Mon', xp: 45 },
  { day: 'Tue', xp: 70 },
  { day: 'Wed', xp: 120 },
  { day: 'Thu', xp: 90 },
  { day: 'Fri', xp: 160 },
  { day: 'Sat', xp: 210 },
  { day: 'Sun', xp: 180 },
];

export const DashboardView: React.FC<DashboardViewProps> = ({ progress }) => {
  const allLessons = getAllLessons();
  const completedCount = allLessons.filter(l => progress.completedLessons.includes(l.id)).length;
  const progressPct = Math.round((completedCount / (allLessons.length || 1)) * 100);

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-purple-50/40 p-6 sm:p-10 rounded-3xl border border-blue-200/80 shadow-subtle overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/90 border border-blue-200/80 rounded-full text-xs font-bold text-primary-blue shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-primary-blue" />
            <span>Interactive 3D Operating Systems Simulator</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-text-main tracking-tight leading-tight">
            Understand Operating Systems by Seeing Them Work.
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
            Explore algorithms, visualize system behavior, and master OS concepts through interactive simulations, voice narration, and gamified challenges.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to="/banker"
              className="flex items-center space-x-2 px-5 py-2.5 bg-primary-blue text-white rounded-xl text-xs font-bold hover:bg-blue-600 shadow-md shadow-blue-500/20 transition-all hover:scale-102"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Launch Banker’s Algorithm Lab</span>
            </Link>

            <Link
              to="/simulators/cpu-scheduling"
              className="flex items-center space-x-2 px-4 py-2.5 bg-white border border-slate-200 text-text-main rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors shadow-subtle"
            >
              <span>Explore All Simulators</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <Link
              to="/memory-palace"
              className="flex items-center space-x-2 px-4 py-2.5 bg-violet-50 border border-violet-200 text-secondary-violet rounded-xl text-xs font-bold hover:bg-violet-100 transition-colors"
            >
              <BrainCircuit className="w-3.5 h-3.5" />
              <span>Start Guided Learning</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Featured 3D Interactive Simulation Card */}
      <div className="bg-surface p-6 rounded-3xl border border-app-border shadow-subtle space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-app-border">
          <div>
            <span className="text-[10px] uppercase font-bold text-primary-blue tracking-wider font-mono">
              ★ Core Featured Experience
            </span>
            <h2 className="text-lg font-bold text-text-main">
              Real-Time 3D Resource Allocation Environment
            </h2>
          </div>
          <Link
            to="/banker"
            className="text-xs text-primary-blue font-bold flex items-center space-x-1 hover:underline"
          >
            <span>Open Dedicated Banker Lab</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Embedded 3D Scene */}
        <Banker3DScene
          state={DEFAULT_BANKER_STATE}
          currentProcessIdx={1}
          completedProcesses={[false, true, false, false, false]}
          eligibleProcesses={[false, false, false, true, false]}
        />
      </div>

      {/* Grid: Continue Learning, Progress, Daily Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Continue Learning Card */}
        <div className="bg-surface p-5 rounded-2xl border border-app-border shadow-subtle space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-primary-blue mb-2">
              <ShieldCheck className="w-4 h-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-main">
                Continue Learning
              </h3>
            </div>
            <h4 className="text-sm font-bold text-text-main">
              Banker’s Algorithm & Deadlock Avoidance
            </h4>
            <p className="text-xs text-text-muted mt-1 leading-relaxed">
              Resume your step-by-step walkthrough of the safety algorithm with Available = [3, 3, 2].
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-app-border">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-500">Module Completion</span>
              <span className="text-primary-blue font-mono font-bold">80%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div className="bg-primary-blue h-full rounded-full w-4/5" />
            </div>
            <Link
              to="/banker"
              className="w-full mt-2 py-2 bg-blue-50 text-primary-blue rounded-xl text-xs font-bold hover:bg-blue-100 flex items-center justify-center space-x-1 transition-colors"
            >
              <span>Resume Simulation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Course Completion & Stats */}
        <div className="bg-surface p-5 rounded-2xl border border-app-border shadow-subtle space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-violet-600 mb-2">
              <Award className="w-4 h-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-main">
                Course Progress
              </h3>
            </div>
            <div className="text-3xl font-black text-text-main font-mono">
              {progressPct}%
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              {completedCount} of {allLessons.length} units completed across all topics
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-app-border font-mono text-xs">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 block font-semibold">Total XP</span>
              <span className="text-sm font-bold text-primary-blue">{progress.points} pts</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 block font-semibold">Day Streak</span>
              <span className="text-sm font-bold text-amber-600">{progress.streakDays} Days</span>
            </div>
          </div>
        </div>

        {/* Daily Learning Activity Chart */}
        <div className="bg-surface p-5 rounded-2xl border border-app-border shadow-subtle space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-app-border">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-600">
              <TrendingUp className="w-4 h-4" />
              <span className="uppercase tracking-wider text-text-main">Weekly Study Activity</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">XP earned</span>
          </div>

          <div className="h-36 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ACTIVITY_DATA}>
                <defs>
                  <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#315EFB" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#315EFB" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="xp" stroke="#315EFB" strokeWidth={2} fillOpacity={1} fill="url(#colorXp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Simulator Shortcuts Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-text-main uppercase tracking-wider">
          Interactive Algorithm Suites
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: "Banker's Algorithm", desc: 'Deadlock avoidance & safety checks', path: '/banker', icon: <ShieldCheck className="w-4 h-4 text-primary-blue" /> },
            { title: 'CPU Scheduling', desc: 'FCFS, SJF, SRTF, RR & Gantt charts', path: '/simulators/cpu-scheduling', icon: <Cpu className="w-4 h-4 text-violet-600" /> },
            { title: 'Memory Partitions', desc: 'First, Best, Worst Fit & Fragmentation', path: '/simulators/memory-allocation', icon: <Layers className="w-4 h-4 text-cyan-600" /> },
            { title: 'Page Replacement', desc: 'FIFO, LRU, Optimal & Belady anomaly', path: '/simulators/page-replacement', icon: <RefreshCw className="w-4 h-4 text-emerald-600" /> },
          ].map(sim => (
            <Link
              key={sim.title}
              to={sim.path}
              className="bg-surface p-4 rounded-2xl border border-app-border shadow-subtle hover:border-blue-300 hover:shadow-card transition-all flex flex-col justify-between h-32 group"
            >
              <div>
                <div className="flex items-center space-x-2 mb-1.5">
                  {sim.icon}
                  <span className="text-xs font-bold text-text-main group-hover:text-primary-blue">
                    {sim.title}
                  </span>
                </div>
                <p className="text-[11px] text-text-muted">{sim.desc}</p>
              </div>
              <span className="text-[10px] font-bold text-primary-blue flex items-center space-x-1">
                <span>Launch</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
