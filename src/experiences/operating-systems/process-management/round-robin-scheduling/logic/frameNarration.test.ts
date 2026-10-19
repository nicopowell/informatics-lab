import { describe, expect, it } from 'vitest'
import { createConvoyProcesses, createStarvationProcesses } from '../../workloads'
import type { Process } from '../../workloads'
import { createReadyFrame, toVisualFrames } from '../../schedule'
import type { SchedulingFrame } from '../../schedule'
import { generateRoundRobinSteps } from './roundRobinScheduling'
import { describeFrame } from './frameNarration'

// P1's slice ends at t=1, the instant P2 arrives; with quantum 1 every unit of
// this workload is its own grant of the CPU.
const ROTATION: Process[] = [
  { id: 'P1', arrival: 0, burst: 3 },
  { id: 'P2', arrival: 1, burst: 1 },
]

function framesFor(processes: Process[], quantum: number): SchedulingFrame[] {
  return [
    createReadyFrame(),
    ...toVisualFrames(generateRoundRobinSteps(processes, quantum)),
  ]
}

function handovers(frames: SchedulingFrame[]): number {
  return frames.filter((frame) => frame.kind === 'preempt').length
}

function sentence(
  frame: SchedulingFrame,
  processes: Process[],
  quantum: number,
): string {
  const frames = framesFor(processes, quantum)

  return describeFrame(frame, processes, quantum, handovers(frames))
}

describe('describeFrame for Round Robin', () => {
  it('states the quantum on the ready frame', () => {
    const frames = framesFor(ROTATION, 1)

    expect(sentence(frames[0], ROTATION, 1)).toEqual(
      'Ready to schedule 2 processes with a quantum of 1 unit.',
    )
  })

  it('names the burst a preempted process still needs, counted from the Gantt', () => {
    const frames = framesFor(ROTATION, 1)
    const first = frames.filter((frame) => frame.kind === 'preempt')[0]

    expect(first.cells).toEqual(['P1'])
    expect(first.queue).toEqual(['P1'])
    expect(sentence(first, ROTATION, 1)).toEqual(
      "P1's slice is over. It still needs 2 units of burst and goes to the back of the ready queue, where it is the only process waiting.",
    )
  })

  it('counts the processes a requeued process lands behind', () => {
    const processes = createConvoyProcesses()
    const frames = framesFor(processes, 2)
    // P1's second slice ends at t=4, while P3 and P4 are already queued.
    const second = frames.filter(
      (frame) => frame.kind === 'preempt' && frame.queue.length === 3,
    )[0]

    expect(second.processId).toBe('P1')
    expect(second.queue).toEqual(['P3', 'P4', 'P1'])
    expect(sentence(second, processes, 2)).toEqual(
      "P1's slice is over. It still needs 2 units of burst and goes to the back of the ready queue, behind the 2 processes already queued.",
    )
  })

  it('separates the first slice from a slice the process gets back', () => {
    const frames = framesFor(ROTATION, 1)
    const runs = frames.filter((frame) => frame.kind === 'run')

    expect(sentence(runs[0], ROTATION, 1)).toEqual(
      'P1 takes the CPU for the first time, after waiting 0 units. Its slice is up to 1 unit.',
    )
    // P2 has one unit of burst, so it never comes back; P1 returns at t=2 with
    // a unit of waiting already charged to it.
    expect(sentence(runs[2], ROTATION, 1)).toEqual(
      'P1 gets the CPU back for another slice of up to 1 unit, with 2 units of burst left and 1 unit already waited.',
    )
  })

  it('tells a long first wait from a slice the process got back', () => {
    const processes = createStarvationProcesses()
    const frames = framesFor(processes, 1)
    const runs = (id: string) => frames.filter((frame) => frame.kind === 'run' && frame.processId === id)

    // P4 arrived at t=3 and did not reach the CPU until t=5: two units of waiting
    // and nothing executed yet, so this is its first slice, not a return.
    expect(sentence(runs('P4')[0], processes, 1)).toContain(
      'P4 takes the CPU for the first time, after waiting 2 units',
    )
    // P2 is the long job: first dispatched at t=1 with no waiting, back at t=4
    // with two units waited and one unit of its burst already spent. Only the
    // units spent say whether a slice is a first one.
    expect(runs('P2')[0]).toMatchObject({ running: { unitsLeft: 20, waiting: 0 } })
    expect(runs('P2')[1]).toMatchObject({ running: { unitsLeft: 19, waiting: 2 } })
    expect(sentence(runs('P2')[1], processes, 1)).toEqual(
      'P2 gets the CPU back for another slice of up to 1 unit, with 19 units of burst left and 2 units already waited.',
    )
  })

  it('separates an arrival that finds the CPU busy from one that finds it free', () => {
    const processes = createConvoyProcesses()
    const frames = framesFor(processes, 2)
    const arrives = (id: string) =>
      frames.filter((frame) => frame.kind === 'arrive' && frame.processId === id)

    // P4 arrives inside P1's second slice, so it queues and waits; P3 arrives at
    // the instant the CPU is free, and the head of the queue is not decided until
    // the dispatch, so the sentence states the rule and not a name.
    expect(arrives('P4')[0].running).toMatchObject({ id: 'P1', unitsLeft: 3 })
    expect(sentence(arrives('P4')[0], processes, 2)).toEqual(
      'P4 joins the ready queue; P1 keeps the CPU for the rest of its slice, and 2 processes are waiting.',
    )
    expect(sentence(arrives('P3')[0], processes, 2)).toEqual(
      'P3 arrives and finds the CPU free.',
    )
  })

  it('reads the second unit of a slice as a continuation, and the last as the end', () => {
    const processes = createConvoyProcesses()
    const frames = framesFor(processes, 2)
    const runs = (id: string, time: number) =>
      frames.find(
        (frame) => frame.kind === 'run' && frame.processId === id && frame.time === time,
      )!

    expect(sentence(runs('P1', 1), processes, 2)).toEqual(
      'P1 runs within its slice — 5 units of its burst left.',
    )
    expect(sentence(runs('P1', 9), processes, 2)).toEqual(
      'P1 runs its last unit of burst.',
    )
  })

  it('finishes with the two averages and the number of handovers', () => {
    const frames = framesFor(ROTATION, 1)
    const done = frames[frames.length - 1]

    // P2 waited nothing, P1 waited one unit between its slices; both got the CPU
    // at once, so the response average is zero while the waiting average is not.
    expect(handovers(frames)).toBe(2)
    expect(sentence(done, ROTATION, 1)).toEqual(
      'All 2 processes finished in 4 units. Average waiting 0.5, average response 0.0, and the CPU was handed back 2 times.',
    )
  })
})
