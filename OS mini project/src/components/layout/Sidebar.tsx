import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  ShieldAlert,
  Cpu,
  RefreshCw,
  Layers,
  HardDrive,
  Award,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Trophy,
  BrainCircuit,
  X,
  ExternalLink,
} from 'lucide-react';
import { TOPIC_CATEGORIES, getAllLessons } from '../../data/topicsData';
import { UserProgress } from '../../types';

interface SidebarProps {
  progress: UserProgress;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  ShieldAlert: <ShieldAlert className="w-4 h-4 text-primary-blue" />,
  Cpu: <Cpu className="w-4 h-4 text-violet-600" />,
  RefreshCw: <RefreshCw className="w-4 h-4 text-emerald-600" />,
  Layers: <Layers className="w-4 h-4 text-cyan-600" />,
  HardDrive: <HardDrive className="w-4 h-4 text-amber-600" />,
  Award: <Award className="w-4 h-4 text-indigo-600" />,
};

export const Sidebar: React.FC<SidebarProps> = ({
  progress,
  isOpenMobile,
  onCloseMobile,
}) => {
  const location = useLocation();
  const allLessons = getAllLessons();
  const completedCount = allLessons.filter(l => progress.completedLessons.includes(l.id)).length;
  const overallPercentage = Math.round((completedCount / (allLessons.length || 1)) * 100);

  // Default expand Deadlock Management and Gamification
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'deadlock-management': true,
    'process-management': true,
    'gamification-revision': true,
  });

  const toggleCategory = (catId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-surface border-r border-app-border w-[270px]">
      {/* Brand Header */}
      <div className="p-4 border-b border-app-border flex items-center justify-between">
        <NavLink to="/" onClick={onCloseMobile} className="flex items-center space-x-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-blue to-secondary-violet flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-text-main tracking-tight flex items-center space-x-1">
              <span>OS Learning Lab</span>
            </div>
            <p className="text-[11px] text-text-muted font-medium">Visualize. Simulate. Master.</p>
          </div>
        </NavLink>

        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 text-text-muted hover:text-text-main rounded-md hover:bg-slate-100"
          aria-label="Close navigation"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Course Overall Progress Bar */}
      <div className="px-4 py-3 bg-panel-tint border-b border-app-border/80">
        <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
          <span className="text-text-main flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5 text-primary-blue" />
            <span>Curriculum Progress</span>
          </span>
          <span className="font-bold text-primary-blue">{overallPercentage}%</span>
        </div>
        <div className="w-full h-1.5 bg-blue-100/80 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-blue to-secondary-violet rounded-full transition-all duration-500"
            style={{ width: `${Math.max(4, overallPercentage)}%` }}
          />
        </div>
        <p className="text-[10px] text-text-muted mt-1 font-mono">
          {completedCount} of {allLessons.length} modules completed
        </p>
      </div>

      {/* Navigation Links Scrollable List */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 text-xs">
        {/* Core Quick Links */}
        <div>
          <div className="text-[10px] uppercase font-bold text-slate-400 px-2 mb-1.5 tracking-wider">
            Navigation
          </div>
          <NavLink
            to="/"
            end
            onClick={onCloseMobile}
            className={({ isActive }) =>
              `flex items-center justify-between px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-primary-blue font-semibold'
                  : 'text-text-main hover:bg-slate-50'
              }`
            }
          >
            <span className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-primary-blue" />
              <span>Lab Dashboard</span>
            </span>
            <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-mono">Home</span>
          </NavLink>
        </div>

        {/* Categories */}
        {TOPIC_CATEGORIES.map(category => {
          const isExpanded = !!expandedCategories[category.id];
          const catCompleted = category.lessons.filter(l => progress.completedLessons.includes(l.id)).length;

          return (
            <div key={category.id} className="space-y-1">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category.id)}
                className={`w-full flex items-center justify-between px-2 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  category.isPrimary
                    ? 'text-primary-blue hover:bg-blue-50/60'
                    : 'text-text-main hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center space-x-2 truncate">
                  {CATEGORY_ICONS[category.iconName] || <Layers className="w-4 h-4 text-slate-400" />}
                  <span className="truncate">{category.title}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-[10px] text-slate-400 font-mono">
                    {catCompleted}/{category.lessons.length}
                  </span>
                  {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </div>
              </button>

              {/* Category Lessons */}
              {isExpanded && (
                <div className="pl-3 pr-1 space-y-0.5 border-l-2 border-slate-100 ml-3.5 my-1">
                  {category.lessons.map(lesson => {
                    const isCompleted = progress.completedLessons.includes(lesson.id);
                    const isActive = location.pathname === lesson.path.split('?')[0];

                    return (
                      <NavLink
                        key={lesson.id}
                        to={lesson.path}
                        onClick={onCloseMobile}
                        className={`group flex items-center justify-between px-2 py-1.5 rounded-md transition-all ${
                          isActive
                            ? 'bg-blue-50/80 text-primary-blue font-semibold shadow-xs'
                            : 'text-slate-600 hover:text-text-main hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center space-x-2 truncate">
                          {isCompleted ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-app-success shrink-0" />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-primary-blue shrink-0" />
                          )}
                          <span className="truncate">{lesson.title}</span>
                        </div>

                        {lesson.badge && (
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-medium shrink-0 ml-1.5 ${
                              lesson.badge === 'Featured 3D'
                                ? 'bg-blue-100 text-blue-700 font-bold'
                                : lesson.badge === 'Multiplayer'
                                ? 'bg-violet-100 text-violet-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {lesson.badge}
                          </span>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Shortcuts: 4 New Major Features */}
      <div className="p-3 bg-slate-50 border-t border-app-border space-y-1.5">
        <div className="text-[10px] font-bold uppercase text-slate-400 px-1 tracking-wider">
          Exam & Gamification Hub
        </div>
        <div className="grid grid-cols-2 gap-1.5 text-[11px]">
          <NavLink
            to="/memory-palace"
            onClick={onCloseMobile}
            className="flex items-center space-x-1.5 p-1.5 bg-white border border-app-border rounded-lg hover:border-blue-400 hover:shadow-xs transition-all text-text-main"
          >
            <BrainCircuit className="w-3.5 h-3.5 text-secondary-violet" />
            <span className="truncate">Palace</span>
          </NavLink>
          <NavLink
            to="/quiz-arena"
            onClick={onCloseMobile}
            className="flex items-center space-x-1.5 p-1.5 bg-white border border-app-border rounded-lg hover:border-blue-400 hover:shadow-xs transition-all text-text-main"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span className="truncate">Quiz Arena</span>
          </NavLink>
          <NavLink
            to="/leaderboard"
            onClick={onCloseMobile}
            className="flex items-center space-x-1.5 p-1.5 bg-white border border-app-border rounded-lg hover:border-blue-400 hover:shadow-xs transition-all text-text-main"
          >
            <Award className="w-3.5 h-3.5 text-indigo-500" />
            <span className="truncate">Rankings</span>
          </NavLink>
          <NavLink
            to="/handwritten-notes"
            onClick={onCloseMobile}
            className="flex items-center space-x-1.5 p-1.5 bg-white border border-app-border rounded-lg hover:border-blue-400 hover:shadow-xs transition-all text-text-main"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
            <span className="truncate">Notes</span>
          </NavLink>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block h-screen sticky top-0 shrink-0 z-20">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="fixed inset-y-0 left-0 max-w-full flex shadow-xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
