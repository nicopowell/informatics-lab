// Shared step/frame vocabulary for the scheduling policies in this topic.
// Each policy keeps its own step generator, but every generator produces the
// same `ScheduleStep` shape and shares this frame builder.

export type CompletedProcess = {
  id: string
  finish: number
  waiting: number
  turnaround: number
  // Units from arrival until the process first held the CPU. Equal to `waiting`
  // for a non-preemptive policy, which grants the CPU once and never takes it
  // back; a preemptive policy can requeue a process, so its total waiting keeps
  // growing after its response is already fixed.
  response: number
}

export type RunningProcess = {
  id: string
  unitsLeft: number
  waiting: number
}

export type ScheduleStep = {
  kind: 'run' | 'idle'
  time: number
  arrivedIds: string[]
  running: RunningProcess | null
  completedId: string | null
  // Set on the unit whose time slice ran out with burst still left: the process
  // named here keeps the CPU for this unit and joins the tail of the ready queue
  // at the start of the next one. A policy that never takes the CPU back reports
  // null, so every producer has to state its position on preemption.
  preemptedId: string | null
  queue: string[]
  completed: CompletedProcess[]
}

export type SchedulingFrame = {
  kind: 'ready' | 'arrive' | 'run' | 'idle' | 'complete' | 'preempt' | 'done'
  time: number
  processId: string | null
  running: RunningProcess | null
  queue: string[]
  cells: (string | null)[]
  // Parallel to `cells`: true where the unit starts a fresh grant of the CPU.
  // For a non-preemptive policy that is the first unit of each process, so the
  // array marks the segment starts; under Round Robin it marks every time slice,
  // including a slice the same process gets back after losing the CPU.
  sliceStarts: boolean[]
  completed: CompletedProcess[]
}

export function createReadyFrame(): SchedulingFrame {
  return {
    kind: 'ready',
    time: 0,
    processId: null,
    running: null,
    queue: [],
    cells: [],
    sliceStarts: [],
    completed: [],
  }
}

/*
 * Expands the per-unit steps into one narratable fact per frame, mirroring the
 * compare/swap split of Bubble Sort: a unit with arrivals produces one `arrive`
 * frame per process, then the `run` or `idle` frame that grows the Gantt by one
 * cell, then a `complete` frame when the running process spent its last unit or
 * a `preempt` frame when its time slice ran out with burst still left.
 * A complete frame sits at the finish instant (time + 1) and shows the closed
 * segment with the frozen metrics; a preempt frame sits at the instant the CPU is
 * lost and shows the process at the tail of the ready queue with the CPU free.
 * Dispatch is left to the following unit so each frame changes exactly one thing.
 */
export function toVisualFrames(steps: ScheduleStep[]): SchedulingFrame[] {
  const frames: SchedulingFrame[] = []
  const cells: (string | null)[] = []
  const sliceStarts: boolean[] = []
  let previous: ScheduleStep | null = null

  for (const step of steps) {
    // The process that lost its slice at the end of the previous unit lands in
    // the ready queue at the start of this one, after the arrivals of this
    // instant: the queue order the generator produces, reconstructed here.
    const requeuedId = previous?.preemptedId ?? null
    // A unit continues the previous one only when the same process held the CPU
    // and kept it: a process re-dispatched after being preempted starts a new
    // grant even though the id did not change.
    const continuing =
      step.running !== null &&
      previous?.running?.id === step.running.id &&
      previous.preemptedId === null

    // A step already records the completion that happens at the end of its
    // unit; only the `complete` frame may show it, so the frames before it
    // drop that last entry.
    const completedBefore =
      step.completedId !== null
        ? step.completed.slice(0, step.completed.length - 1)
        : step.completed

    if (step.arrivedIds.length > 0) {
      // Processes waiting before this unit, in queue order: the step queue
      // already includes every arrival of the unit, so they are removed here,
      // along with the process that only lands once all of them are in.
      const waiting = step.queue.filter(
        (id) => !step.arrivedIds.includes(id) && id !== requeuedId,
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
          queue: [
            ...waiting,
            ...step.arrivedIds.slice(0, index + 1),
            ...(requeuedId === null ? [] : [requeuedId]),
          ],
          cells: [...cells],
          sliceStarts: [...sliceStarts],
          completed: [...completedBefore],
        })
      })
    }

    if (step.running !== null) {
      sliceStarts.push(!continuing)
    } else {
      sliceStarts.push(false)
    }
    cells.push(step.running ? step.running.id : null)
    frames.push({
      kind: step.kind,
      time: step.time,
      processId: step.running ? step.running.id : null,
      running: step.running ? { ...step.running } : null,
      queue: [...step.queue],
      cells: [...cells],
      sliceStarts: [...sliceStarts],
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
        sliceStarts: [...sliceStarts],
        completed: [...step.completed],
      })
    }

    // A step never reports both: a burst that ends inside the slice completes,
    // and only a process with burst left is taken off the CPU.
    if (step.preemptedId !== null) {
      frames.push({
        kind: 'preempt',
        time: step.time + 1,
        processId: step.preemptedId,
        running: null,
        // What the next unit starts from: this unit's queue plus the process that
        // just lost the CPU, at the tail.
        queue: [...step.queue, step.preemptedId],
        cells: [...cells],
        sliceStarts: [...sliceStarts],
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
    sliceStarts: [...sliceStarts],
    completed: last ? [...last.completed] : [],
  })

  return frames
}
