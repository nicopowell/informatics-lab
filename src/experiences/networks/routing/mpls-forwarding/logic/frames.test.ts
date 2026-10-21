import { describe, expect, it } from 'vitest'
import type { LfibEntry, Preset } from './model'
import { generateFrames } from './frames'
import { MPLS_PRESET } from './preset'

function withLfib(changes: Record<string, LfibEntry[]>): Preset {
  return { ...MPLS_PRESET, lfib: { ...MPLS_PRESET.lfib, ...changes } }
}

describe('generateFrames', () => {
  it('walks terminal to terminal, splitting each labelled router visit in two', () => {
    const frames = generateFrames(MPLS_PRESET)

    expect(
      frames.map((frame) => [frame.nodeId, frame.action, frame.inLabel, frame.outLabel, frame.nextNodeId]),
    ).toEqual([
      ['pc-a', 'send', null, null, 'ler-a'],
      ['ler-a', 'classify', null, 42, 'lsr-1'],
      ['lsr-1', 'arrive', 42, null, 'lsr-1'], // the incoming label gets its own frame
      ['lsr-1', 'swap', 42, 17, 'lsr-3'],
      ['lsr-3', 'arrive', 17, null, 'lsr-3'],
      ['lsr-3', 'swap', 17, 8, 'lsr-4'],
      ['lsr-4', 'arrive', 8, null, 'lsr-4'],
      ['lsr-4', 'swap', 8, 25, 'lsr-5'],
      ['lsr-5', 'arrive', 25, null, 'lsr-5'],
      ['lsr-5', 'swap', 25, 63, 'ler-b'],
      ['ler-b', 'arrive', 63, null, 'ler-b'],
      ['ler-b', 'pop', 63, null, 'pc-b'],
      ['pc-b', 'received', null, null, null],
    ])
  })

  it('narrates every frame with node, labels and numeric ports', () => {
    const narrations = generateFrames(MPLS_PRESET).map((frame) => frame.narration)

    expect(narrations).toEqual([
      'PC-A sends 10.0.7.0/24 to gateway LER-A',
      'LER-A classifies 10.0.7.0/24, pushes label 42 and sends to LSR-1',
      'LSR-1 receives label 42 on port 0',
      'LSR-1 swaps label 42 to 17, out 2 to LSR-3',
      'LSR-3 receives label 17 on port 0',
      'LSR-3 swaps label 17 to 8, out 1 to LSR-4',
      'LSR-4 receives label 8 on port 0',
      'LSR-4 swaps label 8 to 25, out 2 to LSR-5',
      'LSR-5 receives label 25 on port 0',
      'LSR-5 swaps label 25 to 63, out 1 to LER-B',
      'LER-B receives label 63 on port 0',
      'LER-B pops label 63 and delivers to PC-B',
      'PC-B receives 10.0.7.0/24',
    ])
  })

  it('visits the terminals around exactly the configured LSP', () => {
    // Arrival frames stand at the same node twice; drop them to see the path.
    const visited = generateFrames(MPLS_PRESET)
      .filter((frame) => frame.action !== 'arrive')
      .map((frame) => frame.nodeId)

    expect(visited).toEqual(['pc-a', ...MPLS_PRESET.lsp, 'pc-b'])
  })

  it('searches no table at the terminals', () => {
    const frames = generateFrames(MPLS_PRESET)

    expect(frames[0].lookup).toBeUndefined() // send: nothing to look up
    expect(frames.at(-1)!.lookup).toBeUndefined() // receive: nothing to look up
    expect(frames[1].lookup).toEqual({ port: 1, label: '10.0.7.0/24' }) // arrives at LER-A on port 1
  })

  it('drops the packet at the first node whose LFIB lacks the arriving label', () => {
    const preset = withLfib({
      'lsr-1': [{ inPort: 0, inLabel: 42, outPort: 2, outLabel: 18 }],
    })
    const frames = generateFrames(preset)

    expect(frames.map((frame) => frame.nodeId)).toEqual([
      'pc-a',
      'ler-a',
      'lsr-1',
      'lsr-1',
      'lsr-3',
      'lsr-3', // first the arrival shows the orphan label, then the failed lookup
    ])
    expect(frames.at(-1)).toMatchObject({
      nodeId: 'lsr-3',
      action: 'dropped',
      dropReason: 'no-entry',
      lookup: { port: 0, label: 18 },
      entry: null,
      outLabel: null,
      nextNodeId: null,
      narration: 'LSR-3 has no LFIB entry for port 0, label 18 — packet dropped',
    })
  })

  it('follows the output port even when it leaves the configured LSP', () => {
    const preset = withLfib({
      'lsr-1': [{ inPort: 0, inLabel: 42, outPort: 1, outLabel: 17 }],
    })
    const frames = generateFrames(preset)

    expect(frames.map((frame) => frame.nodeId)).toEqual([
      'pc-a',
      'ler-a',
      'lsr-1',
      'lsr-1',
      'lsr-2',
      'lsr-2',
    ])
    expect(frames.at(-1)).toMatchObject({ nodeId: 'lsr-2', action: 'dropped' })
  })

  it('terminates with a loop drop when the tables cycle forever', () => {
    const preset = withLfib({
      'lsr-3': [{ inPort: 0, inLabel: 17, outPort: 1, outLabel: 17 }],
      'lsr-4': [
        { inPort: 0, inLabel: 17, outPort: 2, outLabel: 17 },
        { inPort: 2, inLabel: 17, outPort: 2, outLabel: 17 },
      ],
      'lsr-5': [{ inPort: 0, inLabel: 17, outPort: 0, outLabel: 17 }],
    })
    const frames = generateFrames(preset)
    const last = frames.at(-1)!

    expect(last.action).toBe('dropped')
    expect(last.dropReason).toBe('loop')
    expect(last.nodeId).toBe('lsr-5')
    expect(last.narration).toContain('loop')
    // Frames outnumber visits once arrivals split them; two per node plus the drop.
    expect(frames.length).toBeLessThanOrEqual(preset.nodes.length * 2 + 1)
  })
})
