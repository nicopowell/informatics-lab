import { describe, expect, it } from 'vitest'
import type { LfibEntry, Preset } from './model'
import { generateFrames } from './frames'
import { MPLS_PRESET } from './preset'

function withLfib(changes: Record<string, LfibEntry[]>): Preset {
  return { ...MPLS_PRESET, lfib: { ...MPLS_PRESET.lfib, ...changes } }
}

describe('generateFrames', () => {
  it('walks the configured LSP from ingress to egress', () => {
    const frames = generateFrames(MPLS_PRESET)

    expect(
      frames.map((frame) => [frame.nodeId, frame.action, frame.inLabel, frame.outLabel, frame.nextNodeId]),
    ).toEqual([
      ['ler-a', 'classify', null, 42, 'lsr-1'],
      ['lsr-1', 'swap', 42, 17, 'lsr-3'],
      ['lsr-3', 'swap', 17, 8, 'lsr-4'],
      ['lsr-4', 'swap', 8, 25, 'lsr-5'],
      ['lsr-5', 'swap', 25, 63, 'ler-b'],
      ['ler-b', 'pop', 63, null, null],
    ])
  })

  it('narrates every visit with node, labels and ports', () => {
    const narrations = generateFrames(MPLS_PRESET).map((frame) => frame.narration)

    expect(narrations).toEqual([
      'LER-A classifies 10.0.7.0/24, pushes label 42 and sends to LSR-1',
      'LSR-1 swaps label 42 to 17, out if2 to LSR-3',
      'LSR-3 swaps label 17 to 8, out if1 to LSR-4',
      'LSR-4 swaps label 8 to 25, out if2 to LSR-5',
      'LSR-5 swaps label 25 to 63, out if1 to LER-B',
      'LER-B pops label 63 and delivers 10.0.7.0/24',
    ])
  })

  it('visits exactly the nodes of the configured LSP', () => {
    const visited = generateFrames(MPLS_PRESET).map((frame) => frame.nodeId)

    expect(visited).toEqual(MPLS_PRESET.lsp)
  })

  it('drops the packet at the first node whose LFIB lacks the arriving label', () => {
    const preset = withLfib({
      'lsr-1': [{ inPort: 'if0', inLabel: 42, outPort: 'if2', outLabel: 18 }],
    })
    const frames = generateFrames(preset)

    expect(frames.map((frame) => frame.nodeId)).toEqual(['ler-a', 'lsr-1', 'lsr-3'])
    expect(frames.at(-1)).toMatchObject({
      nodeId: 'lsr-3',
      action: 'dropped',
      dropReason: 'no-entry',
      lookup: { port: 'if0', label: 18 },
      entry: null,
      outLabel: null,
      nextNodeId: null,
      narration: 'LSR-3 has no LFIB entry for port if0, label 18 — packet dropped',
    })
  })

  it('follows the output port even when it leaves the configured LSP', () => {
    const preset = withLfib({
      'lsr-1': [{ inPort: 'if0', inLabel: 42, outPort: 'if1', outLabel: 17 }],
    })
    const frames = generateFrames(preset)

    expect(frames.map((frame) => frame.nodeId)).toEqual(['ler-a', 'lsr-1', 'lsr-2'])
    expect(frames.at(-1)).toMatchObject({ nodeId: 'lsr-2', action: 'dropped' })
  })

  it('terminates with a loop drop when the tables cycle forever', () => {
    const preset = withLfib({
      'lsr-3': [{ inPort: 'if0', inLabel: 17, outPort: 'if1', outLabel: 17 }],
      'lsr-4': [
        { inPort: 'if0', inLabel: 17, outPort: 'if2', outLabel: 17 },
        { inPort: 'if2', inLabel: 17, outPort: 'if2', outLabel: 17 },
      ],
      'lsr-5': [{ inPort: 'if0', inLabel: 17, outPort: 'if0', outLabel: 17 }],
    })
    const frames = generateFrames(preset)
    const last = frames.at(-1)!

    expect(last.action).toBe('dropped')
    expect(last.dropReason).toBe('loop')
    expect(last.nodeId).toBe('lsr-4')
    expect(last.narration).toContain('loop')
    expect(frames.length).toBeLessThanOrEqual(preset.nodes.length + 1)
  })
})
