import { LeaderboardEntry } from '../types';
import { progressService } from './progressService';

const SAMPLE_LEADERBOARD: LeaderboardEntry[] = [
  {
    id: 'demo-1',
    rank: 1,
    name: 'Aarav Sharma (Sample Scholar)',
    avatarBg: 'bg-blue-600',
    points: 420,
    quizzesCompleted: 14,
    accuracy: 94,
    wins: 9,
    badge: "Banker's Master",
    isSampleData: true,
  },
  {
    id: 'demo-2',
    rank: 2,
    name: 'Priya Patel (Sample Scholar)',
    avatarBg: 'bg-violet-600',
    points: 380,
    quizzesCompleted: 12,
    accuracy: 91,
    wins: 7,
    badge: 'Deadlock Detective',
    isSampleData: true,
  },
  {
    id: 'demo-3',
    rank: 3,
    name: 'Rohan Verma (Sample Scholar)',
    avatarBg: 'bg-emerald-600',
    points: 310,
    quizzesCompleted: 10,
    accuracy: 86,
    wins: 5,
    badge: 'Scheduling Strategist',
    isSampleData: true,
  },
  {
    id: 'demo-4',
    rank: 4,
    name: 'Ananya Iyer (Sample Scholar)',
    avatarBg: 'bg-amber-600',
    points: 260,
    quizzesCompleted: 8,
    accuracy: 82,
    wins: 3,
    badge: 'Memory Wizard',
    isSampleData: true,
  },
];

class LeaderboardService {
  public getLeaderboard(filter: string = 'all'): LeaderboardEntry[] {
    const userProgress = progressService.getProgress();
    
    // Construct current user entry
    const userQuizzesCount = Object.keys(userProgress.quizScores).length;
    const userEntry: LeaderboardEntry = {
      id: 'current-user',
      rank: 0,
      name: 'You (Current Learner)',
      avatarBg: 'bg-primary-blue text-white ring-2 ring-blue-400',
      points: userProgress.points,
      quizzesCompleted: userQuizzesCount,
      accuracy: userQuizzesCount > 0 ? 88 : 0,
      wins: Math.floor(userQuizzesCount / 2),
      badge: userProgress.achievements.includes('bankers-master')
        ? "Banker's Master"
        : userProgress.achievements.includes('scheduling-strategist')
        ? 'Scheduling Strategist'
        : 'OS Explorer',
      isCurrentUser: true,
      isSampleData: false,
    };

    const combined = [...SAMPLE_LEADERBOARD, userEntry];

    // Sort by points descending
    combined.sort((a, b) => b.points - a.points);

    // Assign ranks
    combined.forEach((entry, idx) => {
      entry.rank = idx + 1;
    });

    return combined;
  }
}

export const leaderboardService = new LeaderboardService();
