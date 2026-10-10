import { describe, expect, it } from 'vitest'
import {
  createConvoyProcesses,
  createRandomProcesses,
  createStarvationProcesses,
} from '../../workloads'
import type { Process } from '../../workloads'
import { generateFcfsSteps } from './fcfsScheduling'

const TEXTBOOK: Process[] = [
  { id: 'P1', arrival: 0, burst: 6 },
  { id: 'P2', arrival: 2, burst: 8 },
  { id: 'P3', arrival: 4, burst: 7 },
]

function runningIds(steps: ReturnType<typeof generateFcfsSteps>): (string | null)[] {
  return steps.map((step) => step.running?.id ?? null)
}

function rngFrom(values: number[]): () => number {
  let index = 0
  return () => values[index++ % values.length]
}

describe('generateFcfsSteps', () => {
  it('produces no steps for an empty workload', () => {
    expect(generateFcfsSteps([])).toEqual([])
  })

  it('runs every unit of a process consecutively without preemption', () => {
    const steps = generateFcfsSteps(TEXTBOOK)

    expect(steps).toHaveLength(21)
    expect(runningIds(steps)).toEqual([
      ...Array(6).fill('P1'),
      ...Array(8).fill('P2'),
      ...Array(7).fill('P3'),
    ])
  })

  it('computes waiting and turnaround at completion', () => {
    const steps = generateFcfsSteps(TEXTBOOK)
    const last = steps[steps.length - 1]

    expect(last.completed).toEqual([
      { id: 'P1', finish: 6, waiting: 0, turnaround: 6 },
      { id: 'P2', finish: 14, waiting: 4, turnaround: 12 },
      { id: 'P3', finish: 21, waiting: 10, turnaround: 17 },
    ])
  })

  it('reports the exact state of every unit for a small workload', () => {
    const steps = generateFcfsSteps([
      { id: 'P1', arrival: 0, burst: 2 },
      { id: 'P2', arrival: 1, burst: 1 },
    ])

    expect(steps).toHaveLength(3)
    expect(steps[0]).toEqual({
      kind: 'run',
      time: 0,
      arrivedIds: ['P1'],
      running: { id: 'P1', unitsLeft: 2, waiting: 0 },
      completedId: null,
      queue: [],
      completed: [],
    })
    expect(steps[1]).toEqual({
      kind: 'run',
      time: 1,
      arrivedIds: ['P2'],
      running: { id: 'P1', unitsLeft: 1, waiting: 0 },
      completedId: 'P1',
      queue: ['P2'],
      completed: [{ id: 'P1', finish: 2, waiting: 0, turnaround: 2 }],
    })
    expect(steps[2]).toEqual({
      kind: 'run',
      time: 2,
      arrivedIds: [],
      running: { id: 'P2', unitsLeft: 1, waiting: 1 },
      completedId: 'P2',
      queue: [],
      completed: [
        { id: 'P1', finish: 2, waiting: 0, turnaround: 2 },
        { id: 'P2', finish: 3, waiting: 1, turnaround: 2 },
      ],
    })
  })

  it('marks units with a free CPU and an empty queue as idle', () => {
    const steps = generateFcfsSteps([
      { id: 'P1', arrival: 0, burst: 1 },
      { id: 'P2', arrival: 3, burst: 1 },
    ])

    expect(steps.map((step) => step.kind)).toEqual(['run', 'idle', 'idle', 'run'])
    expect(runningIds(steps)).toEqual(['P1', null, null, 'P2'])
    expect(steps[3].completed).toEqual([
      { id: 'P1', finish: 1, waiting: 0, turnaround: 1 },
      { id: 'P2', finish: 4, waiting: 0, turnaround: 1 },
    ])
  })

  it('enqueues arrivals before dispatching at the same time', () => {
    const steps = generateFcfsSteps([
      { id: 'P1', arrival: 0, burst: 2 },
      { id: 'P2', arrival: 2, burst: 1 },
    ])

    // P2 arrives exactly when P1 releases the CPU, so it is enqueued before
    // the dispatch of the unit and starts running with zero waiting time and
    // no idle gap.
    expect(steps).toHaveLength(3)
    expect(steps[2]).toMatchObject({
      time: 2,
      arrivedIds: ['P2'],
      running: { id: 'P2', unitsLeft: 1, waiting: 0 },
    })
  })

  it('dispatches same-time arrivals in input order', () => {
    const steps = generateFcfsSteps([
      { id: 'P2', arrival: 0, burst: 1 },
      { id: 'P1', arrival: 0, burst: 1 },
    ])

    expect(steps[0]).toMatchObject({
      arrivedIds: ['P2', 'P1'],
      running: { id: 'P2', unitsLeft: 1, waiting: 0 },
      completedId: 'P2',
      queue: ['P1'],
    })
    expect(steps[1]).toMatchObject({
      running: { id: 'P1', unitsLeft: 1, waiting: 1 },
      completedId: 'P1',
    })
  })

  it('does not mutate the input array or its processes', () => {
    const input: Process[] = [
      { id: 'P2', arrival: 2, burst: 1 },
      { id: 'P1', arrival: 0, burst: 1 },
    ]

    const steps = generateFcfsSteps(input)

    expect(runningIds(steps)).toEqual(['P1', null, 'P2'])
    expect(input).toEqual([
      { id: 'P2', arrival: 2, burst: 1 },
      { id: 'P1', arrival: 0, burst: 1 },
    ])
  })

  it('stores independent snapshots', () => {
    const steps = generateFcfsSteps([
      { id: 'P1', arrival: 0, burst: 2 },
      { id: 'P2', arrival: 1, burst: 1 },
    ])

    expect(steps[0].queue).not.toBe(steps[1].queue)
    expect(steps[1].completed).not.toBe(steps[2].completed)
  })

  it('gives every process exactly as many run units as its burst', () => {
    const workloads = [
      TEXTBOOK,
      createConvoyProcesses(),
      createRandomProcesses(7, rngFrom([0.1, 0.5, 0.9, 0.2, 0.7, 0.4])),
    ]

    for (const processes of workloads) {
      const counts = new Map<string, number>()
      for (const step of generateFcfsSteps(processes)) {
        if (step.running) {
          counts.set(step.running.id, (counts.get(step.running.id) ?? 0) + 1)
        }
      }

      expect(counts.size).toBe(processes.length)
      for (const process of processes) {
        expect(counts.get(process.id)).toBe(process.burst)
      }
    }
  })
})

