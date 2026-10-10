import { describe, expect, it } from 'vitest'
import { createConvoyProcesses } from '../../workloads'
import type { Process } from '../../workloads'
import { generateFcfsSteps } from './fcfsScheduling'
import { createReadyFrame, toVisualFrames } from './visualFrames'
import type { FcfsVisualFrame } from './visualFrames'

function framesFor(processes: Process[]): FcfsVisualFrame[] {
  return [createReadyFrame(), ...toVisualFrames(generateFcfsSteps(processes))]
}

function summarize(frame: FcfsVisualFrame) {
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
      completed: [],
    })
  })
})

describe('toVisualFrames', () => {
  it('produces a single done frame for an empty workload', () => {
    const frames = toVisualFrames([])

    expect(frames).toHaveLength(1)
    expect(frames[0]).toMatchObject({ kind: 'done', time: 0, cells: [] })
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
        completed: [],
      },
      {
        kind: 'arrive',
        time: 0,
        processId: 'P1',
        running: null,
        queue: ['P1'],
        cells: [],
        completed: [],
      },
      {
        kind: 'run',
        time: 0,
        processId: 'P1',
        running: { id: 'P1', unitsLeft: 2, waiting: 0 },
        queue: [],
        cells: ['P1'],
        completed: [],
      },
      {
        kind: 'arrive',
        time: 1,
        processId: 'P2',
        running: { id: 'P1', unitsLeft: 1, waiting: 0 },
        queue: ['P2'],
        cells: ['P1'],
        completed: [],
      },
      {
        kind: 'run',
        time: 1,
        processId: 'P1',
        running: { id: 'P1', unitsLeft: 1, waiting: 0 },
        queue: ['P2'],
        cells: ['P1', 'P1'],
        completed: [],
      },
      {
        kind: 'complete',
        time: 2,
        processId: 'P1',
        running: { id: 'P1', unitsLeft: 0, waiting: 0 },
        queue: ['P2'],
        cells: ['P1', 'P1'],
        completed: ['P1:0/2'],
      },
      {
        kind: 'run',
        time: 2,
        processId: 'P2',
        running: { id: 'P2', unitsLeft: 1, waiting: 1 },
        queue: [],
        cells: ['P1', 'P1', 'P2'],
        completed: ['P1:0/2'],
      },
      {
        kind: 'complete',
        time: 3,
        processId: 'P2',
        running: { id: 'P2', unitsLeft: 0, waiting: 1 },
        queue: [],
        cells: ['P1', 'P1', 'P2'],
        completed: ['P1:0/2', 'P2:1/2'],
      },
      {
        kind: 'done',
        time: 3,
        processId: null,
        running: null,
        queue: [],
        cells: ['P1', 'P1', 'P2'],
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
      completed: [{ id: 'P1', finish: 6, waiting: 0, turnaround: 6 }],
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
