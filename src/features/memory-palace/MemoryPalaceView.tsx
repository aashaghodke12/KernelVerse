import React, { useState } from 'react';
import {
  BrainCircuit,
  Sparkles,
  BookOpen,
  Award,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Plus,
  ArrowRight,
  Clock,
  Layers,
  HelpCircle,
  Trophy,
} from 'lucide-react';
import {
  CORE_MNEMONICS,
  BANKER_STORY_STEPS,
  BANKER_STORY_QUIZ,
} from '../../data/mnemonicsData';
import { MnemonicItem } from '../../types';
import { validateCustomSafeSequence, DEFAULT_BANKER_STATE } from '../../algorithms/bankerAlgorithm';
import { progressService } from '../../services/progressService';
import { speechService } from '../../services/speechService';

export const MemoryPalaceView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'techniques' | 'story' | 'mnemonics' | 'games' | 'spaced-rep'>('story');

  // Vault Story state
  const [currentStoryStep, setCurrentStoryStep] = useState<number>(0);
  const [storyQuizAnswers, setStoryQuizAnswers] = useState<Record<number, number>>({});
  const [storyQuizSubmitted, setStoryQuizSubmitted] = useState<boolean>(false);

  // Mnemonic cards state
  const [mnemonics, setMnemonics] = useState<MnemonicItem[]>(CORE_MNEMONICS);
  const [newMnemonicTitle, setNewMnemonicTitle] = useState('');
  const [newMnemonicAcronym, setNewMnemonicAcronym] = useState('');
  const [newMnemonicDefinition, setNewMnemonicDefinition] = useState('');
  const [showAddMnemonicModal, setShowAddMnemonicModal] = useState(false);

  // Games state
  const [activeGame, setActiveGame] = useState<'match' | 'flip' | 'arrange' | 'fix' | 'recall' | 'safe-challenge' | 'battle'>('safe-challenge');

  // Safe Sequence Challenge state
  const [proposedSeq, setProposedSeq] = useState<string[]>([]);
  const [safeSeqResult, setSafeSeqResult] = useState<{ isValid: boolean; message: string } | null>(null);

  // Match Game state
  const MATCH_PAIRS = [
    { term: 'Mutual Exclusion', def: 'Resource cannot be shared by multiple threads simultaneously' },
    { term: 'Belady’s Anomaly', def: 'FIFO page faults increasing despite adding more physical frames' },
    { term: 'Hold and Wait', def: 'Holding allocated resources while requesting additional locked ones' },
    { term: 'Safe State', def: 'Guaranteed execution path where deadlock is mathematically impossible' },
  ];
  const [selectedMatchTerm, setSelectedMatchTerm] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);

  // Flip Cards state
  const FLIP_CARDS = [
    { front: 'Need Matrix Formula', back: 'Need[i][j] = Max[i][j] - Allocation[i][j]' },
    { front: 'Turnaround Time (TAT)', back: 'TAT = Completion Time - Arrival Time' },
    { front: 'Waiting Time (WT)', back: 'WT = Turnaround Time - Burst Time' },
    { front: 'Coffman Conditions', back: 'Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait' },
  ];
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});

  // Arrange Steps Game state
  const ARRANGE_STEPS = [
    { id: '1', text: 'Initialize Work = Available and Finish = [false, ...]' },
    { id: '2', text: 'Find an unfinished process Pi where Need[i] ≤ Work' },
    { id: '3', text: 'Provisional completion: Work = Work + Allocation[i] and Finish[i] = true' },
    { id: '4', text: 'If all processes finish, state is SAFE; otherwise UNSAFE' },
  ];
  const [userArranged, setUserArranged] = useState<string[]>(['3', '1', '4', '2']);
  const [arrangeVerdict, setArrangeVerdict] = useState<boolean | null>(null);

  // Recall timer
  const [recallSecondsLeft, setRecallSecondsLeft] = useState<number>(60);
  const [recallActive, setRecallActive] = useState<boolean>(false);
  const [showRecallModel, setShowRecallModel] = useState<boolean>(false);

  // Story step progression
  const handleStoryNext = () => {
    if (currentStoryStep < BANKER_STORY_STEPS.length - 1) {
      const next = currentStoryStep + 1;
      setCurrentStoryStep(next);
      speechService.speak(BANKER_STORY_STEPS[next].narrative);
    }
  };

  const handleStoryPrev = () => {
    if (currentStoryStep > 0) {
      const prev = currentStoryStep - 1;
      setCurrentStoryStep(prev);
      speechService.speak(BANKER_STORY_STEPS[prev].narrative);
    }
  };

  // Safe Seq Challenge validation
  const handleCheckSafeChallenge = () => {
    const res = validateCustomSafeSequence(DEFAULT_BANKER_STATE, proposedSeq);
    setSafeSeqResult({ isValid: res.isValid, message: res.message });
    if (res.isValid) {
      progressService.addPoints(25);
      progressService.unlockAchievement('memory-palace-pro');
    }
  };

  // Match click handler
  const handleMatchClick = (term: string, isDef: boolean) => {
    if (!selectedMatchTerm) {
      setSelectedMatchTerm(term);
    } else {
      const pair = MATCH_PAIRS.find(p => p.term === selectedMatchTerm && p.def === term);
      const reversePair = MATCH_PAIRS.find(p => p.def === selectedMatchTerm && p.term === term);
      if (pair || reversePair) {
        setMatchedPairs(prev => [...prev, selectedMatchTerm, term]);
        setSelectedMatchTerm(null);
      } else {
        setSelectedMatchTerm(null);
      }
    }
  };

  // Check arranged steps
  const handleCheckArrangement = () => {
    const isCorrect = userArranged.join(',') === '1,2,3,4';
    setArrangeVerdict(isCorrect);
    if (isCorrect) {
      progressService.addPoints(15);
    }
  };

  const currentStepData = BANKER_STORY_STEPS[currentStoryStep];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="bg-surface p-6 rounded-3xl border border-app-border shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-secondary-violet uppercase tracking-wider mb-1 font-mono">
            <BrainCircuit className="w-4 h-4" />
            <span>OS Memory Palace</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-text-main tracking-tight">
            Remember OS Concepts for Life
          </h1>
          <p className="text-xs text-text-muted mt-1 max-w-2xl leading-relaxed">
            Overcome exam anxiety using visual analogies, mnemonic anchors (MEHN, NRRWT), the Banker’s Safety Vault story, and 7 interactive memory challenge games.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-violet-50 text-secondary-violet border border-violet-200 px-3.5 py-2 rounded-2xl text-xs font-bold font-mono">
          <Sparkles className="w-4 h-4 text-violet-600" />
          <span>Spaced Repetition Active</span>
        </div>
      </div>

      {/* Palace Navigation Tabs */}
      <div className="flex items-center space-x-2 p-1.5 bg-slate-100 rounded-2xl border border-app-border text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('story')}
          className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
            activeTab === 'story'
              ? 'bg-white text-primary-blue shadow-xs font-bold'
              : 'text-text-muted hover:text-text-main'
          }`}
        >
          1. The Banker's Safety Vault Story
        </button>

        <button
          onClick={() => setActiveTab('mnemonics')}
          className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
            activeTab === 'mnemonics'
              ? 'bg-white text-primary-blue shadow-xs font-bold'
              : 'text-text-muted hover:text-text-main'
          }`}
        >
          2. Mnemonic Flashcards (MEHN, NRRWT)
        </button>

        <button
          onClick={() => setActiveTab('games')}
          className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
            activeTab === 'games'
              ? 'bg-white text-primary-blue shadow-xs font-bold'
              : 'text-text-muted hover:text-text-main'
          }`}
        >
          3. 7 Memory Challenge Games
        </button>
      </div>

      {/* TAB 1: THE BANKER'S SAFETY VAULT STORY */}
      {activeTab === 'story' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50/70 to-indigo-50/70 p-6 rounded-3xl border border-blue-200 shadow-subtle space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-blue-100">
              <span className="text-xs font-bold text-primary-blue font-mono uppercase tracking-wider">
                Scene {currentStoryStep + 1} of {BANKER_STORY_STEPS.length}: {currentStepData.title}
              </span>
              <span className="text-xs font-mono font-bold text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-blue-100">
                {currentStepData.analogyMapping}
              </span>
            </div>

            <p className="text-sm text-slate-800 leading-relaxed font-medium">
              {currentStepData.narrative}
            </p>

            <div className="flex items-center justify-between pt-3 border-t border-blue-100">
              <button
                onClick={handleStoryPrev}
                disabled={currentStoryStep === 0}
                className="px-3 py-1.5 bg-white border border-slate-200 text-xs font-bold rounded-xl text-slate-700 hover:bg-slate-50 disabled:opacity-40"
              >
                Previous Scene
              </button>
              <button
                onClick={handleStoryNext}
                disabled={currentStoryStep >= BANKER_STORY_STEPS.length - 1}
                className="px-4 py-1.5 bg-primary-blue text-white text-xs font-bold rounded-xl hover:bg-blue-600 disabled:opacity-40 shadow-xs"
              >
                Next Scene
              </button>
            </div>
          </div>

          {/* 5-Question Memory Challenge at End of Story */}
          <div className="bg-surface p-6 rounded-2xl border border-app-border shadow-subtle space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-app-border">
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-bold text-text-main">
                  5-Question Banker Vault Memory Challenge
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400">Memory Retention Check</span>
            </div>

            <div className="space-y-4 text-xs">
              {BANKER_STORY_QUIZ.map((q, qIdx) => {
                const selected = storyQuizAnswers[qIdx];
                const isCorrect = selected === q.correctIndex;

                return (
                  <div key={qIdx} className="p-4 bg-slate-50/80 border border-slate-200 rounded-xl space-y-2">
                    <p className="font-bold text-slate-800 text-xs">
                      Q{qIdx + 1}: {q.question}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {q.options.map((opt, optIdx) => {
                        const isChosen = selected === optIdx;
                        let btnStyle = 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100';

                        if (storyQuizSubmitted) {
                          if (optIdx === q.correctIndex) {
                            btnStyle = 'bg-emerald-100 border-emerald-400 text-emerald-900 font-bold';
                          } else if (isChosen) {
                            btnStyle = 'bg-red-100 border-red-300 text-red-900';
                          }
                        } else if (isChosen) {
                          btnStyle = 'bg-primary-blue border-primary-blue text-white font-bold';
                        }

                        return (
                          <button
                            key={optIdx}
                            onClick={() => {
                              if (!storyQuizSubmitted) {
                                setStoryQuizAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
                              }
                            }}
                            className={`p-2 rounded-lg text-left text-xs border transition-all ${btnStyle}`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {storyQuizSubmitted && (
                      <div className="pt-2 text-[11px] font-medium text-slate-600 border-t border-slate-200 mt-2">
                        {isCorrect ? '✓ Correct! ' : '✗ Incorrect. '}
                        {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {!storyQuizSubmitted ? (
              <button
                onClick={() => {
                  setStoryQuizSubmitted(true);
                  progressService.addPoints(20);
                }}
                disabled={Object.keys(storyQuizAnswers).length < BANKER_STORY_QUIZ.length}
                className="w-full py-2.5 bg-primary-blue text-white rounded-xl text-xs font-bold hover:bg-blue-600 disabled:opacity-40 transition-colors shadow-xs"
              >
                Submit Memory Challenge Answers
              </button>
            ) : (
              <button
                onClick={() => {
                  setStoryQuizSubmitted(false);
                  setStoryQuizAnswers({});
                }}
                className="w-full py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors"
              >
                Retry Memory Challenge
              </button>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MNEMONICS */}
      {activeTab === 'mnemonics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {mnemonics.map(item => (
              <div
                key={item.id}
                className="bg-surface p-5 rounded-2xl border border-app-border shadow-subtle space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-app-border">
                    <span className="text-xs font-bold text-text-main">{item.title}</span>
                    <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded bg-violet-100 text-violet-800">
                      {item.acronym}
                    </span>
                  </div>

                  <div className="space-y-2 pt-2">
                    {item.meaning.map((m, idx) => (
                      <div key={idx} className="text-xs flex items-start space-x-2">
                        <span className="w-5 h-5 rounded-md bg-blue-50 text-primary-blue font-bold flex items-center justify-center shrink-0 font-mono text-[11px]">
                          {m.letter}
                        </span>
                        <div>
                          <strong className="text-slate-800">{m.word}</strong>: {m.explanation}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 leading-relaxed">
                    <strong className="text-slate-800 block mb-0.5">Real-world Analogy:</strong>
                    {item.example}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400 font-mono">{item.topic}</span>
                  <button
                    onClick={() => {
                      speechService.speak(`${item.title}: Remember ${item.acronym}. ${item.formalDefinition}`);
                    }}
                    className="text-primary-blue hover:underline font-semibold"
                  >
                    Narrate Mnemonic
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: 7 INTERACTIVE GAMES */}
      {activeTab === 'games' && (
        <div className="space-y-6">
          {/* Game Switcher */}
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-100 rounded-2xl border border-app-border text-xs font-semibold">
            {[
              { id: 'safe-challenge', label: 'Game F: Safe Sequence Challenge' },
              { id: 'match', label: 'Game A: Match the Concept' },
              { id: 'flip', label: 'Game B: Memory Flip Cards' },
              { id: 'arrange', label: 'Game C: Arrange the Steps' },
              { id: 'recall', label: 'Game E: 1-Minute Recall' },
            ].map(g => (
              <button
                key={g.id}
                onClick={() => setActiveGame(g.id as any)}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  activeGame === g.id
                    ? 'bg-white text-primary-blue shadow-xs font-bold'
                    : 'text-text-muted hover:text-text-main'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>

          {/* Game F: Safe Sequence Challenge */}
          {activeGame === 'safe-challenge' && (
            <div className="bg-surface p-6 rounded-2xl border border-app-border shadow-subtle space-y-4">
              <h3 className="text-sm font-bold text-text-main">
                Game F: Safe Sequence Challenge
              </h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Click processes in the exact order you predict will satisfy the Banker’s safety conditions.
                Our algorithm verifies every logically sound permutation!
              </p>

              <div className="flex flex-wrap gap-2 pt-2">
                {DEFAULT_BANKER_STATE.processNames.map(p => {
                  const isPicked = proposedSeq.includes(p);
                  return (
                    <button
                      key={p}
                      onClick={() => {
                        if (isPicked) setProposedSeq(prev => prev.filter(x => x !== p));
                        else setProposedSeq(prev => [...prev, p]);
                        setSafeSeqResult(null);
                      }}
                      className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold ${
                        isPicked
                          ? 'bg-primary-blue text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {p} {isPicked && `(${proposedSeq.indexOf(p) + 1})`}
                    </button>
                  );
                })}
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                <span>Proposed: <strong className="font-mono text-primary-blue">{proposedSeq.join(' → ') || 'None'}</strong></span>
                <button
                  onClick={handleCheckSafeChallenge}
                  disabled={proposedSeq.length !== DEFAULT_BANKER_STATE.processNames.length}
                  className="px-4 py-1.5 bg-primary-blue text-white rounded-lg font-bold disabled:opacity-40"
                >
                  Verify Safe Sequence
                </button>
              </div>

              {safeSeqResult && (
                <div
                  className={`p-3 rounded-xl border text-xs font-semibold ${
                    safeSeqResult.isValid
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-red-50 border-red-200 text-red-900'
                  }`}
                >
                  {safeSeqResult.message}
                </div>
              )}
            </div>
          )}

          {/* Game A: Match the Concept */}
          {activeGame === 'match' && (
            <div className="bg-surface p-6 rounded-2xl border border-app-border shadow-subtle space-y-4">
              <h3 className="text-sm font-bold text-text-main">Game A: Match the Concept</h3>
              <p className="text-xs text-text-muted">
                Click a term on the left, then click its corresponding definition on the right.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-500 block">Terms:</span>
                  {MATCH_PAIRS.map(item => {
                    const isMatched = matchedPairs.includes(item.term);
                    const isSelected = selectedMatchTerm === item.term;
                    return (
                      <button
                        key={item.term}
                        onClick={() => !isMatched && handleMatchClick(item.term, false)}
                        disabled={isMatched}
                        className={`w-full p-2.5 rounded-xl border text-left text-xs font-bold transition-all ${
                          isMatched
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                            : isSelected
                            ? 'bg-primary-blue text-white border-primary-blue shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                        }`}
                      >
                        {item.term} {isMatched && '✓'}
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-500 block">Definitions:</span>
                  {MATCH_PAIRS.map(item => {
                    const isMatched = matchedPairs.includes(item.def);
                    const isSelected = selectedMatchTerm === item.def;
                    return (
                      <button
                        key={item.def}
                        onClick={() => !isMatched && handleMatchClick(item.def, true)}
                        disabled={isMatched}
                        className={`w-full p-2.5 rounded-xl border text-left text-xs leading-relaxed transition-all ${
                          isMatched
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                            : isSelected
                            ? 'bg-primary-blue text-white border-primary-blue shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                        }`}
                      >
                        {item.def} {isMatched && '✓'}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Game B: Flip Cards */}
          {activeGame === 'flip' && (
            <div className="bg-surface p-6 rounded-2xl border border-app-border shadow-subtle space-y-4">
              <h3 className="text-sm font-bold text-text-main">Game B: Memory Flip Cards</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {FLIP_CARDS.map((card, idx) => {
                  const isFlipped = !!flippedCards[idx];
                  return (
                    <div
                      key={idx}
                      onClick={() => setFlippedCards(prev => ({ ...prev, [idx]: !prev[idx] }))}
                      className="h-36 bg-gradient-to-tr from-slate-50 to-blue-50/50 border border-app-border rounded-2xl p-4 flex flex-col justify-between cursor-pointer hover:border-blue-400 hover:shadow-xs transition-all text-center"
                    >
                      <span className="text-[10px] font-mono text-slate-400">Click to flip</span>
                      <div className="font-bold text-sm text-text-main px-2">
                        {isFlipped ? card.back : card.front}
                      </div>
                      <span className="text-[10px] font-semibold text-primary-blue">
                        {isFlipped ? 'Answer Revealed' : 'Reveal Answer'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Game C: Arrange Steps */}
          {activeGame === 'arrange' && (
            <div className="bg-surface p-6 rounded-2xl border border-app-border shadow-subtle space-y-4">
              <h3 className="text-sm font-bold text-text-main">Game C: Arrange Banker's Algorithm Steps</h3>
              <p className="text-xs text-text-muted">
                Order the algorithm phases from 1 (Initialization) to 4 (Termination):
              </p>

              <div className="space-y-2">
                {userArranged.map((id, index) => {
                  const step = ARRANGE_STEPS.find(s => s.id === id)!;
                  return (
                    <div
                      key={id}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-center justify-between"
                    >
                      <span className="font-mono font-bold text-primary-blue mr-3">
                        Position {index + 1}:
                      </span>
                      <span className="flex-1 font-medium">{step.text}</span>
                      <div className="flex space-x-1 ml-2">
                        <button
                          disabled={index === 0}
                          onClick={() => {
                            const next = [...userArranged];
                            const temp = next[index - 1];
                            next[index - 1] = next[index];
                            next[index] = temp;
                            setUserArranged(next);
                          }}
                          className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] disabled:opacity-30"
                        >
                          ▲
                        </button>
                        <button
                          disabled={index === userArranged.length - 1}
                          onClick={() => {
                            const next = [...userArranged];
                            const temp = next[index + 1];
                            next[index + 1] = next[index];
                            next[index] = temp;
                            setUserArranged(next);
                          }}
                          className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] disabled:opacity-30"
                        >
                          ▼
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={handleCheckArrangement}
                className="px-4 py-2 bg-primary-blue text-white rounded-xl text-xs font-bold"
              >
                Check Order
              </button>

              {arrangeVerdict !== null && (
                <div
                  className={`p-3 rounded-xl border text-xs font-semibold ${
                    arrangeVerdict
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-red-50 border-red-200 text-red-900'
                  }`}
                >
                  {arrangeVerdict ? '✓ Perfect order! You mastered the 4 safety algorithm steps.' : '✗ Not quite. Recheck step numbering.'}
                </div>
              )}
            </div>
          )}

          {/* Game E: 1-Minute Recall */}
          {activeGame === 'recall' && (
            <div className="bg-surface p-6 rounded-2xl border border-app-border shadow-subtle space-y-4">
              <h3 className="text-sm font-bold text-text-main">Game E: One-Minute Rapid Recall</h3>
              <p className="text-xs text-text-muted">
                Challenge prompt: <strong>"State the four necessary Coffman conditions for deadlock and describe how circular wait is formed."</strong>
              </p>

              <div className="flex items-center space-x-4 py-2">
                <button
                  onClick={() => setShowRecallModel(prev => !prev)}
                  className="px-4 py-2 bg-primary-blue text-white rounded-xl text-xs font-bold"
                >
                  {showRecallModel ? 'Hide Model Answer' : 'Reveal Model Answer'}
                </button>
              </div>

              {showRecallModel && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs space-y-2 text-slate-800 leading-relaxed">
                  <h4 className="font-bold text-primary-blue">Model Answer:</h4>
                  <p>
                    The 4 Coffman conditions are: 1) Mutual Exclusion (non-shareable resources), 2) Hold and Wait (holding while requesting others), 3) No Preemption (cannot forcibly seize resources), and 4) Circular Wait (closed loop chain of processes P0→P1→...→P0 waiting on next).
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
