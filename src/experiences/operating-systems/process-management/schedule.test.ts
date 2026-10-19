import { describe, expect, it } from 'vitest'
import {
  createConvoyProcesses,
  createStarvationProcesses,
} from './workloads'
import type { Process } from './workloads'
import { generateFcfsSteps } from './fcfs-scheduling/logic/fcfsScheduling'
import { generateSjfSteps } from './sjf-scheduling/logic/sjfScheduling'
import { generateRoundRobinSteps } from './round-robin-scheduling/logic/roundRobinScheduling'
import { createReadyFrame, toVisualFrames, waitingSoFar } from './schedule'
import type { SchedulingFrame } from './schedule'

function framesFor(processes: Process[]): SchedulingFrame[] {
  return [createReadyFrame(), ...toVisualFrames(generateFcfsSteps(processes))]
}

function sjfFramesFor(processes: Process[]): SchedulingFrame[] {
  return [createReadyFrame(), ...toVisualFrames(generateSjfSteps(processes))]
}

function rrFramesFor(processes: Process[], quantum: number): SchedulingFrame[] {
  return [
    createReadyFrame(),
    ...toVisualFrames(generateRoundRobinSteps(processes, quantum)),
  ]
}

function summarize(frame: SchedulingFrame) {
  return {
    kind: frame.kind,
    time: frame.time,
    processId: frame.processId,
    running: frame.running
      ? {
          id: frame.running.id,
          unitsLeft: frame.running.unitsLeft,
          waiting: frame.running.waiting,
        }
      : null,
    queue: frame.queue,
    cells: frame.cells,
    starts: frame.sliceStarts
      .map((start, index) => (start ? index : -1))
      .filter((index) => index >= 0),
    completed: frame.completed.map(
      (process) => `${process.id}:${process.waiting}/${process.turnaround}`,
    ),
  }
}

const SMALL_WORKLOAD: Process[] = [
  { id: 'P1', arrival: 0, burst: 2 },
  { id: 'P2', arrival: 1, burst: 1 },
]

describe('createReadyFrame', () => {
  it('is an empty schedule at time zero', () => {
    expect(createReadyFrame()).toEqual({
      kind: 'ready',
      time: 0,
      processId: null,
      running: null,
      queue: [],
      cells: [],
      sliceStarts: [],
      completed: [],
    })
  })
})

