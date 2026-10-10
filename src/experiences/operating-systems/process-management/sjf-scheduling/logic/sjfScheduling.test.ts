import { describe, expect, it } from 'vitest'
import {
  createConvoyProcesses,
  createStarvationProcesses,
} from '../../workloads'
import type { Process } from '../../workloads'
import { generateFcfsSteps } from '../../fcfs-scheduling/logic/fcfsScheduling'
import { generateSjfSteps } from './sjfScheduling'

const TEXTBOOK: Process[] = [
  { id: 'P1', arrival: 0, burst: 6 },
  { id: 'P2', arrival: 2, burst: 8 },
  { id: 'P3', arrival: 4, burst: 7 },
]

describe('generateSjfSteps', () => {
  it('produces no steps for an empty workload', () => {
    expect(generateSjfSteps([])).toEqual([])
  })

  it('runs the shortest job first when it is waiting at dispatch time (TEXTBOOK)', () => {
    const steps = generateSjfSteps(TEXTBOOK)
    const last = steps[steps.length - 1]

    // Completion order P1, P3, P2: when the CPU frees at t=6, P3's burst of 7
    // beats P2's 8 even though P2 arrived first.
    expect(steps).toHaveLength(21)
    expect(last.completed).toEqual([
      { id: 'P1', finish: 6, waiting: 0, turnaround: 6 },
      { id: 'P3', finish: 13, waiting: 2, turnaround: 9 },
      { id: 'P2', finish: 21, waiting: 11, turnaround: 19 },
    ])
    // On this workload SJF reaches the same makespan as FCFS (21).
    expect(generateSjfSteps(TEXTBOOK)).toHaveLength(generateFcfsSteps(TEXTBOOK).length)
  })

  it('produces a schedule identical to FCFS on the convoy workload', () => {
    // P1 owns the CPU before any short process arrives, and SJF is
    // non-preemptive, so the convoy preset cannot show any difference.
    const processes = createConvoyProcesses()
    const sjf = generateSjfSteps(processes)
    const fcfs = generateFcfsSteps(processes)
    const last = sjf[sjf.length - 1]

    expect(sjf).toHaveLength(fcfs.length)
    expect(last.completed.map((process) => process.id)).toEqual([
      'P1',
      'P2',
      'P3',
      'P4',
      'P5',
    ])
    expect(last.completed.map((process) => process.waiting)).toEqual([
      0, 4, 4, 4, 4,
    ])
    expect(sjf).toEqual(fcfs)
  })

  it('shortens total waiting dramatically on the starvation workload', () => {
    const processes = createStarvationProcesses()
    const sjf = generateSjfSteps(processes)
    const fcfs = generateFcfsSteps(processes)
    const last = sjf[sjf.length - 1]

    // Completion order P1, then every short job, then the long P2 last:
    // P2 waits only for the short jobs to drain, not behind them.
    expect(sjf).toHaveLength(27)
    expect(last.completed).toEqual([
      { id: 'P1', finish: 2, waiting: 0, turnaround: 2 },
      { id: 'P3', finish: 3, waiting: 0, turnaround: 1 },
      { id: 'P4', finish: 4, waiting: 0, turnaround: 1 },
      { id: 'P5', finish: 5, waiting: 0, turnaround: 1 },
      { id: 'P6', finish: 6, waiting: 0, turnaround: 1 },
      { id: 'P7', finish: 7, waiting: 0, turnaround: 1 },
      { id: 'P2', finish: 27, waiting: 6, turnaround: 26 },
    ])

    // Both generators run on the same array, so the numbers cannot drift.
    const sjfWaiting = last.completed.reduce(
      (total, process) => total + process.waiting,
      0,
    )
    const fcfsWaiting = fcfs[fcfs.length - 1].completed.reduce(
      (total, process) => total + process.waiting,
      0,
    )
    expect(sjfWaiting).toBe(6)
    expect(fcfsWaiting).toBe(101)

    // FCFS makes every short process wait the full 20 units behind P2,
    // while SJF makes the long process itself wait 6.
    expect(
      fcfs[fcfs.length - 1].completed
        .slice(2, 7)
        .map((process) => process.waiting),
    ).toEqual([20, 20, 20, 20, 20])
  })

  it('dispatches only from jobs that have already arrived, not a global sort', () => {
    const steps = generateSjfSteps([
      { id: 'P1', arrival: 0, burst: 5 },
      { id: 'P2', arrival: 1, burst: 1 },
    ])
    const last = steps[steps.length - 1]

    // P2 has the smaller burst but has not arrived when the CPU frees at
    // t=0, so P1 runs first despite being the longer job.
    expect(steps).toHaveLength(6)
    expect(last.completed).toEqual([
      { id: 'P1', finish: 5, waiting: 0, turnaround: 5 },
      { id: 'P2', finish: 6, waiting: 4, turnaround: 5 },
    ])
  })

  it('fills gaps with no dispatchable job with idle units', () => {
    const steps = generateSjfSteps([
      { id: 'P1', arrival: 0, burst: 1 },
      { id: 'P2', arrival: 5, burst: 2 },
    ])

    expect(steps).toHaveLength(7)
    expect(steps.map((step) => step.kind)).toEqual([
      'run',
      'idle',
      'idle',
      'idle',
      'idle',
      'run',
      'run',
    ])
    expect(steps[4].queue).toEqual([])
    expect(steps[5].arrivedIds).toEqual(['P2'])
    expect(steps[6].completed).toEqual([
      { id: 'P1', finish: 1, waiting: 0, turnaround: 1 },
      { id: 'P2', finish: 7, waiting: 0, turnaround: 2 },
    ])
  })

  it('breaks burst ties by earlier arrival', () => {
    const steps = generateSjfSteps([
      { id: 'P1', arrival: 0, burst: 4 },
      { id: 'P2', arrival: 1, burst: 2 },
      { id: 'P3', arrival: 2, burst: 2 },
    ])
    const last = steps[steps.length - 1]

    expect(steps).toHaveLength(8)
    expect(last.completed.map((process) => process.id)).toEqual([
      'P1',
      'P2',
      'P3',
    ])
    expect(last.completed.map((process) => process.finish)).toEqual([4, 6, 8])
  })

  it('breaks burst and arrival ties by input order', () => {
    const steps = generateSjfSteps([
      { id: 'P2', arrival: 0, burst: 2 },
      { id: 'P1', arrival: 0, burst: 2 },
    ])
    const last = steps[steps.length - 1]

    expect(steps).toHaveLength(4)
    expect(last.completed.map((process) => process.id)).toEqual(['P2', 'P1'])
  })

  it('never preempts a running process, even for a shorter arrival', () => {
    for (const processes of [TEXTBOOK, createConvoyProcesses(), createStarvationProcesses()]) {
      const steps = generateSjfSteps(processes)

      const blocks: { id: string; count: number }[] = []
      for (const step of steps) {
        const id = step.running?.id
        if (!id) continue
        const current = blocks[blocks.length - 1]
        if (current && current.id === id) {
          current.count += 1
        } else {
          blocks.push({ id, count: 1 })
        }
      }

      // Each process appears in exactly one contiguous run block.
      const ids = blocks.map((block) => block.id)
      expect(new Set(ids).size).toBe(ids.length)
      for (const process of processes) {
        expect(ids).toContain(process.id)
      }
    }
  })

  it('does not mutate the input array or its processes', () => {
    const input: Process[] = [
      { id: 'P2', arrival: 2, burst: 1 },
      { id: 'P1', arrival: 0, burst: 1 },
      { id: 'P3', arrival: 1, burst: 3 },
    ]

    generateSjfSteps(input)

    expect(input).toEqual([
      { id: 'P2', arrival: 2, burst: 1 },
      { id: 'P1', arrival: 0, burst: 1 },
      { id: 'P3', arrival: 1, burst: 3 },
    ])
  })
})
