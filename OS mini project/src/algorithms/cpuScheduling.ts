export interface ProcessItem {
  id: string;
  name: string;
  arrivalTime: number;
  burstTime: number;
  priority?: number;
}

export interface GanttSegment {
  processName: string;
  startTime: number;
  endTime: number;
  color?: string;
}

export interface ProcessMetrics {
  name: string;
  arrivalTime: number;
  burstTime: number;
  completionTime: number;
  turnaroundTime: number;
  waitingTime: number;
  responseTime: number;
}

export interface CpuSchedulingResult {
  ganttChart: GanttSegment[];
  metrics: ProcessMetrics[];
  averageTurnaroundTime: number;
  averageWaitingTime: number;
  averageResponseTime: number;
  timelineSteps: {
    time: number;
    runningProcess: string | null;
    readyQueue: string[];
    description: string;
  }[];
}

export function runFCFS(processes: ProcessItem[]): CpuSchedulingResult {
  const sorted = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
  const gantt: GanttSegment[] = [];
  const metrics: ProcessMetrics[] = [];
  const timeline: CpuSchedulingResult['timelineSteps'] = [];

  let currentTime = 0;

  for (const p of sorted) {
    if (currentTime < p.arrivalTime) {
      gantt.push({ processName: 'Idle', startTime: currentTime, endTime: p.arrivalTime });
      currentTime = p.arrivalTime;
    }

    const start = currentTime;
    const end = start + p.burstTime;
    gantt.push({ processName: p.name, startTime: start, endTime: end });

    const completionTime = end;
    const turnaroundTime = completionTime - p.arrivalTime;
    const waitingTime = turnaroundTime - p.burstTime;
    const responseTime = start - p.arrivalTime;

    metrics.push({
      name: p.name,
      arrivalTime: p.arrivalTime,
      burstTime: p.burstTime,
      completionTime,
      turnaroundTime,
      waitingTime,
      responseTime,
    });

    timeline.push({
      time: start,
      runningProcess: p.name,
      readyQueue: sorted.filter(x => x.arrivalTime <= start && x.name !== p.name).map(x => x.name),
      description: `Time ${start}: ${p.name} assigned to CPU. Runs for ${p.burstTime}ms until time ${end}.`,
    });

    currentTime = end;
  }

  const avgTAT = metrics.reduce((acc, m) => acc + m.turnaroundTime, 0) / (metrics.length || 1);
  const avgWT = metrics.reduce((acc, m) => acc + m.waitingTime, 0) / (metrics.length || 1);
  const avgRT = metrics.reduce((acc, m) => acc + m.responseTime, 0) / (metrics.length || 1);

  return {
    ganttChart: gantt,
    metrics,
    averageTurnaroundTime: parseFloat(avgTAT.toFixed(2)),
    averageWaitingTime: parseFloat(avgWT.toFixed(2)),
    averageResponseTime: parseFloat(avgRT.toFixed(2)),
    timelineSteps: timeline,
  };
}