describe('toVisualFrames', () => {
  it('produces a single done frame for an empty workload', () => {
    const frames = toVisualFrames([])

    expect(frames).toHaveLength(1)
    expect(frames[0]).toMatchObject({
      kind: 'done',
      time: 0,
      cells: [],
      sliceStarts: [],
    })
  })

  it('expands a small workload into one fact per frame', () => {
    const frames = framesFor(SMALL_WORKLOAD)

    expect(frames.map(summarize)).toEqual([
      {
        kind: 'ready',
        time: 0,
        processId: null,
        running: null,
        queue: [],
        cells: [],
        starts: [],
        completed: [],
      },
      {
        kind: 'arrive',
        time: 0,
        processId: 'P1',
        running: null,
        queue: ['P1'],
        cells: [],
        starts: [],
        completed: [],
      },
      {
        kind: 'run',
        time: 0,
        processId: 'P1',
        running: { id: 'P1', unitsLeft: 2, waiting: 0 },
        queue: [],
        cells: ['P1'],
        starts: [0],
        completed: [],
      },
      {
        kind: 'arrive',
        time: 1,
        processId: 'P2',
        running: { id: 'P1', unitsLeft: 1, waiting: 0 },
        queue: ['P2'],
        cells: ['P1'],
        starts: [0],
        completed: [],
      },
      {
        kind: 'run',
        time: 1,
        processId: 'P1',
        running: { id: 'P1', unitsLeft: 1, waiting: 0 },
        queue: ['P2'],
        cells: ['P1', 'P1'],
        starts: [0],
        completed: [],
      },
      {
        kind: 'complete',
        time: 2,
        processId: 'P1',
        running: { id: 'P1', unitsLeft: 0, waiting: 0 },
        queue: ['P2'],
        cells: ['P1', 'P1'],
        starts: [0],
        completed: ['P1:0/2'],
      },
      {
        kind: 'run',
        time: 2,
        processId: 'P2',
        running: { id: 'P2', unitsLeft: 1, waiting: 1 },
        queue: [],
        cells: ['P1', 'P1', 'P2'],
        starts: [0, 2],
        completed: ['P1:0/2'],
      },
      {
        kind: 'complete',
        time: 3,
        processId: 'P2',
        running: { id: 'P2', unitsLeft: 0, waiting: 1 },
        queue: [],
        cells: ['P1', 'P1', 'P2'],
        starts: [0, 2],
        completed: ['P1:0/2', 'P2:1/2'],
      },
      {
        kind: 'done',
        time: 3,
        processId: null,
        running: null,
        queue: [],
        cells: ['P1', 'P1', 'P2'],
        starts: [0, 2],
        completed: ['P1:0/2', 'P2:1/2'],
      },
    ])
  })

  it('gives every arrival of a unit its own frame in queue order', () => {
    const frames = framesFor([
      { id: 'P2', arrival: 0, burst: 1 },
      { id: 'P1', arrival: 0, burst: 1 },
    ])
    const arrives = frames.filter((frame) => frame.kind === 'arrive')

    expect(frames.map((frame) => frame.kind)).toEqual([
      'ready',
      'arrive',
      'arrive',
      'run',
      'complete',
      'run',
      'complete',
      'done',
    ])
    expect(arrives[0]).toMatchObject({
      processId: 'P2',
      running: null,
      queue: ['P2'],
    })
    expect(arrives[1]).toMatchObject({
      processId: 'P1',
      running: null,
      queue: ['P2', 'P1'],
    })
  })

  it('keeps showing the running process while an arrival queues', () => {
    const frames = framesFor(createConvoyProcesses())
    const p2Arrival = frames.find(
      (frame) => frame.kind === 'arrive' && frame.processId === 'P2',
    )

    // Non-preemptive: P2 joins the queue but P1 keeps the CPU with its unit
    // count of the current unit.
    expect(p2Arrival).toMatchObject({
      time: 2,
      running: { id: 'P1', unitsLeft: 4, waiting: 0 },
      queue: ['P2'],
      cells: ['P1', 'P1'],
      sliceStarts: [true, false],
    })
  })

  it('closes a segment with its metrics at the finish instant', () => {
    const frames = framesFor(createConvoyProcesses())
    const p1Complete = frames.find(
      (frame) => frame.kind === 'complete' && frame.processId === 'P1',
    )

    expect(p1Complete).toMatchObject({
      time: 6,
      running: { id: 'P1', unitsLeft: 0, waiting: 0 },
      queue: ['P2', 'P3', 'P4', 'P5'],
      cells: Array(6).fill('P1'),
      sliceStarts: [true, ...Array(5).fill(false)],
      completed: [{ id: 'P1', finish: 6, waiting: 0, turnaround: 6, response: 0 }],
    })
  })

  it('grows the Gantt with an empty cell for idle units', () => {
    const frames = framesFor([
      { id: 'P1', arrival: 0, burst: 1 },
      { id: 'P2', arrival: 3, burst: 1 },
    ])

    expect(frames.map((frame) => frame.kind)).toEqual([
      'ready',
      'arrive',
      'run',
      'complete',
      'idle',
      'idle',
      'arrive',
      'run',
      'complete',
      'done',
    ])
    const done = frames[frames.length - 1]
    expect(done.cells).toEqual(['P1', null, null, 'P2'])
    expect(done.time).toBe(4)
  })

  it('ends the convoy run with every short process waiting four units', () => {
    const frames = framesFor(createConvoyProcesses())
    const done = frames[frames.length - 1]

    expect(frames).toHaveLength(22)
    expect(done.kind).toBe('done')
    expect(done.time).toBe(10)
    expect(done.queue).toEqual([])
    expect(done.cells).toHaveLength(10)
    expect(done.completed.map((process) => process.waiting)).toEqual([
      0, 4, 4, 4, 4,
    ])
    expect(done.completed.map((process) => process.turnaround)).toEqual([
      6, 5, 5, 5, 5,
    ])
  })

  it('stores independent snapshots', () => {
    const frames = framesFor(SMALL_WORKLOAD)

    expect(frames[2].cells).not.toBe(frames[3].cells)
    expect(frames[3].queue).not.toBe(frames[4].queue)
    expect(frames[5].completed).not.toBe(frames[6].completed)
  })

  it('never shrinks or reorders the Gantt between frames', () => {
    const frames = framesFor(createConvoyProcesses())

    for (let index = 1; index < frames.length; index++) {
      const previous = frames[index - 1].cells
      const current = frames[index].cells
      expect(current.length).toBeGreaterThanOrEqual(previous.length)
      expect(current.slice(0, previous.length)).toEqual(previous)
    }
  })
})

