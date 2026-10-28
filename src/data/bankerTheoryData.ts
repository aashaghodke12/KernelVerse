export interface VivaItem {
  question: string;
  answer: string;
  keyPoints: string[];
}

export const BANKER_THEORY_CONTENT = {
  analogy: {
    title: 'The Banking Analogy (Dijkstra, 1965)',
    description: `Imagine a small-town bank manager who has cash reserves (Available Resources) and several business clients (Processes). Each client negotiates a credit line representing the maximum money they will ever need to complete their project (Maximum Demand). Clients borrow money in small installments (Allocation).

The banker guarantees that money will only be lent if, after granting the installment, there is still enough cash in the vault to satisfy at least one client's remaining requirement (Need). That client will then finish their venture, pay back all borrowed money, and refill the vault, allowing the next client to finish.

If lending an installment leaves the vault too depleted to guarantee that any client can complete their project, the banker denies or delays the request to avoid a bank run (Deadlock).`,
  },
  definitions: [
    {
      term: 'Available Vector [m]',
      meaning: 'A 1D array of length m. Available[j] = k indicates that there are k units of resource type Rj currently free and unassigned in the system.',
    },
    {
      term: 'Max Matrix [n × m]',
      meaning: 'A 2D matrix where Max[i][j] = k declares that process Pi may demand at most k instances of resource type Rj during its entire lifecycle.',
    },
    {
      term: 'Allocation Matrix [n × m]',
      meaning: 'A 2D matrix where Allocation[i][j] = k means process Pi is currently holding k instances of resource type Rj.',
    },
    {
      term: 'Need Matrix [n × m]',
      meaning: 'Need[i][j] = Max[i][j] - Allocation[i][j]. Represents the remaining resources process Pi may request to finish execution.',
    },
    {
      term: 'Safe State vs Unsafe State',
      meaning: 'A state is SAFE if there exists at least one sequence <P0, P1, ..., Pn-1> of all processes such that for each Pi, its remaining need can be satisfied by current Available plus resources already held by preceding processes. An UNSAFE state is NOT necessarily a deadlock; it is a state from which the OS can no longer prevent processes from potentially deadlocking if they all request their maximum declared claims simultaneously.',
    },
  ],
  formula: {
    equation: 'Need[i][j] = Max[i][j] - Allocation[i][j]',
    explanation: 'Every process must stay within its declared maximum claim: 0 ≤ Allocation[i][j] ≤ Max[i][j]. Once Pi acquires its maximum claim, it must release all resources within a finite time after finishing.',
  },
  safetyAlgorithmSteps: [
    'Let Work = Available (copy of available vector) and Finish[i] = false for i = 0, 1, ..., n-1.',
    'Find an index i such that: Finish[i] == false AND Need[i] ≤ Work. If no such i exists, jump to step 4.',
    'Process Pi can finish! Update Work = Work + Allocation[i], set Finish[i] = true, append Pi to safe sequence, and return to step 2.',
    'If Finish[i] == true for all i, then the system is in a SAFE STATE. Otherwise, the system is in an UNSAFE STATE.',
  ],
  resourceRequestAlgorithmSteps: [
    'If Request[i] ≤ Need[i], proceed to Step 2. Otherwise, raise error: Process has exceeded its maximum claim.',
    'If Request[i] ≤ Available, proceed to Step 3. Otherwise, Pi must wait since resources are not currently available.',
    'Tentatively allocate requested resources to Pi:\n• Available = Available - Request[i]\n• Allocation[i] = Allocation[i] + Request[i]\n• Need[i] = Need[i] - Request[i]',
    'Execute the Safety Algorithm on this tentative state.',
    'If state is SAFE: The request is safely GRANTED and Pi receives resources.\nIf state is UNSAFE: Pi must WAIT, and the previous state is completely RESTORED (rollback).',
  ],
};

export const BANKER_VIVA_QUESTIONS: VivaItem[] = [
  {
    question: "Why is Banker's Algorithm classified as Deadlock Avoidance rather than Deadlock Prevention?",
    answer: "Deadlock prevention eliminates deadlocks by strictly negating at least one of the four Coffman conditions (Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait) at design time. In contrast, Banker's algorithm allows all four conditions to exist dynamically, but inspects each runtime resource request and only grants it if the resulting state remains safe.",
    keyPoints: ['Prevention restrains resource requests statically', 'Avoidance checks runtime safety dynamically', 'Allows flexibility without deadlocking'],
  },
  {
    question: "Does an 'Unsafe State' always mean that a deadlock has occurred?",
    answer: "No. An unsafe state does not guarantee a deadlock has occurred; it simply means that the operating system can no longer guarantee that a deadlock will not occur. If processes do not demand their maximum claims simultaneously, the system might still execute without deadlocking.",
    keyPoints: ['Unsafe is not equal to deadlock', 'Safe states are a subset of deadlock-free states', 'Deadlock is a subset of unsafe states'],
  },
  {
    question: "What is the time complexity of the Banker's Safety Algorithm?",
    answer: "The time complexity is O(m × n²), where n is the number of processes and m is the number of resource types. In the worst case, we search through n processes in each of n iterations, comparing m resource quantities for each process.",
    keyPoints: ['n processes, m resource types', 'O(m * n^2) complexity', 'High overhead for large multi-threaded systems'],
  },
  {
    question: "What are the practical limitations of Banker's Algorithm in modern commercial operating systems?",
    answer: "Banker's algorithm requires: (1) processes to state their maximum resource needs in advance, which is rarely known in general-purpose computing; (2) the number of processes and resources to remain fixed; (3) processes to guarantee returning resources in finite time. Hence, general OSs like Linux and Windows use deadlock ignorance (Ostrich algorithm) or detection instead.",
    keyPoints: ['Hard to predict maximum needs in advance', 'Dynamic process creation/termination', 'High runtime computational overhead'],
  },
  {
    question: "What is the role of the 'Work' vector in the safety algorithm?",
    answer: "The Work vector represents the provisional available resources as we simulate future process completions. It starts initialized to the current Available vector. Whenever an eligible process completes, its allocated resources are returned to Work, enabling subsequent processes with larger needs to run.",
    keyPoints: ['Initial Work = Available', 'Work = Work + Allocation[i] upon completion', 'Monotonically increases during safe execution'],
  },
  {
    question: "What is the difference between a Safe Sequence and a Safe State?",
    answer: "A Safe State is a system state for which there exists at least one order of process execution that allows everyone to finish without deadlocking. A Safe Sequence is that explicit ordered permutation of processes <P1, P2, ..., Pn>.",
    keyPoints: ['Safe State is the condition', 'Safe Sequence is the actual ordering', 'Multiple safe sequences can exist for one safe state'],
  },
  {
    question: "What happens if a process requests more resources than its declared Need?",
    answer: "The system immediately raises an error condition (or exception) indicating that the process has exceeded its maximum claim. The request is rejected without checking Available or running the safety algorithm.",
    keyPoints: ['Violates rule: Request[i] <= Need[i]', 'Protects system from rogue or buggy processes', 'Instant rejection'],
  },
  {
    question: "Can there be multiple distinct safe sequences for a given system state?",
    answer: "Yes! Often multiple processes have their remaining Need less than or equal to current Work at the same step. Picking either one first can lead to different valid safe sequences. The safety algorithm only needs to find one valid sequence to declare the state safe.",
    keyPoints: ['Yes, permutations possible', 'Any valid sequence confirms safety', 'Practice mode evaluates student sequence validity dynamically'],
  },
];
