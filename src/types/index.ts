// Core types for OS Learning Lab

export type ResourceVector = number[];
export type ResourceMatrix = number[][];

export interface BankerState {
  processNames: string[];
  resourceNames: string[];
  allocation: ResourceMatrix;
  max: ResourceMatrix;
  available: ResourceVector;
  need?: ResourceMatrix;
}

export type AlgorithmState = 'idle' | 'eligible' | 'executing' | 'completed' | 'denied' | 'waiting';

export interface BankerStep {
  stepNumber: number;
  processIndex: number;
  processName: string;
  workBefore: ResourceVector;
  needVector: ResourceVector;
  allocationVector: ResourceVector;
  isEligible: boolean;
  reason: string;
  workAfter: ResourceVector;
  finishedProcesses: boolean[];
  safeSequenceSoFar: string[];
  speechText: string;
}

export interface BankerSafetyResult {
  isSafe: boolean;
  safeSequence: string[];
  steps: BankerStep[];
  finalWork: ResourceVector;
  errorMessage?: string;
}

export interface RequestSimulationResult {
  canBeGranted: boolean;
  reason: string;
  errorStage?: 'exceeds_max' | 'unavailable' | 'unsafe';
  newAllocation?: ResourceMatrix;
  newNeed?: ResourceMatrix;
  newAvailable?: ResourceVector;
  safetyResult?: BankerSafetyResult;
}

// Topics & Navigation
export interface LessonItem {
  id: string;
  title: string;
  category: string;
  path: string;
  isImplemented: boolean;
  description: string;
  estimatedMinutes: number;
  badge?: string;
  tags: string[];
}

export interface CategoryGroup {
  id: string;
  title: string;
  iconName: string;
  isPrimary?: boolean;
  lessons: LessonItem[];
}

// User Progress & Settings
export interface UserProgress {
  completedLessons: string[];
  lastVisitedPath: string;
  points: number;
  streakDays: number;
  lastActiveDate: string;
  achievements: string[];
  quizScores: Record<string, number>;
  bookmarkedNotes: string[];
  customMnemonics: MnemonicItem[];
  spacedRepetitionQueue: SpacedRepetitionItem[];
}

export interface VoiceSettings {
  enabled: boolean;
  speechRate: number;
  pitch: number;
  volume: number;
  selectedVoiceURI: string;
  autoNarrateSteps: boolean;
}

// Memory Palace Types
export interface MnemonicItem {
  id: string;
  title: string;
  acronym: string;
  topic: string;
  meaning: { letter: string; word: string; explanation: string }[];
  formalDefinition: string;
  example: string;
  isCustom?: boolean;
  mastered?: boolean;
}

export interface SpacedRepetitionItem {
  id: string;
  conceptTitle: string;
  topic: string;
  nextReviewDate: string; // ISO date string
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
}

// Quiz Arena Types
export type QuestionDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';
export type QuestionType = 'mcq' | 'true-false' | 'numerical';

export interface QuizQuestion {
  id: string;
  topic: string;
  subtopic?: string;
  difficulty: QuestionDifficulty;
  type: QuestionType;
  prompt: string;
  options?: string[]; // for mcq & true-false
  correctAnswer: string | number | number[]; // index or string or numerical value
  explanation: string;
  formulaOrHint?: string;
  tolerance?: number; // for numerical
}

export interface QuizAttempt {
  id: string;
  topic: string;
  date: string;
  score: number;
  totalQuestions: number;
  accuracy: number;
  timeSpentSeconds: number;
  answers: {
    questionId: string;
    userAnswer: any;
    isCorrect: boolean;
  }[];
}

export interface MultiplayerPlayer {
  id: string;
  name: string;
  score: number;
  avatarColor: string;
  isReady: boolean;
  answeredCount: number;
  isHost: boolean;
}

export interface MultiplayerRoom {
  code: string;
  hostId: string;
  topic: string;
  difficulty: QuestionDifficulty;
  questionCount: number;
  timePerQuestion: number;
  state: 'waiting' | 'in-progress' | 'completed';
  currentQuestionIndex: number;
  players: MultiplayerPlayer[];
  questions: QuizQuestion[];
}

// Leaderboard Types
export interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  avatarBg: string;
  points: number;
  quizzesCompleted: number;
  accuracy: number;
  wins: number;
  badge: string;
  isCurrentUser?: boolean;
  isSampleData?: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'banker' | 'scheduling' | 'quiz' | 'general';
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
  pointsReward: number;
}

// Handwritten Notes Types
export interface NoteSection {
  title: string;
  content: string;
  diagramSvg?: string;
  formulaBox?: string;
  highlightNote?: string;
  examTip?: string;
}

export interface HandwrittenNoteTopic {
  id: string;
  title: string;
  category: string;
  readTimeMinutes: number;
  lastUpdated: string;
  subtitle: string;
  sections: NoteSection[];
  dryRunTable?: {
    headers: string[];
    rows: (string | number)[][];
  };
  vivaQuestions: { q: string; a: string }[];
  keyFormulas: string[];
}