// The builder is shared by both policies, so these frames come from the SJF
// generator. They cover what only a non-FIFO dispatch can show: a process that
// queued first is not the process that runs next.
describe('toVisualFrames under SJF', () => {
  it('lets the shorter arrival take the CPU ahead of a queued process', () => {
    const frames = sjfFramesFor(createStarvationProcesses())

    // P2 arrived at t=1 and is still waiting; P3 arrives at t=2 with burst 1
    // and is dispatched by the same unit it arrives in.
    const arriveIndex = frames.findIndex(
      (frame) => frame.kind === 'arrive' && frame.time === 2,
    )
    const arrive = frames.filter(
      (frame) => frame.kind === 'arrive' && frame.time === 2,
    )
    expect(arrive).toHaveLength(1)
    expect(arrive[0].processId).toBe('P3')
    expect(arrive[0].running).toBeNull()
    expect(arrive[0].queue).toEqual(['P2', 'P3'])
    expect(arrive[0].cells).toEqual(['P1', 'P1'])

    const dispatch = frames[arriveIndex + 1]
    expect(dispatch.kind).toBe('run')
    expect(dispatch.time).toBe(2)
    expect(dispatch.processId).toBe('P3')
    expect(dispatch.queue).toEqual(['P2'])
    expect(dispatch.cells).toEqual(['P1', 'P1', 'P3'])
  })

  it('reports completions in the order the policy chose', () => {
    const frames = sjfFramesFor(createStarvationProcesses())
    const done = frames[frames.length - 1]

    expect(
      frames
        .filter((frame) => frame.kind === 'complete')
        .map((frame) => frame.processId),
    ).toEqual(['P1', 'P3', 'P4', 'P5', 'P6', 'P7', 'P2'])
    expect(summarize(done).completed).toEqual([
      'P1:0/2',
      'P3:0/1',
      'P4:0/1',
      'P5:0/1',
      'P6:0/1',
      'P7:0/1',
      'P2:6/26',
    ])
  })

  it('keeps the starved process as one contiguous block in the Gantt', () => {
    const frames = sjfFramesFor(createStarvationProcesses())
    const done = frames[frames.length - 1]

    expect(done.cells).toEqual([
      'P1',
      'P1',
      'P3',
      'P4',
      'P5',
      'P6',
      'P7',
      ...Array.from({ length: 20 }, () => 'P2'),
    ])
    expect(done.time).toBe(27)
  })

  it('produces identical frames for both policies on the convoy workload', () => {
    const processes = createConvoyProcesses()

    expect(sjfFramesFor(processes)).toEqual(framesFor(processes))
    // The FCFS suite pins the same 22-frame count for this workload, so the
    // equality above also says SJF adds no frame of its own here.
    expect(framesFor(processes)).toHaveLength(22)
  })
})

