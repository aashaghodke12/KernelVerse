import React, { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  BookOpen,
  Box,
  Table,
  Send,
  HelpCircle,
  Sparkles,
  Trophy,
  BrainCircuit,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { BankerState, BankerSafetyResult } from '../../types';
import {
  DEFAULT_BANKER_STATE,
  computeNeedMatrix,
  runBankerSafetyAlgorithm,
} from '../../algorithms/bankerAlgorithm';
import { Banker3DScene } from './components/Banker3DScene';
import { Banker2DFallback } from './components/Banker2DFallback';
import { BankerStepController } from './components/BankerStepController';
import { MatrixWorkbench } from './components/MatrixWorkbench';
import { ResourceRequestSimulator } from './components/ResourceRequestSimulator';
import { BankerTheoryTab } from './components/BankerTheoryTab';
import { BankerPracticeTab } from './components/BankerPracticeTab';
import { progressService } from '../../services/progressService';

type TabKey = 'theory' | 'simulation' | 'matrix' | 'request' | 'practice';

export const BankerLabView: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as TabKey) || 'simulation';
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);

  // Banker state (defaults to the prompt's 5 processes, 3 resources)
  const [state, setState] = useState<BankerState>(DEFAULT_BANKER_STATE);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [use2DFallback, setUse2DFallback] = useState<boolean>(false);

  // Compute need and safety algorithm dynamically
  const need = useMemo(() => computeNeedMatrix(state.max, state.allocation), [state.max, state.allocation]);
  const safetyResult: BankerSafetyResult = useMemo(
    () => runBankerSafetyAlgorithm({ ...state, need }),
    [state, need]
  );

  const currentStep = safetyResult.steps[currentStepIndex];

  // Mark completion in progress
  const handleCompleteLab = () => {
    progressService.completeLesson('banker-lab', 50);
  };

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Module Hero Header */}
      <div className="bg-surface p-6 rounded-3xl border border-app-border shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-primary-blue uppercase tracking-wider mb-1 font-mono">
            <span className="w-2 h-2 rounded-full bg-primary-blue animate-pulse" />
            <span>Deadlock Avoidance Laboratory</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-text-main tracking-tight">
            Banker’s Algorithm & Deadlock Avoidance
          </h1>
          <p className="text-xs text-text-muted mt-1 max-w-2xl leading-relaxed">
            Determine whether a system can allocate resources safely without entering a deadlock.
            Explore 3D flows, inspect dynamically computed matrices, test resource requests, and master the safety algorithm.
          </p>
        </div>

        {/* Action Buttons & Integration Shortcuts */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/memory-palace?topic=deadlock"
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-violet-50 text-secondary-violet border border-violet-200/80 rounded-xl text-xs font-semibold hover:bg-violet-100 transition-colors"
          >
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>Vault Story</span>
          </Link>

          <Link
            to="/quiz-arena?topic=banker"
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200/80 rounded-xl text-xs font-semibold hover:bg-amber-100 transition-colors"
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Quiz Arena</span>
          </Link>

          <Link
            to="/handwritten-notes?topic=banker"
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200/80 rounded-xl text-xs font-semibold hover:bg-emerald-100 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Handwritten Notes</span>
          </Link>
        </div>
      </div>

      {/* 5 Tabs Navigation Bar */}
      <div className="flex items-center space-x-1 p-1 bg-slate-100/80 rounded-2xl border border-app-border overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => handleTabChange('theory')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all ${
            activeTab === 'theory'
              ? 'bg-white text-primary-blue shadow-xs font-bold'
              : 'text-text-muted hover:text-text-main'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>1. Learn the Theory</span>
        </button>

        <button
          onClick={() => handleTabChange('simulation')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all ${
            activeTab === 'simulation'
              ? 'bg-white text-primary-blue shadow-xs font-bold'
              : 'text-text-muted hover:text-text-main'
          }`}
        >
          <Box className="w-4 h-4" />
          <span>2. Interactive 3D Simulation</span>
        </button>

        <button
          onClick={() => handleTabChange('matrix')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all ${
            activeTab === 'matrix'
              ? 'bg-white text-primary-blue shadow-xs font-bold'
              : 'text-text-muted hover:text-text-main'
          }`}
        >
          <Table className="w-4 h-4" />
          <span>3. Matrix Workbench</span>
        </button>

        <button
          onClick={() => handleTabChange('request')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all ${
            activeTab === 'request'
              ? 'bg-white text-primary-blue shadow-xs font-bold'
              : 'text-text-muted hover:text-text-main'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>4. Request Resource Simulator</span>
        </button>

        <button
          onClick={() => handleTabChange('practice')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all ${
            activeTab === 'practice'
              ? 'bg-white text-primary-blue shadow-xs font-bold'
              : 'text-text-muted hover:text-text-main'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>5. Practice & Viva</span>
        </button>
      </div>

      {/* Tab 1: Theory */}
      {activeTab === 'theory' && <BankerTheoryTab />}

      {/* Tab 2: 3D Simulation */}
      {activeTab === 'simulation' && (
        <div className="space-y-6">
          {/* 3D Scene / 2D Fallback Switcher Bar */}
          <div className="flex items-center justify-between text-xs px-1">
            <span className="font-semibold text-text-main flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-primary-blue" />
              <span>Real-Time Resource Allocation Space</span>
            </span>

            <button
              onClick={() => setUse2DFallback(prev => !prev)}
              className="flex items-center space-x-1 px-2.5 py-1 text-text-muted hover:text-text-main bg-white border border-app-border rounded-lg shadow-subtle hover:bg-slate-50 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{use2DFallback ? 'Switch to 3D WebGL' : '2D Schematic Fallback'}</span>
            </button>
          </div>

          {/* Visualization Container */}
          {use2DFallback ? (
            <Banker2DFallback
              state={{ ...state, need }}
              currentProcessIdx={currentStep?.processIndex ?? null}
              completedProcesses={currentStep?.finishedProcesses ?? new Array(state.processNames.length).fill(false)}
            />
          ) : (
            <Banker3DScene
              state={{ ...state, need }}
              currentProcessIdx={currentStep?.processIndex ?? null}
              completedProcesses={currentStep?.finishedProcesses ?? new Array(state.processNames.length).fill(false)}
            />
          )}

          {/* Synchronized Step Controller */}
          <BankerStepController
            safetyResult={safetyResult}
            currentStepIndex={currentStepIndex}
            onStepChange={setCurrentStepIndex}
            onReset={() => setCurrentStepIndex(0)}
          />
        </div>
      )}

      {/* Tab 3: Matrix Workbench */}
      {activeTab === 'matrix' && (
        <MatrixWorkbench
          state={state}
          onChangeState={setState}
          onResetDefault={() => {
            setState(DEFAULT_BANKER_STATE);
            setCurrentStepIndex(0);
          }}
        />
      )}

      {/* Tab 4: Resource Request Simulator */}
      {activeTab === 'request' && (
        <ResourceRequestSimulator
          state={state}
          onApplyTentativeState={newState => {
            setState(newState);
            setCurrentStepIndex(0);
            setActiveTab('simulation');
          }}
          onResetOriginal={() => setState(DEFAULT_BANKER_STATE)}
        />
      )}

      {/* Tab 5: Practice & Viva */}
      {activeTab === 'practice' && <BankerPracticeTab state={state} />}

      {/* Bottom Completion Card */}
      <div className="bg-surface p-4 rounded-2xl border border-app-border flex items-center justify-between text-xs shadow-subtle">
        <span className="text-text-muted">
          Finished experimenting with this module? Mark it as mastered to record progress and earn 50 XP.
        </span>
        <button
          onClick={handleCompleteLab}
          className="flex items-center space-x-1.5 px-4 py-2 bg-app-success text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-xs"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Mark Lab as Completed</span>
        </button>
      </div>
    </div>
  );
};