describe('FCFS on the starvation workload', () => {
  it('makes the short arrivals wait behind the long process that reached the queue first', () => {
    // The workload the SJF page offers as its own preset. FCFS reaches the same
    // makespan (27) but pays for it in waiting time: P2 arrives at 1 with a
    // burst of 20, so it is already at the head of the queue when the CPU frees
    // at 2, and every one-unit job that arrives while it runs waits for it.
    const processes = createStarvationProcesses()
    const steps = generateFcfsSteps(processes)
    const last = steps[steps.length - 1]

    expect(steps).toHaveLength(27)
    expect(last.completed.map((process) => process.id)).toEqual([
      'P1',
      'P2',
      'P3',
      'P4',
      'P5',
      'P6',
      'P7',
    ])
    expect(last.completed.map((process) => process.waiting)).toEqual([
      0, 1, 20, 20, 20, 20, 20,
    ])
    expect(last.completed.map((process) => process.turnaround)).toEqual([
      2, 21, 21, 21, 21, 21, 21,
    ])

    // The number the comparison with SJF is built on: 101 units of waiting here
    // against 6 on the same processes, at the same makespan. Asserted here as
    // well as in the SJF test so the two policies cannot drift apart silently.
    const totalWaiting = last.completed.reduce(
      (sum, process) => sum + process.waiting,
      0,
    )
    expect(totalWaiting).toBe(101)
  })
})

describe('FCFS on the convoy workload', () => {
  it('makes every short process wait behind the long one', () => {
    const steps = generateFcfsSteps(createConvoyProcesses())
    const last = steps[steps.length - 1]

    expect(steps).toHaveLength(10)
    expect(last.completed.map((process) => process.waiting)).toEqual([
      0, 4, 4, 4, 4,
    ])
    expect(last.completed.map((process) => process.turnaround)).toEqual([
      6, 5, 5, 5, 5,
    ])
  })
})
