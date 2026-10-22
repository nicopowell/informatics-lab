import type { Preset } from './model'

const DESTINATION = '10.0.7.0/24'

// The LSP takes the long way round on purpose: the physical shortcut
// lsr-1 -> lsr-2 -> ler-b stays grey on screen, which is the lesson — an MPLS
// path is established up front, not discovered hop by hop like an IP route.
export const MPLS_PRESET: Preset = {
  destination: DESTINATION,
  lsp: ['ler-a', 'lsr-1', 'lsr-3', 'lsr-4', 'lsr-5', 'ler-b'],
  nodes: [
    { id: 'ler-a', label: 'LER-A', kind: 'ingress', x: 60, y: 155 },
    { id: 'lsr-1', label: 'LSR-1', kind: 'lsr', x: 220, y: 80 },
    { id: 'lsr-2', label: 'LSR-2', kind: 'lsr', x: 420, y: 80 },
    { id: 'lsr-3', label: 'LSR-3', kind: 'lsr', x: 220, y: 230 },
    { id: 'lsr-4', label: 'LSR-4', kind: 'lsr', x: 420, y: 230 },
    { id: 'lsr-5', label: 'LSR-5', kind: 'lsr', x: 560, y: 155 },
    { id: 'ler-b', label: 'LER-B', kind: 'egress', x: 700, y: 155 },
  ],
  links: [
    // on the LSP
    { a: 'ler-a', b: 'lsr-1', aPort: 'if0', bPort: 'if0' },
    { a: 'lsr-1', b: 'lsr-3', aPort: 'if2', bPort: 'if0' },
    { a: 'lsr-3', b: 'lsr-4', aPort: 'if1', bPort: 'if0' },
    { a: 'lsr-4', b: 'lsr-5', aPort: 'if2', bPort: 'if0' },
    { a: 'lsr-5', b: 'ler-b', aPort: 'if1', bPort: 'if0' },
    // outside the tunnel: the shortcut the packet never takes
    { a: 'lsr-1', b: 'lsr-2', aPort: 'if1', bPort: 'if0' },
    { a: 'lsr-4', b: 'lsr-2', aPort: 'if1', bPort: 'if1' },
    { a: 'lsr-2', b: 'ler-b', aPort: 'if2', bPort: 'if1' },
  ],
  lfib: {
    'ler-a': [{ inPort: 'local', inLabel: DESTINATION, outPort: 'if0', outLabel: 42 }],
    'lsr-1': [{ inPort: 'if0', inLabel: 42, outPort: 'if2', outLabel: 17 }],
    'lsr-2': [], // on every physical link, on no LSP: an empty table says why
    'lsr-3': [{ inPort: 'if0', inLabel: 17, outPort: 'if1', outLabel: 8 }],
    'lsr-4': [{ inPort: 'if0', inLabel: 8, outPort: 'if2', outLabel: 25 }],
    'lsr-5': [{ inPort: 'if0', inLabel: 25, outPort: 'if1', outLabel: 63 }],
    'ler-b': [{ inPort: 'if0', inLabel: 63, outPort: 'local', outLabel: 'pop' }],
  },
}
