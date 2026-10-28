import { HandwrittenNoteTopic } from '../types';

export const HANDWRITTEN_NOTES: HandwrittenNoteTopic[] = [
  {
    id: 'banker-notes',
    title: "Banker's Algorithm & Deadlock Avoidance",
    category: 'Deadlock Management',
    readTimeMinutes: 12,
    lastUpdated: 'Semester Exam 2026 Revision',
    subtitle: 'Complete dry-run, safety algorithm steps, request checks, and 5-process university exam numerical.',
    keyFormulas: [
      'Need[i][j] = Max[i][j] - Allocation[i][j]',
      'Safety Condition: Need[i] ≤ Work',
      'Resource Release: Work = Work + Allocation[i]',
      'Request Rule 1: Request[i] ≤ Need[i] (else Error: Exceeded Claim)',
      'Request Rule 2: Request[i] ≤ Available (else Process Waits)',
    ],
    sections: [
      {
        title: '1. What is Deadlock Avoidance?',
        content: `Deadlock avoidance is a dynamic strategy where the Operating System examines every runtime resource request before granting it. The OS decides whether granting the request will leave the system in a SAFE STATE. If safe, the request is approved; if unsafe, the process must wait, even if the requested resources are physically idle in memory.

Unlike Deadlock Prevention (which permanently breaks one of Coffman's conditions by rigid design), Avoidance preserves maximum flexibility and higher resource utilization.`,
        highlightNote: 'Key Exam Note: Unsafe state ≠ Deadlock! An unsafe state is a vulnerable state where deadlock cannot be avoided if every process simultaneously demands its maximum declared resources.',
      },
      {
        title: '2. Four Crucial Data Structures',
        content: `Let n = number of processes, and m = number of resource types:
1. Available [m]: 1D vector indicating instances of each resource currently unallocated.
2. Max [n × m]: 2D matrix declaring the ceiling limit of each resource type that process Pi will ever request.
3. Allocation [n × m]: 2D matrix of resources currently held by Pi.
4. Need [n × m]: 2D matrix of remaining resources Pi must acquire before completing.`,
        formulaBox: 'Need[i][j] = Max[i][j] - Allocation[i][j]',
      },
      {
        title: '3. Full Numerical Exam Problem (5 Processes, 3 Resources)',
        content: `Consider 5 processes (P0, P1, P2, P3, P4) and 3 resource types (A, B, C).
Total initial available resources: Available = [3, 3, 2].

Step 1: Calculate the Need Matrix:
• P0: Max [7, 5, 3] - Alloc [0, 1, 0] = Need [7, 4, 3]
• P1: Max [3, 2, 2] - Alloc [2, 0, 0] = Need [1, 2, 2]
• P2: Max [9, 0, 2] - Alloc [3, 0, 2] = Need [6, 0, 0]
• P3: Max [2, 2, 2] - Alloc [2, 1, 1] = Need [0, 1, 1]
• P4: Max [4, 3, 3] - Alloc [0, 0, 2] = Need [4, 3, 1]`,
        examTip: 'Always construct the complete Need matrix as your very first step in university answer sheets! It carries 30% of question marks.',
      },
      {
        title: '4. Step-by-Step Safety Algorithm Execution',
        content: `Initialize: Work = Available = [3, 3, 2]. Finish = [F, F, F, F, F].

Iteration 1:
• Check P0: Need [7, 4, 3] ≤ Work [3, 3, 2]? False! (7 > 3). P0 must wait.
• Check P1: Need [1, 2, 2] ≤ Work [3, 3, 2]? TRUE! (1≤3, 2≤3, 2≤2).
  P1 completes and releases resources:
  Work = [3, 3, 2] + Allocation[P1] [2, 0, 0] = [5, 3, 2].
  Finish[P1] = True. Safe Seq so far: <P1>.

Iteration 2:
• Check P3: Need [0, 1, 1] ≤ Work [5, 3, 2]? TRUE!
  P3 completes and releases resources:
  Work = [5, 3, 2] + Allocation[P3] [2, 1, 1] = [7, 4, 3].
  Finish[P3] = True. Safe Seq so far: <P1, P3>.

Iteration 3:
• Check P4: Need [4, 3, 1] ≤ Work [7, 4, 3]? TRUE!
  P4 completes and releases resources:
  Work = [7, 4, 3] + Allocation[P4] [0, 0, 2] = [7, 4, 5].
  Finish[P4] = True. Safe Seq so far: <P1, P3, P4>.

Iteration 4:
• Check P0: Need [7, 4, 3] ≤ Work [7, 4, 5]? TRUE!
  P0 completes and releases resources:
  Work = [7, 4, 5] + Allocation[P0] [0, 1, 0] = [7, 5, 5].
  Finish[P0] = True. Safe Seq so far: <P1, P3, P4, P0>.

Iteration 5:
• Check P2: Need [6, 0, 0] ≤ Work [7, 5, 5]? TRUE!
  P2 completes and releases resources:
  Work = [7, 5, 5] + Allocation[P2] [3, 0, 2] = [10, 5, 7].
  Finish[P2] = True. Safe Seq so far: <P1, P3, P4, P0, P2>.

Result: Finish[i] = True for all processes.
System is in a SAFE STATE with Safe Sequence: P1 → P3 → P4 → P0 → P2.`,
        highlightNote: 'Final Work [10, 5, 7] must always equal the Total System Resources!',
      },
      {
        title: '5. Resource Request Simulation (Sub-Question)',
        content: `Question: What if process P1 makes an additional request: Request[P1] = [1, 0, 2]? Can it be granted?

Step 1: Check Request[P1] ≤ Need[P1]
[1, 0, 2] ≤ [1, 2, 2] → Condition satisfied (True).

Step 2: Check Request[P1] ≤ Available
[1, 0, 2] ≤ [3, 3, 2] → Condition satisfied (True).

Step 3: Tentative Allocation:
• Available = [3, 3, 2] - [1, 0, 2] = [2, 3, 0]
• Allocation[P1] = [2, 0, 0] + [1, 0, 2] = [3, 0, 2]
• Need[P1] = [1, 2, 2] - [1, 0, 2] = [0, 2, 0]

Step 4: Safety Check on Tentative State:
With Work = [2, 3, 0], can P1 run? Need[P1] = [0, 2, 0] ≤ [2, 3, 0] → Yes!
P1 completes: Work becomes [2, 3, 0] + [3, 0, 2] = [5, 3, 2].
From here, P3, P4, P0, P2 can all finish safely!
Conclusion: The request can be IMMEDIATELY GRANTED.`,
      },
    ],
    dryRunTable: {
      headers: ['Process', 'Allocation (A B C)', 'Max Claim (A B C)', 'Need = Max - Alloc', 'Work Before', 'Need ≤ Work?', 'Work After = Work + Alloc'],
      rows: [
        ['P1', '2 0 0', '3 2 2', '1 2 2', '[3, 3, 2]', 'YES', '[5, 3, 2]'],
        ['P3', '2 1 1', '2 2 2', '0 1 1', '[5, 3, 2]', 'YES', '[7, 4, 3]'],
        ['P4', '0 0 2', '4 3 3', '4 3 1', '[7, 4, 3]', 'YES', '[7, 4, 5]'],
        ['P0', '0 1 0', '7 5 3', '7 4 3', '[7, 4, 5]', 'YES', '[7, 5, 5]'],
        ['P2', '3 0 2', '9 0 2', '6 0 0', '[7, 5, 5]', 'YES', '[10, 5, 7]'],
      ],
    },
    vivaQuestions: [
      {
        q: "Why is Banker's algorithm called 'Banker'?",
        a: "Because it models a banker who never allocates cash to customers unless they are guaranteed to complete and return their credit line without causing a bank run.",
      },
      {
        q: 'Can an unsafe state be recovered without aborting processes?',
        a: 'If processes voluntarily release some resources before reaching maximum claim, the system can naturally transition back to a safe state without abortion.',
      },
      {
        q: 'What is the space complexity of Banker algorithm?',
        a: 'O(m × n) to store matrices Max, Allocation, Need and vectors Available, Work, and Finish.',
      },
    ],
  },
  {
    id: 'cpu-scheduling-notes',
    title: 'CPU Scheduling Algorithms & Formulas',
    category: 'Process Management',
    readTimeMinutes: 10,
    lastUpdated: 'Semester Exam 2026 Revision',
    subtitle: 'Gantt chart methods, Turnaround, Waiting, and Response time formulas with solved comparisons.',
    keyFormulas: [
      'Turnaround Time (TAT) = Completion Time - Arrival Time',
      'Waiting Time (WT) = Turnaround Time - Burst Time',
      'Response Time (RT) = Time of First CPU Allocation - Arrival Time',
      'CPU Utilization = (Total Busy Time / Total Simulation Time) × 100%',
      'Throughput = Number of Completed Processes / Unit Time',
    ],
    sections: [
      {
        title: '1. Core Scheduling Terminology',
        content: `• Arrival Time (AT): Time at which process enters Ready Queue.
• Burst Time (BT): CPU computation time required by process.
• Completion Time (CT): Instant when process finishes execution.
• Turnaround Time (TAT): Total lifespan from arrival to completion.
• Waiting Time (WT): Total time spent waiting in Ready Queue.`,
        formulaBox: 'TAT = CT - AT\nWT = TAT - BT\nRT = First CPU - AT',
      },
      {
        title: '2. Comparison Summary of 5 Major Algorithms',
        content: `1. FCFS: Non-preemptive, easy, suffers from CONVOY EFFECT (short processes wait behind long ones).
2. SJF: Non-preemptive, optimal average WT, causes STARVATION for long processes.
3. SRTF: Preemptive SJF, lowest average WT, high context-switch overhead.
4. Priority: Non-preemptive or preemptive, uses AGING to prevent starvation.
5. Round Robin: Preemptive with Time Quantum (q), fair, responsive, ideal for time-sharing systems.`,
        highlightNote: 'Golden Exam Rule: In non-preemptive SJF, once a process gets CPU, it cannot be interrupted even if a shorter process arrives!',
      },
    ],
    vivaQuestions: [
      {
        q: 'What is the Convoy Effect?',
        a: 'A situation in FCFS where a CPU-bound process with a huge burst time holds the CPU while numerous short I/O-bound processes queue behind it, resulting in poor CPU and device utilization.',
      },
      {
        q: 'How does Aging prevent starvation in Priority Scheduling?',
        a: 'Aging gradually increments the priority of processes waiting in the ready queue for prolonged periods, guaranteeing they will eventually attain highest priority and execute.',
      },
    ],
  },
  {
    id: 'page-replacement-notes',
    title: 'Page Replacement Algorithms & Belady Anomaly',
    category: 'Memory Management',
    readTimeMinutes: 8,
    lastUpdated: 'Semester Exam 2026 Revision',
    subtitle: 'FIFO, LRU, Optimal algorithms, hit/fault calculations, and stack algorithm proofs.',
    keyFormulas: [
      'Hit Ratio = (Total Hits / Total Page References) × 100%',
      'Fault Ratio = (Total Faults / Total Page References) × 100%',
      'Belady Anomaly: Occurs in FIFO when frame count increases but fault count increases.',
      'Optimal is an impossible benchmark because future references cannot be known in general OS.',
    ],
    sections: [
      {
        title: '1. Why Page Replacement is Needed',
        content: `When a process references a logical page that is not present in physical RAM (Page Fault), the OS must fetch it from swap space on disk. If all physical page frames are occupied, a victim page must be chosen and evicted to make room.`,
      },
      {
        title: '2. Algorithm Characteristics',
        content: `• FIFO: Oldest page evicted. Suffers Belady’s anomaly.
• LRU: Page unused for longest past time evicted. Implemented using hardware counters or doubly-linked stack.
• Optimal (OPT/MIN): Page not used for longest future duration evicted. Used as the theoretical benchmark lower bound for comparison.`,
        highlightNote: 'LRU and Optimal are STACK ALGORITHMS. They satisfy inclusion property: S(n) ⊆ S(n+1). Therefore, they CANNOT suffer from Belady anomaly.',
      },
    ],
    vivaQuestions: [
      {
        q: 'Can LRU suffer from Belady anomaly?',
        a: 'Never. LRU is a stack algorithm; the set of pages resident in n frames is always a subset of pages resident in n+1 frames at any instant.',
      },
    ],
  },
];
