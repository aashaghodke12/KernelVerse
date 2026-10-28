import React, { useState } from 'react';
import {
  Layers,
  Sparkles,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sliders,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import {
  runPageReplacement,
  PageReplacementResult,
} from '../../algorithms/pageReplacement';
import { speechService } from '../../services/speechService';

const DEFAULT_REF_STRING = [7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2];

export const PageReplacementView: React.FC = () => {
  const [algorithm, setAlgorithm] = useState<'fifo' | 'lru' | 'optimal'>('fifo');
  const [refStringInput, setRefStringInput] = useState<string>('7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2');
  const [frameCount, setFrameCount] = useState<number>(3);

  const refString = refStringInput
    .split(',')
    .map(s => parseInt(s.trim(), 10))
    .filter(n => !isNaN(n));

  const result: PageReplacementResult = runPageReplacement(algorithm, refString, frameCount);

  const handleNarrate = () => {
    const text = `Page replacement using ${algorithm.toUpperCase()} with ${frameCount} frames. Total page faults: ${result.totalFaults}. Total hits: ${result.totalHits}. Hit ratio is ${result.hitRatio}%, and Fault ratio is ${result.faultRatio}%.`;
    speechService.speak(text);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="bg-surface p-6 rounded-3xl border border-app-border shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-cyan-600 uppercase tracking-wider mb-1 font-mono">
            <Layers className="w-4 h-4" />
            <span>Virtual Memory Simulator</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-text-main tracking-tight">
            Page Replacement Algorithms (FIFO, LRU, Optimal)
          </h1>
          <p className="text-xs text-text-muted mt-1 max-w-2xl leading-relaxed">
            Trace page frame contents across references. Compare FIFO with Belady's Anomaly vulnerability against stack-based LRU and theoretical Optimal replacement.
          </p>
        </div>

        <button
          onClick={handleNarrate}
          className="flex items-center space-x-1.5 px-3.5 py-2 bg-blue-50 text-primary-blue border border-blue-200 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Narrate Statistics</span>
        </button>
      </div>

      {/* Controls Bar */}
      <div className="bg-surface p-4 rounded-2xl border border-app-border shadow-subtle flex flex-wrap items-center justify-between gap-4 text-xs">
        {/* Algorithms */}
        <div className="flex items-center space-x-1 p-1 bg-slate-100 rounded-xl">
          {[
            { id: 'fifo', label: 'FIFO (First In First Out)' },
            { id: 'lru', label: 'LRU (Least Recently Used)' },
            { id: 'optimal', label: 'Optimal (Belady Min)' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setAlgorithm(item.id as any)}
              className={`px-3 py-1.5 rounded-lg transition-all font-semibold ${
                algorithm === item.id
                  ? 'bg-white text-primary-blue shadow-xs'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Frames Count & String Inputs */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            <span className="font-semibold text-slate-500 font-mono">Frames (1-6):</span>
            <input
              type="number"
              min="1"
              max="6"
              value={frameCount}
              onChange={e => setFrameCount(Math.min(6, Math.max(1, parseInt(e.target.value, 10) || 3)))}
              className="w-12 text-center font-bold bg-white border border-slate-300 rounded py-0.5 font-mono"
            />
          </div>

          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            <span className="font-semibold text-slate-500 font-mono">Ref String:</span>
            <input
              type="text"
              value={refStringInput}
              onChange={e => setRefStringInput(e.target.value)}
              className="w-48 sm:w-64 text-xs font-mono font-bold bg-white border border-slate-300 rounded px-2 py-0.5"
            />
          </div>
        </div>
      </div>

      {/* Frame Matrix Trace Table */}
      <div className="bg-surface p-5 rounded-2xl border border-app-border shadow-subtle space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-app-border">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-main">
            Step-by-Step Frame Matrix Trace
          </h3>
          <span className="text-xs font-mono text-slate-400">
            {refString.length} References | {frameCount} Physical Frames
          </span>
        </div>

        <div className="overflow-x-auto pb-2">
          <table className="w-full text-center text-xs font-mono border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400">
                <th className="py-2 px-3 text-left font-semibold">Reference Page</th>
                {result.steps.map((step, idx) => (
                  <th key={idx} className="py-2 px-2 font-bold text-primary-blue bg-blue-50/50">
                    {step.page}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Array.from({ length: frameCount }).map((_, fIdx) => (
                <tr key={fIdx} className="hover:bg-slate-50/60">
                  <td className="py-2 px-3 text-left font-semibold text-slate-500">
                    Frame {fIdx + 1}
                  </td>
                  {result.steps.map((step, sIdx) => {
                    const pageVal = step.frames[fIdx];
                    const isNew = pageVal === step.page && !step.isHit;

                    return (
                      <td key={sIdx} className="py-2 px-2">
                        {pageVal !== null ? (
                          <span
                            className={`inline-block w-7 h-7 leading-7 rounded-lg font-bold text-xs ${
                              isNew
                                ? 'bg-red-100 text-red-800 ring-2 ring-red-300'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {pageVal}
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Status Row: Hit / Miss */}
              <tr className="bg-slate-50/80 font-bold">
                <td className="py-2 px-3 text-left font-semibold text-text-main">Hit / Fault</td>
                {result.steps.map((step, idx) => (
                  <td key={idx} className="py-2 px-2">
                    {step.isHit ? (
                      <span className="text-[10px] text-app-success bg-emerald-100 px-1.5 py-0.5 rounded">
                        HIT
                      </span>
                    ) : (
                      <span className="text-[10px] text-app-error bg-red-100 px-1.5 py-0.5 rounded">
                        FAULT
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Ratios & Metrics Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-surface p-4 rounded-2xl border border-app-border shadow-subtle">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">
            Total Page Faults
          </span>
          <span className="text-2xl font-extrabold text-app-error font-mono mt-1 block">
            {result.totalFaults}
          </span>
          <span className="text-[11px] text-text-muted mt-0.5 block">
            Occurred in {result.faultRatio}% of accesses
          </span>
        </div>

        <div className="bg-surface p-4 rounded-2xl border border-app-border shadow-subtle">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">
            Total Page Hits
          </span>
          <span className="text-2xl font-extrabold text-app-success font-mono mt-1 block">
            {result.totalHits}
          </span>
          <span className="text-[11px] text-text-muted mt-0.5 block">
            Hit ratio is {result.hitRatio}%
          </span>
        </div>

        <div className="bg-surface p-4 rounded-2xl border border-app-border shadow-subtle">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">
            Hit Ratio
          </span>
          <span className="text-2xl font-extrabold text-primary-blue font-mono mt-1 block">
            {result.hitRatio}%
          </span>
          <span className="text-[11px] text-text-muted mt-0.5 block">Hits / Total</span>
        </div>

        <div className="bg-surface p-4 rounded-2xl border border-app-border shadow-subtle">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">
            Fault Ratio
          </span>
          <span className="text-2xl font-extrabold text-violet-700 font-mono mt-1 block">
            {result.faultRatio}%
          </span>
          <span className="text-[11px] text-text-muted mt-0.5 block">Faults / Total</span>
        </div>
      </div>
    </div>
  );
};
