import { describe, expect, it } from 'vitest'
import { createConvoyProcesses } from '../../workloads'
import { generateFcfsSteps } from './fcfsScheduling'
import { createReadyFrame, toVisualFrames } from '../../schedule'
import { describeFrame } from './frameNarration'

/*
 * The convoy preset is the workload FCFS is remembered for, so these are the
 * sentences a reader sees while the convoy forms: who arrives, who keeps the
 * CPU anyway, and what each completion costs the processes behind it. The
 * numbers are not retyped here from a head-trace: they come from the frames the
 * shared builder produces from this policy's own steps, and the step data itself
 * is pinned in fcfsScheduling.test.ts.
 */
const processes = createConvoyProcesses()
const frames = [createReadyFrame(), ...toVisualFrames(generateFcfsSteps(processes))]

function sentence(kind: string, order: number): string {
  const matching = frames.filter((frame) => frame.kind === kind)

  return describeFrame(matching[order], processes)
}

function sentenceAt(index: number): string {
  return describeFrame(frames[index], processes)
}

describe('describeFrame for FCFS', () => {
  it('names how many frames the convoy run has', () => {
    // The frame budget is the contract with the shared builder: one frame per
    // unit, one per arrival, one per completion, plus ready and done.
    expect(frames).toHaveLength(22)
  })

  it('opens with the workload size', () => {
    expect(sentenceAt(0)).toEqual('Ready to schedule 5 processes.')
  })

  it('says the first arrival finds the CPU free and the long process keeps it', () => {
    expect(sentence('arrive', 0)).toEqual('P1 arrives and finds the CPU free.')
    expect(sentenceAt(2)).toEqual('P1 runs on the CPU — 6 units of its burst left.')
  })

  it('states the convoy in the arrival sentence: the CPU is not preempted', () => {
    // The whole lesson of FCFS in one line: each newcomer queues behind the long
    // process and waits its full burst, and the count of waiters grows by one.
    expect(sentence('arrive', 1)).toEqual(
      'P2 arrives. P1 keeps the CPU with 4 more units to run, so it joins 1 process waiting.',
    )
    expect(sentence('arrive', 4)).toEqual(
      'P5 arrives. P1 keeps the CPU with 1 more unit to run, so it joins 4 processes waiting.',
    )
  })

  it('names the successor at a completion, because queue order decides it', () => {
    // FCFS may promise the next process by name: the head of the queue is the
    // answer whatever arrives in the meantime. That is what its SJF twin cannot do.
    expect(sentence('complete', 0)).toEqual(
      'P1 finished at t=6. waited 0 and finished with a turnaround of 6. P2 is next in the queue.',
    )
    expect(sentence('complete', 1)).toEqual(
      'P2 finished at t=7. waited 4 and finished with a turnaround of 5. P3 is next in the queue.',
    )
    // The last completion has no successor to name.
    expect(sentence('complete', 4)).toEqual(
      'P5 finished at t=10. waited 4 and finished with a turnaround of 5.',
    )
  })

  it('closes with the average waiting time of the convoy', () => {
    // 16 units of waiting over 5 processes: the number the comparison with the
    // other two policies is built on.
    expect(sentenceAt(frames.length - 1)).toEqual(
      'All 5 processes finished in 10 units. Average waiting time: 3.2.',
    )
  })
})
