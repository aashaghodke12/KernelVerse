import { MnemonicItem } from '../types';

export const CORE_MNEMONICS: MnemonicItem[] = [
  {
    id: 'deadlock-cofffman-mehn',
    title: 'Four Deadlock Conditions',
    acronym: 'MEHN',
    topic: 'Deadlock Management',
    meaning: [
      { letter: 'M', word: 'Mutual Exclusion', explanation: 'At least one resource must be non-shareable (held by one process at a time).' },
      { letter: 'E', word: 'Hold and wait (Enter/Hold)', explanation: 'A process holds at least one resource and waits to acquire additional ones held by others.' },
      { letter: 'H', word: 'No Preemption (Hands-off)', explanation: 'Resources cannot be forcibly confiscated; they can only be released voluntarily.' },
      { letter: 'N', word: 'Circular Wait (Next-in-ring)', explanation: 'A closed chain of processes exists where each waits for a resource held by the next in line.' },
    ],
    formalDefinition: 'Deadlock can occur if and only if all four Coffman conditions (Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait) hold simultaneously in the system.',
    example: 'Think of 4 cars stuck at a crossroads gridlock: Each car occupies a lane (Mutual Exclusion), holds its spot while waiting for the next car to move (Hold & Wait), police cannot tow them away (No Preemption), and each car blocks the one behind it in a circle (Circular Wait).',
  },
  {
    id: 'process-states-nrrwt',
    title: '5 Process Lifecycle States',
    acronym: 'N-R-R-W-T',
    topic: 'Process Management',
    meaning: [
      { letter: 'N', word: 'New', explanation: 'The process is being created and loaded into memory structures.' },
      { letter: 'R', word: 'Ready', explanation: 'Waiting in the ready queue to be allocated a CPU core by the scheduler.' },
      { letter: 'R', word: 'Running', explanation: 'Instructions are currently executing on the CPU core.' },
      { letter: 'W', word: 'Waiting (Blocked)', explanation: 'Waiting for an I/O event, signal, or lock release before it can resume.' },
      { letter: 'T', word: 'Terminated', explanation: 'The process has finished execution and OS reclaims its resources.' },
    ],
    formalDefinition: 'As a process executes, it transitions through discrete lifecycle states maintained in its Process Control Block (PCB).',
    example: 'Think of a patient visiting a doctor: Arrival at reception (New) → Waiting in lobby (Ready) → In doctor consultation (Running) → Getting X-Ray lab test (Waiting/Blocked) → Discharged with prescription (Terminated).',
  },
  {
    id: 'page-replacement-flo',
    title: 'Page Replacement Criteria',
    acronym: 'F - L - O',
    topic: 'Memory Management',
    meaning: [
      { letter: 'F', word: 'FIFO', explanation: 'First In, First Out — evict the oldest resident page regardless of how often it was used.' },
      { letter: 'L', word: 'LRU', explanation: 'Least Recently Used — look backward into past time and evict the page unused for longest.' },
      { letter: 'O', word: 'Optimal (Belady)', explanation: 'Look forward into the future and evict the page that will not be referenced for the longest time.' },
    ],
    formalDefinition: 'Page replacement algorithms choose victim frames when physical memory is saturated during a page fault.',
    example: 'Think of a bookshelf with limited space: FIFO removes the book bought earliest. LRU removes the book you haven’t opened in the longest time. Optimal magically knows what homework you will do tomorrow and removes the book you won’t read for months.',
  },
  {
    id: 'cpu-scheduling-fast-jobs',
    title: 'CPU Scheduling Quick Mnemonics',
    acronym: 'F-S-S-R',
    topic: 'Process Management',
    meaning: [
      { letter: 'F', word: 'FCFS', explanation: 'First-Come, First-Served — Queue order (fair but suffers from convoy effect).' },
      { letter: 'S', word: 'SJF', explanation: 'Shortest Job First — Optimal average waiting time (non-preemptive).' },
      { letter: 'S', word: 'SRTF', explanation: 'Shortest Remaining Time First — Preemptive SJF; preempts if newly arrived job is shorter.' },
      { letter: 'R', word: 'Round Robin', explanation: 'Time Quantum slices; fair for time-sharing interactive systems.' },
    ],
    formalDefinition: 'CPU scheduling algorithms maximize throughput and minimize average turnaround and waiting times.',
    example: 'Bank teller queue: FCFS serves by arrival ticket. SJF serves quickest deposits first. Round Robin gives everyone 2 minutes at the counter before sending them to the back of the queue.',
  },
];

