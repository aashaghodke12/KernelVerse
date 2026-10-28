import React, { useState } from 'react';
import {
  Layers,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  AlertOctagon,
  ArrowRight,
  Database,
} from 'lucide-react';
import {
  runMemoryAllocation,
  MemoryProcess,
  MemoryAllocationResult,
} from '../../algorithms/memoryAllocation';
import { speechService } from '../../services/speechService';

const DEFAULT_BLOCKS = [100, 500, 200, 300, 600];
const DEFAULT_PROCESSES: MemoryProcess[] = [
  { id: '1', name: 'P1', size: 212 },
  { id: '2', name: 'P2', size: 417 },
  { id: '3', name: 'P3', size: 112 },
  { id: '4', name: 'P4', size: 426 },
];

export const MemoryAllocationView: React.FC = () => {
  const [algorithm, setAlgorithm] = useState<'first-fit' | 'best-fit' | 'worst-fit'>('first-fit');
  const [blockSizes, setBlockSizes] = useState<number[]>(DEFAULT_BLOCKS);
  const [processes, setProcesses] = useState<MemoryProcess[]>(DEFAULT_PROCESSES);

  const result: MemoryAllocationResult = runMemoryAllocation(algorithm, blockSizes, processes);

  const handleBlockChange = (idx: number, val: number) => {
    const next = [...blockSizes];
    next[idx] = Math.max(10, val);
    setBlockSizes(next);
  };

  const handleProcessSizeChange = (id: string, size: number) => {
    setProcesses(prev =>
      prev.map(p => (p.id === id ? { ...p, size: Math.max(1, size) } : p))
    );
  };

  const handleNarrate = () => {
    const text = `Memory allocation using ${algorithm}. Total Internal Fragmentation is ${result.totalInternalFragmentation} KB. External Fragmentation is ${result.externalFragmentation} KB. ${result.unallocatedProcesses.length > 0 ? `${result.unallocatedProcesses.join(', ')} could not be allocated due to insufficient contiguous block sizes.` : 'All processes successfully allocated.'}`;
    speechService.speak(text);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="bg-surface p-6 rounded-3xl border border-app-border shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-cyan-600 uppercase tracking-wider mb-1 font-mono">
            <Layers className="w-4 h-4" />
            <span>Memory Management Simulator</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-text-main tracking-tight">
            Contiguous Memory Allocation & Fragmentation
          </h1>
          <p className="text-xs text-text-muted mt-1 max-w-2xl leading-relaxed">
            Compare First Fit, Best Fit, and Worst Fit algorithms. Inspect partition allocations, internal fragmentation waste, and external fragmentation bottlenecks.
          </p>
        </div>

        <button
          onClick={handleNarrate}
          className="flex items-center space-x-1.5 px-3.5 py-2 bg-blue-50 text-primary-blue border border-blue-200 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Narrate Decisions</span>
        </button>
      </div>

      {/* Algorithm Tabs */}
      <div className="flex items-center space-x-2 p-1.5 bg-slate-100/80 rounded-2xl border border-app-border text-xs font-semibold">
        {[
          { id: 'first-fit', label: 'First Fit' },
          { id: 'best-fit', label: 'Best Fit' },
          { id: 'worst-fit', label: 'Worst Fit' },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setAlgorithm(item.id as any)}
            className={`px-4 py-2 rounded-xl transition-all ${
              algorithm === item.id
                ? 'bg-white text-primary-blue shadow-xs font-bold'
                : 'text-text-muted hover:text-text-main'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Memory Partition Visualizer */}
      <div className="bg-surface p-5 rounded-2xl border border-app-border shadow-subtle space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-main">
            Physical Memory Partitions
          </h3>
          <span className="text-xs font-mono text-slate-400">
            Total Blocks: {blockSizes.length} ({blockSizes.reduce((a, b) => a + b, 0)} KB total)
          </span>
        </div>

        {/* Visual Blocks Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {result.finalBlocks.map(block => {
            const isAllocated = block.processName !== null;
            const fillPct = isAllocated
              ? Math.min(100, Math.round(((block.processSize || 0) / block.originalSize) * 100))
              : 0;

            return (
              <div
                key={block.id}
                className={`p-3 rounded-2xl border flex flex-col justify-between h-40 transition-all ${
                  isAllocated
                    ? 'bg-white border-blue-200 shadow-sm'
                    : 'bg-slate-50 border-dashed border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-text-main font-mono">{block.id}</span>
                    <span className="text-slate-400 font-mono text-[10px]">{block.originalSize} KB</span>
                  </div>

                  {isAllocated ? (
                    <div className="mt-2 space-y-1">
                      <div className="text-xs font-bold text-primary-blue flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-app-success" />
                        <span>{block.processName}</span>
                        <span className="text-slate-500 font-normal font-mono text-[10px]">
                          ({block.processSize} KB)
                        </span>
                      </div>

                      <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
                        <div
                          className="bg-primary-blue h-full rounded-full"
                          style={{ width: `${fillPct}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 text-center text-xs text-slate-400 font-mono">
                      Empty / Free
                    </div>
                  )}
                </div>

                {isAllocated && (
                  <div className="pt-2 border-t border-slate-100 text-[10px] text-amber-700 bg-amber-50 px-2 py-1 rounded-md font-mono">
                    Internal Frag: <strong>{block.internalFragmentation} KB</strong>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Inputs & Step-by-Step Decisions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Step-by-Step Decision Log */}
        <div className="bg-surface p-5 rounded-2xl border border-app-border shadow-subtle space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-main pb-2 border-b border-app-border">
            Allocation Decisions Walkthrough
          </h3>

          <div className="space-y-2 max-h-72 overflow-y-auto">
            {result.steps.map(step => (
              <div
                key={step.stepNumber}
                className={`p-3 rounded-xl border text-xs flex items-start space-x-2.5 ${
                  step.status === 'allocated'
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                    : 'bg-red-50/70 border-red-200 text-red-950'
                }`}
              >
                {step.status === 'allocated' ? (
                  <CheckCircle2 className="w-4 h-4 text-app-success shrink-0 mt-0.5" />
                ) : (
                  <AlertOctagon className="w-4 h-4 text-app-error shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-bold flex items-center space-x-1.5">
                    <span>Step {step.stepNumber}: {step.process.name}</span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-white/70">
                      {step.status}
                    </span>
                  </div>
                  <p className="opacity-90 mt-0.5 leading-relaxed">{step.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fragmentation Metrics Card */}
        <div className="bg-surface p-5 rounded-2xl border border-app-border shadow-subtle space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-main pb-2 border-b border-app-border">
            Fragmentation Summary
          </h3>

          <div className="grid grid-cols-2 gap-3 font-mono">
            <div className="p-4 bg-amber-50 border border-amber-200/80 rounded-xl">
              <span className="text-[10px] font-bold text-amber-800 uppercase block">
                Total Internal Fragmentation
              </span>
              <span className="text-xl font-extrabold text-amber-900 mt-1 block">
                {result.totalInternalFragmentation} KB
              </span>
              <p className="text-[10px] text-amber-700 mt-1">
                Wasted space inside allocated blocks
              </p>
            </div>

            <div className="p-4 bg-red-50 border border-red-200/80 rounded-xl">
              <span className="text-[10px] font-bold text-red-800 uppercase block">
                External Fragmentation
              </span>
              <span className="text-xl font-extrabold text-red-900 mt-1 block">
                {result.externalFragmentation} KB
              </span>
              <p className="text-[10px] text-red-700 mt-1">
                Total free memory scattered across non-contiguous holes
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
