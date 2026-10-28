import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Award,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
  Send,
} from 'lucide-react';
import { BankerState } from '../../../types';
import { validateCustomSafeSequence } from '../../../algorithms/bankerAlgorithm';
import { BANKER_VIVA_QUESTIONS } from '../../../data/bankerTheoryData';
import { progressService } from '../../../services/progressService';

interface BankerPracticeTabProps {
  state: BankerState;
}

export const BankerPracticeTab: React.FC<BankerPracticeTabProps> = ({ state }) => {
  const [proposedOrder, setProposedOrder] = useState<string[]>([]);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    message: string;
    stepDetails: string[];
  } | null>(null);

  const [expandedViva, setExpandedViva] = useState<number | null>(null);

  // Proposed sequence builder helpers
  const handleToggleProcess = (pName: string) => {
    if (proposedOrder.includes(pName)) {
      setProposedOrder(prev => prev.filter(p => p !== pName));
    } else {
      setProposedOrder(prev => [...prev, pName]);
    }
    setValidationResult(null);
  };

  const handleClear = () => {
    setProposedOrder([]);
    setValidationResult(null);
  };

  const handleValidate = () => {
    const res = validateCustomSafeSequence(state, proposedOrder);
    setValidationResult(res);

    if (res.isValid) {
      progressService.addPoints(25);
      progressService.unlockAchievement('bankers-master');
    }
  };

  return (
    <div className="space-y-8">
      {/* Exercise 1: Safe Sequence Solver Challenge */}
      <div className="bg-surface p-5 rounded-2xl border border-app-border shadow-subtle space-y-4">
        <div className="flex items-center space-x-2">
          <Award className="w-5 h-5 text-primary-blue" />
          <h3 className="text-sm font-bold text-text-main">
            Interactive Safe Sequence Solver Challenge
          </h3>
        </div>
        <p className="text-xs text-text-muted leading-relaxed">
          Based on the current workbench matrices, construct your own proposed safe sequence.
          Click processes in the exact order you want the OS to grant their requests.
          Our safety engine validates any mathematically legitimate safe sequence.
        </p>

        {/* Process Pick Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <span className="text-xs font-semibold text-slate-500 mr-2">Click to append:</span>
          {state.processNames.map(pName => {
            const isPicked = proposedOrder.includes(pName);
            const pickIndex = proposedOrder.indexOf(pName);

            return (
              <button
                key={pName}
                onClick={() => handleToggleProcess(pName)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all ${
                  isPicked
                    ? 'bg-primary-blue text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{pName}</span>
                {isPicked && (
                  <span className="w-4 h-4 rounded-full bg-blue-700 text-white text-[10px] flex items-center justify-center font-sans">
                    {pickIndex + 1}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Proposed Sequence Display Bar */}
        <div className="p-3.5 bg-slate-50 border border-app-border rounded-xl flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-500">Your Sequence:</span>
            {proposedOrder.length === 0 ? (
              <span className="text-xs text-slate-400 italic">No processes chosen yet</span>
            ) : (
              <div className="flex items-center space-x-1 font-mono text-xs font-bold text-primary-blue">
                {proposedOrder.map((p, idx) => (
                  <React.Fragment key={p}>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-900 rounded">{p}</span>
                    {idx < proposedOrder.length - 1 && (
                      <ArrowRight className="w-3 h-3 text-blue-400" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleClear}
              disabled={proposedOrder.length === 0}
              className="px-2.5 py-1 text-xs text-text-muted hover:text-text-main hover:bg-slate-200/60 rounded-lg disabled:opacity-40"
            >
              Clear
            </button>
            <button
              onClick={handleValidate}
              disabled={proposedOrder.length !== state.processNames.length}
              className="flex items-center space-x-1 px-4 py-1.5 bg-primary-blue text-white rounded-lg text-xs font-semibold hover:bg-blue-600 shadow-xs transition-colors disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Verify Sequence</span>
            </button>
          </div>
        </div>

        {/* Validation Result Box */}
        {validationResult && (
          <div
            className={`p-4 rounded-xl border space-y-2 ${
              validationResult.isValid
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                : 'bg-red-50 border-red-200 text-red-950'
            }`}
          >
            <div className="flex items-center space-x-2">
              {validationResult.isValid ? (
                <CheckCircle2 className="w-5 h-5 text-app-success shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-app-error shrink-0" />
              )}
              <h4 className="text-sm font-bold">{validationResult.message}</h4>
            </div>

            {/* Dry-run Step details */}
            <div className="space-y-1 pl-7 pt-1 font-mono text-xs">
              {validationResult.stepDetails.map((step, idx) => (
                <div key={idx} className="opacity-90">
                  {step}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Exercise 2: Viva Question Bank */}
      <div className="bg-surface p-5 rounded-2xl border border-app-border shadow-subtle space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <HelpCircle className="w-5 h-5 text-violet-600" />
            <h3 className="text-sm font-bold text-text-main">
              University Viva & Interview Question Bank
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">8 curated questions</span>
        </div>

        <div className="space-y-3">
          {BANKER_VIVA_QUESTIONS.map((item, idx) => {
            const isExpanded = expandedViva === idx;
            return (
              <div
                key={idx}
                className="border border-app-border rounded-xl overflow-hidden transition-all bg-slate-50/40"
              >
                <button
                  onClick={() => setExpandedViva(isExpanded ? null : idx)}
                  className="w-full text-left p-3.5 flex items-center justify-between text-xs font-bold text-text-main hover:bg-slate-100 transition-colors"
                >
                  <span className="flex items-center space-x-2 max-w-[90%]">
                    <span className="w-5 h-5 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-[10px] shrink-0 font-mono">
                      Q{idx + 1}
                    </span>
                    <span>{item.question}</span>
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>

                {isExpanded && (
                  <div className="p-4 bg-white border-t border-app-border text-xs space-y-3">
                    <p className="text-slate-700 leading-relaxed">{item.answer}</p>
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5 font-mono">
                        Key Exam Takeaways:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {item.keyPoints.map((kp, kIdx) => (
                          <span
                            key={kIdx}
                            className="text-[10px] px-2 py-0.5 bg-blue-50 text-primary-blue border border-blue-100 rounded-md font-medium"
                          >
                            ✓ {kp}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
