import { describe, expect, it } from 'vitest'
import {
  createConvoyProcesses,
  createRandomProcesses,
  createStarvationProcesses,
} from '../../workloads'
import type { Process } from '../../workloads'
import { generateFcfsSteps } from '../../fcfs-scheduling/logic/fcfsScheduling'
import { generateSjfSteps } from '../../sjf-scheduling/logic/sjfScheduling'
import { generateRoundRobinSteps } from './roundRobinScheduling'

// The same textbook workload the FCFS and SJF suites use, so a schedule
// difference between the three policies is always a difference in the rule.
const TEXTBOOK: Process[] = [
  { id: 'P1', arrival: 0, burst: 6 },
  { id: 'P2', arrival: 2, burst: 8 },
  { id: 'P3', arrival: 4, burst: 7 },
]

function runningIds(steps: ReturnType<typeof generateRoundRobinSteps>): (string | null)[] {
  return steps.map((step) => step.running?.id ?? null)
}

// Contiguous runs on the CPU: the shape a reader sees in the Gantt.
function blocks(
  steps: ReturnType<typeof generateRoundRobinSteps>,
): { id: string; units: number }[] {
  const result: { id: string; units: number }[] = []
  for (const step of steps) {
    const id = step.running?.id
    if (!id) continue
    const current = result[result.length - 1]
    if (current && current.id === id) {
      current.units += 1
    } else {
      result.push({ id, units: 1 })
    }
  }
  return result
}

function rngFrom(values: number[]): () => number {
  let index = 0
  return () => values[index++ % values.length]
}

