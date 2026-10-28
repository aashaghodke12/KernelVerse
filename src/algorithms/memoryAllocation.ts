export interface MemoryBlock {
  id: string;
  size: number;
  originalSize: number;
  processName: string | null;
  processSize: number | null;
  internalFragmentation: number;
}

export interface MemoryProcess {
  id: string;
  name: string;
  size: number;
}

export interface MemoryAllocationStep {
  stepNumber: number;
  process: MemoryProcess;
  allocatedBlockId: string | null;
  status: 'allocated' | 'failed';
  reason: string;
  blocksSnapshot: MemoryBlock[];
  totalInternalFragmentation: number;
  externalFragmentation: number;
}

export interface MemoryAllocationResult {
  algorithm: 'first-fit' | 'best-fit' | 'worst-fit';
  finalBlocks: MemoryBlock[];
  steps: MemoryAllocationStep[];
  allocatedProcesses: string[];
  unallocatedProcesses: string[];
  totalInternalFragmentation: number;
  externalFragmentation: number;
}

export function runMemoryAllocation(
  algorithm: 'first-fit' | 'best-fit' | 'worst-fit',
  initialBlockSizes: number[],
  processes: MemoryProcess[]
): MemoryAllocationResult {
  const blocks: MemoryBlock[] = initialBlockSizes.map((size, idx) => ({
    id: `Block-${idx + 1}`,
    size,
    originalSize: size,
    processName: null,
    processSize: null,
    internalFragmentation: 0,
  }));

  const steps: MemoryAllocationStep[] = [];
  const allocatedProcesses: string[] = [];
  const unallocatedProcesses: string[] = [];

  for (let pIdx = 0; pIdx < processes.length; pIdx++) {
    const proc = processes[pIdx];
    let chosenIdx = -1;

    if (algorithm === 'first-fit') {
      for (let i = 0; i < blocks.length; i++) {
        if (!blocks[i].processName && blocks[i].size >= proc.size) {
          chosenIdx = i;
          break;
        }
      }
    } else if (algorithm === 'best-fit') {
      let minDiff = Infinity;
      for (let i = 0; i < blocks.length; i++) {
        if (!blocks[i].processName && blocks[i].size >= proc.size) {
          const diff = blocks[i].size - proc.size;
          if (diff < minDiff) {
            minDiff = diff;
            chosenIdx = i;
          }
        }
      }
    } else if (algorithm === 'worst-fit') {
      let maxDiff = -1;
      for (let i = 0; i < blocks.length; i++) {
        if (!blocks[i].processName && blocks[i].size >= proc.size) {
          const diff = blocks[i].size - proc.size;
          if (diff > maxDiff) {
            maxDiff = diff;
            chosenIdx = i;
          }
        }
      }
    }

    if (chosenIdx !== -1) {
      const b = blocks[chosenIdx];
      const internalFrag = b.size - proc.size;
      b.processName = proc.name;
      b.processSize = proc.size;
      b.internalFragmentation = internalFrag;

      allocatedProcesses.push(proc.name);

      const totalIF = blocks.reduce((acc, blk) => acc + blk.internalFragmentation, 0);
      const freeCap = blocks.filter(blk => !blk.processName).reduce((acc, blk) => acc + blk.size, 0);

      steps.push({
        stepNumber: pIdx + 1,
        process: proc,
        allocatedBlockId: b.id,
        status: 'allocated',
        reason: `${proc.name} (${proc.size} KB) allocated to ${b.id} (${b.originalSize} KB). Leftover internal space = ${internalFrag} KB.`,
        blocksSnapshot: JSON.parse(JSON.stringify(blocks)),
        totalInternalFragmentation: totalIF,
        externalFragmentation: freeCap,
      });
    } else {
      unallocatedProcesses.push(proc.name);
      const totalIF = blocks.reduce((acc, blk) => acc + blk.internalFragmentation, 0);
      const freeCap = blocks.filter(blk => !blk.processName).reduce((acc, blk) => acc + blk.size, 0);

      steps.push({
        stepNumber: pIdx + 1,
        process: proc,
        allocatedBlockId: null,
        status: 'failed',
        reason: `${proc.name} (${proc.size} KB) cannot be allocated! No single free partition is large enough. Total free external memory across fragmented holes is ${freeCap} KB.`,
        blocksSnapshot: JSON.parse(JSON.stringify(blocks)),
        totalInternalFragmentation: totalIF,
        externalFragmentation: freeCap,
      });
    }
  }

  const totalIF = blocks.reduce((acc, blk) => acc + blk.internalFragmentation, 0);
  const freeCap = blocks.filter(blk => !blk.processName).reduce((acc, blk) => acc + blk.size, 0);

  return {
    algorithm,
    finalBlocks: blocks,
    steps,
    allocatedProcesses,
    unallocatedProcesses,
    totalInternalFragmentation: totalIF,
    externalFragmentation: unallocatedProcesses.length > 0 ? freeCap : 0,
  };
}