export const BANKER_STORY_STEPS = [
  {
    step: 1,
    title: 'Meet the Banker (Operating System)',
    narrative: 'You are the Chief Risk Officer of the OS Central Bank. In your vault, you have three currencies: Token A, Token B, and Token C. Currently, you have [3, 3, 2] tokens free in your vault (Available Vector). Five demanding clients (P0 through P4) want credit lines.',
    analogyMapping: 'Vault Cash = Available Vector [3, 3, 2]',
  },
  {
    step: 2,
    title: 'Credit Lines (Max Demand) and Current Loans (Allocation)',
    narrative: 'Each customer declared their absolute ceiling budget (Maximum Demand). Some have already borrowed partial sums (Allocation). The difference between what they were promised and what they have taken is their Remaining Need (Need = Max - Allocation).',
    analogyMapping: 'Remaining Need = Max Claim - Current Borrowed',
  },
  {
    step: 3,
    title: 'The Golden Banker Rule',
    narrative: 'Never lend money unless you can prove that AT LEAST ONE customer can completely finish their business right now with your remaining vault cash! If you can find one, that customer will finish, pay off their debt, and return all their borrowed tokens into your vault, making your vault wealthier!',
    analogyMapping: 'Eligible condition: Need[i] ≤ Current Work',
  },
  {
    step: 4,
    title: 'Evaluating Client P1',
    narrative: 'Client P0 needs [7, 4, 3], but your vault only has [3, 3, 2]. P0 cannot finish right now and must wait! But look at Client P1: P1 only needs [1, 2, 2], which is within your [3, 3, 2] vault! You fund P1. P1 finishes their project and returns all [2, 0, 0] borrowed tokens. Your vault balance swells to [5, 3, 2]!',
    analogyMapping: 'P1 finishes! Work becomes [3,3,2] + [2,0,0] = [5,3,2]',
  },
  {
    step: 5,
    title: 'Chain Reaction to Complete Safety',
    narrative: 'With [5, 3, 2] now in the vault, P3 can finish next (Need [0, 1, 1]). P3 returns [2, 1, 1], increasing vault cash to [7, 4, 3]! Next P4, P0, and P2 all finish in order: P1 → P3 → P4 → P0 → P2. All debts cleared! No bank run! Complete Safety achieved!',
    analogyMapping: 'Safe Sequence: P1 → P3 → P4 → P0 → P2',
  },
];

export const BANKER_STORY_QUIZ = [
  {
    question: 'In the banking analogy, what corresponds to the remaining resources currently free in the operating system?',
    options: ['The total credit line of customers', 'The cash balance currently inside the vault (Available)', 'The money already borrowed by clients', 'The bankrupt businesses'],
    correctIndex: 1,
    explanation: 'The vault balance represents the Available vector [3, 3, 2], which is ready to be lent out immediately.',
  },
  {
    question: 'How is a client’s remaining loan requirement (Need) calculated?',
    options: ['Need = Allocation + Available', 'Need = Maximum Demand − Current Allocation', 'Need = Maximum Demand + Allocation', 'Need = Available − Allocation'],
    correctIndex: 1,
    explanation: 'Need[i][j] = Max[i][j] - Allocation[i][j]. It is the remaining money the customer needs to finish.',
  },
  {
    question: 'What happens to the vault funds when a customer completes their project?',
    options: ['The vault loses all its money', 'The vault receives back all previously allocated tokens (Work = Work + Allocation)', 'The customer keeps the money forever', 'The banker must file for bankruptcy'],
    correctIndex: 1,
    explanation: 'When a process terminates, it releases its allocated resources back to the operating system: Work = Work + Allocation[i].',
  },
  {
    question: 'Why could client P0 NOT be served first in the vault story?',
    options: ['P0 has bad credit', 'P0’s Need [7, 4, 3] exceeded the vault’s current Available cash [3, 3, 2]', 'P0 already finished', 'The banker disliked P0'],
    correctIndex: 1,
    explanation: 'P0 required 7 units of Token A, but the vault only had 3 units. Since Need > Work, P0 had to wait.',
  },
  {
    question: 'What does finding a complete "Safe Sequence" guarantee to the banker?',
    options: ['High interest rates', 'Every single client can finish without any deadlock occurring', 'The bank can never add new clients', 'Clients do not need to pay back loans'],
    correctIndex: 1,
    explanation: 'A safe sequence guarantees an order of execution where every process is guaranteed to obtain its resources and finish without deadlock.',
  },
];