// Round Robin is the first policy that takes the CPU back, so the shared frame
// vocabulary needs two things the non-preemptive ones never use: a `preempt`
// frame sitting between the end of a slice and the next dispatch, and the record
// of which Gantt cells start a new slice.
describe('toVisualFrames under Round Robin', () => {
  // P1's quantum ends at t=1, exactly when P2 arrives.
  const PREEMPT_WORKLOAD: Process[] = [
    { id: 'P1', arrival: 0, burst: 3 },
    { id: 'P2', arrival: 1, burst: 1 },
  ]

  it('inserts a preempt frame that frees the CPU and lands the process at the tail', () => {
    const frames = rrFramesFor(PREEMPT_WORKLOAD, 1)

    expect(frames.map((frame) => frame.kind)).toEqual([
      'ready',
      'arrive',
      'run',
      'preempt',
      'arrive',
      'run',
      'complete',
      'run',
      'preempt',
      'run',
      'complete',
      'done',
    ])
    expect(frames[3]).toMatchObject({
      kind: 'preempt',
      time: 1,
      processId: 'P1',
      running: null,
      queue: ['P1'],
      // The Gantt does not grow on a preemption: no unit of burst was spent.
      cells: ['P1'],
      completed: [],
    })
  })

  it('lands a process that arrives at the preemption instant ahead of the preempted one', () => {
    const frames = rrFramesFor(PREEMPT_WORKLOAD, 1)

    // The arrive frame reconstructs the queue as it stands while P2 lands: what
    // was already waiting first, the arrivals next, and the process that just
    // lost the CPU last - the order the generator itself uses.
    expect(frames[4]).toMatchObject({
      kind: 'arrive',
      processId: 'P2',
      running: null,
      queue: ['P2', 'P1'],
    })
  })

  it('marks every time slice as the start of a run of the Gantt segment', () => {
    const done = rrFramesFor(PREEMPT_WORKLOAD, 1).at(-1)!

    // P1 runs t=0, t=2 and t=3, P2 runs t=1: each unit is its own slice, so all
    // four cells start one, even where the same process resumes.
    expect(done.cells).toEqual(['P1', 'P2', 'P1', 'P1'])
    expect(done.sliceStarts).toEqual([true, true, true, true])
  })

  it('marks only the segment starts under FCFS, where a process is dispatched once', () => {
    const done = framesFor(PREEMPT_WORKLOAD).at(-1)!

    expect(done.cells).toEqual(['P1', 'P1', 'P1', 'P2'])
    expect(done.sliceStarts).toEqual([true, false, false, true])
  })

  it('starts a new slice when the only waiting process is re-dispatched after preemption', () => {
    const frames = rrFramesFor([{ id: 'P1', arrival: 0, burst: 3 }], 1)
    const done = frames.at(-1)!

    // Same process, three contiguous cells, three separate slices: the mark is
    // the only thing that tells the reader the CPU was taken back twice.
    expect(done.cells).toEqual(['P1', 'P1', 'P1'])
    expect(done.sliceStarts).toEqual([true, true, true])
    expect(frames.filter((frame) => frame.kind === 'preempt')).toHaveLength(2)
  })

  it('never emits a preempt frame for the non-preemptive policies', () => {
    const processes = createStarvationProcesses()

    for (const frames of [
      framesFor(processes),
      sjfFramesFor(processes),
    ]) {
      expect(frames.some((frame) => frame.kind === 'preempt')).toBe(false)
      // One slice per process, so the finished Gantt has exactly as many starts
      // as processes even though it holds 27 cells.
      expect(frames.at(-1)!.sliceStarts.filter(Boolean)).toHaveLength(
        processes.length,
      )
    }
  })
})

// The Waiting column and the ready queue chips read this, so its two edges are
// what a reader sees: a preemptive process must not be charged for its own CPU
// time, and the older policies must keep every number they showed before.
describe('waitingSoFar', () => {
  it('excludes the units a queued round-robin process already ran', () => {
    const processes: Process[] = [{ id: 'P1', arrival: 0, burst: 4 }]
    const preempt = rrFramesFor(processes, 2).find(
      (frame) => frame.kind === 'preempt',
    )!

    expect(preempt.time).toBe(2)
    expect(preempt.cells).toEqual(['P1', 'P1'])
    expect(preempt.queue).toEqual(['P1'])
    expect(waitingSoFar(preempt, processes[0])).toBe(0)
  })

  it('keeps a lone process at zero waiting however many slices it is cut into', () => {
    const processes: Process[] = [{ id: 'P1', arrival: 0, burst: 3 }]
    const frames = rrFramesFor(processes, 1)
    const preempted = frames.filter((frame) => frame.kind === 'preempt')

    // Two handovers, all three units run: the live column and the finished record
    // have to say the same thing, or the page contradicts itself at t=done.
    expect(preempted).toHaveLength(2)
    for (const frame of preempted) {
      expect(waitingSoFar(frame, processes[0])).toBe(0)
    }
    expect(frames.at(-1)!.completed[0].waiting).toBe(0)
  })

  it('keeps the non-preemptive reading, because a queued process has never run', () => {
    const processes = createConvoyProcesses()
    const p1Complete = framesFor(processes).find(
      (frame) => frame.kind === 'complete' && frame.processId === 'P1',
    )!

    // FCFS at t=6: P2, P3, P4 and P5 are queued and none has held the CPU, so
    // their wait is the whole time since arrival - 4, 3, 2 and 1 units.
    expect(p1Complete.time).toBe(6)
    expect(p1Complete.cells).toEqual(Array(6).fill('P1'))
    expect(
      p1Complete.queue.map((id) =>
        waitingSoFar(p1Complete, processes.find((process) => process.id === id)!),
      ),
    ).toEqual([4, 3, 2, 1])
  })
})
