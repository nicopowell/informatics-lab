# Round Robin Scheduling

Round Robin dispatches in arrival order, exactly like FCFS, and keeps the ready
queue a FIFO — what changes is that nobody keeps the CPU. A process runs for at
most one **time slice** (the quantum); if its burst is not spent by then, the
kernel takes the CPU back and puts the process at the **tail** of the ready
queue, behind whatever is already waiting. The head of the queue runs next, and
the rotation repeats until every burst is spent.

This is the project's first **preemptive** policy. FCFS and Shortest-Job-First
only choose at the moment the CPU comes free, so a process is dispatched once;
here a process is dispatched as many times as slices it needs, which is why the
table now shows two different numbers for it. **Waiting** keeps growing across
the whole rotation, while **response** — arrival until the first unit of
execution — freezes at the very first slice. The two coincide for the
non-preemptive policies, and separating them is the point of this page.

The slider is the experiment. On the **Convoy effect** preset, where a
six-unit process owns the CPU before four one-unit jobs arrive, FCFS and SJF
agree: 16 units of total waiting and an average first-slice wait of 3.2. With
quantum 2 the same processes give 10 and 1.2; with quantum 1 they give 8 and
0.8, at the price of five handovers. Push the slider to 6 and the page becomes
FCFS again, slice for slice: the longest burst in that workload is 6, so no
process is ever cut short.

- **Quantum:** the whole trade-off in one number — too large and Round Robin
  degenerates into FCFS, too small and the CPU spends its time switching instead
  of working. Real systems pick it so that a slice dwarfs the switch cost
- **Context switches:** not charged in this model, so every quantum on the slider
  keeps the same makespan (10 on Convoy, 27 on Starvation). A real kernel pays
  each one, and a very small quantum can waste a large share of the CPU
- **Starvation:** bounded — with n processes ready, none waits more than about
  (n − 1) × quantum units to get the CPU back, which is exactly what a stream of
  short arrivals does to Shortest-Job-First
- **Turnaround:** worsened, because a process that would have finished
  uninterrupted is interrupted instead. On the **Starvation** preset
  Shortest-Job-First still beats Round Robin on both averages (6 units of total
  waiting against 17 at quantum 1), and it does so only because it knows the
  burst lengths. What Round Robin guarantees that SJF does not is the worst case:
  the longest first-slice wait here is 3 units, against 6 for SJF and 20 for FCFS

Two rules the board shows and the model has to fix: a process whose burst ends
inside its slice simply finishes, it is never requeued; and a process that loses
the CPU at the same instant another one arrives goes behind the newcomer, because
the one that just received service is the one that has waited least recently.
