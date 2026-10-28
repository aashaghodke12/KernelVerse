import { BankerState, BankerStep, BankerSafetyResult, RequestSimulationResult, ResourceMatrix, ResourceVector } from '../types';

export const DEFAULT_BANKER_STATE: BankerState = {
  processNames: ['P0', 'P1', 'P2', 'P3', 'P4'],
  resourceNames: ['A', 'B', 'C'],
  allocation: [
    [0, 1, 0], // P0
    [2, 0, 0], // P1
    [3, 0, 2], // P2
    [2, 1, 1], // P3
    [0, 0, 2], // P4
  ],
  max: [
    [7, 5, 3], // P0
    [3, 2, 2], // P1
    [9, 0, 2], // P2
    [2, 2, 2], // P3
    [4, 3, 3], // P4
  ],
  available: [3, 3, 2],
};

export const UNSAFE_PRESET_BANKER_STATE: BankerState = {
  processNames: ['P0', 'P1', 'P2', 'P3'],
  resourceNames: ['R1', 'R2'],
  allocation: [
    [2, 0],
    [1, 1],
    [2, 1],
    [0, 2],
  ],
  max: [
    [3, 2],
    [2, 2],
    [4, 3],
    [1, 3],
  ],
  available: [0, 1],
};

export function computeNeedMatrix(max: ResourceMatrix, allocation: ResourceMatrix): ResourceMatrix {
  return max.map((maxRow, pIdx) => {
    return maxRow.map((maxVal, rIdx) => {
      const allocVal = allocation[pIdx]?.[rIdx] ?? 0;
      return Math.max(0, maxVal - allocVal);
    });
  });
}

export function isVectorLessOrEqual(a: ResourceVector, b: ResourceVector): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] > b[i]) return false;
  }
  return true;
}

export function addVectors(a: ResourceVector, b: ResourceVector): ResourceVector {
  return a.map((val, idx) => val + (b[idx] ?? 0));
}

export function subVectors(a: ResourceVector, b: ResourceVector): ResourceVector {
  return a.map((val, idx) => val - (b[idx] ?? 0));
}

export function formatVector(v: ResourceVector, names?: string[]): string {
  if (names && names.length === v.length) {
    return `[${names.map((name, i) => `${name}:${v[i]}`).join(', ')}]`;
  }
  return `[${v.join(', ')}]`;
}

/**
 * Runs the Banker's safety algorithm, generating rich step-by-step telemetry
 * with speech narration texts for synchronized playback.
 */
export function runBankerSafetyAlgorithm(state: BankerState): BankerSafetyResult {
  const pCount = state.processNames.length;
  const rCount = state.resourceNames.length;
  const need = state.need ?? computeNeedMatrix(state.max, state.allocation);
  
  let work: ResourceVector = [...state.available];
  const finish: boolean[] = new Array(pCount).fill(false);
  const safeSequence: string[] = [];
  const steps: BankerStep[] = [];
  
  let stepCount = 0;
  let progressMade = true;
  let lastCheckedIdx = 0;

  while (progressMade && safeSequence.length < pCount) {
    progressMade = false;

    for (let offset = 0; offset < pCount; offset++) {
      const i = (lastCheckedIdx + offset) % pCount;
      if (!finish[i]) {
        const pName = state.processNames[i];
        const pNeed = need[i];
        const pAlloc = state.allocation[i];
        const workBefore = [...work];

        const isEligible = isVectorLessOrEqual(pNeed, work);

        if (isEligible) {
          // Process can complete!
          work = addVectors(work, pAlloc);
          finish[i] = true;
          safeSequence.push(pName);
          progressMade = true;
          stepCount++;
          lastCheckedIdx = (i + 1) % pCount;

          const speech = `Process ${pName} can finish because its remaining need ${formatVector(pNeed)} is less than or equal to the available Work vector ${formatVector(workBefore)}. We add its allocated resources ${formatVector(pAlloc)} back to Work, making Work ${formatVector(work)}, and mark ${pName} as finished.`;

          steps.push({
            stepNumber: stepCount,
            processIndex: i,
            processName: pName,
            workBefore,
            needVector: pNeed,
            allocationVector: pAlloc,
            isEligible: true,
            reason: `Need ${formatVector(pNeed)} ≤ Work ${formatVector(workBefore)}. Process can finish and release its resources.`,
            workAfter: [...work],
            finishedProcesses: [...finish],
            safeSequenceSoFar: [...safeSequence],
            speechText: speech,
          });

          // Break to evaluate subsequent processes in sequence
          break;
        } else {
          // Process cannot finish currently
          stepCount++;
          const speech = `Process ${pName} requires ${formatVector(pNeed)}, which exceeds current available Work ${formatVector(workBefore)}. Process ${pName} must wait.`;

          steps.push({
            stepNumber: stepCount,
            processIndex: i,
            processName: pName,
            workBefore,
            needVector: pNeed,
            allocationVector: pAlloc,
            isEligible: false,
            reason: `Need ${formatVector(pNeed)} > Work ${formatVector(workBefore)}. Resources currently insufficient.`,
            workAfter: [...work],
            finishedProcesses: [...finish],
            safeSequenceSoFar: [...safeSequence],
            speechText: speech,
          });
        }
      }
    }
  }

  const isSafe = finish.every((f) => f === true);
  return {
    isSafe,
    safeSequence: isSafe ? safeSequence : [],
    steps,
    finalWork: work,
    errorMessage: isSafe
      ? undefined
      : `System is in an UNSAFE state. No process could satisfy Need <= Work with available resources. Deadlock may occur if processes demand maximum resources.`,
  };
}

