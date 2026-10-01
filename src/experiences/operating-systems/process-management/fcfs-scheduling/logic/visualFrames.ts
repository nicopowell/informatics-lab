import type {
  CompletedFcfsProcess,
  FcfsScheduleStep,
  RunningFcfsProcess,
} from './fcfsScheduling'

export type FcfsVisualFrame = {
  kind: 'ready' | 'arrive' | 'run' | 'idle' | 'complete' | 'done'
  time: number
  processId: string | null
  running: RunningFcfsProcess | null
  queue: string[]
  cells: (string | null)[]
  completed: CompletedFcfsProcess[]
}

export function createReadyFrame(): FcfsVisualFrame {
  return {
    kind: 'ready',
    time: 0,
    processId: null,
    running: null,
    queue: [],
    cells: [],
    completed: [],
  }
}

/*
 * Expands the per-unit steps into one narratable fact per frame, mirroring the
 * compare/swap split of Bubble Sort: a unit with arrivals produces one `arrive`
 * frame per process, then the `run` or `idle` frame that grows the Gantt by one
 * cell, then a `complete` frame when the running process spent its last unit.
 * A complete frame sits at the finish instant (time + 1) and shows the closed
 * segment with the frozen metrics; dispatch is left to the following unit so
 * each frame changes exactly one thing.
 */
export function toVisualFrames(steps: FcfsScheduleStep[]): FcfsVisualFrame[] {
  const frames: FcfsVisualFrame[] = []
  const cells: (string | null)[] = []
  let previous: FcfsScheduleStep | null = null

  for (const step of steps) {
    const continuing =
      step.running !== null &&
      previous?.running?.id === step.running.id

    // A step already records the completion that happens at the end of its
    // unit; only the `complete` frame may show it, so the frames before it
    // drop that last entry.
    const completedBefore =
      step.completedId !== null
        ? step.completed.slice(0, step.completed.length - 1)
        : step.completed

    if (step.arrivedIds.length > 0) {
      // Processes waiting before this unit, in queue order: the step queue
      // already includes every arrival of the unit, so they are removed here.
      const waiting = step.queue.filter(
        (id) => !step.arrivedIds.includes(id),
      )
      // While the arrivals of the unit come in, the CPU belongs to the
      // continuing process; a fresh dispatch happens after all arrivals.
      const cpu = continuing && step.running ? { ...step.running } : null
      step.arrivedIds.forEach((id, index) => {
        frames.push({
          kind: 'arrive',
          time: step.time,
          processId: id,
          running: cpu,
          queue: [...waiting, ...step.arrivedIds.slice(0, index + 1)],
          cells: [...cells],
          completed: [...completedBefore],
        })
      })
    }

    cells.push(step.running ? step.running.id : null)
    frames.push({
      kind: step.kind,
      time: step.time,
      processId: step.running ? step.running.id : null,
      running: step.running ? { ...step.running } : null,
      queue: [...step.queue],
      cells: [...cells],
      completed: [...completedBefore],
    })

    if (step.completedId !== null) {
      const finished = step.completed[step.completed.length - 1]
      frames.push({
        kind: 'complete',
        time: step.time + 1,
        processId: step.completedId,
        running: {
          id: step.completedId,
          unitsLeft: 0,
          waiting: finished ? finished.waiting : 0,
        },
        queue: [...step.queue],
        cells: [...cells],
        completed: [...step.completed],
      })
    }

    previous = step
  }

  const last = steps.length > 0 ? steps[steps.length - 1] : null
  frames.push({
    kind: 'done',
    time: last ? last.time + 1 : 0,
    processId: null,
    running: null,
    queue: [],
    cells: [...cells],
    completed: last ? [...last.completed] : [],
  })

  return frames
}
