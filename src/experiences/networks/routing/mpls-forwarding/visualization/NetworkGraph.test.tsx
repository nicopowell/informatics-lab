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
    const html = render(MPLS_PRESET, 4) // a swap frame carries the badge

    expect(html.match(/<line /g)).toHaveLength(MPLS_PRESET.links.length * 2) // base + flow overlay
    expect(html.match(/<circle /g)).toHaveLength(7) // five LSRs + packet dot + pulse
    expect(html.match(/<rect /g)).toHaveLength(5) // two LERs + two terminals + badge
  })

  it('numbers every port beside its link endpoint', () => {
    const html = render(MPLS_PRESET, 0)

    // Both ends of every link name the port the LFIB columns also use.
    expect(html.match(/mpls-graph__port/g)).toHaveLength(MPLS_PRESET.links.length * 2)
  })

  it('tunnels the five LSP links under the single hop the packet is about to take', () => {
    const html = render(MPLS_PRESET, 2) // after the push at LER-A, next hop LSR-1

    expect(html.match(/mpls-graph__link--lsp/g)).toHaveLength(5)
    expect(html.match(/mpls-graph__link--active/g)).toHaveLength(1)
    expect(html).toContain('mpls-graph__node--active')
  })

  it('keeps the chosen link lit while the packet crosses it', () => {
    // Frame 3: arrival at LSR-1 — the glide from LER-A renders on this frame,
    // so the link it crosses must be the active one.
    expect(render(MPLS_PRESET, 3)).toContain('mpls-graph__link--active')
    // Frame 1: the bare ingress arrival crosses the access link from PC-A.
    expect(render(MPLS_PRESET, 1)).toContain('mpls-graph__link--active')
  })

  it('exposes every node as a selectable control only when given a handler', () => {
    const plain = render(MPLS_PRESET, 0) // no handler: display only
    expect(plain).not.toContain('role="button"')

    const html = renderToStaticMarkup(
      <NetworkGraph
        preset={MPLS_PRESET}
        frame={generateFrames(MPLS_PRESET)[0]}
        onSelectNode={() => undefined}
      />,
    )
    expect(html.match(/role="button"/g)).toHaveLength(MPLS_PRESET.nodes.length)
    expect(html).toContain('aria-label="Select LSR-3"')
  })

  it('rings the selected node with the neutral marquee', () => {
    const html = renderToStaticMarkup(
      <NetworkGraph
        preset={MPLS_PRESET}
        frame={generateFrames(MPLS_PRESET)[0]}
        selectedNodeId="lsr-2"
        onSelectNode={() => undefined}
      />,
    )

    expect(html).toContain('mpls-graph__selection')
    expect(render(MPLS_PRESET, 0)).not.toContain('mpls-graph__selection')
  })

  it('flows the dash toward the destination, and against it when reversed', () => {
    // The preset draws ler-a → lsr-1 in travel direction: forward flow.
    const forward = render(MPLS_PRESET, 3)
    expect(forward).toContain('mpls-graph__link-flow--on')
    expect(forward).not.toContain('mpls-graph__link--active-reverse')

    // A dropped packet has no lit hop: the overlay stays mounted but dark.
    const dropped: Preset = {
      ...MPLS_PRESET,
      lfib: {
        ...MPLS_PRESET.lfib,
        'lsr-1': [{ inPort: 0, inLabel: 42, outPort: 2, outLabel: 18 }],
      },
    }
    const dropFrames = generateFrames(dropped)
    const dark = renderToStaticMarkup(
      <NetworkGraph preset={dropped} frame={dropFrames[dropFrames.length - 1]} />,
    )
    expect(dark).toContain('mpls-graph__link-flow')
    expect(dark).not.toContain('mpls-graph__link-flow--on')

    // The same hop on a link stored backwards must flow in reverse.
    const reversedPreset: Preset = {
      ...MPLS_PRESET,
      links: MPLS_PRESET.links.map((link) =>
        link.a === 'ler-a' && link.b === 'lsr-1'
          ? { ...link, a: 'lsr-1', b: 'ler-a' }
          : link,
      ),
    }
    const reversed = renderToStaticMarkup(
      <NetworkGraph preset={reversedPreset} frame={generateFrames(reversedPreset)[3]} />,
    )
    expect(reversed).toContain('mpls-graph__link--active-reverse')
  })

  it('shows the label the packet carries at the current node', () => {
    const html = render(MPLS_PRESET, 4) // LSR-1 swapped 42 to 17 (frame 3 showed the arrival)

    expect(html).toContain('>17<')
  })

  it('marks the sink terminal when the packet is delivered', () => {
    const frames = generateFrames(MPLS_PRESET)
    const html = renderToStaticMarkup(
      <NetworkGraph preset={MPLS_PRESET} frame={frames[frames.length - 1]} />,
    )

    expect(html).toContain('mpls-graph__node--delivered')
    expect(html).toContain('mpls-graph__packet-dot') // bare packet: nothing survived the pop
    expect(html).toContain('scale(0)') // the chip stays collapsed
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

  it('glides the packet between nodes instead of teleporting it', () => {
    const html = render(MPLS_PRESET, 4) // parked at LSR-1 after the swap

    // The transform must live in the style attribute (transitionable); the
    // 400ms transition itself is declared in mplsForwarding.css.
    expect(html).toContain('style="transform:translate(')
  })

  it('rings the node on the frames where the table acts', () => {
    expect(render(MPLS_PRESET, 2)).toContain('mpls-graph__pulse') // push at LER-A
    expect(render(MPLS_PRESET, 4)).toContain('mpls-graph__pulse') // swap at LSR-1
    // Arrival frames park the packet; the table is still silent there.
    expect(render(MPLS_PRESET, 3)).not.toContain('mpls-graph__pulse')
  })

  it('grows the label chip out of the bare packet on the push', () => {
    const html = render(MPLS_PRESET, 2) // classify frame at LER-A

    expect(html).toContain('scale(1)') // chip expanded
    expect(html).toContain('opacity:0') // dot faded away
    expect(html).toContain('>42<')
  })

  it('shows a bare packet at the source terminal', () => {
    const html = render(MPLS_PRESET, 0) // PC-A puts an unlabelled packet on the wire

    expect(html).toContain('mpls-graph__packet-dot')
    expect(html).toContain('scale(0)') // chip collapsed
  })

  it('converts the label back into a bare packet on the pop', () => {
    const frames = generateFrames(MPLS_PRESET)
    const popIndex = frames.findIndex((frame) => frame.action === 'pop')
    const html = renderToStaticMarkup(
      <NetworkGraph preset={MPLS_PRESET} frame={frames[popIndex]} />,
    )

    expect(html).toContain('scale(0)') // chip collapsing back to the dot
    expect(html).toContain('mpls-graph__packet-dot')
    expect(html).not.toContain('>63<') // the label is gone here
  })
})
