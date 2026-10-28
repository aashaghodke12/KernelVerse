export interface DiskStep {
  stepNumber: number;
  fromTrack: number;
  toTrack: number;
  seekDistance: number;
  cumulativeDistance: number;
  reason: string;
}

export interface DiskSchedulingResult {
  algorithm: 'fcfs' | 'sstf' | 'scan' | 'c-scan' | 'look' | 'c-look';
  seekSequence: number[];
  totalHeadMovement: number;
  averageSeekDistance: number;
  steps: DiskStep[];
}

export function runDiskScheduling(
  algorithm: 'fcfs' | 'sstf' | 'scan' | 'c-scan' | 'look' | 'c-look',
  requests: number[],
  initialHead: number,
  maxTrack: number = 199,
  direction: 'left' | 'right' = 'right'
): DiskSchedulingResult {
  const sequence: number[] = [initialHead];
  const steps: DiskStep[] = [];
  let currentHead = initialHead;
  let totalDistance = 0;

  if (algorithm === 'fcfs') {
    for (const req of requests) {
      sequence.push(req);
    }
  } else if (algorithm === 'sstf') {
    const pending = [...requests];
    while (pending.length > 0) {
      let closestIdx = 0;
      let minDistance = Math.abs(pending[0] - currentHead);

      for (let i = 1; i < pending.length; i++) {
        const d = Math.abs(pending[i] - currentHead);
        if (d < minDistance) {
          minDistance = d;
          closestIdx = i;
        }
      }

      currentHead = pending[closestIdx];
      sequence.push(currentHead);
      pending.splice(closestIdx, 1);
    }
  } else if (algorithm === 'scan') {
    const left = requests.filter(r => r < initialHead).sort((a, b) => b - a);
    const right = requests.filter(r => r >= initialHead).sort((a, b) => a - b);

    if (direction === 'right') {
      sequence.push(...right);
      if (left.length > 0) {
        if (!sequence.includes(maxTrack)) sequence.push(maxTrack);
        sequence.push(...left);
      }
    } else {
      sequence.push(...left);
      if (right.length > 0) {
        if (!sequence.includes(0)) sequence.push(0);
        sequence.push(...right);
      }
    }
  } else if (algorithm === 'c-scan') {
    const left = requests.filter(r => r < initialHead).sort((a, b) => a - b);
    const right = requests.filter(r => r >= initialHead).sort((a, b) => a - b);

    if (direction === 'right') {
      sequence.push(...right);
      if (left.length > 0) {
        if (!sequence.includes(maxTrack)) sequence.push(maxTrack);
        sequence.push(0);
        sequence.push(...left);
      }
    } else {
      const leftRev = [...left].reverse();
      const rightRev = [...right].reverse();
      sequence.push(...leftRev);
      if (right.length > 0) {
        if (!sequence.includes(0)) sequence.push(0);
        sequence.push(maxTrack);
        sequence.push(...rightRev);
      }
    }
  } else if (algorithm === 'look') {
    const left = requests.filter(r => r < initialHead).sort((a, b) => b - a);
    const right = requests.filter(r => r >= initialHead).sort((a, b) => a - b);

    if (direction === 'right') {
      sequence.push(...right);
      sequence.push(...left);
    } else {
      sequence.push(...left);
      sequence.push(...right);
    }
  } else if (algorithm === 'c-look') {
    const left = requests.filter(r => r < initialHead).sort((a, b) => a - b);
    const right = requests.filter(r => r >= initialHead).sort((a, b) => a - b);

    if (direction === 'right') {
      sequence.push(...right);
      sequence.push(...left);
    } else {
      const leftRev = [...left].reverse();
      const rightRev = [...right].reverse();
      sequence.push(...leftRev);
      sequence.push(...rightRev);
    }
  }

  // Calculate distances & steps
  for (let i = 1; i < sequence.length; i++) {
    const from = sequence[i - 1];
    const to = sequence[i];
    const diff = Math.abs(to - from);
    totalDistance += diff;

    steps.push({
      stepNumber: i,
      fromTrack: from,
      toTrack: to,
      seekDistance: diff,
      cumulativeDistance: totalDistance,
      reason: `Head moves from cylinder ${from} to ${to} (|${to} - ${from}| = ${diff} cylinders).`,
    });
  }

  const avgDistance = requests.length > 0 ? parseFloat((totalDistance / requests.length).toFixed(2)) : 0;

  return {
    algorithm,
    seekSequence: sequence,
    totalHeadMovement: totalDistance,
    averageSeekDistance: avgDistance,
    steps,
  };
}
