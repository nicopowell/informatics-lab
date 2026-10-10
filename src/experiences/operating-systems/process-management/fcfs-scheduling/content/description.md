# FCFS Scheduling

First-Come, First-Served is the simplest CPU scheduling policy: the ready queue
is a FIFO, so the process that arrived first is the one that runs first. Once
the CPU is granted, the process keeps it until it finishes; the policy is
**non-preemptive**, so a process that arrives while another is running has to
wait even if it only needs one unit of time.

That simplicity hides the classic weakness visible in the convoy effect: a
single long process at the head of the queue accumulates the waiting time of
every short process that arrives behind it.

The same thing happens with less extreme input. Load the **Starvation** preset:
a one-unit job, then a long one that arrives before the CPU frees, then five
short arrivals. FCFS hands the CPU to the long process as soon as it reaches
the head of the queue, so all five short jobs wait its full burst behind it —
101 units of waiting in total. It is the workload Shortest-Job-First is designed
for, so it is also the clearest place to compare the two policies: same
processes, same makespan, and a very different total waiting time.

- **Decision cost:** O(n) to drain an arrival-ordered queue, O(n log n) if the processes must first be sorted by arrival
- **Waiting time:** units spent in the ready queue before the CPU is granted
- **Turnaround time:** finish time minus arrival time, waiting plus burst
- **Response time:** time until the first execution; it coincides with waiting time in non-preemptive FCFS
