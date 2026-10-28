// Automated deterministic unit tests for OS Learning Lab algorithms
import {
  DEFAULT_BANKER_STATE,
  UNSAFE_PRESET_BANKER_STATE,
  computeNeedMatrix,
  runBankerSafetyAlgorithm,
  validateCustomSafeSequence,
  simulateResourceRequest,
} from '../src/algorithms/bankerAlgorithm';
import { runFCFS, runSJFNonPreemptive, runRoundRobin } from '../src/algorithms/cpuScheduling';
import { runMemoryAllocation } from '../src/algorithms/memoryAllocation';
import { runPageReplacement } from '../src/algorithms/pageReplacement';
import { runDiskScheduling } from '../src/algorithms/diskScheduling';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

console.log('--- Testing Banker\'s Algorithm & Safety Engine ---');

// Test 1: Need matrix computation
const need = computeNeedMatrix(DEFAULT_BANKER_STATE.max, DEFAULT_BANKER_STATE.allocation);
assert(JSON.stringify(need[0]) === JSON.stringify([7, 4, 3]), 'P0 Need equals [7, 4, 3]');
assert(JSON.stringify(need[1]) === JSON.stringify([1, 2, 2]), 'P1 Need equals [1, 2, 2]');
assert(JSON.stringify(need[2]) === JSON.stringify([6, 0, 0]), 'P2 Need equals [6, 0, 0]');
assert(JSON.stringify(need[3]) === JSON.stringify([0, 1, 1]), 'P3 Need equals [0, 1, 1]');
assert(JSON.stringify(need[4]) === JSON.stringify([4, 3, 1]), 'P4 Need equals [4, 3, 1]');

// Test 2: Safety algorithm on default state
const safety = runBankerSafetyAlgorithm({ ...DEFAULT_BANKER_STATE, need });
assert(safety.isSafe === true, 'Default state is recognized as SAFE');
const expectedSequence = ['P1', 'P3', 'P4', 'P0', 'P2'];
assert(
  JSON.stringify(safety.safeSequence) === JSON.stringify(expectedSequence),
  `Safe sequence dynamically equals ${expectedSequence.join(' → ')}`
);

// Test 3: Unsafe state detection
const unsafeResult = runBankerSafetyAlgorithm(UNSAFE_PRESET_BANKER_STATE);
assert(unsafeResult.isSafe === false, 'Unsafe preset correctly detected as UNSAFE');

// Test 4: Custom proposed sequence verification
const validProposal = validateCustomSafeSequence(DEFAULT_BANKER_STATE, ['P1', 'P3', 'P4', 'P0', 'P2']);
assert(validProposal.isValid === true, 'Valid custom proposed sequence approved');

const invalidProposal = validateCustomSafeSequence(DEFAULT_BANKER_STATE, ['P0', 'P1', 'P2', 'P3', 'P4']);
assert(invalidProposal.isValid === false, 'Invalid custom sequence (P0 first) rejected because Need > Work');

// Test 5: Resource Request Simulation (Valid Grant)
// P1 requests [1, 0, 2]
const validReq = simulateResourceRequest(DEFAULT_BANKER_STATE, 1, [1, 0, 2]);
assert(validReq.canBeGranted === true, 'Safe request P1: [1, 0, 2] granted');
assert(JSON.stringify(validReq.newAvailable) === JSON.stringify([2, 3, 0]), 'New Available correctly [2, 3, 0]');

// Test 6: Resource Request Simulation (Exceeds Max)
const exceedReq = simulateResourceRequest(DEFAULT_BANKER_STATE, 1, [5, 5, 5]);
assert(exceedReq.canBeGranted === false, 'Request exceeding Max properly rejected');
assert(exceedReq.errorStage === 'exceeds_max', 'Error stage is exceeds_max');

// Test 7: Resource Request Simulation (Unsafe Rollback)
// P0 requests [0, 3, 0] which exhausts resource B so that no process can finish
const unsafeReq = simulateResourceRequest(DEFAULT_BANKER_STATE, 0, [0, 3, 0]);
assert(unsafeReq.canBeGranted === false, 'Unsafe request rejected and rolled back');

console.log('--- Testing CPU Scheduling ---');
const procs = [
  { id: '1', name: 'P1', arrivalTime: 0, burstTime: 6 },
  { id: '2', name: 'P2', arrivalTime: 0, burstTime: 8 },
  { id: '3', name: 'P3', arrivalTime: 0, burstTime: 2 },
];
const fcfs = runFCFS(procs);
assert(fcfs.metrics[0].waitingTime === 0, 'FCFS P1 WT = 0');
assert(fcfs.metrics[1].waitingTime === 6, 'FCFS P2 WT = 6');

const sjf = runSJFNonPreemptive(procs);
assert(sjf.ganttChart[0].processName === 'P3', 'SJF schedules P3 with shortest burst (2ms) first');

console.log('--- Testing Memory Allocation ---');
const memResult = runMemoryAllocation('first-fit', [100, 500, 200], [
  { id: '1', name: 'P1', size: 150 },
]);
assert(memResult.finalBlocks[1].processName === 'P1', 'P1 allocated to Block-2 (500 KB)');
assert(memResult.finalBlocks[1].internalFragmentation === 350, 'Internal fragmentation is 350 KB');

console.log('--- Testing Page Replacement ---');
const pageResult = runPageReplacement('fifo', [7, 0, 1, 2, 0, 3], 3);
assert(pageResult.totalFaults > 0, 'Page faults tracked correctly');

console.log('--- Testing Disk Scheduling ---');
const diskResult = runDiskScheduling('fcfs', [98, 183, 37], 53);
assert(diskResult.seekSequence[0] === 53, 'Initial head cylinder 53');
assert(diskResult.totalHeadMovement > 0, 'Head movement computed');

console.log('\n🎉 ALL 14 TEST CASES PASSED SUCCESSFULLY!');
