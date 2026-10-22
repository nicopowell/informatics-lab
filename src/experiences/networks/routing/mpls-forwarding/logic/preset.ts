import type { Preset } from './model'

const DESTINATION = '10.0.7.0/24'

// The LSP takes the long way round on purpose: the physical shortcut
// lsr-1 -> lsr-2 -> ler-b stays grey on screen, which is the lesson — an MPLS
// path is established up front, not discovered hop by hop like an IP route.
// PC-A and PC-B sit outside the tunnel: labels only exist between the LERs.
export const MPLS_PRESET: Preset = {
  destination: DESTINATION,
  source: 'pc-a',
  lsp: ['ler-a', 'lsr-1', 'lsr-3', 'lsr-4', 'lsr-5', 'ler-b'],
  nodes: [
    // Terminals sit far enough from their LER that each port number can hug
    // its own node (12px clearance each side) without the two numbers meeting
    // in the middle of the gap — see the user note in the feature doc.
    { id: 'pc-a', label: 'PC-A', kind: 'host', x: 23, y: 155 },
    { id: 'ler-a', label: 'LER-A', kind: 'ingress', x: 110, y: 155 },
    { id: 'lsr-1', label: 'LSR-1', kind: 'lsr', x: 265, y: 80 },
    { id: 'lsr-2', label: 'LSR-2', kind: 'lsr', x: 455, y: 80 },
    { id: 'lsr-3', label: 'LSR-3', kind: 'lsr', x: 265, y: 230 },
    { id: 'lsr-4', label: 'LSR-4', kind: 'lsr', x: 455, y: 230 },
    // y 200 instead of level with LER-B: at equal height its link to LER-B
    // arrived at almost the same angle as lsr-2's shortcut and the two port
    // numbers stacked on top of each other at the LER.
    { id: 'lsr-5', label: 'LSR-5', kind: 'lsr', x: 575, y: 200 },
    { id: 'ler-b', label: 'LER-B', kind: 'egress', x: 700, y: 155 },
    { id: 'pc-b', label: 'PC-B', kind: 'host', x: 787, y: 155 },
  ],
  links: [
    // terminals: the packet's first and last hop
    { a: 'pc-a', b: 'ler-a', aPort: 0, bPort: 1 },
    { a: 'ler-b', b: 'pc-b', aPort: 2, bPort: 0 },
    // on the LSP
    { a: 'ler-a', b: 'lsr-1', aPort: 0, bPort: 0 },
    { a: 'lsr-1', b: 'lsr-3', aPort: 2, bPort: 0 },
    { a: 'lsr-3', b: 'lsr-4', aPort: 1, bPort: 0 },
    { a: 'lsr-4', b: 'lsr-5', aPort: 2, bPort: 0 },
    { a: 'lsr-5', b: 'ler-b', aPort: 1, bPort: 0 },
    // outside the tunnel: the shortcut the packet never takes
    { a: 'lsr-1', b: 'lsr-2', aPort: 1, bPort: 0 },
    { a: 'lsr-4', b: 'lsr-2', aPort: 1, bPort: 1 },
    { a: 'lsr-2', b: 'ler-b', aPort: 2, bPort: 1 },
  ],
  lfib: {
    'ler-a': [{ inPort: 1, inLabel: DESTINATION, outPort: 0, outLabel: 42 }],
    'lsr-1': [{ inPort: 0, inLabel: 42, outPort: 2, outLabel: 17 }],
    'lsr-2': [], // on every physical link, on no LSP: an empty table says why
    'lsr-3': [{ inPort: 0, inLabel: 17, outPort: 1, outLabel: 8 }],
    'lsr-4': [{ inPort: 0, inLabel: 8, outPort: 2, outLabel: 25 }],
    'lsr-5': [{ inPort: 0, inLabel: 25, outPort: 1, outLabel: 63 }],
    'ler-b': [{ inPort: 0, inLabel: 63, outPort: 2, outLabel: 'pop' }],
    // PC-A and PC-B are absent on purpose: terminals never forward.
  },
}