/**
 * Validates ANY proposed safe sequence submitted by a student
 * dynamically using the true Banker's algorithm logic.
 */
export function validateCustomSafeSequence(
  state: BankerState,
  proposedSequence: string[]
): { isValid: boolean; message: string; stepDetails: string[] } {
  const pCount = state.processNames.length;
  const need = state.need ?? computeNeedMatrix(state.max, state.allocation);

  if (proposedSequence.length !== pCount) {
    return {
      isValid: false,
      message: `Sequence contains ${proposedSequence.length} processes, but there are ${pCount} processes in the system.`,
      stepDetails: [],
    };
  }

  // Check duplicates
  const set = new Set(proposedSequence);
  if (set.size !== pCount) {
    return {
      isValid: false,
      message: 'Sequence contains duplicate or missing processes.',
      stepDetails: [],
    };
  }

  let currentWork = [...state.available];
  const stepDetails: string[] = [];

  for (let i = 0; i < proposedSequence.length; i++) {
    const pName = proposedSequence[i];
    const pIdx = state.processNames.indexOf(pName);
    if (pIdx === -1) {
      return {
        isValid: false,
        message: `Unknown process '${pName}' in sequence.`,
        stepDetails,
      };
    }

    const pNeed = need[pIdx];
    const pAlloc = state.allocation[pIdx];

    if (!isVectorLessOrEqual(pNeed, currentWork)) {
      stepDetails.push(
        `Step ${i + 1}: ${pName} failed! Need ${formatVector(pNeed)} exceeds current Work ${formatVector(currentWork)}.`
      );
      return {
        isValid: false,
        message: `Invalid sequence! At step ${i + 1}, process ${pName}'s Need ${formatVector(pNeed)} exceeds available Work ${formatVector(currentWork)}.`,
        stepDetails,
      };
    }

    const nextWork = addVectors(currentWork, pAlloc);
    stepDetails.push(
      `Step ${i + 1}: ${pName} executed! Need ${formatVector(pNeed)} ≤ Work ${formatVector(currentWork)}. New Work = ${formatVector(nextWork)}.`
    );
    currentWork = nextWork;
  }

  return {
    isValid: true,
    message: `Outstanding! Sequence [${proposedSequence.join(' → ')}] is completely SAFE and satisfies all resource constraints!`,
    stepDetails,
  };
}

/**
 * Simulates a resource request according to Banker's Resource-Request Algorithm.
 */
export function simulateResourceRequest(
  state: BankerState,
  processIndex: number,
  requestVector: ResourceVector
): RequestSimulationResult {
  const pName = state.processNames[processIndex];
  const need = state.need ?? computeNeedMatrix(state.max, state.allocation);
  const pNeed = need[processIndex];

  // Rule 1: Request[i] <= Need[i]
  if (!isVectorLessOrEqual(requestVector, pNeed)) {
    return {
      canBeGranted: false,
      errorStage: 'exceeds_max',
      reason: `Error: Process ${pName} requested ${formatVector(requestVector)}, which exceeds its remaining declared need ${formatVector(pNeed)}. The request violates the maximum claim.`,
    };
  }

  // Rule 2: Request[i] <= Available
  if (!isVectorLessOrEqual(requestVector, state.available)) {
    return {
      canBeGranted: false,
      errorStage: 'unavailable',
      reason: `Wait: Process ${pName} requested ${formatVector(requestVector)}, but currently available resources are only ${formatVector(state.available)}. Process must wait.`,
    };
  }

  // Tentative allocation:
  const newAvailable = subVectors(state.available, requestVector);
  const newAllocation = state.allocation.map((row, idx) =>
    idx === processIndex ? addVectors(row, requestVector) : [...row]
  );
  const newNeed = need.map((row, idx) =>
    idx === processIndex ? subVectors(row, requestVector) : [...row]
  );

  const tentativeState: BankerState = {
    ...state,
    available: newAvailable,
    allocation: newAllocation,
    need: newNeed,
  };

  const safetyResult = runBankerSafetyAlgorithm(tentativeState);

  if (safetyResult.isSafe) {
    return {
      canBeGranted: true,
      reason: `Success! The request of ${formatVector(requestVector)} by ${pName} can be safely granted. The system remains in a safe state with sequence: <${safetyResult.safeSequence.join(', ')}>.`,
      newAllocation,
      newNeed,
      newAvailable,
      safetyResult,
    };
  } else {
    return {
      canBeGranted: false,
      errorStage: 'unsafe',
      reason: `Denied (Deadlock Avoidance): Granting ${formatVector(requestVector)} to ${pName} leaves the system in an UNSAFE state. No safe sequence exists. The tentative allocation has been rolled back.`,
      newAllocation: state.allocation,
      newNeed: need,
      newAvailable: state.available,
      safetyResult,
    };
  }
}
