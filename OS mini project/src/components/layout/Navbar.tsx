import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Volume2, VolumeX, Settings, Award, Layers, Sparkles } from 'lucide-react';
import { findLessonByPath } from '../../data/topicsData';
import { UserProgress } from '../../types';

interface NavbarProps {
  progress: UserProgress;
  isVoiceActive: boolean;
  onToggleVoice: () => void;
  onOpenSearch: () => void;
  onOpenSettings: () => void;
  onToggleMobileSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  progress,
  isVoiceActive,
  onToggleVoice,
  onOpenSearch,
  onOpenSettings,
  onToggleMobileSidebar,
}) => {
  const location = useLocation();
  const currentLesson = findLessonByPath(location.pathname);

  return (
    <header className="h-16 bg-surface border-b border-app-border sticky top-0 z-30 px-4 md:px-6 flex items-center justify-between">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 text-text-muted hover:text-text-main hover:bg-slate-100 rounded-lg"
          aria-label="Toggle navigation menu"
        >
          <Layers className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center space-x-2 text-xs md:text-sm">
          <Link to="/" className="text-text-muted hover:text-primary-blue font-medium">
            OS Lab
          </Link>
          <span className="text-slate-300">/</span>
          {currentLesson ? (
            <>
              <span className="text-text-muted">{currentLesson.category}</span>
              <span className="text-slate-300">/</span>
              <span className="text-text-main font-semibold truncate max-w-[200px] md:max-w-xs">
                {currentLesson.title}
              </span>
            </>
          ) : (
            <span className="text-text-main font-semibold">Dashboard</span>
          )}
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3.5 py-1.5 text-xs text-text-muted bg-slate-50 border border-app-border rounded-lg hover:border-blue-400 hover:bg-white transition-all shadow-subtle group"
        >
          <span className="flex items-center space-x-2">
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary-blue" />
            <span>Search algorithms, topics, or formulas...</span>
          </span>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white border border-slate-200 rounded">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Right: Actions, Voice, Points & Settings */}
      <div className="flex items-center space-x-2 md:space-x-3">
        <button
          onClick={onOpenSearch}
          className="md:hidden p-2 text-text-muted hover:text-text-main rounded-lg hover:bg-slate-100"
          aria-label="Search"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Voice Assistant Toggle */}
        <button
          onClick={onToggleVoice}
          title={isVoiceActive ? 'Voice Assistant Active (Click to mute)' : 'Voice Assistant Muted (Click to enable)'}
          className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            isVoiceActive
              ? 'bg-blue-50 text-primary-blue border-blue-200 hover:bg-blue-100'
              : 'bg-slate-50 text-text-muted border-slate-200 hover:bg-slate-100'
          }`}
        >
          {isVoiceActive ? (
            <>
              <Volume2 className="w-4 h-4 text-primary-blue animate-pulse" />
              <span className="hidden sm:inline">Voice Active</span>
            </>
          ) : (
            <>
              <VolumeX className="w-4 h-4" />
              <span className="hidden sm:inline">Voice Muted</span>
            </>
          )}
        </button>

        {/* User Points & Streak */}
        <div className="hidden lg:flex items-center space-x-2 px-2.5 py-1 bg-amber-50 border border-amber-200/60 rounded-lg text-xs font-semibold text-amber-900">
          <Award className="w-4 h-4 text-amber-600" />
          <span>{progress.points} pts</span>
          <span className="text-amber-300">|</span>
          <span className="flex items-center space-x-0.5 text-amber-700">
            <Sparkles className="w-3 h-3" />
            <span>{progress.streakDays}d streak</span>
          </span>
        </div>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          className="p-2 text-text-muted hover:text-text-main hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
