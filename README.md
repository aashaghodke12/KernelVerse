# OS Learning Lab — Visualize. Simulate. Master.

An interactive, university-grade Operating Systems educational simulation platform engineered with **React 18, TypeScript, Vite, Tailwind CSS, Three.js / React Three Fiber, Framer Motion, and the Web Speech API**.

---

## 🌟 Key Highlights & Modules

### 1. 🛡️ Featured Module: Banker’s Algorithm & Deadlock Avoidance Lab
- **Real-Time 3D Resource Allocation Environment**: Interactive Three.js/R3F scene featuring glass process nodes ($P_0$ through $P_4$) in circular orbit and center countable resource clusters ($A, B, C$). Includes dynamic flow beams, active execution pulse rings, camera presets (*Overview*, *Process View*, *Resource View*), and a 2D SVG fallback.
- **Dynamic Safety Engine**: Solves the safety algorithm step-by-step. Uses circular next-scan ordering to compute the expected sequence:
  $$\langle P_1 \to P_3 \to P_4 \to P_0 \to P_2 \rangle$$
- **Editable Matrix Workbench**: Live editable tables for Allocation, Maximum Claim, Available Vector, and automatically calculated Remaining Need ($Need = Max - Allocation$). Supports adding/deleting processes and resource types with full input validation.
- **Resource Request Simulator**: Implements standard two-step validation:
  1. $\text{Request}[i] \le \text{Need}[i]$
  2. $\text{Request}[i] \le \text{Available}$
  Executes tentative allocation, evaluates global system safety, and automatically rolls back if the state is unsafe.
- **Practice & Solver Challenge**: Validates **any** mathematically sound safe sequence proposed by students. Includes a curated University Viva question accordion.

---

### 2. ⚡ Additional Operating System Simulators
- **CPU Scheduling Suite**: FCFS, SJF (Non-preemptive), SRTF (Preemptive SJF), Priority, and Round Robin (with configurable time quantum $q$). Generates interactive Gantt charts, completion times (CT), turnaround times (TAT), waiting times (WT), and response times (RT).
- **Memory Allocation Simulator**: First Fit, Best Fit, and Worst Fit with dynamic partition visualization and exact calculations for internal and external fragmentation.
- **Page Replacement Visualizer**: FIFO (with Belady's Anomaly analysis), LRU (Least Recently Used stack algorithm), and Optimal (Belady's Min benchmark). Displays step-by-step frame contents, page hits, page faults, and hit/fault ratios.
- **Process Synchronization**: Interactive simulations of Bounded-Buffer Producer–Consumer, 5-Philosopher Dining Philosophers with chopstick locking, and Binary Mutex locks protecting a Critical Section.
- **Resource Allocation Graph (RAG)**: Interactive graph nodes and directed edges with cycle detection, differentiating between single-instance resource cycles (definite deadlock) and multiple-instance cycles.
- **Process Management Explorer**: 5-state process lifecycle diagram (New, Ready, Running, Waiting, Terminated), Process Control Block (PCB) inspector, and CPU context-switching overhead visualizer.
- **Disk Scheduling**: FCFS, SSTF, Elevator SCAN, C-SCAN, LOOK, and C-LOOK with mechanical read/write head cylinder traces and total seek calculations.

---

### 3. 🧠 OS Memory Palace — Fun Ways to Remember
- **"The Banker’s Safety Vault" Interactive Story**: Explains the banker analogy through a 5-scene visual narrative mapping vault cash to Available, loans to Allocation, and safe lending plans to Safe Sequences, accompanied by a 5-question retention quiz.
- **Mnemonic Anchors**: Accurate memory aids with full technical definitions:
  - **MEHN**: Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait.
  - **N-R-R-W-T**: New, Ready, Running, Waiting, Terminated.
  - **F-L-O**: FIFO, LRU, Optimal.
  - **F-S-S-R**: FCFS, SJF, SRTF, Round Robin.
- **7 Memory Challenge Games**:
  - *Game A*: Match the Concept
  - *Game B*: Memory Flip Cards
  - *Game C*: Arrange the Algorithm Steps
  - *Game D*: Fix the Mistake
  - *Game E*: One-Minute Rapid Recall
  - *Game F*: Safe Sequence Solver Challenge
  - *Game G*: OS Concept Battles

---

### 4. 🏆 Quiz Arena & Competitive Leaderboard
- **Solo Quiz Mode**: Timed sessions with standard 4-option MCQs, True/False, and numerical calculations. Features question palette, mark for review, and detailed post-quiz answer rationales.
- **Multiplayer Mode**: Private room generation (e.g. `OS-8492`), pass-and-play local mode on the same device, and real-time room synchronized challenge state.
- **Global Leaderboard & Badges**: Transparent score tracking based on quiz performance and completed modules. Clearly demarcated benchmark demonstration data. Earn unlockable badges (*Banker's Master*, *Deadlock Detective*, *Scheduling Strategist*, *Memory Wizard*).

---

### 5. 📖 Handwritten Notes Library (Exam-Ready)
- **Ruled Notebook Aesthetic**: Off-white paper background, horizontal ruling, red left margin line, handwriting typography (*Caveat*, *Kalam*), blue/red pen notes, and yellow highlighter formula boxes.
- **Complete Banker's Dry-Run**: Step-by-step matrix evaluations, Work vectors, safe sequences, request checks, and university viva answers.
- **Print & PDF Export**: Fully styled for `@media print` and standard A4 export with clean page breaks and zero clipped diagrams.

---

### 6. 🎙️ Voice-Guided Learning Assistant
- Powered by the native browser **Web Speech API**.
- Natural voice selection, adjustable speech rate ($0.75\times$ to $1.5\times$), playback controls (Play, Pause, Stop, Replay), and persistent live captions.
- Automatic speech cancellation upon route transitions to eliminate overlapping audio.

---

## 🚀 Getting Started

### Prerequisites
- Node.js `v18+` or `v20+`
- npm `v9+` or `v10+`

### Installation & Run

1. Clone or navigate to the project directory:
   ```bash
   cd "c:\Users\USER\OneDrive\Desktop\OS mini project"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run automated algorithm unit tests:
   ```bash
   npm test
   ```

4. Launch the local development server:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173`.

5. Build for production:
   ```bash
   npm run build
   ```
