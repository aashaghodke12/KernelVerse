import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  Volume2,
  VolumeX,
  Gauge,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { BankerStep, BankerSafetyResult } from '../../../types';
import { speechService } from '../../../services/speechService';
import { formatVector } from '../../../algorithms/bankerAlgorithm';

interface BankerStepControllerProps {
  safetyResult: BankerSafetyResult;
  currentStepIndex: number;
  onStepChange: (newIndex: number) => void;
  onReset: () => void;
}

export const BankerStepController: React.FC<BankerStepControllerProps> = ({
  safetyResult,
  currentStepIndex,
  onStepChange,
  onReset,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeedMs, setPlaybackSpeedMs] = useState<number>(2000); // 2s per step
  const [narrationEnabled, setNarrationEnabled] = useState<boolean>(true);
  const timerRef = useRef<any>(null);

  const steps = safetyResult.steps;
  const currentStep: BankerStep | undefined = steps[currentStepIndex];

  // Auto-play interval
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        if (currentStepIndex < steps.length - 1) {
          const nextIdx = currentStepIndex + 1;
          onStepChange(nextIdx);
        } else {
          setIsPlaying(false);
        }
      }, playbackSpeedMs);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, currentStepIndex, steps.length, playbackSpeedMs, onStepChange]);

  // Synchronize narration on step change
  useEffect(() => {
    if (currentStep && narrationEnabled) {
      speechService.speak(currentStep.speechText);
    }
  }, [currentStepIndex, narrationEnabled]);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      onStepChange(currentStepIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      onStepChange(currentStepIndex - 1);
    }
  };

  const handleTogglePlay = () => {
    setIsPlaying(prev => !prev);
  };

  const handleReset = () => {
    setIsPlaying(false);
    onStepChange(0);
    onReset();
  };

  return (
    <div className="bg-surface p-5 rounded-2xl border border-app-border shadow-subtle space-y-4">
      {/* Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-app-border">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-primary-blue" />
          <h3 className="text-sm font-bold text-text-main">
            Step-by-Step Algorithm Walkthrough
          </h3>
          <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
            Step {steps.length > 0 ? currentStepIndex + 1 : 0} of {steps.length}
          </span>
        </div>

        {/* Buttons */}
        <div className="flex items-center space-x-1.5 text-xs">
          <button
            onClick={handlePrev}
            disabled={currentStepIndex <= 0}
            className="p-2 text-text-muted hover:text-text-main hover:bg-slate-100 rounded-lg disabled:opacity-40 transition-colors"
            title="Previous Step"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={handleTogglePlay}
            disabled={steps.length === 0}
            className="flex items-center space-x-1 px-3.5 py-1.5 bg-primary-blue text-white rounded-lg hover:bg-blue-600 font-semibold shadow-xs transition-colors"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Auto Play</span>
              </>
            )}
          </button>

          <button
            onClick={handleNext}
            disabled={currentStepIndex >= steps.length - 1}
            className="p-2 text-text-muted hover:text-text-main hover:bg-slate-100 rounded-lg disabled:opacity-40 transition-colors"
            title="Next Step"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          <button
            onClick={handleReset}
            className="p-2 text-text-muted hover:text-text-main hover:bg-slate-100 rounded-lg transition-colors"
            title="Reset to beginning"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <span className="h-4 w-px bg-slate-200 mx-1" />

          {/* Speed Toggle */}
          <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg text-[10px] font-mono">
            <button
              onClick={() => setPlaybackSpeedMs(3000)}
              className={`px-1.5 py-0.5 rounded ${playbackSpeedMs === 3000 ? 'bg-white font-bold text-primary-blue' : 'text-slate-500'}`}
            >
              Slow
            </button>
            <button
              onClick={() => setPlaybackSpeedMs(1800)}
              className={`px-1.5 py-0.5 rounded ${playbackSpeedMs === 1800 ? 'bg-white font-bold text-primary-blue' : 'text-slate-500'}`}
            >
              Normal
            </button>
            <button
              onClick={() => setPlaybackSpeedMs(1000)}
              className={`px-1.5 py-0.5 rounded ${playbackSpeedMs === 1000 ? 'bg-white font-bold text-primary-blue' : 'text-slate-500'}`}
            >
              Fast
            </button>
          </div>

          {/* Voice Narration Toggle */}
          <button
            onClick={() => setNarrationEnabled(prev => !prev)}
            className={`p-1.5 rounded-lg border transition-colors ${
              narrationEnabled
                ? 'bg-blue-50 text-primary-blue border-blue-200'
                : 'text-slate-400 border-slate-200 hover:bg-slate-100'
            }`}
            title={narrationEnabled ? 'Step narration enabled' : 'Step narration muted'}
          >
            {narrationEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Step Explanation Card */}
      {currentStep ? (
        <div className="space-y-3">
          <div
            className={`p-4 rounded-xl border flex items-start space-x-3 ${
              currentStep.isEligible
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                : 'bg-amber-50/70 border-amber-200 text-amber-950'
            }`}
          >
            {currentStep.isEligible ? (
              <CheckCircle2 className="w-5 h-5 text-app-success shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-app-warning shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm">
                  Evaluating Process {currentStep.processName}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                    currentStep.isEligible
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {currentStep.isEligible ? 'Eligible to Finish' : 'Insufficient Resources (Must Wait)'}
                </span>
              </div>
              <p className="text-xs leading-relaxed opacity-95">{currentStep.reason}</p>
            </div>
          </div>

          {/* Telemetry Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                Work Before
              </span>
              <span className="font-bold text-slate-700">{formatVector(currentStep.workBefore)}</span>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                {currentStep.processName} Remaining Need
              </span>
              <span className="font-bold text-violet-700">{formatVector(currentStep.needVector)}</span>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                Allocated To Release
              </span>
              <span className="font-bold text-blue-700">
                {currentStep.isEligible ? `+ ${formatVector(currentStep.allocationVector)}` : 'None'}
              </span>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                Work After
              </span>
              <span className="font-bold text-emerald-700">{formatVector(currentStep.workAfter)}</span>
            </div>
          </div>

          {/* Sequence Progress Bar */}
          <div className="p-3 bg-panel-tint rounded-xl border border-blue-100 flex items-center justify-between text-xs">
            <span className="font-semibold text-text-main flex items-center space-x-1.5">
              <span>Safe Sequence Progress:</span>
            </span>
            <div className="flex items-center space-x-1.5 font-mono font-bold text-primary-blue">
              {currentStep.safeSequenceSoFar.length === 0 ? (
                <span className="text-slate-400 font-normal italic">None finished yet</span>
              ) : (
                currentStep.safeSequenceSoFar.map((p, idx) => (
                  <React.Fragment key={p}>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-900 rounded">{p}</span>
                    {idx < currentStep.safeSequenceSoFar.length - 1 && (
                      <ArrowRight className="w-3 h-3 text-blue-400" />
                    )}
                  </React.Fragment>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-xs text-text-muted p-4 text-center">
          Click "Next Step" or "Auto Play" to begin evaluating the algorithm.
        </div>
      )}
    </div>
  );
};