describe('generateRoundRobinSteps', () => {
  it('produces no steps for an empty workload', () => {
    expect(generateRoundRobinSteps([], 2)).toEqual([])
  })

  it('reports the exact state of every unit when a slice ends on an arrival', () => {
    // P1's quantum ends at t=1, exactly when P2 arrives. The newcomer takes the
    // CPU and P1 goes behind it: the process that just received service waits.
    const steps = generateRoundRobinSteps(
      [
        { id: 'P1', arrival: 0, burst: 3 },
        { id: 'P2', arrival: 1, burst: 1 },
      ],
      1,
    )

    expect(steps).toHaveLength(4)
    expect(steps[0]).toEqual({
      kind: 'run',
      time: 0,
      arrivedIds: ['P1'],
      running: { id: 'P1', unitsLeft: 3, waiting: 0 },
      completedId: null,
      preemptedId: 'P1',
      queue: [],
      completed: [],
    })
    expect(steps[1]).toEqual({
      kind: 'run',
      time: 1,
      arrivedIds: ['P2'],
      running: { id: 'P2', unitsLeft: 1, waiting: 0 },
      completedId: 'P2',
      // P2 ran its whole burst in one unit: a burst that ends inside the slice
      // completes, it is never requeued.
      preemptedId: null,
      queue: ['P1'],
      completed: [
        { id: 'P2', finish: 2, waiting: 0, turnaround: 1, response: 0 },
      ],
    })
    expect(steps[2]).toEqual({
      kind: 'run',
      time: 2,
      arrivedIds: [],
      // The waiting time of a preempted process keeps growing: P1 spent t=1 in
      // the ready queue, and the formula charges it for the queue only, not for
      // the unit it already ran.
      running: { id: 'P1', unitsLeft: 2, waiting: 1 },
      completedId: null,
      preemptedId: 'P1',
      queue: [],
      completed: [
        { id: 'P2', finish: 2, waiting: 0, turnaround: 1, response: 0 },
      ],
    })
    expect(steps[3]).toEqual({
      kind: 'run',
      time: 3,
      arrivedIds: [],
      running: { id: 'P1', unitsLeft: 1, waiting: 1 },
      completedId: 'P1',
      preemptedId: null,
      queue: [],
      completed: [
        { id: 'P2', finish: 2, waiting: 0, turnaround: 1, response: 0 },
        { id: 'P1', finish: 4, waiting: 1, turnaround: 4, response: 0 },
      ],
    })
  })

  it('queues the preempted process behind every arrival of the same instant', () => {
    // Two processes arrive at t=2, the same instant P1's quantum ends.
    const steps = generateRoundRobinSteps(
      [
        { id: 'P1', arrival: 0, burst: 3 },
        { id: 'P2', arrival: 2, burst: 1 },
        { id: 'P3', arrival: 2, burst: 1 },
      ],
      2,
    )

    expect(steps[1]).toMatchObject({ time: 1, preemptedId: 'P1' })
    expect(steps[2]).toMatchObject({
      time: 2,
      arrivedIds: ['P2', 'P3'],
      running: { id: 'P2', unitsLeft: 1, waiting: 0 },
      completedId: 'P2',
      // After P2 is dispatched, P3 (arrived at the same instant) still sits
      // ahead of the preempted P1.
      queue: ['P3', 'P1'],
    })
    expect(runningIds(steps)).toEqual(['P1', 'P1', 'P2', 'P3', 'P1'])
  })

  it('never requeues a process that finishes inside its slice', () => {
    const steps = generateRoundRobinSteps([{ id: 'P1', arrival: 0, burst: 1 }], 4)

    expect(steps).toHaveLength(1)
    expect(steps[0]).toMatchObject({
      running: { id: 'P1', unitsLeft: 1 },
      completedId: 'P1',
      preemptedId: null,
      queue: [],
    })
  })

  it('runs each process for at most one quantum before handing the CPU over (TEXTBOOK)', () => {
    // Quantum 4: P1 runs 0-3, P2 4-7, P3 8-11, then the second round.
    const steps = generateRoundRobinSteps(TEXTBOOK, 4)

    expect(blocks(steps)).toEqual([
      { id: 'P1', units: 4 },
      { id: 'P2', units: 4 },
      { id: 'P3', units: 4 },
      { id: 'P1', units: 2 },
      { id: 'P2', units: 4 },
      { id: 'P3', units: 3 },
    ])
    expect(runningIds(steps)).toEqual([
      ...Array(4).fill('P1'),
      ...Array(4).fill('P2'),
      ...Array(4).fill('P3'),
      ...Array(2).fill('P1'),
      ...Array(4).fill('P2'),
      ...Array(3).fill('P3'),
    ])
    // The process that ends a slice is reported for that very unit, and the CPU
    // is still shown as occupied: the requeue is the next fact. Only the first
    // round is cut by the quantum; from t=12 every remaining burst is shorter
    // than the slice, so the processes finish instead of being preempted.
    expect(steps.map((step) => step.preemptedId)).toEqual([
      null,
      null,
      null,
      'P1',
      null,
      null,
      null,
      'P2',
      null,
      null,
      null,
      'P3',
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
    ])
  })

  it('accumulates waiting across slices while response freezes at the first dispatch (TEXTBOOK)', () => {
    const steps = generateRoundRobinSteps(TEXTBOOK, 4)
    const last = steps[steps.length - 1]

    // P1: dispatched at 0, so response 0 forever, but it then sat in the ready
    // queue for the whole first round of P2 and P3 (t=4 to t=11, eight units).
    // Turnaround 14 with a burst of 6 leaves exactly that as its waiting time.
    expect(last.completed).toEqual([
      { id: 'P1', finish: 14, waiting: 8, turnaround: 14, response: 0 },
      { id: 'P2', finish: 18, waiting: 8, turnaround: 16, response: 2 },
      { id: 'P3', finish: 21, waiting: 10, turnaround: 17, response: 4 },
    ])
    expect(steps).toHaveLength(21)
  })

  it('matches the FCFS schedule exactly when the quantum covers the longest burst', () => {
    const cases: { processes: Process[]; quantum: number }[] = [
      { processes: TEXTBOOK, quantum: 8 },
      { processes: createConvoyProcesses(), quantum: 6 },
      { processes: createStarvationProcesses(), quantum: 20 },
    ]

    // No process can spend quantum units without finishing first, so nothing is
    // ever preempted and the round robin queue is a plain FIFO: the policy
    // degenerates into FCFS, step for step.
    for (const { processes, quantum } of cases) {
      expect(generateRoundRobinSteps(processes, quantum)).toEqual(
        generateFcfsSteps(processes),
      )
    }
  })

  it('keeps the same makespan as FCFS for every quantum, because no unit is wasted', () => {
    const workloads = [
      TEXTBOOK,
      createConvoyProcesses(),
      createStarvationProcesses(),
      createRandomProcesses(7, rngFrom([0.1, 0.5, 0.9, 0.2, 0.7, 0.4])),
    ]

    for (const processes of workloads) {
      const makespan = generateFcfsSteps(processes).length
      const totalBurst = processes.reduce((sum, process) => sum + process.burst, 0)

      for (const quantum of [1, 2, 3, 6]) {
        const steps = generateRoundRobinSteps(processes, quantum)
        // Preemption costs nothing in this model, and there is always something
        // ready to run once the queue is non-empty: only an empty queue idles.
        expect(steps.filter((step) => step.kind === 'run')).toHaveLength(totalBurst)
        expect(steps).toHaveLength(makespan)
      }
    }
  })

  it('gives every process exactly as many run units as its burst', () => {
    const workloads = [
      TEXTBOOK,
      createConvoyProcesses(),
      createRandomProcesses(7, rngFrom([0.1, 0.5, 0.9, 0.2, 0.7, 0.4])),
    ]

    for (const processes of workloads) {
      for (const quantum of [1, 3]) {
        const counts = new Map<string, number>()
        for (const step of generateRoundRobinSteps(processes, quantum)) {
          if (step.running) {
            counts.set(step.running.id, (counts.get(step.running.id) ?? 0) + 1)
          }
        }

        expect(counts.size).toBe(processes.length)
        for (const process of processes) {
          expect(counts.get(process.id)).toBe(process.burst)
        }
      }
    }
  })

  it('buys a short response for the queued jobs with some total waiting (starvation, quantum 1)', () => {
    const processes = createStarvationProcesses()
    const steps = generateRoundRobinSteps(processes, 1)
    const last = steps[steps.length - 1]

    // The Gantt as one line of process digits. P2, the long job, arrives at t=1
    // exactly when P1's slice ends and takes the CPU at once - response 0, where
    // FCFS makes it wait 1 and Shortest-Job-First waits 6. Then the CPU rotates:
    // every one-unit job runs within three units of arriving, where FCFS makes
    // each of them wait 20 behind P2. P2 alone spends the last 17 units, being
    // preempted every slice and handed the CPU straight back because nothing
    // else is waiting.
    expect(steps.map((step) => step.running?.id.replace('P', '') ?? '.').join('')).toEqual(
      '1213245627' + '2'.repeat(17),
    )
    expect(last.completed.map((process) => process.id)).toEqual([
      'P1',
      'P3',
      'P4',
      'P5',
      'P6',
      'P7',
      'P2',
    ])
    expect(last.completed.map((process) => process.response)).toEqual([
      0, 1, 2, 2, 2, 3, 0,
    ])
    expect(last.completed.map((process) => process.waiting)).toEqual([
      1, 1, 2, 2, 2, 3, 6,
    ])
    // The price of the rotation: 17 units of waiting here against FCFS's 101 and
    // Shortest-Job-First's 6 on the same processes, at the same makespan (27).
    expect(
      last.completed.reduce((sum, process) => sum + process.waiting, 0),
    ).toBe(17)
  })

  it('breaks the convoy that FCFS and Shortest-Job-First both leave standing (convoy, quantum 2)', () => {
    const processes = createConvoyProcesses()
    const rr = generateRoundRobinSteps(processes, 2)
    const fcfs = generateFcfsSteps(processes)
    const last = rr[rr.length - 1]

    // The long P1 still runs first, but only for two units at a time, so the
    // short jobs behind it reach the CPU in the first rotation instead of at the
    // end: 10 units of total waiting against 16, at the same makespan, and a
    // first-slice wait of 1.2 on average against 3.2.
    expect(rr).toHaveLength(10)
    expect(fcfs).toHaveLength(10)
    // Completion order here is P2, P3, P4, P5 and only then P1: the long process
    // finishes last because the rotation keeps interrupting it, which is exactly
    // what frees the short ones.
    expect(last.completed.map((process) => process.id)).toEqual([
      'P2',
      'P3',
      'P4',
      'P5',
      'P1',
    ])
    expect(last.completed.map((process) => process.waiting)).toEqual([
      0, 2, 2, 2, 4,
    ])
    expect(last.completed.map((process) => process.response)).toEqual([
      0, 2, 2, 2, 0,
    ])
    expect(
      last.completed.reduce((sum, process) => sum + process.waiting, 0),
    ).toBe(10)
    expect(
      fcfs[fcfs.length - 1].completed.reduce(
        (sum, process) => sum + process.waiting,
        0,
      ),
    ).toBe(16)
    expect(rr.filter((step) => step.preemptedId !== null)).toHaveLength(2)
    // And neither non-preemptive policy moves: SJF picks the same order here, so
    // the convoy is a consequence of keeping the CPU, not of the queue order.
    expect(generateSjfSteps(processes)).toEqual(fcfs)
  })

  it('trades waiting and response for handovers as the quantum grows (convoy)', () => {
    const processes = createConvoyProcesses()

    const total = (quantum: number) => {
      const steps = generateRoundRobinSteps(processes, quantum)
      return steps[steps.length - 1].completed.reduce(
        (sum, process) => sum + process.waiting,
        0,
      )
    }
    const handovers = (quantum: number) =>
      generateRoundRobinSteps(processes, quantum).filter(
        (step) => step.preemptedId !== null,
      ).length

    // The same input, one variable: a shorter slice answers sooner and pays in
    // context switches, and the longest slice on the slider is FCFS again.
    expect(total(1)).toBeLessThan(total(2))
    expect(total(2)).toBeLessThan(total(6))
    expect(handovers(1)).toBe(5)
    expect(handovers(2)).toBe(2)
    expect(handovers(6)).toBe(0)
  })

  it('stores independent snapshots', () => {
    const steps = generateRoundRobinSteps(
      [
        { id: 'P1', arrival: 0, burst: 3 },
        { id: 'P2', arrival: 1, burst: 1 },
      ],
      1,
    )

    expect(steps[0].queue).not.toBe(steps[1].queue)
    expect(steps[1].completed).not.toBe(steps[3].completed)
  })

  it('does not mutate the input array or its processes', () => {
    const input: Process[] = [
      { id: 'P2', arrival: 2, burst: 1 },
      { id: 'P1', arrival: 0, burst: 3 },
      { id: 'P3', arrival: 1, burst: 2 },
    ]

    generateRoundRobinSteps(input, 2)

    expect(input).toEqual([
      { id: 'P2', arrival: 2, burst: 1 },
      { id: 'P1', arrival: 0, burst: 3 },
      { id: 'P3', arrival: 1, burst: 2 },
    ])
  })
})
