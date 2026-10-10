export type ReferenceLanguage = {
  id: string
  label: string
  color: string
  code: string
}

export const SJF_SCHEDULING_REFERENCE: ReferenceLanguage[] = [
  {
    id: 'pseudocode',
    label: 'Pseudocode',
    color: '#e2e8f0',
    code: `procedure sjf(processes)
    order processes by arrival time
    clock <- 0
    while some process is unfinished
        enqueue every process with arrival <= clock
        if cpu is free and queue not empty
            dispatch the waiting process with the smallest burst
                    ties: earlier arrival, then queue order
            dispatch time <- clock
        if cpu is busy
            run one unit of the burst
            if the burst is finished
                waiting <- dispatch - arrival
                turnaround <- clock + 1 - arrival
        clock <- clock + 1`,
  },
  {
    id: 'python',
    label: 'Python',
    color: '#3776ab',
    code: `def sjf(processes):
    results = []
    ready = sorted(processes, key=lambda p: p["arrival"])
    queue, running, clock = [], None, 0
    while ready or queue or running:
        while ready and ready[0]["arrival"] <= clock:
            queue.append(ready.pop(0))      # enqueue arrivals
        if running is None and queue:
            # smallest burst, then earlier arrival;
            # the stable sort keeps equal bursts in queue order
            queue.sort(key=lambda p: (p["burst"], p["arrival"]))
            process = queue.pop(0)
            running = {"arrival": process["arrival"],
                       "dispatch": clock, "units_left": process["burst"]}
        if running:
            running["units_left"] -= 1
            if running["units_left"] == 0:
                results.append({"waiting": running["dispatch"] - running["arrival"],
                                "turnaround": clock + 1 - running["arrival"]})
                running = None
        clock += 1
    return results`,
  },
  {
    id: 'javascript',
    label: 'JavaScript',
    color: '#f7df1e',
    code: `function sjf(processes) {
  const ready = [...processes].sort((a, b) => a.arrival - b.arrival)
  const queue = []
  const results = []
  let running = null
  let clock = 0
  while (ready.length > 0 || queue.length > 0 || running) {
    // enqueue arrivals
    while (ready.length > 0 && ready[0].arrival <= clock) {
      queue.push(ready.shift())
    }
    if (running === null && queue.length > 0) {
      // smallest burst, then earlier arrival;
      // the stable sort keeps equal bursts in queue order
      queue.sort((a, b) => a.burst - b.burst || a.arrival - b.arrival)
      const process = queue.shift()
      running = { ...process, dispatch: clock, unitsLeft: process.burst }
    }
    if (running) {
      running.unitsLeft -= 1               // run one unit
      if (running.unitsLeft === 0) {
        results.push({
          waiting: running.dispatch - running.arrival,
          turnaround: clock + 1 - running.arrival,
        })
        running = null
      }
    }
    clock += 1
  }
  return results
}`,
  },
  {
    id: 'cpp',
    label: 'C++',
    color: '#00599c',
    code: `void sjf(std::vector<Process>& processes) {
  std::sort(processes.begin(), processes.end(),
            [](const Process& a, const Process& b) {
              return a.arrival < b.arrival;
            });
  std::vector<const Process*> queue;
  size_t next = 0;
  int clock = 0, unitsLeft = 0, dispatch = 0;
  const Process* running = nullptr;
  while (next < processes.size() || !queue.empty() || running != nullptr) {
    while (next < processes.size() && processes[next].arrival <= clock) {
      queue.push_back(&processes[next]);   // enqueue arrivals
      ++next;
    }
    if (running == nullptr && !queue.empty()) {
      // smallest burst wins; the strict '<' keeps equal bursts in queue
      // order, which is arrival order because the input was sorted first
      auto best = queue.begin();
      for (auto it = queue.begin() + 1; it != queue.end(); ++it) {
        if ((*it)->burst < (*best)->burst) best = it;
      }
      running = *best;
      dispatch = clock;
      unitsLeft = running->burst;
      queue.erase(best);
    }
    if (running != nullptr) {
      --unitsLeft;                         // run one unit
      if (unitsLeft == 0) {
        running->waiting = dispatch - running->arrival;
        running->turnaround = clock + 1 - running->arrival;
        running = nullptr;
      }
    }
    ++clock;
  }
}`,
  },
]
