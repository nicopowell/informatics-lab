# Shortest-Job-First Scheduling

Shortest-Job-First dispatches, whenever the CPU becomes free, the waiting
process with the smallest burst. When two waiting processes have the same burst
the tie is broken by arrival time, and then by the order they reached the queue,
so the rule is total: the same workload always produces the same schedule.
It keeps the **non-preemptive** rule of FCFS:
a running process is never displaced, so choosing among jobs only happens at
dispatch time.

Assigning the shortest job first is what keeps average waiting time low. Take
two jobs already waiting, A (short) and B (long): if B runs first, A waits for
all of B's burst; swap them and A waits for nothing while B's own waiting barely
moves. So among the jobs already released, running a long one before a short one
is pure loss, and every pair in that order can be swapped to gain. This is also
why a long process that already owns the CPU is not rescued by the rule: SJF
never displaces it.

- **Average waiting time:** the swap argument proves shortest-first is the best order for the jobs waiting at a dispatch instant. Across a whole workload with arrivals it is a greedy policy, not a proven optimum — a short job that has not arrived yet cannot be accounted for
- **Burst knowledge:** SJF needs each process's burst length in advance; real systems do not have it, so they estimate bursts from the process's past behaviour
- **Convoy effect:** not fixed — if the long process already holds the CPU when short ones arrive, they still queue behind it, because SJF never preempts. Run the convoy preset and the schedule matches FCFS exactly
- **Starvation:** a stream of short arrivals keeps postponing a long process, which may wait indefinitely; aging (boosting priority over time) is the usual remedy
