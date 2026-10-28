import { UserProgress, MnemonicItem, SpacedRepetitionItem, Achievement } from '../types';

const PROGRESS_STORAGE_KEY = 'os_learning_lab_progress_v1';

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-steps',
    title: 'First Steps',
    description: 'Complete your first OS learning lesson or simulator.',
    icon: 'Footprints',
    category: 'general',
    progress: 0,
    maxProgress: 1,
    pointsReward: 20,
  },
  {
    id: 'deadlock-detective',
    title: 'Deadlock Detective',
    description: 'Learn the 4 necessary conditions and explore the Resource Allocation Graph.',
    icon: 'Search',
    category: 'banker',
    progress: 0,
    maxProgress: 1,
    pointsReward: 25,
  },
  {
    id: 'bankers-master',
    title: "Banker's Master",
    description: 'Successfully execute the safety algorithm and complete a resource request simulation.',
    icon: 'ShieldCheck',
    category: 'banker',
    progress: 0,
    maxProgress: 2,
    pointsReward: 50,
  },
  {
    id: 'scheduling-strategist',
    title: 'Scheduling Strategist',
    description: 'Compare FCFS, SJF, and Round Robin on the interactive Gantt chart.',
    icon: 'Clock',
    category: 'scheduling',
    progress: 0,
    maxProgress: 3,
    pointsReward: 35,
  },
  {
    id: 'memory-wizard',
    title: 'Memory Wizard',
    description: 'Simulate First Fit, Best Fit, and Worst Fit memory allocation.',
    icon: 'Cpu',
    category: 'general',
    progress: 0,
    maxProgress: 3,
    pointsReward: 35,
  },
  {
    id: 'quiz-streak',
    title: 'Quiz Champion',
    description: 'Score 80% or higher in any Quiz Arena challenge.',
    icon: 'Trophy',
    category: 'quiz',
    progress: 0,
    maxProgress: 1,
    pointsReward: 40,
  },
  {
    id: 'multiplayer-challenger',
    title: 'Multiplayer Challenger',
    description: 'Host or participate in a multiplayer quiz battle.',
    icon: 'Users',
    category: 'quiz',
    progress: 0,
    maxProgress: 1,
    pointsReward: 30,
  },
  {
    id: 'memory-palace-pro',
    title: 'Memory Palace Scholar',
    description: 'Master 3 mnemonic techniques or flashcard challenges.',
    icon: 'Sparkles',
    category: 'general',
    progress: 0,
    maxProgress: 3,
    pointsReward: 30,
  },
];

class ProgressService {
  private progress: UserProgress;
  private listeners: Set<(progress: UserProgress) => void> = new Set();

  constructor() {
    this.progress = this.loadProgress();
    this.checkStreak();
  }

  private loadProgress(): UserProgress {
    try {
      const stored = localStorage.getItem(PROGRESS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load progress from localStorage', e);
    }

    return {
      completedLessons: ['banker-theory'], // starter credit
      lastVisitedPath: '/banker',
      points: 40,
      streakDays: 1,
      lastActiveDate: new Date().toISOString().split('T')[0],
      achievements: ['first-steps'],
      quizScores: {},
      bookmarkedNotes: ['banker-notes'],
      customMnemonics: [],
      spacedRepetitionQueue: [],
    };
  }

  private saveProgress() {
    try {
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(this.progress));
    } catch (e) {
      console.warn('Failed to save progress to localStorage', e);
    }
    this.notify();
  }

  private notify() {
    this.listeners.forEach(fn => fn(this.progress));
  }

  public subscribe(listener: (progress: UserProgress) => void): () => void {
    this.listeners.add(listener);
    listener(this.progress);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getProgress(): UserProgress {
    return { ...this.progress };
  }

  private checkStreak() {
    const today = new Date().toISOString().split('T')[0];
    const lastDate = this.progress.lastActiveDate;

    if (!lastDate) {
      this.progress.lastActiveDate = today;
      this.progress.streakDays = 1;
      this.saveProgress();
      return;
    }

    if (lastDate !== today) {
      const last = new Date(lastDate);
      const curr = new Date(today);
      const diffDays = Math.round((curr.getTime() - last.getTime()) / (1000 * 3600 * 24));

      if (diffDays === 1) {
        this.progress.streakDays += 1;
      } else if (diffDays > 1) {
        this.progress.streakDays = 1;
      }
      this.progress.lastActiveDate = today;
      this.saveProgress();
    }
  }

  public completeLesson(lessonId: string, pointsReward: number = 20) {
    if (!this.progress.completedLessons.includes(lessonId)) {
      this.progress.completedLessons.push(lessonId);
      this.addPoints(pointsReward);
      this.checkAchievementTriggers();
      this.saveProgress();
    }
  }

  public isLessonCompleted(lessonId: string): boolean {
    return this.progress.completedLessons.includes(lessonId);
  }

  public setLastVisitedPath(path: string) {
    this.progress.lastVisitedPath = path;
    this.saveProgress();
  }

  public addPoints(amount: number) {
    this.progress.points += amount;
    this.saveProgress();
  }

  public recordQuizScore(topic: string, score: number, accuracy: number) {
    const prevBest = this.progress.quizScores[topic] || 0;
    if (score > prevBest) {
      this.progress.quizScores[topic] = score;
    }
    this.addPoints(score);

    if (accuracy >= 80) {
      this.unlockAchievement('quiz-streak');
    }
    this.saveProgress();
  }

  public toggleBookmarkNote(noteId: string): boolean {
    const idx = this.progress.bookmarkedNotes.indexOf(noteId);
    let isBookmarked = false;
    if (idx === -1) {
      this.progress.bookmarkedNotes.push(noteId);
      isBookmarked = true;
    } else {
      this.progress.bookmarkedNotes.splice(idx, 1);
      isBookmarked = false;
    }
    this.saveProgress();
    return isBookmarked;
  }

  public unlockAchievement(achievementId: string) {
    if (!this.progress.achievements.includes(achievementId)) {
      this.progress.achievements.push(achievementId);
      const ach = INITIAL_ACHIEVEMENTS.find(a => a.id === achievementId);
      if (ach) {
        this.addPoints(ach.pointsReward);
      }
      this.saveProgress();
    }
  }

  public checkAchievementTriggers() {
    if (this.progress.completedLessons.length >= 1) {
      this.unlockAchievement('first-steps');
    }
    if (this.progress.completedLessons.includes('banker-lab')) {
      this.unlockAchievement('bankers-master');
    }
    if (this.progress.completedLessons.includes('cpu-scheduling')) {
      this.unlockAchievement('scheduling-strategist');
    }
    if (this.progress.completedLessons.includes('memory-allocation')) {
      this.unlockAchievement('memory-wizard');
    }
  }

  public resetProgress() {
    this.progress = {
      completedLessons: [],
      lastVisitedPath: '/dashboard',
      points: 0,
      streakDays: 1,
      lastActiveDate: new Date().toISOString().split('T')[0],
      achievements: [],
      quizScores: {},
      bookmarkedNotes: [],
      customMnemonics: [],
      spacedRepetitionQueue: [],
    };
    this.saveProgress();
  }
}

export const progressService = new ProgressService();