export function runSJFNonPreemptive(processes: ProcessItem[]): CpuSchedulingResult {
  const procs = processes.map(p => ({ ...p, finished: false }));
  const gantt: GanttSegment[] = [];
  const metrics: ProcessMetrics[] = [];
  const timeline: CpuSchedulingResult['timelineSteps'] = [];

  let currentTime = 0;
  let finishedCount = 0;

  while (finishedCount < procs.length) {
    const available = procs.filter(p => !p.finished && p.arrivalTime <= currentTime);

    if (available.length === 0) {
      // CPU Idle
      const nextArrival = Math.min(...procs.filter(p => !p.finished).map(p => p.arrivalTime));
      gantt.push({ processName: 'Idle', startTime: currentTime, endTime: nextArrival });
      currentTime = nextArrival;
      continue;
    }

    available.sort((a, b) => a.burstTime - b.burstTime);
    const chosen = available[0];

    const start = currentTime;
    const end = start + chosen.burstTime;
    gantt.push({ processName: chosen.name, startTime: start, endTime: end });

    chosen.finished = true;
    finishedCount++;

    const completionTime = end;
    const turnaroundTime = completionTime - chosen.arrivalTime;
    const waitingTime = turnaroundTime - chosen.burstTime;
    const responseTime = start - chosen.arrivalTime;

    metrics.push({
      name: chosen.name,
      arrivalTime: chosen.arrivalTime,
      burstTime: chosen.burstTime,
      completionTime,
      turnaroundTime,
      waitingTime,
      responseTime,
    });

    timeline.push({
      time: start,
      runningProcess: chosen.name,
      readyQueue: available.filter(x => x.name !== chosen.name).map(x => x.name),
      description: `Time ${start}: Selected ${chosen.name} with shortest burst (${chosen.burstTime}ms). Runs to completion at ${end}.`,
    });

    currentTime = end;
  }

  const avgTAT = metrics.reduce((acc, m) => acc + m.turnaroundTime, 0) / (metrics.length || 1);
  const avgWT = metrics.reduce((acc, m) => acc + m.waitingTime, 0) / (metrics.length || 1);
  const avgRT = metrics.reduce((acc, m) => acc + m.responseTime, 0) / (metrics.length || 1);

  return {
    ganttChart: gantt,
    metrics,
    averageTurnaroundTime: parseFloat(avgTAT.toFixed(2)),
    averageWaitingTime: parseFloat(avgWT.toFixed(2)),
    averageResponseTime: parseFloat(avgRT.toFixed(2)),
    timelineSteps: timeline,
  };
}

export function runSRTF(processes: ProcessItem[]): CpuSchedulingResult {
  const n = processes.length;
  const remBurst = processes.map(p => p.burstTime);
  const firstResponse = new Array(n).fill(-1);
  const completion = new Array(n).fill(0);
  const gantt: GanttSegment[] = [];

  let currentTime = 0;
  let complete = 0;
  let lastProc = -1;

  while (complete < n) {
    let shortest = -1;
    let minBurst = Infinity;

    for (let i = 0; i < n; i++) {
      if (processes[i].arrivalTime <= currentTime && remBurst[i] > 0) {
        if (remBurst[i] < minBurst) {
          minBurst = remBurst[i];
          shortest = i;
        }
      }
    }

    if (shortest === -1) {
      if (lastProc !== -2) {
        gantt.push({ processName: 'Idle', startTime: currentTime, endTime: currentTime + 1 });
        lastProc = -2;
      } else {
        gantt[gantt.length - 1].endTime = currentTime + 1;
      }
      currentTime++;
      continue;
    }

    if (firstResponse[shortest] === -1) {
      firstResponse[shortest] = currentTime;
    }

    if (lastProc !== shortest) {
      gantt.push({ processName: processes[shortest].name, startTime: currentTime, endTime: currentTime + 1 });
      lastProc = shortest;
    } else {
      gantt[gantt.length - 1].endTime = currentTime + 1;
    }

    remBurst[shortest]--;
    currentTime++;

    if (remBurst[shortest] === 0) {
      complete++;
      completion[shortest] = currentTime;
    }
  }

  const metrics: ProcessMetrics[] = processes.map((p, i) => {
    const tat = completion[i] - p.arrivalTime;
    const wt = tat - p.burstTime;
    const rt = firstResponse[i] - p.arrivalTime;
    return {
      name: p.name,
      arrivalTime: p.arrivalTime,
      burstTime: p.burstTime,
      completionTime: completion[i],
      turnaroundTime: tat,
      waitingTime: wt,
      responseTime: rt,
    };
  });

  const avgTAT = metrics.reduce((acc, m) => acc + m.turnaroundTime, 0) / (metrics.length || 1);
  const avgWT = metrics.reduce((acc, m) => acc + m.waitingTime, 0) / (metrics.length || 1);
  const avgRT = metrics.reduce((acc, m) => acc + m.responseTime, 0) / (metrics.length || 1);

  return {
    ganttChart: gantt,
    metrics,
    averageTurnaroundTime: parseFloat(avgTAT.toFixed(2)),
    averageWaitingTime: parseFloat(avgWT.toFixed(2)),
    averageResponseTime: parseFloat(avgRT.toFixed(2)),
    timelineSteps: [],
  };
}

