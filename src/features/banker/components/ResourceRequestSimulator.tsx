import React, { useState } from 'react';
import {
  Send,
  RotateCcw,
  CheckCircle2,
  AlertOctagon,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Database,
  Info,
} from 'lucide-react';
import { BankerState, RequestSimulationResult, ResourceVector } from '../../../types';
import {
  simulateResourceRequest,
  computeNeedMatrix,
  formatVector,
} from '../../../algorithms/bankerAlgorithm';
import { speechService } from '../../../services/speechService';

interface ResourceRequestSimulatorProps {
  state: BankerState;
  onApplyTentativeState: (newState: BankerState) => void;
  onResetOriginal: () => void;
}

export const ResourceRequestSimulator: React.FC<ResourceRequestSimulatorProps> = ({
  state,
  onApplyTentativeState,
  onResetOriginal,
}) => {
  const [selectedProcessIdx, setSelectedProcessIdx] = useState<number>(1); // Default to P1
  const [requestVector, setRequestVector] = useState<ResourceVector>(
    new Array(state.resourceNames.length).fill(0)
  );
  const [simulationResult, setSimulationResult] = useState<RequestSimulationResult | null>(null);

  const need = state.need ?? computeNeedMatrix(state.max, state.allocation);
  const selectedProcessName = state.processNames[selectedProcessIdx] || 'P0';

  const handleVectorChange = (rIdx: number, valStr: string) => {
    const val = parseInt(valStr, 10);
    if (isNaN(val) || val < 0) return;
    const next = [...requestVector];
    next[rIdx] = val;
    setRequestVector(next);
  };

  const handleLoadSampleSafeRequest = () => {
    // For default example: P1 requests [1, 0, 2]
    setSelectedProcessIdx(1);
    setRequestVector([1, 0, 2]);
    setSimulationResult(null);
  };

  const handleLoadSampleUnsafeRequest = () => {
    // For default example: P0 requests [0, 3, 0] which exhausts resource B and produces an unsafe state
    setSelectedProcessIdx(0);
    setRequestVector([0, 3, 0]);
    setSimulationResult(null);
  };

  const handleExecuteRequest = () => {
    const result = simulateResourceRequest(state, selectedProcessIdx, requestVector);
    setSimulationResult(result);

    // Speak narration of the decision
    if (result.canBeGranted) {
      speechService.speak(
        `Request granted! Granting ${formatVector(requestVector)} to ${selectedProcessName} leaves the system in a completely safe state with sequence: ${result.safetyResult?.safeSequence.join(', ')}.`
      );
    } else {
      speechService.speak(
        `Request denied. ${result.reason}`
      );
    }
  };

  const handleCommitState = () => {
    if (simulationResult?.canBeGranted && simulationResult.newAllocation && simulationResult.newAvailable) {
      onApplyTentativeState({
        ...state,
        allocation: simulationResult.newAllocation,
        available: simulationResult.newAvailable,
        need: simulationResult.newNeed,
      });
      setSimulationResult(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Intro Banner */}
      <div className="bg-surface p-5 rounded-2xl border border-app-border shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-primary-blue" />
            <h3 className="text-sm font-bold text-text-main">
              Resource-Request Algorithm Simulator
            </h3>
          </div>
          <p className="text-xs text-text-muted mt-1 leading-relaxed max-w-2xl">
            Simulate a dynamic runtime request from any process. The system executes the two strict bounds checks, performs tentative allocation, tests global safety, and automatically rolls back if the state becomes unsafe.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleLoadSampleSafeRequest}
            className="px-3 py-1.5 bg-blue-50 text-primary-blue border border-blue-200 rounded-lg hover:bg-blue-100 text-xs font-semibold transition-colors"
          >
            Load Safe Request (P1: [1,0,2])
          </button>
          <button
            onClick={handleLoadSampleUnsafeRequest}
            className="px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg hover:bg-amber-100 text-xs font-semibold transition-colors"
          >
            Load Unsafe Request (P0: [0,2,0])
          </button>
        </div>
      </div>

      {/* Input Configuration Panel */}
      <div className="bg-surface p-5 rounded-2xl border border-app-border shadow-subtle space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-text-main">
          1. Configure Process & Request Vector
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* Select Process */}
          <div>
            <label className="text-[11px] font-medium text-text-muted block mb-1.5">
              Requesting Process
            </label>
            <select
              value={selectedProcessIdx}
              onChange={e => {
                setSelectedProcessIdx(parseInt(e.target.value, 10));
                setSimulationResult(null);
              }}
              className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-app-border rounded-xl focus:border-blue-500 focus:outline-hidden"
            >
              {state.processNames.map((pName, idx) => (
                <option key={pName} value={idx}>
                  {pName} (Remaining Need: {formatVector(need[idx], state.resourceNames)})
                </option>
              ))}
            </select>
          </div>

          {/* Request Vector Inputs */}
          <div className="md:col-span-2">
            <label className="text-[11px] font-medium text-text-muted block mb-1.5">
              Request Vector [{state.resourceNames.join(', ')}]
            </label>
            <div className="flex flex-wrap items-center gap-2.5">
              {state.resourceNames.map((rName, rIdx) => (
                <div
                  key={rName}
                  className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl"
                >
                  <span className="text-xs font-bold text-primary-blue font-mono">{rName}:</span>
                  <input
                    type="number"
                    min="0"
                    value={requestVector[rIdx] ?? 0}
                    onChange={e => handleVectorChange(rIdx, e.target.value)}
                    className="w-14 text-center font-bold text-xs bg-white border border-slate-300 rounded py-1 focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              ))}

              <button
                onClick={handleExecuteRequest}
                className="flex items-center space-x-1.5 px-4 py-2 bg-primary-blue text-white rounded-xl text-xs font-bold hover:bg-blue-600 shadow-xs transition-colors ml-auto"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Simulate Request</span>
              </button>
            </div>
          </div>
        </div>

        {/* Current Reference Badges */}
        <div className="flex flex-wrap items-center gap-4 pt-2 text-xs border-t border-slate-100">
          <span className="text-slate-500">
            System Available: <strong className="font-mono text-emerald-700">{formatVector(state.available)}</strong>
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500">
            {selectedProcessName} Current Allocation: <strong className="font-mono text-blue-700">{formatVector(state.allocation[selectedProcessIdx])}</strong>
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500">
            {selectedProcessName} Remaining Need: <strong className="font-mono text-violet-700">{formatVector(need[selectedProcessIdx])}</strong>
          </span>
        </div>
      </div>

      {/* Simulation Result Presentation */}
      {simulationResult && (
        <div
          className={`p-5 rounded-2xl border transition-all ${
            simulationResult.canBeGranted
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
              : 'bg-red-50/80 border-red-200 text-red-950'
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start space-x-3">
              {simulationResult.canBeGranted ? (
                <ShieldCheck className="w-6 h-6 text-app-success shrink-0 mt-0.5" />
              ) : (
                <ShieldAlert className="w-6 h-6 text-app-error shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <h4 className="text-sm font-bold">
                  {simulationResult.canBeGranted
                    ? 'Request Successfully Granted!'
                    : 'Request Denied by Deadlock Avoidance'}
                </h4>
                <p className="text-xs opacity-90 leading-relaxed">{simulationResult.reason}</p>
                {simulationResult.safetyResult?.isSafe && (
                  <div className="pt-2 flex items-center space-x-2 font-mono text-xs">
                    <span className="font-semibold text-emerald-800">Verified Safe Sequence:</span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded font-bold">
                      {simulationResult.safetyResult.safeSequence.join(' → ')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {simulationResult.canBeGranted && (
              <button
                onClick={handleCommitState}
                className="shrink-0 px-3.5 py-1.5 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 transition-colors shadow-xs"
              >
                Apply Allocation Permanently
              </button>
            )}
          </div>

          {/* Before vs After Matrix Comparison */}
          {simulationResult.newAvailable && simulationResult.newAllocation && (
            <div className="mt-5 pt-4 border-t border-emerald-200/60 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/80 p-3 rounded-xl border border-emerald-100 text-xs space-y-2">
                <div className="font-bold text-slate-700">Before Request State:</div>
                <div className="font-mono text-[11px] space-y-1 text-slate-600">
                  <p>Available: {formatVector(state.available)}</p>
                  <p>{selectedProcessName} Allocation: {formatVector(state.allocation[selectedProcessIdx])}</p>
                  <p>{selectedProcessName} Need: {formatVector(need[selectedProcessIdx])}</p>
                </div>
              </div>

              <div className="bg-white/80 p-3 rounded-xl border border-emerald-100 text-xs space-y-2">
                <div className="font-bold text-emerald-800">
                  {simulationResult.canBeGranted ? 'Tentative (Safe) State:' : 'Tentative (Unsafe - Rolled Back) State:'}
                </div>
                <div className="font-mono text-[11px] space-y-1 text-slate-600">
                  <p>Available: {formatVector(simulationResult.newAvailable)}</p>
                  <p>{selectedProcessName} Allocation: {formatVector(simulationResult.newAllocation[selectedProcessIdx])}</p>
                  <p>{selectedProcessName} Need: {formatVector(simulationResult.newNeed![selectedProcessIdx])}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
