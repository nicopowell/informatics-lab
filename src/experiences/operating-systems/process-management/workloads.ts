// The scheduling workload lives at topic level so scheduling policies can be
// compared on identical input. FCFS is its first consumer; the next unit adds
// Shortest-Job-First on the same processes.

export type Process = {
  id: string
  arrival: number
  burst: number
}

const MIN_BURST = 2
const MAX_BURST = 5
const MAX_ARRIVAL_GAP = 3

const STARVATION: Process[] = [
  { id: 'P1', arrival: 0, burst: 2 },
  { id: 'P2', arrival: 1, burst: 20 },
  { id: 'P3', arrival: 2, burst: 1 },
  { id: 'P4', arrival: 3, burst: 1 },
  { id: 'P5', arrival: 4, burst: 1 },
  { id: 'P6', arrival: 5, burst: 1 },
  { id: 'P7', arrival: 6, burst: 1 },
]

const CONVOY: Process[] = [
  { id: 'P1', arrival: 0, burst: 6 },
  { id: 'P2', arrival: 2, burst: 1 },
  { id: 'P3', arrival: 3, burst: 1 },
  { id: 'P4', arrival: 4, burst: 1 },
  { id: 'P5', arrival: 5, burst: 1 },
]

export function createRandomProcesses(
  count: number,
  rng: () => number = Math.random,
): Process[] {
  const processes: Process[] = []
  let arrival = 0

  for (let index = 0; index < count; index++) {
    if (index > 0) {
      arrival += Math.floor(rng() * (MAX_ARRIVAL_GAP + 1))
    }
    const burst = MIN_BURST + Math.floor(rng() * (MAX_BURST - MIN_BURST + 1))
    processes.push({ id: `P${index + 1}`, arrival, burst })
  }

  return processes
}

export function createConvoyProcesses(): Process[] {
  return CONVOY.map((process) => ({ ...process }))
}

export function createStarvationProcesses(): Process[] {
  return STARVATION.map((process) => ({ ...process }))
}
