import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { createConvoyProcesses, createStarvationProcesses } from './workloads'
import type { Process } from './workloads'
import { generateFcfsSteps } from './fcfs-scheduling/logic/fcfsScheduling'
import { generateSjfSteps } from './sjf-scheduling/logic/sjfScheduling'
import { generateRoundRobinSteps } from './round-robin-scheduling/logic/roundRobinScheduling'
import { describeFrame } from './round-robin-scheduling/logic/frameNarration'
import { createReadyFrame, toVisualFrames } from './schedule'
import type { SchedulingFrame } from './schedule'
import SchedulingBoard from './SchedulingBoard'

/*
 * The board and the round-robin narration are shared display code with no test
 * that covers what the reader actually sees: the Waiting number, the CPU chip,
 * the ready queue chips, the table rows and the legend. Unit tests cover the
 * data reaching them and the hand-written board tests cover four specific
 * claims; nothing covers the rest, which is exactly how the preempted-process
 * waiting bug (a row reading 2 for a process that had run 2) stayed alive.
 *
 * This test therefore records, for every frame of every policy on three
 * workloads, the text a screen reader would read off the board. It is a
 * snapshot on purpose, and deliberately NOT a hash of the markup: renaming a
 * class or restyling must not break it, while any number or sentence a human
 * can read has to. When a change is intentional, the snapshot is updated and
 * the diff in `__snapshots__` is part of the review.
 */

// The rendered board stripped to the text it shows, whitespace collapsed.
function boardText(
  frame: SchedulingFrame,
  processes: Process[],
  makespan: number,
): string {
  return renderToStaticMarkup(
    <SchedulingBoard frame={frame} processes={processes} makespan={makespan} />,
  )
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// The two workloads the experiences are studied with. A random shape is not here
// on purpose: it exercises no display branch the presets do not, and its schedule
// is already pinned by the three policy suites.
const WORKLOADS: [string, () => Process[]][] = [
  ['convoy', createConvoyProcesses],
  ['starvation', createStarvationProcesses],
]

// Quantum 1 is the maximum-cut case, 2 the page default, 6 the end of the slider
// where the policy degenerates into FCFS.
const QUANTA = [1, 2, 6]

describe('scheduling board readout', () => {
  for (const [workloadName, make] of WORKLOADS) {
    const processes = make()

    const policies: [string, ReturnType<typeof generateFcfsSteps>][] = [
      ['fcfs', generateFcfsSteps(processes)],
      ['sjf', generateSjfSteps(processes)],
      ...QUANTA.map(
        (quantum): [string, ReturnType<typeof generateFcfsSteps>] => [
          `round-robin-q${quantum}`,
          generateRoundRobinSteps(processes, quantum),
        ],
      ),
    ]

    for (const [policyName, steps] of policies) {
      it(`reads the same on ${workloadName} under ${policyName}`, () => {
        const frames = [createReadyFrame(), ...toVisualFrames(steps)]
        const makespan = frames[frames.length - 1].time
        const quantum = policyName.startsWith('round-robin')
          ? Number(policyName.slice(-1))
          : 0
        const preemptFrames = frames.filter((frame) => frame.kind === 'preempt').length

        const trace = frames.map((frame, index) => {
          const head = `${index} ${frame.kind} t=${frame.time} ${frame.processId ?? '-'}`
          const shown = `[${boardText(frame, processes, makespan)}]`
          // The narration is page text the board does not render, so it belongs in
          // the same lock. FCFS and SJF keep their sentences page-private and are
          // covered by the board readout only.
          const spoken =
            quantum > 0
              ? ` {${describeFrame(frame, processes, quantum, preemptFrames)}}`
              : ''
          return `${head} ${shown}${spoken}`
        })

        // A guard the snapshot alone cannot give: the frame budget is the contract
        // between the step generator and the frame builder. One frame per unit of
        // the simulation, one per arrival, one per completion, one per preemption,
        // plus the ready and done frames around them.
        const arrivals = steps.reduce((sum, step) => sum + step.arrivedIds.length, 0)
        const completions = steps.filter((step) => step.completedId !== null).length
        const preemptions = steps.filter((step) => step.preemptedId !== null).length

        expect(frames).toHaveLength(2 + steps.length + arrivals + completions + preemptions)
        expect(trace.join('\n')).toMatchSnapshot()
      })
    }
  }
})
