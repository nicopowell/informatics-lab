export type ReferenceLanguage = {
  id: string
  label: string
  color: string
  code: string
}

export const FCFS_SCHEDULING_REFERENCE: ReferenceLanguage[] = [
  {
    id: 'pseudocode',
    label: 'Pseudocode',
    color: '#e2e8f0',
    code: `procedure fcfs(processes)
    order processes by arrival time
    clock <- 0
    for each process p in processes
        if clock < p.arrival
            clock <- p.arrival      // CPU idle: nothing to run
        p.start <- clock
        clock <- clock + p.burst
        p.waiting <- p.start - p.arrival
        p.turnaround <- clock - p.arrival`,
  },
  {
    id: 'python',
    label: 'Python',
    color: '#3776ab',
    code: `def fcfs(processes):
    results = []
    clock = 0
    for arrival, burst in sorted(processes):
        start = max(clock, arrival)
        clock = start + burst
        results.append(
            {"start": start, "waiting": start - arrival,
             "turnaround": clock - arrival}
        )
    return results`,
  },
  {
    id: 'javascript',
    label: 'JavaScript',
    color: '#f7df1e',
    code: `function fcfs(processes) {
  const ordered = [...processes].sort((a, b) => a.arrival - b.arrival)
  let clock = 0
  for (const process of ordered) {
    const start = Math.max(clock, process.arrival)
    clock = start + process.burst
    process.start = start
    process.waiting = start - process.arrival
    process.turnaround = clock - process.arrival
  }
}`,
  },
  {
    id: 'cpp',
    label: 'C++',
    color: '#00599c',
    code: `void fcfs(std::vector<Process>& processes) {
  std::sort(processes.begin(), processes.end(),
            [](const Process& a, const Process& b) {
              return a.arrival < b.arrival;
            });
  int clock = 0;
  for (auto& p : processes) {
    int start = std::max(clock, p.arrival);
    clock = start + p.burst;
    p.waiting = start - p.arrival;
    p.turnaround = clock - p.arrival;
  }
}`,
  },
]
