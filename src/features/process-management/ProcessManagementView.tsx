import React, { useState } from 'react';
import {
  Cpu,
  Sparkles,
  ArrowRight,
  Database,
  FileText,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { speechService } from '../../services/speechService';

export const ProcessManagementView: React.FC = () => {
  const [selectedState, setSelectedState] = useState<string>('Running');
  const [activePcbProcess, setActivePcbProcess] = useState<'P0' | 'P1'>('P0');
  const [isContextSwitching, setIsContextSwitching] = useState<boolean>(false);

  const STATES = [
    { name: 'New', desc: 'Process is being created and loaded into RAM structures.' },
    { name: 'Ready', desc: 'Waiting in the ready queue to be allocated CPU by the scheduler.' },
    { name: 'Running', desc: 'Instructions are actively executing on the CPU core.' },
    { name: 'Waiting', desc: 'Waiting for an I/O event, semaphore lock, or hardware interrupt.' },
    { name: 'Terminated', desc: 'Finished execution; OS reclaims memory and PCB descriptors.' },
  ];

  const handleSimulateContextSwitch = () => {
    setIsContextSwitching(true);
    const target = activePcbProcess === 'P0' ? 'P1' : 'P0';
    speechService.speak(
      `Context switch initiated! CPU saves state of ${activePcbProcess} into its PCB, updates program counter, and reloads state of ${target} from its PCB.`
    );

    setTimeout(() => {
      setActivePcbProcess(target);
      setIsContextSwitching(false);
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="bg-surface p-6 rounded-3xl border border-app-border shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-violet-600 uppercase tracking-wider mb-1 font-mono">
            <Cpu className="w-4 h-4" />
            <span>Process Concept Visualizer</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-text-main tracking-tight">
            Process Lifecycle States & PCB Architecture
          </h1>
          <p className="text-xs text-text-muted mt-1 max-w-2xl leading-relaxed">
            Explore 5-state process lifecycle transitions, examine hardware registers stored inside the Process Control Block (PCB), and visualize CPU context switching.
          </p>
        </div>

        <button
          onClick={handleSimulateContextSwitch}
          disabled={isContextSwitching}
          className="flex items-center space-x-1.5 px-4 py-2 bg-primary-blue text-white rounded-xl text-xs font-bold hover:bg-blue-600 shadow-xs transition-colors disabled:opacity-50"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isContextSwitching ? 'animate-spin' : ''}`} />
          <span>{isContextSwitching ? 'Switching Context...' : 'Trigger Context Switch'}</span>
        </button>
      </div>

      {/* 5-State Lifecycle Diagram */}
      <div className="bg-surface p-6 rounded-2xl border border-app-border shadow-subtle space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-main">
          5-State Process Lifecycle Diagram
        </h3>

        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 py-6">
          {STATES.map((st, idx) => {
            const isSelected = selectedState === st.name;

            return (
              <React.Fragment key={st.name}>
                <button
                  onClick={() => {
                    setSelectedState(st.name);
                    speechService.speak(`${st.name} state: ${st.desc}`);
                  }}
                  className={`px-5 py-3 rounded-2xl border-2 font-bold text-xs transition-all flex flex-col items-center ${
                    isSelected
                      ? 'bg-blue-50 border-primary-blue text-primary-blue shadow-md scale-105'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span className="font-mono text-sm">{st.name}</span>
                </button>

                {idx < STATES.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-slate-300 hidden md:block shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Selected State Description Card */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-center space-x-3">
          <span className="font-bold text-primary-blue font-mono uppercase tracking-wider shrink-0">
            {selectedState} State:
          </span>
          <p className="text-slate-600">
            {STATES.find(s => s.name === selectedState)?.desc}
          </p>
        </div>
      </div>

      {/* Interactive PCB Explorer & Context Switching Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PCB Explorer */}
        <div className="bg-surface p-5 rounded-2xl border border-app-border shadow-subtle space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-app-border">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-primary-blue" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-main">
                Process Control Block (PCB_{activePcbProcess})
              </h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
              Kernel Data Structure
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex justify-between">
              <span className="text-slate-500">Process ID (PID)</span>
              <span className="font-bold text-primary-blue">{activePcbProcess === 'P0' ? '1042' : '1088'}</span>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex justify-between">
              <span className="text-slate-500">Current State</span>
              <span className="font-bold text-emerald-600">RUNNING</span>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex justify-between">
              <span className="text-slate-500">Program Counter (PC)</span>
              <span className="font-bold text-violet-700">{activePcbProcess === 'P0' ? '0x00401A24' : '0x00402F10'}</span>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex justify-between">
              <span className="text-slate-500">CPU Registers (EAX, EBX, ESP)</span>
              <span className="font-bold text-slate-700">[0x04, 0x1A, 0x7FFF00]</span>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex justify-between">
              <span className="text-slate-500">Memory Limits</span>
              <span className="font-bold text-slate-700">Base: 0x1000, Limit: 0x5000</span>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex justify-between">
              <span className="text-slate-500">Open File Descriptors</span>
              <span className="font-bold text-slate-700">[stdin:0, stdout:1, file.txt:3]</span>
            </div>
          </div>
        </div>

        {/* Context Switching Mechanics */}
        <div className="bg-surface p-5 rounded-2xl border border-app-border shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-app-border">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-main">
              Context Switch Overhead Analysis
            </h3>
            <span className="text-[10px] font-mono text-amber-800 bg-amber-50 px-2 py-0.5 rounded font-bold">
              Pure Overhead
            </span>
          </div>

          <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
            <p>
              A <strong>Context Switch</strong> occurs when the operating system kernel stops running one process, saves its state into its PCB, and restores the execution state of another process from its respective PCB.
            </p>
            <div className="p-3 bg-panel-tint border border-blue-100 rounded-xl space-y-1">
              <div className="font-bold text-primary-blue text-[11px] uppercase font-mono">
                Why Context Switching is Pure Overhead:
              </div>
              <p className="text-[11px] text-slate-600">
                The CPU performs zero useful computational work for user programs during a context switch. It spends hardware cycles flushing TLB caches, storing registers, and reloading page tables.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
