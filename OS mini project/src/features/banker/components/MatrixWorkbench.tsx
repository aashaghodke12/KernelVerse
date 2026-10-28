import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Database,
  SlidersHorizontal,
} from 'lucide-react';
import { BankerState, BankerSafetyResult } from '../../../types';
import {
  DEFAULT_BANKER_STATE,
  UNSAFE_PRESET_BANKER_STATE,
  computeNeedMatrix,
  runBankerSafetyAlgorithm,
} from '../../../algorithms/bankerAlgorithm';

interface MatrixWorkbenchProps {
  state: BankerState;
  onChangeState: (newState: BankerState) => void;
  onResetDefault: () => void;
}

export const MatrixWorkbench: React.FC<MatrixWorkbenchProps> = ({
  state,
  onChangeState,
  onResetDefault,
}) => {
  const [validationError, setValidationError] = useState<string | null>(null);

  const need = computeNeedMatrix(state.max, state.allocation);
  const safetyResult: BankerSafetyResult = runBankerSafetyAlgorithm({
    ...state,
    need,
  });

  // Cell change handlers
  const handleAllocChange = (pIdx: number, rIdx: number, valStr: string) => {
    const val = parseInt(valStr, 10);
    if (isNaN(val) || val < 0) return;

    const newAlloc = state.allocation.map((row, p) =>
      p === pIdx ? row.map((rVal, r) => (r === rIdx ? val : rVal)) : [...row]
    );

    // Validation
    if (val > state.max[pIdx][rIdx]) {
      setValidationError(`Process ${state.processNames[pIdx]} allocation (${val}) cannot exceed declared maximum (${state.max[pIdx][rIdx]}).`);
    } else {
      setValidationError(null);
    }

    onChangeState({
      ...state,
      allocation: newAlloc,
      need: computeNeedMatrix(state.max, newAlloc),
    });
  };

  const handleMaxChange = (pIdx: number, rIdx: number, valStr: string) => {
    const val = parseInt(valStr, 10);
    if (isNaN(val) || val < 0) return;

    const newMax = state.max.map((row, p) =>
      p === pIdx ? row.map((rVal, r) => (r === rIdx ? val : rVal)) : [...row]
    );

    if (val < state.allocation[pIdx][rIdx]) {
      setValidationError(`Maximum claim (${val}) cannot be lower than current allocation (${state.allocation[pIdx][rIdx]}).`);
    } else {
      setValidationError(null);
    }

    onChangeState({
      ...state,
      max: newMax,
      need: computeNeedMatrix(newMax, state.allocation),
    });
  };

  const handleAvailableChange = (rIdx: number, valStr: string) => {
    const val = parseInt(valStr, 10);
    if (isNaN(val) || val < 0) return;

    const newAvail = state.available.map((a, idx) => (idx === rIdx ? val : a));
    onChangeState({
      ...state,
      available: newAvail,
    });
  };

  // Add Process
  const handleAddProcess = () => {
    const pIndex = state.processNames.length;
    const newName = `P${pIndex}`;
    const rCount = state.resourceNames.length;

    const newAlloc = [...state.allocation, new Array(rCount).fill(0)];
    const newMax = [...state.max, new Array(rCount).fill(2)];

    onChangeState({
      ...state,
      processNames: [...state.processNames, newName],
      allocation: newAlloc,
      max: newMax,
      need: computeNeedMatrix(newMax, newAlloc),
    });
  };

  // Delete Process
  const handleDeleteProcess = (pIdx: number) => {
    if (state.processNames.length <= 2) {
      alert('Minimum 2 processes required for Banker simulation.');
      return;
    }

    const newNames = state.processNames.filter((_, i) => i !== pIdx);
    const newAlloc = state.allocation.filter((_, i) => i !== pIdx);
    const newMax = state.max.filter((_, i) => i !== pIdx);

    onChangeState({
      ...state,
      processNames: newNames,
      allocation: newAlloc,
      max: newMax,
      need: computeNeedMatrix(newMax, newAlloc),
    });
  };

  // Add Resource Type
  const handleAddResource = () => {
    const rIndex = state.resourceNames.length;
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const newName = alphabet[rIndex] || `R${rIndex}`;

    const newAlloc = state.allocation.map(row => [...row, 0]);
    const newMax = state.max.map(row => [...row, 2]);
    const newAvail = [...state.available, 2];

    onChangeState({
      ...state,
      resourceNames: [...state.resourceNames, newName],
      allocation: newAlloc,
      max: newMax,
      available: newAvail,
      need: computeNeedMatrix(newMax, newAlloc),
    });
  };

  // Delete Resource Type
  const handleDeleteResource = (rIdx: number) => {
    if (state.resourceNames.length <= 1) {
      alert('At least 1 resource type is required.');
      return;
    }

    const newNames = state.resourceNames.filter((_, i) => i !== rIdx);
    const newAlloc = state.allocation.map(row => row.filter((_, i) => i !== rIdx));
    const newMax = state.max.map(row => row.filter((_, i) => i !== rIdx));
    const newAvail = state.available.filter((_, i) => i !== rIdx);

    onChangeState({
      ...state,
      resourceNames: newNames,
      allocation: newAlloc,
      max: newMax,
      available: newAvail,
      need: computeNeedMatrix(newMax, newAlloc),
    });
  };

  return (
    <div className="space-y-6">
      {/* Controls & Presets Bar */}
      <div className="bg-surface p-4 rounded-2xl border border-app-border flex flex-wrap items-center justify-between gap-3 shadow-subtle">
        <div className="flex items-center space-x-2">
          <SlidersHorizontal className="w-4 h-4 text-primary-blue" />
          <h3 className="text-sm font-bold text-text-main">Matrix Configuration & Presets</h3>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => onChangeState(DEFAULT_BANKER_STATE)}
            className="px-3 py-1.5 bg-blue-50 text-primary-blue border border-blue-200 rounded-lg hover:bg-blue-100 font-medium transition-colors"
          >
            Load Safe Default (5P, 3R)
          </button>
          <button
            onClick={() => onChangeState(UNSAFE_PRESET_BANKER_STATE)}
            className="px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg hover:bg-amber-100 font-medium transition-colors"
          >
            Load Unsafe Preset (4P, 2R)
          </button>
          <button
            onClick={onResetDefault}
            className="flex items-center space-x-1 px-3 py-1.5 text-text-muted hover:text-text-main hover:bg-slate-100 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <span className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

          <button
            onClick={handleAddProcess}
            className="flex items-center space-x-1 px-2.5 py-1.5 bg-slate-100 text-text-main hover:bg-slate-200 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-primary-blue" />
            <span>Add Process</span>
          </button>
          <button
            onClick={handleAddResource}
            className="flex items-center space-x-1 px-2.5 py-1.5 bg-slate-100 text-text-main hover:bg-slate-200 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-violet-600" />
            <span>Add Resource</span>
          </button>
        </div>
      </div>

      {/* Validation Error Banner */}
      {validationError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Available Resources Vector Card */}
      <div className="bg-surface p-4 rounded-2xl border border-app-border shadow-subtle space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4 text-emerald-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-main">
              Available Resources Vector [m]
            </h4>
          </div>
          <span className="text-[11px] text-text-muted font-mono">
            Currently unallocated in system
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {state.resourceNames.map((rName, rIdx) => (
            <div
              key={rName}
              className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl"
            >
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-500 font-mono">Resource {rName}</span>
                <input
                  type="number"
                  min="0"
                  value={state.available[rIdx]}
                  onChange={e => handleAvailableChange(rIdx, e.target.value)}
                  className="w-16 text-center font-mono font-bold text-sm bg-white border border-slate-300 rounded px-1 py-0.5 mt-0.5 focus:border-blue-500 focus:outline-hidden"
                />
              </div>
              <button
                onClick={() => handleDeleteResource(rIdx)}
                title={`Delete Resource ${rName}`}
                className="text-slate-400 hover:text-red-500 p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Matrices Grid: Allocation, Max, and Need */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Allocation Matrix */}
        <div className="bg-surface p-4 rounded-2xl border border-app-border shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-app-border mb-3">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-main">
                  Allocation Matrix
                </h4>
                <p className="text-[10px] text-text-muted">Resources currently held</p>
              </div>
              <span className="text-[10px] font-mono bg-blue-50 text-primary-blue px-2 py-0.5 rounded font-bold">
                n × m
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-center border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-mono text-[11px]">
                    <th className="py-1 px-2 text-left font-semibold">Proc</th>
                    {state.resourceNames.map(r => (
                      <th key={r} className="py-1 px-2 font-bold text-primary-blue">
                        {r}
                      </th>
                    ))}
                    <th className="py-1 px-1"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {state.processNames.map((pName, pIdx) => (
                    <tr key={pName} className="hover:bg-slate-50/60">
                      <td className="py-1.5 px-2 text-left font-bold text-text-main">{pName}</td>
                      {state.resourceNames.map((_, rIdx) => (
                        <td key={rIdx} className="py-1.5 px-1">
                          <input
                            type="number"
                            min="0"
                            value={state.allocation[pIdx][rIdx]}
                            onChange={e => handleAllocChange(pIdx, rIdx, e.target.value)}
                            className="w-12 text-center text-xs font-bold bg-slate-50 border border-slate-200 rounded py-1 focus:bg-white focus:border-blue-500 focus:outline-hidden"
                          />
                        </td>
                      ))}
                      <td className="py-1.5 px-1">
                        <button
                          onClick={() => handleDeleteProcess(pIdx)}
                          title={`Delete ${pName}`}
                          className="text-slate-300 hover:text-red-500 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Maximum Matrix */}
        <div className="bg-surface p-4 rounded-2xl border border-app-border shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-app-border mb-3">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-main">
                  Maximum Claim Matrix
                </h4>
                <p className="text-[10px] text-text-muted">Maximum demanded lifecycle limit</p>
              </div>
              <span className="text-[10px] font-mono bg-violet-50 text-secondary-violet px-2 py-0.5 rounded font-bold">
                n × m
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-center border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-mono text-[11px]">
                    <th className="py-1 px-2 text-left font-semibold">Proc</th>
                    {state.resourceNames.map(r => (
                      <th key={r} className="py-1 px-2 font-bold text-secondary-violet">
                        {r}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {state.processNames.map((pName, pIdx) => (
                    <tr key={pName} className="hover:bg-slate-50/60">
                      <td className="py-1.5 px-2 text-left font-bold text-text-main">{pName}</td>
                      {state.resourceNames.map((_, rIdx) => (
                        <td key={rIdx} className="py-1.5 px-1">
                          <input
                            type="number"
                            min="0"
                            value={state.max[pIdx][rIdx]}
                            onChange={e => handleMaxChange(pIdx, rIdx, e.target.value)}
                            className="w-12 text-center text-xs font-bold bg-slate-50 border border-slate-200 rounded py-1 focus:bg-white focus:border-violet-500 focus:outline-hidden"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Need Matrix (Computed Automatically) */}
        <div className="bg-surface p-4 rounded-2xl border border-app-border shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-app-border mb-3">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-main">
                  Remaining Need Matrix
                </h4>
                <p className="text-[10px] text-text-muted">Computed: Need = Max − Allocation</p>
              </div>
              <span className="text-[10px] font-mono bg-emerald-50 text-app-success px-2 py-0.5 rounded font-bold">
                Auto-computed
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-center border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-mono text-[11px]">
                    <th className="py-1 px-2 text-left font-semibold">Proc</th>
                    {state.resourceNames.map(r => (
                      <th key={r} className="py-1 px-2 font-bold text-app-success">
                        {r}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {state.processNames.map((pName, pIdx) => (
                    <tr key={pName} className="hover:bg-slate-50/60">
                      <td className="py-1.5 px-2 text-left font-bold text-text-main">{pName}</td>
                      {state.resourceNames.map((_, rIdx) => (
                        <td key={rIdx} className="py-1.5 px-1">
                          <div className="w-12 mx-auto py-1 text-center font-bold text-xs bg-emerald-50/70 border border-emerald-100 rounded text-emerald-800">
                            {need[pIdx][rIdx]}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Safety Analysis Summary Bar */}
      <div
        className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
          safetyResult.isSafe
            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
            : 'bg-red-50/70 border-red-200 text-red-900'
        }`}
      >
        <div className="flex items-center space-x-3">
          {safetyResult.isSafe ? (
            <CheckCircle2 className="w-6 h-6 text-app-success shrink-0" />
          ) : (
            <AlertCircle className="w-6 h-6 text-app-error shrink-0" />
          )}
          <div>
            <h4 className="text-sm font-bold">
              {safetyResult.isSafe ? 'System is in a SAFE STATE' : 'System is in an UNSAFE STATE'}
            </h4>
            <p className="text-xs opacity-90 mt-0.5">
              {safetyResult.isSafe
                ? `A complete deadlock-free safe sequence exists for current inputs.`
                : `No safe sequence exists. Granting full requests could lead to deadlock.`}
            </p>
          </div>
        </div>

        {safetyResult.isSafe && (
          <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-xs px-3.5 py-1.5 rounded-xl border border-emerald-200 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
              Safe Sequence:
            </span>
            <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-700 font-mono">
              {safetyResult.safeSequence.map((p, idx) => (
                <React.Fragment key={p}>
                  <span className="px-1.5 py-0.5 bg-emerald-100 rounded">{p}</span>
                  {idx < safetyResult.safeSequence.length - 1 && (
                    <ArrowRight className="w-3 h-3 text-emerald-500" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
