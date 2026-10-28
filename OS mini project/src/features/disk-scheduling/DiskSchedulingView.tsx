import React, { useState } from 'react';
import {
  HardDrive,
  Sparkles,
  RotateCcw,
  Play,
  ArrowRight,
  TrendingDown,
} from 'lucide-react';
import {
  runDiskScheduling,
  DiskSchedulingResult,
} from '../../algorithms/diskScheduling';
import { speechService } from '../../services/speechService';

const DEFAULT_REQUESTS = [98, 183, 37, 122, 14, 124, 65, 67];

export const DiskSchedulingView: React.FC = () => {
  const [algorithm, setAlgorithm] = useState<'fcfs' | 'sstf' | 'scan' | 'c-scan' | 'look' | 'c-look'>('fcfs');
  const [requestsInput, setRequestsInput] = useState<string>('98, 183, 37, 122, 14, 124, 65, 67');
  const [initialHead, setInitialHead] = useState<number>(53);
  const [direction, setDirection] = useState<'left' | 'right'>('right');

  const requests = requestsInput
    .split(',')
    .map(s => parseInt(s.trim(), 10))
    .filter(n => !isNaN(n));

  const result: DiskSchedulingResult = runDiskScheduling(
    algorithm,
    requests,
    initialHead,
    199,
    direction
  );

  const handleNarrate = () => {
    const text = `Disk scheduling using ${algorithm.toUpperCase()}. Initial head at cylinder ${initialHead}. Total head movement is ${result.totalHeadMovement} cylinders, with an average seek distance of ${result.averageSeekDistance} cylinders per request.`;
    speechService.speak(text);
  };

  const maxCylinder = 199;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="bg-surface p-6 rounded-3xl border border-app-border shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1 font-mono">
            <HardDrive className="w-4 h-4" />
            <span>Secondary Storage Visualizer</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-text-main tracking-tight">
            Disk Scheduling & Seek Optimization
          </h1>
          <p className="text-xs text-text-muted mt-1 max-w-2xl leading-relaxed">
            Trace the mechanical read/write head arm path across magnetic platters. Compare FCFS, SSTF, Elevator SCAN, C-SCAN, and LOOK policies to minimize mechanical seek latency.
          </p>
        </div>

        <button
          onClick={handleNarrate}
          className="flex items-center space-x-1.5 px-3.5 py-2 bg-blue-50 text-primary-blue border border-blue-200 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Narrate Seek Path</span>
        </button>
      </div>

      {/* Algorithm Pills & Controls */}
      <div className="bg-surface p-4 rounded-2xl border border-app-border shadow-subtle flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-xl font-semibold">
          {[
            { id: 'fcfs', label: 'FCFS' },
            { id: 'sstf', label: 'SSTF' },
            { id: 'scan', label: 'SCAN (Elevator)' },
            { id: 'c-scan', label: 'C-SCAN' },
            { id: 'look', label: 'LOOK' },
            { id: 'c-look', label: 'C-LOOK' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setAlgorithm(item.id as any)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                algorithm === item.id
                  ? 'bg-white text-primary-blue shadow-xs font-bold'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Inputs */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl font-mono">
            <span className="font-semibold text-slate-500">Initial Head:</span>
            <input
              type="number"
              min="0"
              max="199"
              value={initialHead}
              onChange={e => setInitialHead(Math.max(0, parseInt(e.target.value, 10) || 0))}
              className="w-14 text-center font-bold bg-white border border-slate-300 rounded py-0.5"
            />
          </div>

          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl font-mono">
            <span className="font-semibold text-slate-500">Direction:</span>
            <select
              value={direction}
              onChange={e => setDirection(e.target.value as any)}
              className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-xs font-bold"
            >
              <option value="right">Right (Ascending)</option>
              <option value="left">Left (Descending)</option>
            </select>
          </div>

          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl font-mono">
            <span className="font-semibold text-slate-500">Requests:</span>
            <input
              type="text"
              value={requestsInput}
              onChange={e => setRequestsInput(e.target.value)}
              className="w-48 text-xs font-bold bg-white border border-slate-300 rounded px-2 py-0.5"
            />
          </div>
        </div>
      </div>

      {/* Graphical Cylinder Track Arm Movement Trace */}
      <div className="bg-surface p-6 rounded-2xl border border-app-border shadow-subtle space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-app-border">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-main">
            Disk Head Travel Path (Cylinders 0 to {maxCylinder})
          </h3>
          <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded">
            Total Head Movement: {result.totalHeadMovement} Cylinders
          </span>
        </div>

        {/* SVG Head Path Visualizer */}
        <div className="w-full bg-slate-50 rounded-xl p-4 border border-slate-200 overflow-x-auto">
          <svg viewBox="0 0 700 240" className="w-full min-w-[600px] h-60">
            {/* Cylinder Track Grid Lines */}
            {[0, 50, 100, 150, 199].map(cyl => {
              const x = 30 + (cyl / maxCylinder) * 640;
              return (
                <g key={cyl}>
                  <line x1={x} y1={20} x2={x} y2={220} stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3 3" />
                  <text x={x} y={15} textAnchor="middle" className="text-[10px] font-mono fill-slate-400">
                    {cyl}
                  </text>
                </g>
              );
            })}

            {/* Travel Path Zig-Zag Line */}
            {result.seekSequence.map((cyl, idx) => {
              if (idx === 0) return null;
              const prevCyl = result.seekSequence[idx - 1];
              const x1 = 30 + (prevCyl / maxCylinder) * 640;
              const y1 = 30 + (idx - 1) * (180 / Math.max(1, result.seekSequence.length - 1));
              const x2 = 30 + (cyl / maxCylinder) * 640;
              const y2 = 30 + idx * (180 / Math.max(1, result.seekSequence.length - 1));

              return (
                <g key={idx}>
                  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#315EFB" strokeWidth="2.5" />
                  <circle cx={x2} cy={y2} r="5" fill="#315EFB" />
                  <text x={x2} y={y2 - 8} textAnchor="middle" className="text-[10px] font-mono font-bold fill-slate-700">
                    {cyl}
                  </text>
                </g>
              );
            })}

            {/* Starting Head Dot */}
            <circle
              cx={30 + (initialHead / maxCylinder) * 640}
              cy={30}
              r="7"
              fill="#15966A"
              stroke="#FFFFFF"
              strokeWidth="2"
            />
          </svg>
        </div>

        {/* Ordered Service Sequence */}
        <div className="p-3 bg-panel-tint border border-blue-100 rounded-xl flex items-center justify-between text-xs">
          <span className="font-semibold text-text-main">Serviced Head Sequence:</span>
          <div className="flex items-center space-x-1.5 font-mono font-bold text-primary-blue">
            {result.seekSequence.map((c, idx) => (
              <React.Fragment key={idx}>
                <span className="px-2 py-0.5 bg-blue-100 rounded">{c}</span>
                {idx < result.seekSequence.length - 1 && (
                  <ArrowRight className="w-3 h-3 text-blue-400" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
