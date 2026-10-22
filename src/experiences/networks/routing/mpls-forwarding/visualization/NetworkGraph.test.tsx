import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { Preset } from '../logic/model'
import { generateFrames } from '../logic/frames'
import { MPLS_PRESET } from '../logic/preset'
import NetworkGraph from './NetworkGraph'

function render(preset: Preset, frameIndex: number): string {
  return renderToStaticMarkup(
    <NetworkGraph preset={preset} frame={generateFrames(preset)[frameIndex]} />,
  )
}

describe('NetworkGraph', () => {
  it('draws every node and physical link of the preset', () => {
    const html = render(MPLS_PRESET, 2) // a labelled frame carries the badge

    expect(html.match(/<line /g)).toHaveLength(MPLS_PRESET.links.length)
    expect(html.match(/<circle /g)).toHaveLength(5) // the five LSRs
    expect(html.match(/<rect /g)).toHaveLength(5) // two LERs + two terminals + badge
  })

  it('numbers every port beside its link endpoint', () => {
    const html = render(MPLS_PRESET, 0)

    // Both ends of every link name the port the LFIB columns also use.
    expect(html.match(/mpls-graph__port/g)).toHaveLength(MPLS_PRESET.links.length * 2)
  })

  it('tunnels the five LSP links under the single hop the packet is about to take', () => {
    const html = render(MPLS_PRESET, 1) // at LER-A, next hop LSR-1

    expect(html.match(/mpls-graph__link--lsp/g)).toHaveLength(5)
    expect(html.match(/mpls-graph__link--active/g)).toHaveLength(1)
    expect(html).toContain('mpls-graph__node--active')
  })

  it('shows the label the packet carries at the current node', () => {
    const html = render(MPLS_PRESET, 2) // LSR-1 swapped 42 to 17

    expect(html).toContain('>17<')
  })

  it('marks the sink terminal when the packet is delivered', () => {
    const html = render(MPLS_PRESET, 7) // PC-B receives

    expect(html).toContain('mpls-graph__node--delivered')
    expect(html).not.toContain('mpls-graph__packet') // no label survives the pop
  })

  it('flags the node where a broken chain drops the packet', () => {
    const preset: Preset = {
      ...MPLS_PRESET,
      lfib: {
        ...MPLS_PRESET.lfib,
        'lsr-1': [{ inPort: 0, inLabel: 42, outPort: 2, outLabel: 18 }],
      },
    }
    const frames = generateFrames(preset)
    const html = renderToStaticMarkup(
      <NetworkGraph preset={preset} frame={frames[frames.length - 1]} />,
    )

    expect(html).toContain('mpls-graph__node--dropped')
    expect(html).toContain('mpls-graph__packet--dropped')
    expect(html).toContain('>18<') // died carrying the label nothing matched
  })
})