export function runRoundRobin(processes: ProcessItem[], quantum: number): CpuSchedulingResult {
  const q = Math.max(1, quantum);
  const n = processes.length;
  const remBurst = processes.map(p => p.burstTime);
  const firstResponse = new Array(n).fill(-1);
  const completion = new Array(n).fill(0);
  const gantt: GanttSegment[] = [];

  const readyQueue: number[] = [];
  const inQueue = new Array(n).fill(false);

  let currentTime = 0;
  let complete = 0;

  // Add initial arrivals
  processes.forEach((p, i) => {
    if (p.arrivalTime <= currentTime && !inQueue[i]) {
      readyQueue.push(i);
      inQueue[i] = true;
    }
  });

  while (complete < n) {
    if (readyQueue.length === 0) {
      // Check next arrival
      const unarrived = processes
        .map((p, i) => ({ ...p, i }))
        .filter(x => remBurst[x.i] > 0 && !inQueue[x.i]);
      if (unarrived.length > 0) {
        const nextArrival = Math.min(...unarrived.map(x => x.arrivalTime));
        gantt.push({ processName: 'Idle', startTime: currentTime, endTime: nextArrival });
        currentTime = nextArrival;
        processes.forEach((p, i) => {
          if (p.arrivalTime <= currentTime && !inQueue[i] && remBurst[i] > 0) {
            readyQueue.push(i);
            inQueue[i] = true;
          }
        });
      }
      continue;
    }

    const idx = readyQueue.shift()!;
    inQueue[idx] = false;

    if (firstResponse[idx] === -1) {
      firstResponse[idx] = currentTime;
    }

    const slice = Math.min(q, remBurst[idx]);
    const start = currentTime;
    const end = start + slice;

    gantt.push({ processName: processes[idx].name, startTime: start, endTime: end });

    remBurst[idx] -= slice;
    currentTime = end;

    // Check newly arrived processes during this quantum
    processes.forEach((p, i) => {
      if (p.arrivalTime <= currentTime && !inQueue[i] && remBurst[i] > 0 && i !== idx) {
        readyQueue.push(i);
        inQueue[i] = true;
      }
    });

    if (remBurst[idx] > 0) {
      readyQueue.push(idx);
      inQueue[idx] = true;
    } else {
      complete++;
      completion[idx] = currentTime;
    }
  }

  const metrics: ProcessMetrics[] = processes.map((p, i) => {
    const tat = completion[i] - p.arrivalTime;
    const wt = tat - p.burstTime;
    const rt = firstResponse[i] - p.arrivalTime;
    return {
      name: p.name,
      arrivalTime: p.arrivalTime,
      burstTime: p.burstTime,
      completionTime: completion[i],
      turnaroundTime: tat,
      waitingTime: wt,
      responseTime: rt,
    };
  });

  const avgTAT = metrics.reduce((acc, m) => acc + m.turnaroundTime, 0) / (metrics.length || 1);
  const avgWT = metrics.reduce((acc, m) => acc + m.waitingTime, 0) / (metrics.length || 1);
  const avgRT = metrics.reduce((acc, m) => acc + m.responseTime, 0) / (metrics.length || 1);

  return {
    ganttChart: gantt,
    metrics,
    averageTurnaroundTime: parseFloat(avgTAT.toFixed(2)),
    averageWaitingTime: parseFloat(avgWT.toFixed(2)),
    averageResponseTime: parseFloat(avgRT.toFixed(2)),
    timelineSteps: [],
  };
}

