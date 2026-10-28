import React, { useState } from 'react';
import {
  Play,
  RotateCcw,
  Plus,
  Trash2,
  Clock,
  Sparkles,
  Award,
  CheckCircle2,
} from 'lucide-react';
import {
  ProcessItem,
  runFCFS,
  runSJFNonPreemptive,
  runSRTF,
  runRoundRobin,
  runPriority,
  CpuSchedulingResult,
} from '../../algorithms/cpuScheduling';
import { speechService } from '../../services/speechService';
import { progressService } from '../../services/progressService';

const DEFAULT_PROCESSES: ProcessItem[] = [
  { id: '1', name: 'P1', arrivalTime: 0, burstTime: 4, priority: 2 },
  { id: '2', name: 'P2', arrivalTime: 1, burstTime: 3, priority: 1 },
  { id: '3', name: 'P3', arrivalTime: 2, burstTime: 1, priority: 3 },
  { id: '4', name: 'P4', arrivalTime: 3, burstTime: 2, priority: 4 },
];

export const CpuSchedulingView: React.FC = () => {
  const [algorithm, setAlgorithm] = useState<'fcfs' | 'sjf' | 'srtf' | 'rr' | 'priority'>('fcfs');
  const [quantum, setQuantum] = useState<number>(2);
  const [processes, setProcesses] = useState<ProcessItem[]>(DEFAULT_PROCESSES);

  // Compute results
  let result: CpuSchedulingResult;
  if (algorithm === 'fcfs') result = runFCFS(processes);
  else if (algorithm === 'sjf') result = runSJFNonPreemptive(processes);
  else if (algorithm === 'srtf') result = runSRTF(processes);
  else if (algorithm === 'rr') result = runRoundRobin(processes, quantum);
  else result = runPriority(processes, false);

  const handleAddProcess = () => {
    const nextNum = processes.length + 1;
    setProcesses(prev => [
      ...prev,
      {
        id: String(Date.now()),
        name: `P${nextNum}`,
        arrivalTime: prev.length,
        burstTime: 3,
        priority: 2,
      },
    ]);
  };

  const handleDeleteProcess = (id: string) => {
    if (processes.length <= 1) return;
    setProcesses(prev => prev.filter(p => p.id !== id));
  };

  const handleUpdateProcess = (id: string, field: keyof ProcessItem, val: number) => {
    setProcesses(prev =>
      prev.map(p => (p.id === id ? { ...p, [field]: Math.max(0, val) } : p))
    );
  };

  const handleNarrateSummary = () => {
    const text = `CPU scheduling using ${algorithm.toUpperCase()}. Average Turnaround Time is ${result.averageTurnaroundTime} milliseconds, and Average Waiting Time is ${result.averageWaitingTime} milliseconds across ${result.metrics.length} processes.`;
    speechService.speak(text);
  };

  const totalDuration = result.ganttChart.length > 0
    ? result.ganttChart[result.ganttChart.length - 1].endTime
    : 1;

  const COLORS = ['#315EFB', '#7657F6', '#15966A', '#D99116', '#EC4899', '#06B6D4'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="bg-surface p-6 rounded-3xl border border-app-border shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-violet-600 uppercase tracking-wider mb-1 font-mono">
            <Clock className="w-4 h-4" />
            <span>Process Management Simulator</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-text-main tracking-tight">
            CPU Scheduling & Gantt Chart Visualizer
          </h1>
          <p className="text-xs text-text-muted mt-1 max-w-2xl leading-relaxed">
            Simulate and contrast classical scheduling policies. Inspect animated Gantt timeline segments, turnaround times, and waiting queues.
          </p>
        </div>

        <button
          onClick={handleNarrateSummary}
          className="flex items-center space-x-1.5 px-3.5 py-2 bg-blue-50 text-primary-blue border border-blue-200 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Narrate Metrics</span>
        </button>
      </div>

      {/* Algorithm Selector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-100/80 rounded-2xl border border-app-border">
        <div className="flex flex-wrap items-center gap-1 text-xs font-semibold">
          {[
            { id: 'fcfs', label: 'FCFS' },
            { id: 'sjf', label: 'SJF (Non-preemptive)' },
            { id: 'srtf', label: 'SRTF (Preemptive SJF)' },
            { id: 'rr', label: 'Round Robin' },
            { id: 'priority', label: 'Priority' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setAlgorithm(item.id as any)}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                algorithm === item.id
                  ? 'bg-white text-primary-blue shadow-xs font-bold'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {algorithm === 'rr' && (
          <div className="flex items-center space-x-2 bg-white px-3 py-1 rounded-xl border border-slate-200 text-xs">
            <span className="font-semibold text-slate-500 font-mono">Time Quantum (q):</span>
            <input
              type="number"
              min="1"
              value={quantum}
              onChange={e => setQuantum(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="w-12 text-center font-bold font-mono bg-slate-50 border border-slate-200 rounded px-1"
            />
          </div>
        )}
      </div>

      {/* Interactive Gantt Chart */}
      <div className="bg-surface p-5 rounded-2xl border border-app-border shadow-subtle space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-main">
            Interactive Gantt Timeline
          </h3>
          <span className="text-xs font-mono text-slate-400">Total Duration: {totalDuration} ms</span>
        </div>

        {/* Visual Gantt Bar */}
        <div className="w-full bg-slate-100 rounded-xl p-1.5 border border-slate-200">
          <div className="flex h-12 rounded-lg overflow-hidden divide-x divide-white/40">
            {result.ganttChart.map((segment, idx) => {
              const widthPct = ((segment.endTime - segment.startTime) / (totalDuration || 1)) * 100;
              const isIdle = segment.processName === 'Idle';
              const pIdx = processes.findIndex(p => p.name === segment.processName);
              const color = isIdle ? '#94A3B8' : COLORS[pIdx % COLORS.length];

              return (
                <div
                  key={idx}
                  style={{ width: `${widthPct}%`, backgroundColor: color }}
                  className="relative group flex items-center justify-center text-white text-xs font-bold transition-all hover:brightness-110"
                >
                  <span className="truncate px-1 font-mono">{segment.processName}</span>

                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full mb-1.5 hidden group-hover:block bg-slate-900 text-white text-[10px] py-1 px-2 rounded font-mono shadow-md whitespace-nowrap z-10">
                    {segment.processName}: {segment.startTime}ms → {segment.endTime}ms (Duration: {segment.endTime - segment.startTime}ms)
                  </div>
                </div>
              );
            })}
          </div>

          {/* Time Tick Marks */}
          <div className="flex justify-between text-[10px] font-mono text-slate-400 pt-1 px-0.5">
            <span>0</span>
            {result.ganttChart.map((segment, idx) => (
              <span key={idx}>{segment.endTime}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Process Inputs Table & Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Process Inputs Card */}
        <div className="bg-surface p-5 rounded-2xl border border-app-border shadow-subtle space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-app-border">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-main">
              Process Inputs
            </h3>
            <button
              onClick={handleAddProcess}
              className="flex items-center space-x-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-text-main rounded-lg text-xs font-medium"
            >
              <Plus className="w-3.5 h-3.5 text-primary-blue" />
              <span>Add Process</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-center">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-mono text-[11px]">
                  <th className="py-1 px-2 text-left">Process</th>
                  <th className="py-1 px-2">Arrival (AT)</th>
                  <th className="py-1 px-2">Burst (BT)</th>
                  {algorithm === 'priority' && <th className="py-1 px-2">Priority</th>}
                  <th className="py-1 px-1"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {processes.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/60">
                    <td className="py-1.5 px-2 text-left font-bold text-text-main">{p.name}</td>
                    <td className="py-1.5 px-1">
                      <input
                        type="number"
                        min="0"
                        value={p.arrivalTime}
                        onChange={e => handleUpdateProcess(p.id, 'arrivalTime', parseInt(e.target.value, 10))}
                        className="w-14 text-center bg-slate-50 border border-slate-200 rounded py-0.5 text-xs font-bold"
                      />
                    </td>
                    <td className="py-1.5 px-1">
                      <input
                        type="number"
                        min="1"
                        value={p.burstTime}
                        onChange={e => handleUpdateProcess(p.id, 'burstTime', parseInt(e.target.value, 10))}
                        className="w-14 text-center bg-slate-50 border border-slate-200 rounded py-0.5 text-xs font-bold"
                      />
                    </td>
                    {algorithm === 'priority' && (
                      <td className="py-1.5 px-1">
                        <input
                          type="number"
                          min="1"
                          value={p.priority ?? 1}
                          onChange={e => handleUpdateProcess(p.id, 'priority', parseInt(e.target.value, 10))}
                          className="w-14 text-center bg-slate-50 border border-slate-200 rounded py-0.5 text-xs font-bold"
                        />
                      </td>
                    )}
                    <td className="py-1.5 px-1">
                      <button
                        onClick={() => handleDeleteProcess(p.id)}
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

        {/* Calculated Metrics Card */}
        <div className="bg-surface p-5 rounded-2xl border border-app-border shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-app-border">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-main">
              Calculated Performance Metrics
            </h3>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
              Automated
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-center">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-mono text-[11px]">
                  <th className="py-1 px-2 text-left">Process</th>
                  <th className="py-1 px-2">CT</th>
                  <th className="py-1 px-2">TAT</th>
                  <th className="py-1 px-2">WT</th>
                  <th className="py-1 px-2">RT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {result.metrics.map(m => (
                  <tr key={m.name} className="hover:bg-slate-50/60">
                    <td className="py-1.5 px-2 text-left font-bold text-text-main">{m.name}</td>
                    <td className="py-1.5 px-2 text-slate-600">{m.completionTime}</td>
                    <td className="py-1.5 px-2 font-bold text-primary-blue">{m.turnaroundTime}</td>
                    <td className="py-1.5 px-2 font-bold text-violet-700">{m.waitingTime}</td>
                    <td className="py-1.5 px-2 text-slate-600">{m.responseTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Average Summaries */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl">
              <span className="text-[10px] font-mono uppercase font-semibold text-slate-500 block">
                Average Turnaround (TAT)
              </span>
              <span className="text-base font-extrabold text-primary-blue font-mono">
                {result.averageTurnaroundTime} ms
              </span>
            </div>

            <div className="p-3 bg-violet-50/60 border border-violet-100 rounded-xl">
              <span className="text-[10px] font-mono uppercase font-semibold text-slate-500 block">
                Average Waiting (WT)
              </span>
              <span className="text-base font-extrabold text-violet-700 font-mono">
                {result.averageWaitingTime} ms
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
