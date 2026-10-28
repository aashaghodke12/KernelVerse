import React, { useState } from 'react';
import {
  RefreshCw,
  Sparkles,
  Lock,
  Unlock,
  Play,
  RotateCcw,
  Utensils,
  Package,
  BookOpen,
} from 'lucide-react';
import { speechService } from '../../services/speechService';

export const SynchronizationView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'producer-consumer' | 'dining-philosophers' | 'mutex'>('producer-consumer');

  // Producer-Consumer Buffer State
  const BUFFER_SIZE = 5;
  const [buffer, setBuffer] = useState<number[]>([1, 2]);
  const [inIndex, setInIndex] = useState<number>(2);
  const [outIndex, setOutIndex] = useState<number>(0);
  const [itemCounter, setItemCounter] = useState<number>(3);
  const [pcLog, setPcLog] = useState<string>('Buffer initialized with 2 items.');

  const handleProduce = () => {
    if (buffer.length >= BUFFER_SIZE) {
      setPcLog('Buffer FULL! Producer blocked on semWait(empty).');
      speechService.speak('Buffer is full. The producer is blocked and must wait for a consumer to consume an item.');
      return;
    }
    const newItem = itemCounter;
    setBuffer(prev => [...prev, newItem]);
    setItemCounter(prev => prev + 1);
    setInIndex((inIndex + 1) % BUFFER_SIZE);
    setPcLog(`Produced Item #${newItem} into buffer slot. Available spaces: ${BUFFER_SIZE - (buffer.length + 1)}.`);
    speechService.speak(`Producer placed item ${newItem} into buffer.`);
  };

  const handleConsume = () => {
    if (buffer.length === 0) {
      setPcLog('Buffer EMPTY! Consumer blocked on semWait(full).');
      speechService.speak('Buffer is empty. The consumer is blocked until the producer places an item.');
      return;
    }
    const consumed = buffer[0];
    setBuffer(prev => prev.slice(1));
    setOutIndex((outIndex + 1) % BUFFER_SIZE);
    setPcLog(`Consumed Item #${consumed} from buffer slot. Buffer count: ${buffer.length - 1}.`);
    speechService.speak(`Consumer removed item ${consumed} from buffer.`);
  };

  // Dining Philosophers State (5 philosophers, 5 chopsticks)
  // State: 0 = Thinking, 1 = Hungry, 2 = Eating
  const [philosophers, setPhilosophers] = useState<number[]>([0, 0, 0, 0, 0]);
  const [chopsticks, setChopsticks] = useState<boolean[]>([false, false, false, false, false]); // false = free, true = taken
  const [dpLog, setDpLog] = useState<string>('All 5 philosophers are currently Thinking peacefully.');

  const handleToggleEat = (pIdx: number) => {
    const leftChopstick = pIdx;
    const rightChopstick = (pIdx + 1) % 5;

    if (philosophers[pIdx] === 2) {
      // Release chopsticks & return to Thinking
      const nextPhilo = [...philosophers];
      nextPhilo[pIdx] = 0;
      setPhilosophers(nextPhilo);

      const nextChop = [...chopsticks];
      nextChop[leftChopstick] = false;
      nextChop[rightChopstick] = false;
      setChopsticks(nextChop);

      setDpLog(`Philosopher ${pIdx} finished eating, put down chopsticks ${leftChopstick} and ${rightChopstick}, and resumed Thinking.`);
      speechService.speak(`Philosopher ${pIdx} finished eating and put down chopsticks.`);
    } else {
      // Wants to eat
      if (chopsticks[leftChopstick] || chopsticks[rightChopstick]) {
        setDpLog(`Philosopher ${pIdx} is Hungry but CANNOT eat! Chopstick ${chopsticks[leftChopstick] ? leftChopstick : rightChopstick} is held by neighbor.`);
        speechService.speak(`Philosopher ${pIdx} cannot acquire both chopsticks and must wait.`);
        const nextPhilo = [...philosophers];
        nextPhilo[pIdx] = 1;
        setPhilosophers(nextPhilo);
      } else {
        const nextPhilo = [...philosophers];
        nextPhilo[pIdx] = 2; // Eating
        setPhilosophers(nextPhilo);

        const nextChop = [...chopsticks];
        nextChop[leftChopstick] = true;
        nextChop[rightChopstick] = true;
        setChopsticks(nextChop);

        setDpLog(`Philosopher ${pIdx} acquired chopsticks ${leftChopstick} and ${rightChopstick} and is now EATING!`);
        speechService.speak(`Philosopher ${pIdx} picked up both chopsticks and is eating.`);
      }
    }
  };

  // Mutex Lock Simulation
  const [mutexOwner, setMutexOwner] = useState<string | null>(null);
  const [mutexWaitQueue, setMutexWaitQueue] = useState<string[]>([]);

  const handleRequestLock = (proc: string) => {
    if (!mutexOwner) {
      setMutexOwner(proc);
      speechService.speak(`${proc} acquired mutex lock and entered Critical Section.`);
    } else if (mutexOwner === proc) {
      // Already owns
    } else {
      if (!mutexWaitQueue.includes(proc)) {
        setMutexWaitQueue(prev => [...prev, proc]);
        speechService.speak(`Mutex held by ${mutexOwner}. ${proc} added to wait queue.`);
      }
    }
  };

  const handleReleaseLock = () => {
    if (!mutexOwner) return;
    const releasing = mutexOwner;
    if (mutexWaitQueue.length > 0) {
      const next = mutexWaitQueue[0];
      setMutexWaitQueue(prev => prev.slice(1));
      setMutexOwner(next);
      speechService.speak(`${releasing} released lock. ${next} acquired lock and entered Critical Section.`);
    } else {
      setMutexOwner(null);
      speechService.speak(`${releasing} released lock. Mutex is now free.`);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="bg-surface p-6 rounded-3xl border border-app-border shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1 font-mono">
            <RefreshCw className="w-4 h-4" />
            <span>Process Synchronization Suite</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-text-main tracking-tight">
            Concurrency, Semaphores & Critical Sections
          </h1>
          <p className="text-xs text-text-muted mt-1 max-w-2xl leading-relaxed">
            Interactive demonstrations of bounded-buffer Producer-Consumer, Dining Philosophers deadlock avoidance, and binary Mutex locks.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 p-1.5 bg-slate-100 rounded-2xl border border-app-border text-xs font-semibold">
        <button
          onClick={() => setActiveTab('producer-consumer')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
            activeTab === 'producer-consumer'
              ? 'bg-white text-primary-blue shadow-xs font-bold'
              : 'text-text-muted hover:text-text-main'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Producer–Consumer (Bounded Buffer)</span>
        </button>

        <button
          onClick={() => setActiveTab('dining-philosophers')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
            activeTab === 'dining-philosophers'
              ? 'bg-white text-primary-blue shadow-xs font-bold'
              : 'text-text-muted hover:text-text-main'
          }`}
        >
          <Utensils className="w-4 h-4" />
          <span>Dining Philosophers</span>
        </button>

        <button
          onClick={() => setActiveTab('mutex')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
            activeTab === 'mutex'
              ? 'bg-white text-primary-blue shadow-xs font-bold'
              : 'text-text-muted hover:text-text-main'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Mutex Lock & Critical Section</span>
        </button>
      </div>

      {/* Tab 1: Producer Consumer */}
      {activeTab === 'producer-consumer' && (
        <div className="space-y-6">
          <div className="bg-surface p-5 rounded-2xl border border-app-border shadow-subtle space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-main">
                Circular Bounded Buffer (Capacity: {BUFFER_SIZE})
              </h3>
              <span className="text-xs font-mono text-slate-400">
                Count: {buffer.length} / {BUFFER_SIZE}
              </span>
            </div>

            {/* Visual Buffer Slots */}
            <div className="flex items-center justify-center space-x-3 py-6">
              {Array.from({ length: BUFFER_SIZE }).map((_, idx) => {
                const item = buffer[idx];
                const isOccupied = item !== undefined;

                return (
                  <div
                    key={idx}
                    className={`w-16 h-16 rounded-2xl border-2 flex flex-col items-center justify-center transition-all ${
                      isOccupied
                        ? 'bg-blue-50 border-primary-blue text-primary-blue shadow-sm'
                        : 'bg-slate-50 border-dashed border-slate-300 text-slate-300'
                    }`}
                  >
                    <span className="text-[10px] text-slate-400 font-mono">Slot {idx}</span>
                    <span className="text-sm font-extrabold font-mono mt-0.5">
                      {isOccupied ? `Item #${item}` : 'Empty'}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-center space-x-4 pt-2">
              <button
                onClick={handleProduce}
                className="px-5 py-2.5 bg-primary-blue text-white rounded-xl text-xs font-bold hover:bg-blue-600 shadow-xs transition-colors"
              >
                + Produce Item
              </button>
              <button
                onClick={handleConsume}
                className="px-5 py-2.5 bg-violet-600 text-white rounded-xl text-xs font-bold hover:bg-violet-700 shadow-xs transition-colors"
              >
                - Consume Item
              </button>
            </div>

            {/* Telemetry Log */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-700 text-center">
              {pcLog}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Dining Philosophers */}
      {activeTab === 'dining-philosophers' && (
        <div className="bg-surface p-5 rounded-2xl border border-app-border shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-main">
              Circular Dining Table (5 Philosophers, 5 Chopsticks)
            </h3>
            <span className="text-xs font-mono text-slate-400">Click a philosopher to toggle eat/think</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 py-4">
            {philosophers.map((status, pIdx) => {
              const statusLabel = status === 2 ? 'EATING' : status === 1 ? 'HUNGRY (WAITING)' : 'THINKING';
              const cardBg =
                status === 2
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : status === 1
                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                  : 'bg-white border-slate-200 text-slate-700';

              return (
                <div
                  key={pIdx}
                  onClick={() => handleToggleEat(pIdx)}
                  className={`p-4 rounded-2xl border cursor-pointer hover:shadow-md transition-all flex flex-col justify-between h-40 ${cardBg}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm">Philo {pIdx}</span>
                    <Utensils className="w-4 h-4 opacity-70" />
                  </div>

                  <div className="text-center">
                    <span className="text-[10px] uppercase font-mono font-bold block">
                      {statusLabel}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                      Chopsticks: {pIdx} & {(pIdx + 1) % 5}
                    </span>
                  </div>

                  <div className="text-center text-[10px] font-bold text-primary-blue bg-white/70 py-1 rounded-lg">
                    {status === 2 ? 'Put Down' : 'Pick Up'}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Log */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-700 text-center">
            {dpLog}
          </div>
        </div>
      )}

      {/* Tab 3: Mutex */}
      {activeTab === 'mutex' && (
        <div className="bg-surface p-5 rounded-2xl border border-app-border shadow-subtle space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-main">
            Binary Mutex & Critical Section Protection
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
            {/* Processes Requesting */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <span className="text-xs font-bold text-slate-700 block">Available Threads</span>
              {['Thread 1', 'Thread 2', 'Thread 3'].map(proc => (
                <button
                  key={proc}
                  onClick={() => handleRequestLock(proc)}
                  disabled={mutexOwner === proc}
                  className="w-full py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 hover:border-blue-400 hover:text-primary-blue disabled:opacity-40 transition-all flex items-center justify-center space-x-1.5"
                >
                  <Lock className="w-3.5 h-3.5 text-primary-blue" />
                  <span>Request Lock: {proc}</span>
                </button>
              ))}
            </div>

            {/* Critical Section */}
            <div className="bg-blue-50/70 p-4 rounded-2xl border-2 border-primary-blue flex flex-col justify-between text-center">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-primary-blue block">
                  Protected Critical Section
                </span>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Only 1 thread allowed at a time
                </span>
              </div>

              <div className="py-6">
                {mutexOwner ? (
                  <div className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-blue text-white font-bold rounded-xl shadow-xs">
                    <Lock className="w-4 h-4" />
                    <span>{mutexOwner} EXECUTING</span>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 font-mono italic">
                    Critical Section is Idle (Lock Free)
                  </span>
                )}
              </div>

              <button
                onClick={handleReleaseLock}
                disabled={!mutexOwner}
                className="w-full py-2 bg-app-success text-white rounded-xl text-xs font-bold hover:bg-emerald-700 disabled:opacity-40 transition-colors"
              >
                Release Mutex Lock
              </button>
            </div>

            {/* Wait Queue */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <span className="text-xs font-bold text-slate-700 block">
                Blocked Threads Queue ({mutexWaitQueue.length})
              </span>
              <div className="space-y-1.5">
                {mutexWaitQueue.length === 0 ? (
                  <span className="text-xs text-slate-400 font-mono italic block pt-3 text-center">
                    No threads waiting
                  </span>
                ) : (
                  mutexWaitQueue.map((proc, idx) => (
                    <div
                      key={idx}
                      className="p-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-amber-700 flex items-center space-x-2"
                    >
                      <span className="w-4 h-4 rounded-full bg-amber-100 text-[10px] flex items-center justify-center font-sans">
                        {idx + 1}
                      </span>
                      <span>{proc} (Blocked)</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