export function runPriority(processes: ProcessItem[], preemptive: boolean = false): CpuSchedulingResult {
  if (!preemptive) {
    const procs = processes.map(p => ({ ...p, finished: false, priority: p.priority ?? 5 }));
    const gantt: GanttSegment[] = [];
    const metrics: ProcessMetrics[] = [];

    let currentTime = 0;
    let finishedCount = 0;

    while (finishedCount < procs.length) {
      const available = procs.filter(p => !p.finished && p.arrivalTime <= currentTime);

      if (available.length === 0) {
        const nextArrival = Math.min(...procs.filter(p => !p.finished).map(p => p.arrivalTime));
        gantt.push({ processName: 'Idle', startTime: currentTime, endTime: nextArrival });
        currentTime = nextArrival;
        continue;
      }

      // Lower number = higher priority
      available.sort((a, b) => (a.priority ?? 5) - (b.priority ?? 5));
      const chosen = available[0];

      const start = currentTime;
      const end = start + chosen.burstTime;
      gantt.push({ processName: chosen.name, startTime: start, endTime: end });

      chosen.finished = true;
      finishedCount++;

      const completionTime = end;
      const turnaroundTime = completionTime - chosen.arrivalTime;
      const waitingTime = turnaroundTime - chosen.burstTime;
      const responseTime = start - chosen.arrivalTime;

      metrics.push({
        name: chosen.name,
        arrivalTime: chosen.arrivalTime,
        burstTime: chosen.burstTime,
        completionTime,
        turnaroundTime,
        waitingTime,
        responseTime,
      });

      currentTime = end;
    }

    const avgTAT = metrics.reduce((acc, m) => acc + m.turnaroundTime, 0) / (metrics.length || 1);
    const avgWT = metrics.reduce((acc, m) => acc + m.waitingTime, 0) / (metrics.length || 1);
    const avgRT = metrics.reduce((acc, m) => acc + m.responseTime, 0) / (metrics.length || 1);

    return {
      ganttChart: gantt,
      metrics,
      averageTurnaroundTime: parseFloat(avgTAT.toFixed(2)),
      averageWaitingTime: parseFloat(avgWT.toFixed(2)),
      averageResponseTime: parseFloat(avgRT.toFixed(2)),
      timelineSteps: [],
    };
  }

  // Preemptive Priority
  const n = processes.length;
  const remBurst = processes.map(p => p.burstTime);
  const firstResponse = new Array(n).fill(-1);
  const completion = new Array(n).fill(0);
  const gantt: GanttSegment[] = [];

  let currentTime = 0;
  let complete = 0;
  let lastProc = -1;

  while (complete < n) {
    let highest = -1;
    let highestPri = Infinity;

    for (let i = 0; i < n; i++) {
      if (processes[i].arrivalTime <= currentTime && remBurst[i] > 0) {
        const pri = processes[i].priority ?? 5;
        if (pri < highestPri) {
          highestPri = pri;
          highest = i;
        }
      }
    }

    if (highest === -1) {
      if (lastProc !== -2) {
        gantt.push({ processName: 'Idle', startTime: currentTime, endTime: currentTime + 1 });
        lastProc = -2;
      } else {
        gantt[gantt.length - 1].endTime = currentTime + 1;
      }
      currentTime++;
      continue;
    }

    if (firstResponse[highest] === -1) {
      firstResponse[highest] = currentTime;
    }

    if (lastProc !== highest) {
      gantt.push({ processName: processes[highest].name, startTime: currentTime, endTime: currentTime + 1 });
      lastProc = highest;
    } else {
      gantt[gantt.length - 1].endTime = currentTime + 1;
    }

    remBurst[highest]--;
    currentTime++;

    if (remBurst[highest] === 0) {
      complete++;
      completion[highest] = currentTime;
    }
  }

  const metrics: ProcessMetrics[] = processes.map((p, i) => {
    const tat = completion[i] - p.arrivalTime;
    const wt = tat - p.burstTime;
    const rt = firstResponse[i] - p.arrivalTime;
    return {
      name: p.name,
      arrivalTime: p.arrivalTime,
      burstTime: p.burstTime,
      completionTime: completion[i],
      turnaroundTime: tat,
      waitingTime: wt,
      responseTime: rt,
    };
  });

  const avgTAT = metrics.reduce((acc, m) => acc + m.turnaroundTime, 0) / (metrics.length || 1);
  const avgWT = metrics.reduce((acc, m) => acc + m.waitingTime, 0) / (metrics.length || 1);
  const avgRT = metrics.reduce((acc, m) => acc + m.responseTime, 0) / (metrics.length || 1);

  return {
    ganttChart: gantt,
    metrics,
    averageTurnaroundTime: parseFloat(avgTAT.toFixed(2)),
    averageWaitingTime: parseFloat(avgWT.toFixed(2)),
    averageResponseTime: parseFloat(avgRT.toFixed(2)),
    timelineSteps: [],
  };
}
