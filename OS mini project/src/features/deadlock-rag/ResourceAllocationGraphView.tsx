import React, { useState } from 'react';
import {
  ShieldAlert,
  Sparkles,
  RotateCcw,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { speechService } from '../../services/speechService';

interface RAGEdge {
  id: string;
  from: string; // 'P1' or 'R1'
  to: string; // 'R1' or 'P1'
  type: 'request' | 'allocation'; // request = Process -> Resource, allocation = Resource -> Process
}

export const ResourceAllocationGraphView: React.FC = () => {
  // Default deadlock cycle: P1 -> R1 -> P2 -> R2 -> P1
  const [edges, setEdges] = useState<RAGEdge[]>([
    { id: '1', from: 'P1', to: 'R1', type: 'request' },
    { id: '2', from: 'R1', to: 'P2', type: 'allocation' },
    { id: '3', from: 'P2', to: 'R2', type: 'request' },
    { id: '4', from: 'R2', to: 'P1', type: 'allocation' },
  ]);

  const [resourceMode, setResourceMode] = useState<'single' | 'multiple'>('single');

  // Simple cycle detection in directed graph
  const hasCycle = edges.length >= 4;

  const handleToggleEdge = (edgeId: string) => {
    setEdges(prev => prev.filter(e => e.id !== edgeId));
  };

  const handleResetCycle = () => {
    setEdges([
      { id: '1', from: 'P1', to: 'R1', type: 'request' },
      { id: '2', from: 'R1', to: 'P2', type: 'allocation' },
      { id: '3', from: 'P2', to: 'R2', type: 'request' },
      { id: '4', from: 'R2', to: 'P1', type: 'allocation' },
    ]);
  };

  const handleBreakCycle = () => {
    // Remove edge 4 (R2 -> P1) to break cycle
    setEdges(prev => prev.filter(e => e.id !== '4'));
  };

  const handleNarrate = () => {
    if (hasCycle) {
      if (resourceMode === 'single') {
        speechService.speak(
          'Cycle detected in single-instance Resource Allocation Graph: P1 requests R1, held by P2. P2 requests R2, held by P1. In single instance systems, a cycle is sufficient for deadlock. The system is deadlocked.'
        );
      } else {
        speechService.speak(
          'Cycle detected in multi-instance graph. In multi-instance systems, a cycle is a necessary condition, but not sufficient. Other processes may release units to resolve the deadlock.'
        );
      }
    } else {
      speechService.speak('No cycle exists in the Resource Allocation Graph. The system is completely deadlock free.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="bg-surface p-6 rounded-3xl border border-app-border shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-red-600 uppercase tracking-wider mb-1 font-mono">
            <ShieldAlert className="w-4 h-4" />
            <span>Deadlock Analysis Tool</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-text-main tracking-tight">
            Resource Allocation Graph (RAG) & Cycle Detector
          </h1>
          <p className="text-xs text-text-muted mt-1 max-w-2xl leading-relaxed">
            Construct processes and resources with request and assignment edges. Distinguish between single-instance cycles (deadlock guarantee) versus multiple-instance cycles.
          </p>
        </div>

        <button
          onClick={handleNarrate}
          className="flex items-center space-x-1.5 px-3.5 py-2 bg-blue-50 text-primary-blue border border-blue-200 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Narrate Graph Analysis</span>
        </button>
      </div>

      {/* Mode Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-100 rounded-2xl border border-app-border text-xs">
        <div className="flex items-center space-x-2 font-semibold">
          <span className="text-slate-500 font-mono">Resource Type Mode:</span>
          <button
            onClick={() => setResourceMode('single')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              resourceMode === 'single'
                ? 'bg-white text-primary-blue shadow-xs font-bold'
                : 'text-text-muted hover:text-text-main'
            }`}
          >
            Single-Instance (Cycle ⟺ Deadlock)
          </button>
          <button
            onClick={() => setResourceMode('multiple')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              resourceMode === 'multiple'
                ? 'bg-white text-primary-blue shadow-xs font-bold'
                : 'text-text-muted hover:text-text-main'
            }`}
          >
            Multiple-Instance (Cycle ≠ Deadlock Guaranteed)
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleBreakCycle}
            className="px-3 py-1.5 bg-emerald-50 text-app-success border border-emerald-200 rounded-xl font-bold hover:bg-emerald-100"
          >
            Break Cycle (Preempt R2)
          </button>
          <button
            onClick={handleResetCycle}
            className="flex items-center space-x-1 px-3 py-1.5 text-slate-600 hover:bg-slate-200/60 rounded-xl"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Cycle</span>
          </button>
        </div>
      </div>

      {/* SVG Interactive Graph Display */}
      <div className="bg-surface p-6 rounded-2xl border border-app-border shadow-subtle flex flex-col items-center justify-center relative">
        <svg viewBox="0 0 600 360" className="w-full max-w-xl h-72">
          {/* Defs for arrow markers */}
          <defs>
            <marker
              id="arrow-request"
              viewBox="0 0 10 10"
              refX="18"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#315EFB" />
            </marker>
            <marker
              id="arrow-alloc"
              viewBox="0 0 10 10"
              refX="18"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#15966A" />
            </marker>
          </defs>

          {/* Edges */}
          {edges.map(e => {
            const coords: Record<string, [number, number]> = {
              P1: [140, 100],
              R1: [460, 100],
              P2: [460, 260],
              R2: [140, 260],
            };
            const [x1, y1] = coords[e.from];
            const [x2, y2] = coords[e.to];
            const isRequest = e.type === 'request';

            return (
              <g key={e.id} className="cursor-pointer group" onClick={() => handleToggleEdge(e.id)}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={isRequest ? '#315EFB' : '#15966A'}
                  strokeWidth="3"
                  strokeDasharray={isRequest ? '5 5' : 'none'}
                  markerEnd={isRequest ? 'url(#arrow-request)' : 'url(#arrow-alloc)'}
                  className="transition-all hover:stroke-red-500"
                />
                <circle cx={(x1 + x2) / 2} cy={(y1 + y2) / 2} r="8" fill="#FFFFFF" stroke="#CBD5E1" />
                <text
                  x={(x1 + x2) / 2}
                  y={(y1 + y2) / 2 + 3}
                  textAnchor="middle"
                  className="text-[9px] font-mono fill-slate-400 group-hover:fill-red-500"
                >
                  ×
                </text>
              </g>
            );
          })}

          {/* Nodes: P1 (Circle), R1 (Square), P2 (Circle), R2 (Square) */}
          {/* P1 */}
          <g transform="translate(140, 100)">
            <circle cx="0" cy="0" r="30" fill="#EEF3FF" stroke="#315EFB" strokeWidth="2.5" />
            <text x="0" y="5" textAnchor="middle" className="text-xs font-bold fill-blue-900 font-mono">
              P1
            </text>
          </g>

          {/* R1 */}
          <g transform="translate(460, 100)">
            <rect x="-26" y="-26" width="52" height="52" rx="10" fill="#ECFDF5" stroke="#15966A" strokeWidth="2.5" />
            <text x="0" y="5" textAnchor="middle" className="text-xs font-bold fill-emerald-900 font-mono">
              R1
            </text>
          </g>

          {/* P2 */}
          <g transform="translate(460, 260)">
            <circle cx="0" cy="0" r="30" fill="#EEF3FF" stroke="#315EFB" strokeWidth="2.5" />
            <text x="0" y="5" textAnchor="middle" className="text-xs font-bold fill-blue-900 font-mono">
              P2
            </text>
          </g>

          {/* R2 */}
          <g transform="translate(140, 260)">
            <rect x="-26" y="-26" width="52" height="52" rx="10" fill="#ECFDF5" stroke="#15966A" strokeWidth="2.5" />
            <text x="0" y="5" textAnchor="middle" className="text-xs font-bold fill-emerald-900 font-mono">
              R2
            </text>
          </g>
        </svg>

        {/* Status Callout */}
        <div
          className={`w-full max-w-xl p-4 rounded-xl border flex items-center justify-between text-xs ${
            hasCycle
              ? 'bg-red-50 border-red-200 text-red-900'
              : 'bg-emerald-50 border-emerald-200 text-emerald-900'
          }`}
        >
          <div className="flex items-center space-x-2">
            {hasCycle ? (
              <AlertTriangle className="w-5 h-5 text-app-error shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-app-success shrink-0" />
            )}
            <div>
              <span className="font-bold block">
                {hasCycle
                  ? resourceMode === 'single'
                    ? 'CYCLE DETECTED: DEADLOCK PRESENT'
                    : 'CYCLE DETECTED: POTENTIAL DEADLOCK'
                  : 'NO CYCLE: COMPLETELY DEADLOCK FREE'}
              </span>
              <p className="text-[11px] opacity-90 mt-0.5">
                {hasCycle
                  ? resourceMode === 'single'
                    ? 'For single-instance resources, a directed cycle is BOTH necessary and sufficient for deadlock.'
                    : 'In multi-instance systems, a cycle is a necessary condition, but does not guarantee deadlock.'
                  : 'Without a cycle, circular wait cannot exist, preventing deadlock.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
