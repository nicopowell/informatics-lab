import { describe, expect, it } from 'vitest'
import { createStarvationProcesses } from '../../workloads'
import { generateSjfSteps } from './sjfScheduling'
import { createReadyFrame, toVisualFrames } from '../../schedule'
import { describeFrame } from './frameNarration'

/*
 * The starvation preset is where Shortest-Job-First earns its average and pays
 * for it in the long process. The sentences below are the ones that carry the
 * rule, not decoration: the dispatch names the reason it chose a process, and a
 * completion refuses to name the successor because a shorter arrival can still
 * take the CPU. Both helpers are local to this file on purpose: they are welded
 * to this policy's generator and workload, which is why they are not shared with
 * the FCFS twin.
 */
const processes = createStarvationProcesses()
const frames = [createReadyFrame(), ...toVisualFrames(generateSjfSteps(processes))]

function sentenceAt(index: number): string {
  return describeFrame(frames[index], processes)
}

function nth(kind: string, order: number): string {
  return describeFrame(frames.filter((frame) => frame.kind === kind)[order], processes)
}

describe('describeFrame for SJF', () => {
  it('names how many frames the starvation run has', () => {
    expect(frames).toHaveLength(43)
  })

  it('gives the reason for a dispatch, not only the fact', () => {
    // The sentence a reader needs to learn the rule: who was chosen, out of how
    // many, and with how many left behind.
    expect(sentenceAt(2)).toEqual(
      'P1 runs its 2 units of burst — the only process waiting when the CPU came free.',
    )
    expect(sentenceAt(7)).toEqual(
      'P3 runs its 1 unit of burst — the shortest burst of the 2 waiting, with 1 process queued behind it.',
    )
  })

  it('keeps the non-preemptive promise in the arrival sentence', () => {
    // SJF reorders the queue but never displaces the running process.
    expect(sentenceAt(3)).toEqual(
      'P2 arrives, but the CPU is not preempted: P1 keeps running with 1 more unit left, and 1 process is waiting.',
    )
  })

  it('states the rule at an arrival instead of naming the next process', () => {
    // It cannot promise a name: the winner is the shortest of whoever is waiting
    // at the dispatch instant, after this unit's arrivals.
    expect(sentenceAt(6)).toEqual(
      'P3 arrives and the CPU is free: the shortest burst of the 2 processes waiting will run next.',
    )
    expect(nth('complete', 0)).toEqual(
      'P1 finished at t=2. waited 0 and finished with a turnaround of 2. The CPU is free: the next process to run is the shortest burst among those waiting.',
    )
  })

  it('shows the long job running alone once the short ones drained', () => {
    // The other half of the trade: P2 waits 6 units, then keeps the CPU for its
    // whole 20-unit burst because nothing else is left.
    expect(sentenceAt(21)).toEqual(
      'P2 runs its 20 units of burst — the only process waiting when the CPU came free.',
    )
    expect(nth('complete', 6)).toEqual(
      'P2 finished at t=27. waited 6 and finished with a turnaround of 26. The CPU is free and no process is waiting.',
    )
  })

  it('closes with the average this policy reached on these processes', () => {
    // 6 units of waiting over 7 processes, against FCFS's 101 on the same input.
    expect(sentenceAt(frames.length - 1)).toEqual(
      'All 7 processes finished in 27 units. Average waiting time: 0.9.',
    )
  })
})
