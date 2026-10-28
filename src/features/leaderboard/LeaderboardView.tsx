import React, { useState } from 'react';
import {
  Award,
  Trophy,
  Users,
  Sparkles,
  CheckCircle2,
  Lock,
  Flame,
  ShieldCheck,
  Star,
  Info,
} from 'lucide-react';
import { leaderboardService } from '../../services/leaderboardService';
import { progressService, INITIAL_ACHIEVEMENTS } from '../../services/progressService';
import { LeaderboardEntry } from '../../types';

export const LeaderboardView: React.FC = () => {
  const [filter, setFilter] = useState<'global' | 'friends' | 'weekly' | 'banker'>('global');
  const [activeTab, setActiveTab] = useState<'rankings' | 'achievements'>('rankings');

  const entries: LeaderboardEntry[] = leaderboardService.getLeaderboard(filter);
  const userProgress = progressService.getProgress();

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="bg-surface p-6 rounded-3xl border border-app-border shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1 font-mono">
            <Award className="w-4 h-4" />
            <span>Competitive Learning Rankings</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-text-main tracking-tight">
            Global & Local Leaderboard
          </h1>
          <p className="text-xs text-text-muted mt-1 max-w-2xl leading-relaxed">
            Track your standing across quizzes and interactive simulations. Earn achievements, maintain daily learning streaks, and celebrate course mastery.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('rankings')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'rankings'
                ? 'bg-primary-blue text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Leaderboard
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'achievements'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Badges & Achievements ({userProgress.achievements.length}/{INITIAL_ACHIEVEMENTS.length})
          </button>
        </div>
      </div>

      {activeTab === 'rankings' ? (
        <div className="space-y-6">
          {/* Filters & Sample Data Transparency Notice */}
          <div className="bg-surface p-4 rounded-2xl border border-app-border shadow-subtle flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-1.5 p-1 bg-slate-100 rounded-xl font-semibold">
              {[
                { id: 'global', label: 'All-Time' },
                { id: 'weekly', label: 'Weekly' },
                { id: 'friends', label: 'Friends' },
                { id: 'banker', label: 'Banker’s Lab' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    filter === f.id
                      ? 'bg-white text-primary-blue shadow-xs font-bold'
                      : 'text-text-muted hover:text-text-main'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-1.5 text-[11px] text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <Info className="w-3.5 h-3.5 text-primary-blue" />
              <span>Sample peers are clearly tagged as demonstration data.</span>
            </div>
          </div>

          {/* Ranking Table */}
          <div className="bg-surface rounded-2xl border border-app-border shadow-subtle overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-app-border text-slate-400 font-mono text-[11px]">
                    <th className="py-3 px-4 font-semibold">Rank</th>
                    <th className="py-3 px-4 font-semibold">Scholar</th>
                    <th className="py-3 px-4 font-semibold">Points (XP)</th>
                    <th className="py-3 px-4 font-semibold">Quizzes</th>
                    <th className="py-3 px-4 font-semibold">Accuracy</th>
                    <th className="py-3 px-4 font-semibold">Specialty Badge</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {entries.map(entry => {
                    const isUser = entry.isCurrentUser;

                    return (
                      <tr
                        key={entry.id}
                        className={`transition-colors ${
                          isUser
                            ? 'bg-blue-50/70 font-semibold'
                            : 'hover:bg-slate-50/60'
                        }`}
                      >
                        <td className="py-3 px-4 font-mono font-bold">
                          {entry.rank === 1 ? (
                            <span className="flex items-center space-x-1 text-amber-500">
                              <Trophy className="w-4 h-4" />
                              <span>1</span>
                            </span>
                          ) : entry.rank === 2 ? (
                            <span className="flex items-center space-x-1 text-slate-400">
                              <Trophy className="w-4 h-4" />
                              <span>2</span>
                            </span>
                          ) : entry.rank === 3 ? (
                            <span className="flex items-center space-x-1 text-amber-700">
                              <Trophy className="w-4 h-4" />
                              <span>3</span>
                            </span>
                          ) : (
                            <span className="text-slate-500">#{entry.rank}</span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2.5">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-white text-[11px] ${entry.avatarBg}`}>
                              {entry.name[0]}
                            </div>
                            <div>
                              <span className="font-bold text-text-main block">
                                {entry.name}
                              </span>
                              {entry.isSampleData && (
                                <span className="text-[9px] text-slate-400 font-mono">
                                  Demo Benchmark
                                </span>
                              )}
                              {isUser && (
                                <span className="text-[9px] text-primary-blue font-bold font-mono">
                                  Your Profile
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 font-mono font-bold text-primary-blue">
                          {entry.points} pts
                        </td>

                        <td className="py-3 px-4 font-mono text-slate-600">
                          {entry.quizzesCompleted} completed
                        </td>

                        <td className="py-3 px-4 font-mono text-slate-600">
                          {entry.accuracy}%
                        </td>

                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                            {entry.badge}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Achievements & Badges Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {INITIAL_ACHIEVEMENTS.map(ach => {
            const isUnlocked = userProgress.achievements.includes(ach.id);

            return (
              <div
                key={ach.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  isUnlocked
                    ? 'bg-surface border-blue-200 shadow-card'
                    : 'bg-slate-50/70 border-slate-200 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-app-border">
                    <span className="text-xs font-bold text-text-main flex items-center space-x-1.5">
                      {isUnlocked ? (
                        <CheckCircle2 className="w-4 h-4 text-app-success" />
                      ) : (
                        <Lock className="w-4 h-4 text-slate-400" />
                      )}
                      <span>{ach.title}</span>
                    </span>
                    <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                      +{ach.pointsReward} XP
                    </span>
                  </div>

                  <p className="text-xs text-text-muted mt-2 leading-relaxed">
                    {ach.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-mono">
                    Status: {isUnlocked ? 'Unlocked' : 'In Progress'}
                  </span>
                  {isUnlocked && (
                    <span className="text-app-success font-bold font-mono">Completed</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
