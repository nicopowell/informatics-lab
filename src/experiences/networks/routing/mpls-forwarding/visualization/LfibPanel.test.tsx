import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { LfibEntry, Preset } from '../logic/model'
import { generateFrames } from '../logic/frames'
import { MPLS_PRESET } from '../logic/preset'
import LfibPanel from './LfibPanel'

const HEADERS = ['Input port', 'Input label', 'Output port', 'Output label']

function renderNode(
  preset: Preset,
  nodeId: string,
  frameIndex = 0,
  onOutLabelChange?: (entry: LfibEntry, value: number) => void,
): string {
  const node = preset.nodes.find((candidate) => candidate.id === nodeId)!
  return renderToStaticMarkup(
    <LfibPanel
      node={node}
      entries={preset.lfib[nodeId] ?? []}
      frame={generateFrames(preset)[frameIndex]}
      onOutLabelChange={onOutLabelChange}
    />,
  )
}

describe('LfibPanel', () => {
  it('heads the four LFIB columns in reading order', () => {
    const html = renderNode(MPLS_PRESET, 'lsr-1')
    const positions = HEADERS.map((header) => html.indexOf(`>${header}<`))

    expect(positions.every((position) => position >= 0)).toBe(true)
    expect(positions).toEqual([...positions].sort((a, b) => a - b))
    expect(html.match(/<th>/g)).toHaveLength(HEADERS.length)
  })

  it('lights the row the current frame used', () => {
    const html = renderNode(MPLS_PRESET, 'lsr-1', 3) // frame 3 is the swap; 2 was the arrival

    expect(html).toContain('mpls-lfib__row--active')
    expect(html).toContain('42') // its input label is on screen
    expect(html).toContain('17') // and so is the label it writes
  })

  it('renders a failed lookup as a ghost row of dashes', () => {
    const preset: Preset = {
      ...MPLS_PRESET,
      lfib: {
        ...MPLS_PRESET.lfib,
        'lsr-1': [{ inPort: 0, inLabel: 42, outPort: 2, outLabel: 18 }],
      },
    }
    const frames = generateFrames(preset)
    const html = renderNode(preset, 'lsr-3', frames.length - 1)

    expect(html).toContain('mpls-lfib__row--missing')
    expect(html).toContain('>18<') // the orphan label, unique to the ghost row
  })

  it('shows no ghost row when the drop was a loop, not a missed lookup', () => {
    // The loop guard drops before any lookup runs, so claiming that a port and
    // label found no row would report a search that never happened.
    const node = MPLS_PRESET.nodes.find((candidate) => candidate.id === 'lsr-4')!
    const html = renderToStaticMarkup(
      <LfibPanel
        node={node}
        entries={MPLS_PRESET.lfib['lsr-4'] ?? []}
        frame={{
          nodeId: 'lsr-4',
          action: 'dropped',
          dropReason: 'loop',
          lookup: { port: 0, label: 25 },
          entry: null,
          inLabel: 25,
          outLabel: null,
          nextNodeId: null,
          narration: 'Forwarding loop at LSR-4 — packet dropped',
        }}
      />,
    )

    expect(html).not.toContain('mpls-lfib__row--missing')
  })

  it('says why a table with no rows cannot forward', () => {
    const html = renderNode(MPLS_PRESET, 'lsr-2')

    expect(html).toContain('No entries — not on any LSP')
  })

  it('says terminals forward nothing instead of showing an empty grid', () => {
    const html = renderNode(MPLS_PRESET, 'pc-a')

    expect(html).toContain('Terminal device — no forwarding table')
    expect(html).not.toContain('<table')
    expect(html).not.toContain('LFIB — PC-A')
  })

  it('edits only numeric output labels and leaves the egress pop alone', () => {
    const editable = renderNode(MPLS_PRESET, 'lsr-1', 0, () => {})
    expect(editable).toContain('type="number"')
    expect(editable).toContain('value="17"')

    const egress = renderNode(MPLS_PRESET, 'ler-b', 0, () => {})
    expect(egress).not.toContain('type="number"')
    expect(egress).toContain('pop')
  })
})
