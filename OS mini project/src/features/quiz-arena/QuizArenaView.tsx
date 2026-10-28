import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Users,
  Timer,
  Play,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Bookmark,
  Share2,
  Copy,
  Zap,
  Target,
  Swords,
  Flame,
} from 'lucide-react';
import { QUESTION_BANK } from '../../data/questionBankData';
import { QuizQuestion, MultiplayerRoom, MultiplayerPlayer } from '../../types';
import { progressService } from '../../services/progressService';
import { speechService } from '../../services/speechService';

export const QuizArenaView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'solo' | 'multiplayer' | 'special'>('solo');

  // Solo Quiz Setup
  const [selectedTopic, setSelectedTopic] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [quizStarted, setQuizStarted] = useState<boolean>(false);
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [activeQuestions, setActiveQuestions] = useState<QuizQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<number, any>>({});
  const [markedForReview, setMarkedForReview] = useState<number[]>([]);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(120);

  // Multiplayer State (Local Pass-and-Play / Room Code)
  const [multiplayerMode, setMultiplayerMode] = useState<'lobby' | 'room' | 'in-game' | 'results'>('lobby');
  const [roomCode, setRoomCode] = useState<string>('OS-7492');
  const [playerName, setPlayerName] = useState<string>('You');
  const [joinCodeInput, setJoinCodeInput] = useState<string>('');
  const [players, setPlayers] = useState<MultiplayerPlayer[]>([
    { id: '1', name: 'You (Host)', score: 0, avatarColor: 'bg-primary-blue', isReady: true, answeredCount: 0, isHost: true },
    { id: '2', name: 'Rohan (Local Player 2)', score: 0, avatarColor: 'bg-violet-600', isReady: true, answeredCount: 0, isHost: false },
  ]);
  const [multiQIndex, setMultiQIndex] = useState<number>(0);

  // Timer countdown for solo
  useEffect(() => {
    let interval: any = null;
    if (quizStarted && !quizSubmitted && timeLeftSeconds > 0) {
      interval = setInterval(() => {
        setTimeLeftSeconds(prev => prev - 1);
      }, 1000);
    } else if (timeLeftSeconds === 0 && quizStarted && !quizSubmitted) {
      handleSubmitQuiz();
    }
    return () => clearInterval(interval);
  }, [quizStarted, quizSubmitted, timeLeftSeconds]);

  // Start Solo Quiz
  const handleStartSolo = () => {
    let pool = [...QUESTION_BANK];
    if (selectedTopic !== 'All') {
      pool = pool.filter(q => q.topic === selectedTopic);
    }
    if (selectedDifficulty !== 'All') {
      pool = pool.filter(q => q.difficulty === selectedDifficulty);
    }
    // Shuffle & take questionCount
    pool.sort(() => 0.5 - Math.random());
    const selected = pool.slice(0, Math.min(questionCount, pool.length));

    setActiveQuestions(selected);
    setUserAnswers({});
    setMarkedForReview([]);
    setCurrentQIndex(0);
    setTimeLeftSeconds(selected.length * 30);
    setQuizStarted(true);
    setQuizSubmitted(false);

    speechService.speak(`Starting quiz with ${selected.length} questions. You have ${selected.length * 30} seconds.`);
  };

  // Submit Solo Quiz
  const handleSubmitQuiz = () => {
    setQuizSubmitted(true);
    let correctCount = 0;
    activeQuestions.forEach((q, idx) => {
      const userAns = userAnswers[idx];
      if (q.type === 'numerical') {
        if (parseFloat(userAns) === q.correctAnswer) correctCount++;
      } else {
        if (userAns === q.correctAnswer) correctCount++;
      }
    });

    const score = correctCount * 10;
    const accuracy = Math.round((correctCount / (activeQuestions.length || 1)) * 100);
    progressService.recordQuizScore(selectedTopic, score, accuracy);
    speechService.speak(`Quiz completed! You scored ${score} points with ${accuracy}% accuracy.`);
  };

  const handleSelectOption = (qIdx: number, val: any) => {
    setUserAnswers(prev => ({ ...prev, [qIdx]: val }));
  };

  const handleToggleMarkReview = (qIdx: number) => {
    setMarkedForReview(prev =>
      prev.includes(qIdx) ? prev.filter(x => x !== qIdx) : [...prev, qIdx]
    );
  };

  // Multiplayer room creation
  const handleCreateRoom = () => {
    const code = `OS-${Math.floor(1000 + Math.random() * 9000)}`;
    setRoomCode(code);
    setMultiplayerMode('room');
  };

  const handleJoinRoom = () => {
    if (!joinCodeInput.trim()) return;
    setRoomCode(joinCodeInput.toUpperCase());
    setMultiplayerMode('room');
  };

  const handleStartMultiMatch = () => {
    setMultiplayerMode('in-game');
    setMultiQIndex(0);
    speechService.speak('Multiplayer match started! Players answer simultaneously.');
  };

  const handleMultiAnswer = (pId: string, isCorrect: boolean) => {
    setPlayers(prev =>
      prev.map(p => {
        if (p.id === pId) {
          return {
            ...p,
            score: p.score + (isCorrect ? 10 : 0),
            answeredCount: p.answeredCount + 1,
          };
        }
        return p;
      })
    );
  };

  const currentQ = activeQuestions[currentQIndex];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="bg-surface p-6 rounded-3xl border border-app-border shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1 font-mono">
            <Trophy className="w-4 h-4" />
            <span>Competitive Learning Arena</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-text-main tracking-tight">
            Quiz Arena & Multiplayer Challenges
          </h1>
          <p className="text-xs text-text-muted mt-1 max-w-2xl leading-relaxed">
            Test your knowledge against time, solve numerical algorithm problems, and challenge classmates in live room battles with synchronized scoring.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('solo')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'solo'
                ? 'bg-primary-blue text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Solo Arena
          </button>
          <button
            onClick={() => setActiveTab('multiplayer')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'multiplayer'
                ? 'bg-violet-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Multiplayer Rooms
          </button>
          <button
            onClick={() => setActiveTab('special')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'special'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Special Modes
          </button>
        </div>
      </div>

      {/* TAB 1: SOLO QUIZ */}
      {activeTab === 'solo' && (
        <div className="space-y-6">
          {!quizStarted ? (
            /* Quiz Lobby & Filter Selection */
            <div className="bg-surface p-6 rounded-2xl border border-app-border shadow-subtle space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-main pb-2 border-b border-app-border">
                Configure Your Practice Round
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1.5">
                    Category Topic
                  </label>
                  <select
                    value={selectedTopic}
                    onChange={e => setSelectedTopic(e.target.value)}
                    className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="All">All OS Topics Mixed</option>
                    <option value="Banker's Algorithm">Banker's Algorithm</option>
                    <option value="Deadlocks">Deadlocks & Conditions</option>
                    <option value="CPU Scheduling">CPU Scheduling</option>
                    <option value="Memory Management">Memory Management</option>
                    <option value="Page Replacement">Page Replacement</option>
                    <option value="Process Synchronization">Process Synchronization</option>
                    <option value="Disk Scheduling">Disk Scheduling</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1.5">
                    Difficulty Level
                  </label>
                  <select
                    value={selectedDifficulty}
                    onChange={e => setSelectedDifficulty(e.target.value)}
                    className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="All">All Difficulties</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced (Numerical & Proofs)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1.5">
                    Question Count
                  </label>
                  <div className="flex space-x-2">
                    {[5, 10, 15, 20].map(c => (
                      <button
                        key={c}
                        onClick={() => setQuestionCount(c)}
                        className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                          questionCount === c
                            ? 'bg-blue-50 border-primary-blue text-primary-blue shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {c} Qs
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={handleStartSolo}
                  className="flex items-center space-x-2 px-6 py-2.5 bg-primary-blue text-white rounded-xl text-xs font-bold hover:bg-blue-600 shadow-xs transition-colors"
                >
                  <Play className="w-4 h-4" />
                  <span>Start Quiz Session</span>
                </button>
              </div>
            </div>
          ) : !quizSubmitted ? (
            /* Active Solo Question View */
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Question Area (3 Cols) */}
              <div className="lg:col-span-3 bg-surface p-6 rounded-2xl border border-app-border shadow-subtle space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-app-border">
                  <span className="text-xs font-bold font-mono text-primary-blue bg-blue-50 px-2.5 py-1 rounded-lg">
                    Question {currentQIndex + 1} of {activeQuestions.length} ({currentQ.difficulty})
                  </span>

                  {/* Timer */}
                  <div className="flex items-center space-x-1.5 font-mono text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-lg border border-amber-200">
                    <Timer className="w-4 h-4 text-amber-600" />
                    <span>
                      {Math.floor(timeLeftSeconds / 60)}:
                      {(timeLeftSeconds % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm sm:text-base font-bold text-text-main leading-relaxed">
                    {currentQ.prompt}
                  </h3>

                  {currentQ.formulaOrHint && (
                    <div className="text-[11px] text-slate-500 font-mono bg-slate-50 p-2 rounded-lg border border-slate-200">
                      Hint: {currentQ.formulaOrHint}
                    </div>
                  )}
                </div>

                {/* Options / Input */}
                <div className="space-y-2.5 pt-2">
                  {currentQ.type === 'numerical' ? (
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">
                        Enter Numerical Value:
                      </label>
                      <input
                        type="number"
                        value={userAnswers[currentQIndex] ?? ''}
                        onChange={e => handleSelectOption(currentQIndex, e.target.value)}
                        placeholder="Enter calculated number..."
                        className="w-full max-w-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-sm"
                      />
                    </div>
                  ) : (
                    currentQ.options?.map((opt, oIdx) => {
                      const isSelected = userAnswers[currentQIndex] === oIdx;

                      return (
                        <button
                          key={oIdx}
                          onClick={() => handleSelectOption(currentQIndex, oIdx)}
                          className={`w-full text-left p-3.5 rounded-xl border text-xs font-medium transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-blue-50/80 border-primary-blue text-primary-blue shadow-xs font-bold'
                              : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                          }`}
                        >
                          <span>{opt}</span>
                          <span
                            className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                              isSelected ? 'border-primary-blue bg-primary-blue text-white' : 'border-slate-300'
                            }`}
                          >
                            {isSelected && '✓'}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>

                {/* Bottom Navigation */}
                <div className="flex items-center justify-between pt-4 border-t border-app-border text-xs">
                  <button
                    onClick={() => handleToggleMarkReview(currentQIndex)}
                    className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl border font-semibold ${
                      markedForReview.includes(currentQIndex)
                        ? 'bg-amber-100 border-amber-300 text-amber-900'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>{markedForReview.includes(currentQIndex) ? 'Marked for Review' : 'Mark for Review'}</span>
                  </button>

                  <div className="flex space-x-2">
                    <button
                      disabled={currentQIndex === 0}
                      onClick={() => setCurrentQIndex(prev => prev - 1)}
                      className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-40"
                    >
                      Previous
                    </button>

                    {currentQIndex < activeQuestions.length - 1 ? (
                      <button
                        onClick={() => setCurrentQIndex(prev => prev + 1)}
                        className="px-4 py-1.5 bg-primary-blue text-white font-bold rounded-xl hover:bg-blue-600"
                      >
                        Next
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmitQuiz}
                        className="px-5 py-1.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-xs"
                      >
                        Submit Quiz
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Question Palette (1 Col) */}
              <div className="bg-surface p-5 rounded-2xl border border-app-border shadow-subtle space-y-4">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Question Palette
                </span>

                <div className="grid grid-cols-4 gap-2">
                  {activeQuestions.map((_, idx) => {
                    const isAnswered = userAnswers[idx] !== undefined;
                    const isMarked = markedForReview.includes(idx);
                    const isCurrent = currentQIndex === idx;

                    let bg = 'bg-slate-100 text-slate-600';
                    if (isCurrent) bg = 'ring-2 ring-blue-500 font-bold';
                    if (isMarked) bg += ' bg-amber-200 text-amber-900';
                    else if (isAnswered) bg += ' bg-emerald-100 text-emerald-900';

                    return (
                      <button
                        key={idx}
                        onClick={() => setCurrentQIndex(idx)}
                        className={`h-9 rounded-lg font-mono text-xs flex items-center justify-center transition-all ${bg}`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-3 border-t border-slate-100 text-[11px] space-y-1 text-slate-500">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-3 h-3 rounded bg-emerald-200" />
                    <span>Answered</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-3 h-3 rounded bg-amber-200" />
                    <span>Marked for Review</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-3 h-3 rounded bg-slate-200" />
                    <span>Unanswered</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Results View */
            <div className="bg-surface p-6 rounded-2xl border border-app-border shadow-subtle space-y-6">
              <div className="text-center space-y-2 py-4 border-b border-app-border">
                <Trophy className="w-10 h-10 text-amber-500 mx-auto" />
                <h3 className="text-xl font-black text-text-main">Quiz Results & Review</h3>
                <p className="text-xs text-text-muted">
                  Review your answers and learn from the step-by-step explanations below.
                </p>
              </div>

              {/* Review Questions List */}
              <div className="space-y-4">
                {activeQuestions.map((q, idx) => {
                  const userAns = userAnswers[idx];
                  const isCorrect =
                    q.type === 'numerical'
                      ? parseFloat(userAns) === q.correctAnswer
                      : userAns === q.correctAnswer;

                  return (
                    <div
                      key={q.id}
                      className={`p-4 rounded-xl border text-xs space-y-2 ${
                        isCorrect
                          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                          : 'bg-red-50/70 border-red-200 text-red-950'
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        {isCorrect ? (
                          <CheckCircle2 className="w-4 h-4 text-app-success shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-4 h-4 text-app-error shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className="font-bold">
                            Q{idx + 1}: {q.prompt}
                          </p>
                          <div className="mt-1 space-y-0.5 text-[11px] opacity-90">
                            <p>
                              Your Answer: <strong>{q.type === 'numerical' ? userAns : q.options?.[userAns] ?? 'Unanswered'}</strong>
                            </p>
                            {!isCorrect && (
                              <p className="text-emerald-800">
                                Correct Answer: <strong>{q.type === 'numerical' ? q.correctAnswer : q.options?.[q.correctAnswer as number]}</strong>
                              </p>
                            )}
                          </div>
                          <p className="mt-2 text-[11px] font-sans border-t border-current/20 pt-1.5 opacity-90">
                            {q.explanation}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setQuizStarted(false)}
                  className="px-5 py-2 bg-primary-blue text-white rounded-xl text-xs font-bold hover:bg-blue-600"
                >
                  Configure Another Quiz
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MULTIPLAYER */}
      {activeTab === 'multiplayer' && (
        <div className="space-y-6">
          {multiplayerMode === 'lobby' ? (
            <div className="bg-surface p-6 rounded-2xl border border-app-border shadow-subtle space-y-6">
              <div className="flex items-center space-x-2 text-violet-600">
                <Users className="w-5 h-5" />
                <h3 className="text-sm font-bold text-text-main">
                  Multiplayer Quiz Room Lobby (Pass-and-Play & Room Codes)
                </h3>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                Compete with friends on the same device or generate a unique room code to synchronize quiz challenges.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* Create Room */}
                <div className="p-5 bg-gradient-to-tr from-violet-50 to-indigo-50 border border-violet-200 rounded-2xl space-y-3">
                  <h4 className="font-bold text-xs text-violet-900">Create Private Room</h4>
                  <p className="text-[11px] text-slate-600">
                    Host a match, configure category and question timer, and invite classmates.
                  </p>
                  <button
                    onClick={handleCreateRoom}
                    className="w-full py-2 bg-violet-600 text-white rounded-xl text-xs font-bold hover:bg-violet-700 shadow-xs"
                  >
                    Create Room Code
                  </button>
                </div>

                {/* Join Room */}
                <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <h4 className="font-bold text-xs text-slate-800">Join Existing Room</h4>
                  <p className="text-[11px] text-slate-600">
                    Enter the 4-digit code provided by your host.
                  </p>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="e.g. OS-8492"
                      value={joinCodeInput}
                      onChange={e => setJoinCodeInput(e.target.value)}
                      className="flex-1 p-2 bg-white border border-slate-300 rounded-xl font-mono text-xs font-bold"
                    />
                    <button
                      onClick={handleJoinRoom}
                      className="px-4 py-2 bg-primary-blue text-white rounded-xl text-xs font-bold"
                    >
                      Join
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : multiplayerMode === 'room' ? (
            /* Room Waiting Lobby */
            <div className="bg-surface p-6 rounded-2xl border border-app-border shadow-subtle space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-app-border">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
                    Room Code:
                  </span>
                  <div className="text-2xl font-black text-primary-blue font-mono tracking-widest">
                    {roomCode}
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-semibold text-emerald-800">Ready to start</span>
                </div>
              </div>

              {/* Participants list */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 block">Connected Participants (2):</span>
                {players.map(p => (
                  <div
                    key={p.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs font-semibold"
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className={`w-7 h-7 rounded-full ${p.avatarColor} text-white flex items-center justify-center font-bold text-[11px]`}>
                        {p.name[0]}
                      </div>
                      <span>{p.name}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-mono">
                      READY
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-app-border">
                <button
                  onClick={() => setMultiplayerMode('lobby')}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800"
                >
                  Leave Room
                </button>
                <button
                  onClick={handleStartMultiMatch}
                  className="px-6 py-2.5 bg-primary-blue text-white rounded-xl text-xs font-bold hover:bg-blue-600 shadow-xs"
                >
                  Start Multiplayer Match
                </button>
              </div>
            </div>
          ) : (
            /* In-game pass and play challenge */
            <div className="bg-surface p-6 rounded-2xl border border-app-border shadow-subtle space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-app-border">
                <span className="text-xs font-bold text-violet-700 font-mono">
                  Multiplayer Battle | Round {multiQIndex + 1}
                </span>
                <div className="flex items-center space-x-3 text-xs font-mono">
                  {players.map(p => (
                    <span key={p.id} className="font-bold">
                      {p.name.split(' ')[0]}: {p.score} pts
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <p className="text-sm font-bold text-slate-800">
                  {QUESTION_BANK[multiQIndex]?.prompt}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  {QUESTION_BANK[multiQIndex]?.options?.map((opt, oIdx) => (
                    <div key={oIdx} className="flex space-x-2">
                      <button
                        onClick={() => handleMultiAnswer('1', oIdx === QUESTION_BANK[multiQIndex].correctAnswer)}
                        className="flex-1 p-2 bg-white border border-slate-200 rounded-lg text-left text-xs hover:border-blue-400"
                      >
                        P1: {opt}
                      </button>
                      <button
                        onClick={() => handleMultiAnswer('2', oIdx === QUESTION_BANK[multiQIndex].correctAnswer)}
                        className="flex-1 p-2 bg-white border border-slate-200 rounded-lg text-left text-xs hover:border-violet-400"
                      >
                        P2: {opt}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                {multiQIndex < 3 ? (
                  <button
                    onClick={() => setMultiQIndex(prev => prev + 1)}
                    className="px-5 py-2 bg-primary-blue text-white rounded-xl text-xs font-bold"
                  >
                    Next Question
                  </button>
                ) : (
                  <button
                    onClick={() => setMultiplayerMode('lobby')}
                    className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                  >
                    Finish Match & Return to Lobby
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SPECIAL MODES */}
      {activeTab === 'special' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { title: 'Speed Run', icon: <Zap className="w-5 h-5 text-amber-500" />, desc: 'Answer as many rapid questions as possible within 2 minutes.' },
            { title: 'Boss Battle', icon: <Swords className="w-5 h-5 text-red-500" />, desc: 'Tackle the hardest university exam numericals in Banker and Scheduling.' },
            { title: 'Daily Challenge', icon: <Flame className="w-5 h-5 text-orange-500" />, desc: 'A curated daily set of 5 OS problems to keep your study streak alive.' },
          ].map(sm => (
            <div
              key={sm.title}
              className="bg-surface p-5 rounded-2xl border border-app-border shadow-subtle space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  {sm.icon}
                  <h4 className="text-xs font-bold text-text-main">{sm.title}</h4>
                </div>
                <p className="text-xs text-text-muted leading-relaxed">{sm.desc}</p>
              </div>
              <button
                onClick={handleStartSolo}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-text-main rounded-xl text-xs font-bold transition-colors"
              >
                Launch Mode
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
