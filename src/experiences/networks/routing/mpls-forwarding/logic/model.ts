// The MPLS data plane as types: a node reads a label arriving on one port and
// writes a label out of another. The unions below make the protocol's two
// exceptions the compiler's business — a label that is not a number can only be
// the ingress destination, and a label leaving a port that is not a number can
// only be the egress 'pop'.

export type NodeKind = 'ingress' | 'lsr' | 'egress'

export type TopologyNode = {
  id: string
  label: string
  kind: NodeKind
  x: number // fixed SVG coordinates: the preset draws, the component connects
  y: number
}

export type TopologyLink = {
  a: string
  b: string
  aPort: string // ports belong to the link endpoint, not to the node in isolation:
  bPort: string // the same node holds a different port per neighbour
}

export type LfibEntry = {
  inPort: string // port the packet arrives on; 'local' at the ingress
  inLabel: number | string // label number, or the destination being classified
  outPort: string // port the packet leaves on; 'local' at the egress
  outLabel: number | 'pop' // 'pop' only at the egress: the label ends there
}

export type Preset = {
  nodes: TopologyNode[]
  links: TopologyLink[]
  lfib: Record<string, LfibEntry[]> // node id -> its table; [] when off every LSP
  destination: string // the FEC: classified once, at the ingress
  lsp: string[] // node ids, ingress first — the path is input, never computed
}
