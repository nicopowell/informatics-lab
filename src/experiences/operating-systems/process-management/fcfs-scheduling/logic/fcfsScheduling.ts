export type FcfsProcess = {
  id: string
  arrival: number
  burst: number
}

export type CompletedFcfsProcess = {
  id: string
  finish: number
  waiting: number
  turnaround: number
}

export type RunningFcfsProcess = {
  id: string
  unitsLeft: number
  waiting: number
}

export type FcfsScheduleStep = {
  kind: 'run' | 'idle'
  time: number
  arrivedIds: string[]
  running: RunningFcfsProcess | null
  completedId: string | null
  queue: string[]
  completed: CompletedFcfsProcess[]
}

type RunningState = {
  process: FcfsProcess
  unitsLeft: number
  dispatchTime: number
}

const MIN_BURST = 2
const MAX_BURST = 8
const MAX_ARRIVAL_GAP = 3

const CONVOY: FcfsProcess[] = [
  { id: 'P1', arrival: 0, burst: 10 },
  { id: 'P2', arrival: 2, burst: 1 },
  { id: 'P3', arrival: 3, burst: 1 },
  { id: 'P4', arrival: 4, burst: 1 },
  { id: 'P5', arrival: 5, burst: 1 },
]

// One step per time unit of the simulation, so the number of steps is the
// makespan. Within a unit: arrivals at `time` are enqueued first, then the
// free CPU dispatches the head of the queue, and the running process spends
// one unit of its burst. A process that finishes during a unit is reported as
// `completedId` of that same unit, with `finish = time + 1`, and the next
// process is dispatched at the start of the following unit.
export function generateFcfsSteps(processes: FcfsProcess[]): FcfsScheduleStep[] {
  // Stable sort: processes arriving at the same time keep their input order.
  const byArrival = [...processes].sort((a, b) => a.arrival - b.arrival)
  const steps: FcfsScheduleStep[] = []
  const queue: FcfsProcess[] = []
  const completed: CompletedFcfsProcess[] = []
  let nextIndex = 0
  let running: RunningState | null = null
  let time = 0

  while (nextIndex < byArrival.length || queue.length > 0 || running !== null) {
    const arrivedIds: string[] = []
    while (nextIndex < byArrival.length && byArrival[nextIndex].arrival <= time) {
      queue.push(byArrival[nextIndex])
      arrivedIds.push(byArrival[nextIndex].id)
      nextIndex++
    }

    if (running === null && queue.length > 0) {
      const dispatched = queue.shift()
      if (dispatched) {
        running = {
          process: dispatched,
          unitsLeft: dispatched.burst,
          dispatchTime: time,
        }
      }
    }

    let completedId: string | null = null
    const active: RunningFcfsProcess | null = running
      ? {
          id: running.process.id,
          unitsLeft: running.unitsLeft,
          waiting: running.dispatchTime - running.process.arrival,
        }
      : null

    if (running) {
      running.unitsLeft -= 1
      if (running.unitsLeft === 0) {
        const finished = running.process
        completedId = finished.id
        completed.push({
          id: finished.id,
          finish: time + 1,
          waiting: running.dispatchTime - finished.arrival,
          turnaround: time + 1 - finished.arrival,
        })
        running = null
      }
    }

    steps.push({
      kind: active === null ? 'idle' : 'run',
      time,
      arrivedIds,
      running: active,
      completedId,
      queue: queue.map((process) => process.id),
      completed: [...completed],
    })
    time += 1
  }

  return steps
}

export function createRandomProcesses(
  count: number,
  rng: () => number = Math.random,
): FcfsProcess[] {
  const processes: FcfsProcess[] = []
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

export function createConvoyProcesses(): FcfsProcess[] {
  return CONVOY.map((process) => ({ ...process }))
}
