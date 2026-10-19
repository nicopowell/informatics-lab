import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { createConvoyProcesses } from './workloads'
import type { Process } from './workloads'
import { generateFcfsSteps } from './fcfs-scheduling/logic/fcfsScheduling'
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

function renderBoard(frame: SchedulingFrame, processes: Process[]): string {
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
