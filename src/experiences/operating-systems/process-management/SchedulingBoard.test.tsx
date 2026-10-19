import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { createConvoyProcesses, createStarvationProcesses } from './workloads'
import type { Process } from './workloads'
import { generateFcfsSteps } from './fcfs-scheduling/logic/fcfsScheduling'
import { generateSjfSteps } from './sjf-scheduling/logic/sjfScheduling'
import { generateRoundRobinSteps } from './round-robin-scheduling/logic/roundRobinScheduling'
import { createReadyFrame, toVisualFrames } from './schedule'
import type { SchedulingFrame } from './schedule'
import SchedulingBoard from './SchedulingBoard'

/*
 * The table is shared by every policy in the topic, and its columns are what a
 * reader compares across experiences, so the contract tested here is the shape
 * of the header row and what a process without a metric shows. FCFS renders it:
 * the values themselves belong to the policy generators' own suites.
 */
const HEADERS = [
  'Process',
  'Arrival',
  'Burst',
  'Status',
  'Waiting',
  'Turnaround',
  'Response',
]

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

function renderBoard(frame: SchedulingFrame, processes: Process[]): string {
  // The makespan is the same for every work-conserving policy (pinned in the
  // round-robin suite), so deriving it from the FCFS frames of the same
  // processes is valid whatever frame is on screen.
  const frames = framesFor(processes)

  return renderToStaticMarkup(
    <SchedulingBoard
      frame={frame}
      processes={processes}
      makespan={frames[frames.length - 1].time}
    />,
  )
}

describe('SchedulingBoard metrics table', () => {
  it('headers the seven metrics in reading order', () => {
    const processes = createConvoyProcesses()
    const html = renderBoard(framesFor(processes).at(-1)!, processes)
    const positions = HEADERS.map((header) => html.indexOf(`>${header}<`))

    // Every label is present exactly once in the header row, and the Response
    // column sits last, after Turnaround.
    expect(positions.every((position) => position >= 0)).toBe(true)
    expect(positions).toEqual([...positions].sort((a, b) => a - b))
    expect(html.match(/<th>/g)).toHaveLength(HEADERS.length)
  })

  it('gives every process row one cell per header', () => {
    const processes = createConvoyProcesses()
    const html = renderBoard(framesFor(processes).at(-1)!, processes)

    expect(html.match(/<td>/g)).toHaveLength(HEADERS.length * processes.length)
  })

  it('withholds the response metric until a process completes', () => {
    const processes = createConvoyProcesses()
    const html = renderBoard(createReadyFrame(), processes)

    // Before the simulation starts, no process has a waiting, turnaround or
    // response number, so each row carries three em dashes.
    expect(html.match(/—/g)).toHaveLength(3 * processes.length)
  })

  it('reports a response number for a completed process', () => {
    const processes = createConvoyProcesses()
    // The frame that closes P1's segment: it is the only process with metrics.
    const p1Complete = framesFor(processes).find(
      (frame) => frame.kind === 'complete' && frame.processId === 'P1',
    )!
    const html = renderBoard(p1Complete, processes)

    expect(p1Complete.completed[0]).toMatchObject({ id: 'P1', response: 0 })
    // P1's row shows finish metrics; the four queued processes show waiting but
    // still no turnaround or response.
    expect(html.match(/—/g)).toHaveLength(2 * (processes.length - 1))
  })
})

// P1's slice ends at t=1, the instant P2 arrives; with quantum 1 every unit of
// this workload is its own grant of the CPU.
const ROTATION: Process[] = [
  { id: 'P1', arrival: 0, burst: 3 },
  { id: 'P2', arrival: 1, burst: 1 },
]

// The board text with the markup stripped: the numbers a reader can see, in
// reading order. Used only to assert a whole row at once, which is what the
// comparison between policies is about.
function readout(frame: SchedulingFrame, processes: Process[]): string {
  return renderBoard(frame, processes)
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
}

