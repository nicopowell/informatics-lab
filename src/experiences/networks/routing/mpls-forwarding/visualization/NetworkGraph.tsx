import type { MplsFrame } from '../logic/frames'
import type { Preset, TopologyNode } from '../logic/model'

type NetworkGraphProps = {
  preset: Preset
  frame: MplsFrame
}

const LSR_RADIUS = 24
const LER_RADIUS = 30

function linkKey(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`
}

// The packet badge shows the label the node has just written; a dropped packet
// died carrying the label it arrived with, and a popped one carries nothing.
function packetLabel(frame: MplsFrame): number | null {
  if (frame.action === 'pop') return null
  return frame.outLabel ?? frame.inLabel
}

/*
 * The topology in SVG: physical links under the highlighted LSP tunnel, the
 * node the packet is visiting lit up, and the packet's label badge on top of
 * it. Links never disappear — the grey shortcuts are what make "the path is
 * configured, not discovered" visible without a sentence.
 */
function NetworkGraph({ preset, frame }: NetworkGraphProps) {
  const nodeById = new Map(preset.nodes.map((node) => [node.id, node]))
  const lspLinks = new Set<string>()
  for (let index = 0; index + 1 < preset.lsp.length; index++) {
    lspLinks.add(linkKey(preset.lsp[index], preset.lsp[index + 1]))
  }

  const outgoing =
    frame.nextNodeId !== null ? linkKey(frame.nodeId, frame.nextNodeId) : null
  const label = packetLabel(frame)
  const activeNode = nodeById.get(frame.nodeId)

  return (
    <svg
      className="mpls-graph"
      viewBox="0 0 760 300"
      role="img"
      aria-label="MPLS topology with the labelled packet"
    >
      <g>
        {preset.links.map((link) => {
          const from = nodeById.get(link.a)
          const to = nodeById.get(link.b)
          if (!from || !to) return null
          const key = linkKey(link.a, link.b)
          const classes = ['mpls-graph__link']
          if (lspLinks.has(key)) classes.push('mpls-graph__link--lsp')
          if (key === outgoing) classes.push('mpls-graph__link--active')
          return (
            <line
              key={key}
              className={classes.join(' ')}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
            />
          )
        })}
      </g>

      <g>
        {preset.nodes.map((node) => {
          const classes = ['mpls-graph__node', `mpls-graph__node--${node.kind}`]
          if (node.id === frame.nodeId) {
            if (frame.action === 'dropped') classes.push('mpls-graph__node--dropped')
            else if (frame.action === 'pop') classes.push('mpls-graph__node--delivered')
            else classes.push('mpls-graph__node--active')
          }
          const className = classes.join(' ')
          return (
            <g key={node.id}>
              {node.kind === 'lsr' ? (
                <circle className={className} cx={node.x} cy={node.y} r={LSR_RADIUS} />
              ) : (
                <rect
                  className={className}
                  x={node.x - LER_RADIUS}
                  y={node.y - LER_RADIUS + 6}
                  width={LER_RADIUS * 2}
                  height={LER_RADIUS * 2 - 12}
                  rx={10}
                />
              )}
              <text
                className="mpls-graph__label"
                x={node.x}
                y={node.y + nodeShapeRadius(node) + 18}
              >
                {node.label}
              </text>
            </g>
          )
        })}
      </g>

      {label !== null && activeNode && (
        <g
          className={
            frame.action === 'dropped'
              ? 'mpls-graph__packet mpls-graph__packet--dropped'
              : 'mpls-graph__packet'
          }
          transform={`translate(${activeNode.x}, ${activeNode.y - nodeShapeRadius(activeNode) - 20})`}
        >
          <rect x={-24} y={-14} width={48} height={28} rx={7} />
          <text x={0} y={6} textAnchor="middle">
            {label}
          </text>
        </g>
      )}
    </svg>
  )
}

function nodeShapeRadius(node: TopologyNode): number {
  return node.kind === 'lsr' ? LSR_RADIUS : LER_RADIUS
}

export default NetworkGraph
