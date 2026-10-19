import type { Process } from '../../workloads'
import type {
  CompletedProcess,
  RunningProcess,
  ScheduleStep,
} from '../../schedule'

type RunningState = {
  process: Process
  unitsLeft: number
  // Units of the quantum still granted before the CPU is taken back. It starts
  // at `quantum` on every dispatch, so a process that comes back for a second
  // slice gets a fresh one rather than the leftover of the last.
  sliceLeft: number
  // Instant of this dispatch, used to split the time since arrival into
  // ready-queue time and CPU time.
  dispatchTime: number
  // Units of burst already spent before this dispatch. Zero for a policy that
  // never preempts, and the reason a second slice does not report a process as
  // starting over.
  executedBefore: number
}

/*
 * One step per time unit of the simulation, exactly like the FCFS and SJF
 * generators, so the number of steps is the makespan and the three policies
 * stay comparable frame by frame. Within a unit:
 *
 *   1. arrivals at `time` are enqueued,
 *   2. the process whose quantum ended at the end of the previous unit joins
 *      the tail of the queue,
 *   3. if the CPU is free, the head of the queue is dispatched,
 *   4. the running process spends one unit of its burst and one of its slice,
 *   5. either its burst is spent (completion), or its slice is spent (the CPU
 *      is taken back and reported as `preemptedId` of this same unit).
 *
 * Round Robin is the project's first preemptive policy: the dispatch rule is
 * the arrival-order FIFO of FCFS, and what changes is that nobody keeps the CPU
 * past its slice. That single difference is what separates response time from
 * waiting time, and what makes the convoy effect disappear - the long process
 * at the head still runs first, but only for `quantum` units before the short
 * ones behind it get their turn.
 *
 * Two rules the board will show and the model has to decide explicitly:
 *
 * - A burst that ends inside the slice completes; it is never requeued. So the
 *   completion always wins over the quantum in the same unit, and a process is
 *   never reported as both.
 * - Context-switch cost is not modeled: a unit is either a unit of useful burst
 *   or idle. The makespan therefore equals FCFS's for every quantum, and the
 *   price of a small quantum shows up as more preemptions, not as lost time.
 *
 * `quantum` is expected to be a positive integer, which the page's slider
 * guarantees. A process alone in the system with quantum 1 is re-dispatched by
 * the next unit, so it loses the CPU and gets it back immediately: wasteful,
 * and faithful to the policy.
 */
export function generateRoundRobinSteps(
  processes: Process[],
  quantum: number,
): ScheduleStep[] {
  // Stable sort: processes arriving at the same time keep their input order.
  const byArrival = [...processes].sort((a, b) => a.arrival - b.arrival)
  const steps: ScheduleStep[] = []
  const queue: Process[] = []
  const completed: CompletedProcess[] = []
  // Units of burst each process has spent so far. Kept outside the running
  // state because a preempted process rejoins the queue as a plain `Process`,
  // and its history has to survive the trip.
  const executed = new Map<string, number>()
  // Instant of the first CPU grant per process. Response time is frozen there,
  // while waiting time keeps accumulating through the whole rotation.
  const firstDispatch = new Map<string, number>()
  // The running process used its last unit of quantum; it goes to the tail of
  // the ready queue at the start of the next unit, after the arrivals of that
  // instant, so the process that just received service ends up behind everything
  // that arrived meanwhile.
  let requeue: Process | null = null
  let running: RunningState | null = null
  let nextIndex = 0
  let time = 0

  while (
    nextIndex < byArrival.length ||
    queue.length > 0 ||
    running !== null ||
    requeue !== null
  ) {
    const arrivedIds: string[] = []
    while (nextIndex < byArrival.length && byArrival[nextIndex].arrival <= time) {
      queue.push(byArrival[nextIndex])
      arrivedIds.push(byArrival[nextIndex].id)
      nextIndex++
    }

    if (requeue !== null) {
      queue.push(requeue)
      requeue = null
    }

    if (running === null && queue.length > 0) {
      const dispatched = queue.shift()
      if (dispatched) {
        const executedBefore = executed.get(dispatched.id) ?? 0
        running = {
          process: dispatched,
          unitsLeft: dispatched.burst - executedBefore,
          sliceLeft: quantum,
          dispatchTime: time,
          executedBefore,
        }
        if (!firstDispatch.has(dispatched.id)) {
          firstDispatch.set(dispatched.id, time)
        }
      }
    }

    let completedId: string | null = null
    let preemptedId: string | null = null
    const active: RunningProcess | null = running
      ? {
          id: running.process.id,
          unitsLeft: running.unitsLeft,
          // Everything spent since arrival that is not a unit already run: the
          // ready-queue time up to this dispatch. A process that never lost the
          // CPU has run nothing before its only dispatch, which is why this
          // reduces to `dispatchTime - arrival` for the non-preemptive policies.
          waiting:
            running.dispatchTime -
            running.process.arrival -
            running.executedBefore,
        }
      : null

    if (running) {
      const served = running.process
      running.unitsLeft -= 1
      running.sliceLeft -= 1
      executed.set(served.id, (executed.get(served.id) ?? 0) + 1)

      if (running.unitsLeft === 0) {
        const respondedAt = firstDispatch.get(served.id) ?? served.arrival
        completedId = served.id
        completed.push({
          id: served.id,
          finish: time + 1,
          // Time in the system minus the CPU it used: the whole queue time,
          // across every slice and every wait in between.
          waiting: time + 1 - served.arrival - served.burst,
          turnaround: time + 1 - served.arrival,
          response: respondedAt - served.arrival,
        })
        running = null
      } else if (running.sliceLeft === 0) {
        preemptedId = served.id
        requeue = served
        running = null
      }
    }

    steps.push({
      kind: active === null ? 'idle' : 'run',
      time,
      arrivedIds,
      running: active,
      completedId,
      preemptedId,
      queue: queue.map((process) => process.id),
      completed: [...completed],
    })
    time += 1
  }

  return steps
}