// Same processes, three dispatch rules. The last short arrival is the clearest
// victim of each rule, so its row is pinned through the rendered table for all
// three policies: if a column ever reads from the wrong place, this is the kind
// of number that shows it.
describe('SchedulingBoard across the three policies', () => {
  it('reports what P7 waited under each dispatch rule', () => {
    const processes = createStarvationProcesses()
    const cases: [string, SchedulingFrame, string][] = [
      // FCFS hands the CPU to the 20-unit process before P7 arrives, so P7 waits
      // its full burst: 20 waited, 21 turnaround, 20 response.
      ['fcfs', framesFor(processes).at(-1)!, 'P7 6 1 done 20 21 20'],
      // SJF runs the short jobs first, so P7 is served the unit after arriving.
      ['sjf', sjfFramesFor(processes).at(-1)!, 'P7 6 1 done 0 1 0'],
      // Round Robin rotates: P7 is served behind whoever is already queued, so it
      // reaches the CPU three units after arriving and waits three in total.
      ['round-robin q1', rrFramesFor(processes, 1).at(-1)!, 'P7 6 1 done 3 4 3'],
    ]

    for (const [, frame, row] of cases) {
      expect(readout(frame, processes)).toContain(row)
    }
  })

  it('shows the same three metrics for the long process under every policy', () => {
    const processes = createStarvationProcesses()

    // P2 is the process the three policies disagree about the most: 1/21/1 under
    // FCFS, 6/26/6 under SJF (its response is the price of the short arrivals)
    // and 6/26/0 under Round Robin, which answers it at once and then lets it
    // finish last.
    expect(readout(framesFor(processes).at(-1)!, processes)).toContain('P2 1 20 done 1 21 1')
    expect(readout(sjfFramesFor(processes).at(-1)!, processes)).toContain('P2 1 20 done 6 26 6')
    expect(readout(rrFramesFor(processes, 1).at(-1)!, processes)).toContain('P2 1 20 done 6 26 0')
  })
})

describe('SchedulingBoard under a preemptive policy', () => {
  it('names the process that lost the CPU on the CPU track', () => {
    const frames = rrFramesFor(ROTATION, 1)
    const preempt = frames.find((frame) => frame.kind === 'preempt')!
    const html = renderBoard(preempt, ROTATION)

    expect(preempt.kind).toBe('preempt')
    expect(html).toContain('scheduling-board__chip--preempt')
    expect(html).toContain('slice over')
    // The preempted process is not drawn as running: nothing holds the CPU in
    // this beat, and 'finished' belongs to the complete frame only.
    expect(html).not.toContain('scheduling-board__chip--focus')
    expect(html).not.toContain('finished')
  })

  it('cuts the Gantt band where the same process gets the CPU back', () => {
    const done = rrFramesFor(ROTATION, 1).at(-1)!
    const html = renderBoard(done, ROTATION)

    // Cells P1, P2, P1, P1: the third unit starts a new grant after a different
    // process, so the id change already separates it; only the fourth unit is a
    // cut inside a contiguous band of the same color.
    expect(done.cells).toEqual(['P1', 'P2', 'P1', 'P1'])
    expect(html.match(/scheduling-board__cell--slice-cut/g)).toHaveLength(1)
  })

  it('shows the cost of a small quantum as cuts inside the long band', () => {
    const processes = createStarvationProcesses()

    const rrCuts = (
      renderBoard(rrFramesFor(processes, 1).at(-1)!, processes).match(
        /scheduling-board__cell--slice-cut/g,
      ) ?? []
    ).length
    const fcfsCuts = (
      renderBoard(framesFor(processes).at(-1)!, processes).match(
        /scheduling-board__cell--slice-cut/g,
      ) ?? []
    ).length

    // One unit per grant: the long process comes back to the CPU on its own
    // again and again, so its band is cut 16 times. FCFS, which never takes the
    // CPU back, never cuts a band at all.
    expect(rrCuts).toBe(16)
    expect(fcfsCuts).toBe(0)
  })

  it('does not charge the units a preempted process ran as waiting time', () => {
    // The case the reader sees first: a single process, quantum 2. At t=2 it
    // loses the CPU with two units still to run, and those two units were spent
    // ON the CPU, not in the ready queue.
    const processes: Process[] = [{ id: 'P1', arrival: 0, burst: 4 }]
    const frames = rrFramesFor(processes, 2)
    const preempt = frames.find((frame) => frame.kind === 'preempt')!

    expect(preempt.time).toBe(2)
    expect(preempt.cells).toEqual(['P1', 'P1'])
    expect(preempt.queue).toEqual(['P1'])

    const html = renderBoard(preempt, processes)

    // Waiting is 0, so the row holds two zero cells: arrival and waiting. Before
    // the fix the same row charged the two run units as waiting.
    expect(html.match(/<td>0<\/td>/g)).toHaveLength(2)
    expect(html).not.toContain('<td>2</td>')
    // The ready queue chip is the same number, shown as +<waiting>.
    expect(html).toContain('+0')
    expect(html).not.toContain('+2')
    expect(html).toContain('scheduling-board__status--waiting')
  })

  it('says which metric a preempted process keeps and which one freezes', () => {
    const frames = rrFramesFor(createStarvationProcesses(), 4)
    const firstPreempt = frames.find((frame) => frame.kind === 'preempt')!
    const html = renderBoard(firstPreempt, createStarvationProcesses())

    // With quantum 4 the two-unit P1 finishes inside its slice, so the first
    // process ever taken off the CPU is the long one, after four units.
    expect(firstPreempt.processId).toBe('P2')
    expect(firstPreempt.queue).toEqual(['P3', 'P4', 'P5', 'P6', 'P2'])
    // P2 is drawn as waiting again, not as done: its metrics are not frozen.
    expect(html).toContain('scheduling-board__status--waiting')
  })
})
