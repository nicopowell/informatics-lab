import type { MplsFrame } from '../logic/frames'
import type { Preset, TopologyNode } from '../logic/model'

type NetworkGraphProps = {
  preset: Preset
  frame: MplsFrame
}

const LSR_RADIUS = 24
const LER_RADIUS = 30
const HOST_HALF_WIDTH = 17
const HOST_HALF_HEIGHT = 13

function linkKey(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`
}

// The packet badge shows the label on board: the push's new label at the
// ingress and the incoming one on an arrival. A pop converts the chip back
// to the bare-packet dot, which is also how send and delivery travel.
function packetLabel(frame: MplsFrame): number | null {
  if (frame.action === 'pop') return null
  return frame.outLabel ?? frame.inLabel
}

function nodeShapeRadius(node: TopologyNode): number {
  if (node.kind === 'lsr') return LSR_RADIUS
  if (node.kind === 'host') return HOST_HALF_WIDTH
  return LER_RADIUS
}

/*
 * The topology in SVG: physical links under the highlighted LSP tunnel, the
 * node the packet is visiting lit up, the packet's label badge on top of it,
 * and a small number beside every link endpoint naming that node's port — the
 * same numbers the LFIB columns use. Links never disappear: the grey shortcuts
 * are what make "the path is configured, not discovered" visible.
 */
function NetworkGraph({ preset, frame }: NetworkGraphProps) {
  const nodeById = new Map(preset.nodes.map((node) => [node.id, node]))
  const lspLinks = new Set<string>()
  for (let index = 0; index + 1 < preset.lsp.length; index++) {
    lspLinks.add(linkKey(preset.lsp[index], preset.lsp[index + 1]))
  }

  // The lit hop: the table's choice on operations, the link the packet is
  // riding on arrivals (the glide renders there) — self-references never
  // count as a hop. Light travels the preset's draw direction a→b; hops that
  // run b→a get the reversed-flow class.
  const activeHop =
    frame.nextNodeId !== null && frame.nextNodeId !== frame.nodeId
      ? ([frame.nodeId, frame.nextNodeId] as const)
      : frame.fromNodeId != null && frame.fromNodeId !== frame.nodeId
        ? ([frame.fromNodeId, frame.nodeId] as const)
        : null
  const label = packetLabel(frame)
  const activeNode = nodeById.get(frame.nodeId)

  return (
    <svg
      className="mpls-graph"
      viewBox="0 0 830 300"
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
          const forwards =
            activeHop !== null && link.a === activeHop[0] && link.b === activeHop[1]
          const backwards =
            activeHop !== null && link.a === activeHop[1] && link.b === activeHop[0]
          if (forwards || backwards) classes.push('mpls-graph__link--active')
          if (backwards) classes.push('mpls-graph__link--active-reverse')

          // Port numbers sit just past each node's edge, one end nudged to
          // each side of the line: the two numbers of a short link can never
          // land on top of each other.
          const dx = to.x - from.x
          const dy = to.y - from.y
          const length = Math.hypot(dx, dy) || 1
          const ux = dx / length
          const uy = dy / length
          const sideX = -uy * 9
          const sideY = ux * 9
          const fromGap = nodeShapeRadius(from) + 12
          const toGap = nodeShapeRadius(to) + 12

          return (
            <g key={key}>
              <line
                className={classes.join(' ')}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
              />
              <text
                className="mpls-graph__port"
                x={from.x + ux * fromGap + sideX}
                y={from.y + uy * fromGap + sideY}
                dominantBaseline="central"
              >
                {link.aPort}
              </text>
              <text
                className="mpls-graph__port"
                x={to.x - ux * toGap - sideX}
                y={to.y - uy * toGap - sideY}
                dominantBaseline="central"
              >
                {link.bPort}
              </text>
            </g>
          )
        })}
      </g>

      <g>
        {preset.nodes.map((node) => {
          const classes = ['mpls-graph__node', `mpls-graph__node--${node.kind}`]
          if (node.id === frame.nodeId) {
            if (frame.action === 'dropped') classes.push('mpls-graph__node--dropped')
            else if (frame.action === 'received') classes.push('mpls-graph__node--delivered')
            else classes.push('mpls-graph__node--active')
          }
          const className = classes.join(' ')
          return (
            <g key={node.id}>
              {node.kind === 'lsr' ? (
                <circle className={className} cx={node.x} cy={node.y} r={LSR_RADIUS} />
              ) : node.kind === 'host' ? (
                <rect
                  className={className}
                  x={node.x - HOST_HALF_WIDTH}
                  y={node.y - HOST_HALF_HEIGHT}
                  width={HOST_HALF_WIDTH * 2}
                  height={HOST_HALF_HEIGHT * 2}
                  rx={5}
                />
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
                y={node.y}
                dominantBaseline="central"
              >
                {node.label}
              </text>
            </g>
          )
        })}
      </g>

      {/* The pulse marks the frame where the table acts: the same instant
          the LFIB row lights and the label morphs. */}
      {frame.entry !== null && activeNode && (
        <circle
          className="mpls-graph__pulse"
          cx={activeNode.x}
          cy={activeNode.y}
          r={nodeShapeRadius(activeNode) + 5}
          fill="none"
        />
      )}

      {activeNode && (
        <g
          className={
            frame.action === 'dropped'
              ? 'mpls-graph__packet mpls-graph__packet--dropped'
              : 'mpls-graph__packet'
          }
          style={{
            transform: `translate(${activeNode.x}px, ${activeNode.y - nodeShapeRadius(activeNode) - 20}px)`,
          }}
        >
          {/* Both shapes are always here: the push grows the chip out of the
              dot and the pop collapses it back, instead of one shape
              swapping for the other. */}
          <g
            className="mpls-graph__packet-shape"
            style={{ transform: `scale(${label !== null ? 1 : 0})` }}
          >
            <rect
              className="mpls-graph__label-chip"
              x={-24}
              y={-14}
              width={48}
              height={28}
              rx={7}
            />
            {label !== null && (
              <text
                key={label}
                className="mpls-graph__label-text"
                x={0}
                y={6}
                textAnchor="middle"
              >
                {label}
              </text>
            )}
          </g>
          <circle
            className="mpls-graph__packet-dot"
            r={9}
            style={{ opacity: label !== null ? 0 : 1 }}
          />
        </g>
      )}
    </svg>
  )
}

export default NetworkGraph
