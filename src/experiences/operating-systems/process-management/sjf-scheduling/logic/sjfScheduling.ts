import type { Process } from '../../workloads'
import type {
  CompletedProcess,
  RunningProcess,
  ScheduleStep,
} from '../../schedule'

type RunningState = {
  process: Process
  unitsLeft: number
  dispatchTime: number
}

// Selects the waiting process to dispatch: smallest burst wins, then earlier
// arrival, then whichever entered the queue first. The comparisons are made
// explicit in this scan instead of relying on how Array.prototype.sort resolves
// ties. Arrival order and queue order need no comparison here: the queue is
// filled from a stable arrival sort, so a process never sits behind one that
// arrived later, and the strict `<` below leaves equal bursts in queue order.
function selectShortestIndex(queue: Process[]): number {
  let best = 0
  for (let index = 1; index < queue.length; index++) {
    if (queue[index].burst < queue[best].burst) {
      best = index
    }
  }
  return best
}

// One step per time unit of the simulation, so the number of steps is the
// makespan, mirroring the FCFS generator. Within a unit: arrivals at `time`
// are enqueued first, then the free CPU dispatches the waiting process with
// the smallest burst, and the running process spends one unit of its burst.
// Dispatch is non-preemptive: once a process holds the CPU it runs to
// completion, even if a shorter process arrives meanwhile. A process that
// finishes during a unit is reported as `completedId` of that same unit, with
// `finish = time + 1`, and the next dispatch happens at the start of the
// following unit.
export function generateSjfSteps(processes: Process[]): ScheduleStep[] {
  // Stable sort: processes arriving at the same time keep their input order.
  const byArrival = [...processes].sort((a, b) => a.arrival - b.arrival)
  const steps: ScheduleStep[] = []
  const queue: Process[] = []
  const completed: CompletedProcess[] = []
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
      const shortestIndex = selectShortestIndex(queue)
      const dispatched = queue.splice(shortestIndex, 1)[0]
      running = {
        process: dispatched,
        unitsLeft: dispatched.burst,
        dispatchTime: time,
      }
    }

    let completedId: string | null = null
    const active: RunningProcess | null = running
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
