// The MPLS data plane as types: a node reads a label arriving on one port and
// writes a label out of another. The unions below make the protocol's two
// exceptions the compiler's business — a label that is not a number can only be
// the ingress destination, and a label leaving a port that is not a number can
// only be the egress 'pop'.

export type NodeKind = 'ingress' | 'lsr' | 'egress' | 'host'

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
  // Ports are plain 0-based numbers and belong to the link endpoint, not
  // to the node in isolation: the same node holds a different port per neighbour.
  aPort: number
  bPort: number
}

export type LfibEntry = {
  inPort: number // port the packet arrives on — terminals replaced any pseudo-port
  inLabel: number | string // label number, or the destination being classified
  outPort: number
  outLabel: number | 'pop' // 'pop' only at the egress: the label ends there
}

export type Preset = {
  nodes: TopologyNode[]
  links: TopologyLink[]
  lfib: Record<string, LfibEntry[]> // router id -> its table; hosts have none
  destination: string // the FEC: classified once, at the ingress
  lsp: string[] // LER ids, ingress first — the label-switched path, hosts excluded
  source: string // the terminal the packet originates at
}
