export interface PageStep {
  stepIndex: number;
  page: number;
  frames: (number | null)[];
  isHit: boolean;
  replacedPage: number | null;
  reason: string;
}

export interface PageReplacementResult {
  algorithm: 'fifo' | 'lru' | 'optimal';
  referenceString: number[];
  frameCount: number;
  steps: PageStep[];
  totalHits: number;
  totalFaults: number;
  hitRatio: number;
  faultRatio: number;
}

export function runPageReplacement(
  algorithm: 'fifo' | 'lru' | 'optimal',
  referenceString: number[],
  frameCount: number
): PageReplacementResult {
  const frames: (number | null)[] = new Array(frameCount).fill(null);
  const steps: PageStep[] = [];
  let hits = 0;
  let faults = 0;

  // FIFO tracking: order of entry
  const fifoQueue: number[] = [];
  // LRU tracking: last used time
  const lastUsedMap = new Map<number, number>();

  for (let i = 0; i < referenceString.length; i++) {
    const page = referenceString[i];
    const isHit = frames.includes(page);
    let replacedPage: number | null = null;
    let reason = '';

    if (isHit) {
      hits++;
      lastUsedMap.set(page, i);
      reason = `Page ${page} is already in frame ${frames.indexOf(page) + 1}. Page Hit!`;
    } else {
      faults++;
      const emptySlot = frames.indexOf(null);

      if (emptySlot !== -1) {
        // Free frame available
        frames[emptySlot] = page;
        fifoQueue.push(page);
        lastUsedMap.set(page, i);
        reason = `Page Fault: Allocated into empty Frame ${emptySlot + 1}.`;
      } else {
        // Replacement needed
        if (algorithm === 'fifo') {
          const victim = fifoQueue.shift()!;
          const victimIdx = frames.indexOf(victim);
          replacedPage = victim;
          frames[victimIdx] = page;
          fifoQueue.push(page);
          reason = `Page Fault: Replaced oldest page ${victim} in Frame ${victimIdx + 1} (FIFO).`;
        } else if (algorithm === 'lru') {
          let leastRecentTime = Infinity;
          let victimIdx = 0;

          for (let f = 0; f < frames.length; f++) {
            const fPage = frames[f]!;
            const lastTime = lastUsedMap.get(fPage) ?? -1;
            if (lastTime < leastRecentTime) {
              leastRecentTime = lastTime;
              victimIdx = f;
            }
          }

          replacedPage = frames[victimIdx];
          reason = `Page Fault: Replaced page ${replacedPage} in Frame ${victimIdx + 1} (Least Recently Used at step ${leastRecentTime + 1}).`;
          frames[victimIdx] = page;
        } else if (algorithm === 'optimal') {
          let farthestDist = -1;
          let victimIdx = 0;

          for (let f = 0; f < frames.length; f++) {
            const fPage = frames[f]!;
            let nextUse = Infinity;

            for (let k = i + 1; k < referenceString.length; k++) {
              if (referenceString[k] === fPage) {
                nextUse = k;
                break;
              }
            }

            if (nextUse > farthestDist) {
              farthestDist = nextUse;
              victimIdx = f;
            }
          }

          replacedPage = frames[victimIdx];
          const distDesc = farthestDist === Infinity ? 'never used again' : `next used at step ${farthestDist + 1}`;
          reason = `Page Fault: Replaced page ${replacedPage} in Frame ${victimIdx + 1} (${distDesc}, optimal choice).`;
          frames[victimIdx] = page;
        }

        lastUsedMap.set(page, i);
      }
    }

    steps.push({
      stepIndex: i + 1,
      page,
      frames: [...frames],
      isHit,
      replacedPage,
      reason,
    });
  }

  const total = referenceString.length || 1;
  const hitRatio = parseFloat(((hits / total) * 100).toFixed(1));
  const faultRatio = parseFloat(((faults / total) * 100).toFixed(1));

  return {
    algorithm,
    referenceString,
    frameCount,
    steps,
    totalHits: hits,
    totalFaults: faults,
    hitRatio,
    faultRatio,
  };
}
