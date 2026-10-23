import { frameGeometry, NODE_RADIUS } from '../logic/layout'
import type { BstFrame } from '../logic/visualFrames'

type TreeCanvasProps = {
  frame: BstFrame
  // The operation's last frame. When given, the node or slot it will show is
  // mounted on every frame as a pending ghost: keyframes alone only ever run
  // on mount, so without a ghost, stepping back would cut it away instead of
  // fading it out like every other state.
  finalFrame?: BstFrame
}

// Every value under the ruled-out roots, read off the parent links the layout
// already recorded instead of walking the tree again.
function discardedValues(
  roots: number[],
  childLinks: Map<number, number[]>,
): Set<number> {
  const values = new Set<number>()
  const stack = [...roots]
  while (stack.length > 0) {
    const value = stack.pop()
    if (value === undefined || values.has(value)) continue
    values.add(value)
    stack.push(...(childLinks.get(value) ?? []))
  }
  return values
}

function childLinksOf(nodes: { value: number; parent: number | null }[]): Map<
  number,
  number[]
> {
  const children = new Map<number, number[]>()
  for (const node of nodes) {
    if (node.parent === null) continue
    const siblings = children.get(node.parent) ?? []
    siblings.push(node.value)
    children.set(node.parent, siblings)
  }
  return children
}

// Pull a segment's endpoints back along its own direction, so a line starts
// and ends on the circles' rims instead of crossing their interiors.
function trimSegment(
  edge: { x1: number; y1: number; x2: number; y2: number },
  start: number,
  end: number,
): { x1: number; y1: number; x2: number; y2: number } {
  const dx = edge.x2 - edge.x1
  const dy = edge.y2 - edge.y1
  const length = Math.hypot(dx, dy)
  if (length === 0) {
    return edge
  }
  const unitX = dx / length
  const unitY = dy / length
  return {
    x1: edge.x1 + unitX * start,
    y1: edge.y1 + unitY * start,
    x2: edge.x2 - unitX * end,
    y2: edge.y2 - unitY * end,
  }
}

function pendingClass(base: string, live: boolean): string {
  return live ? base : `${base} bst-tree__pending`
}

/*
 * The tree in SVG: edges under nodes, the subtree the walk ruled out dimmed,
 * the path walked so far in its own colour, the node under comparison in the
 * spotlight, and — on a miss — a dashed branch and circle in the empty child
 * slot the walk reached. Layout is derived from the structure, so inserting
 * a value drops it into a free half-slot instead of moving anything else.
 */
function TreeCanvas({ frame, finalFrame }: TreeCanvasProps) {
  const geometry = frameGeometry(frame)
  const { layout } = geometry
  const path = new Set(frame.path)
  const discarded = discardedValues(frame.discarded, childLinksOf(layout.nodes))

  const finalGeometry =
    finalFrame !== undefined ? frameGeometry(finalFrame) : null
  const pendingValue =
    finalGeometry !== null &&
    finalFrame !== undefined &&
    finalFrame.kind === 'inserted'
      ? finalFrame.newNode
      : null
  const pendingNode =
    pendingValue !== null && finalGeometry !== null
      ? (finalGeometry.layout.nodes.find(
          (node) => node.value === pendingValue,
        ) ?? null)
      : null
  const pendingEdge =
    pendingValue !== null && finalGeometry !== null
      ? (finalGeometry.layout.edges.find(
          (edge) => edge.child === pendingValue,
        ) ?? null)
      : null
  const pendingLive = pendingValue !== null && frame.newNode === pendingValue

  // The slot the walk will reach (miss operations): this frame's own gap once
  // the walk lands on it, the final frame's gap while still pending.
  const gapGeometry =
    geometry.gap !== null
      ? geometry
      : finalGeometry !== null && finalGeometry.gap !== null
        ? finalGeometry
        : null
  const gapLive = geometry.gap !== null
  const visibleGapEdge =
    gapGeometry?.gapEdge !== null && gapGeometry?.gapEdge !== undefined
      ? trimSegment(gapGeometry.gapEdge, NODE_RADIUS + 2, NODE_RADIUS + 2)
      : null

  const width = geometry.width
  const height = geometry.height

  return (
    <svg
      className="bst-tree"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Binary search tree"
    >
      {layout.edges.map((edge) => {
        if (pendingValue !== null && edge.child === pendingValue) return null
        const classes = ['bst-tree__edge']
        if (path.has(edge.parent) && path.has(edge.child)) {
          classes.push('bst-tree__edge--path')
        }
        if (discarded.has(edge.child)) {
          classes.push('bst-tree__edge--discarded')
        }
        if (frame.newNode !== null && edge.child === frame.newNode) {
          classes.push('bst-tree__edge--new')
        }
        return (
          <line
            key={`${edge.parent}-${edge.child}`}
            className={classes.join(' ')}
            x1={edge.x1}
            y1={edge.y1}
            x2={edge.x2}
            y2={edge.y2}
          />
        )
      })}
      {pendingEdge !== null && (
        <line
          key={`${pendingEdge.parent}-${pendingEdge.child}`}
          className={pendingClass('bst-tree__edge bst-tree__edge--new', pendingLive)}
          x1={pendingEdge.x1}
          y1={pendingEdge.y1}
          x2={pendingEdge.x2}
          y2={pendingEdge.y2}
        />
      )}
      {layout.nodes.map((node) => {
        if (pendingValue !== null && node.value === pendingValue) return null
        const classes = ['bst-tree__node']
        if (path.has(node.value)) {
          classes.push('bst-tree__node--path')
        }
        if (frame.active === node.value) {
          if (frame.kind === 'found') {
            classes.push('bst-tree__node--found')
          } else if (
            frame.kind === 'compare' ||
            frame.kind === 'descend' ||
            frame.kind === 'duplicate'
          ) {
            // Only a live comparison wears the amber spotlight. At a terminal
            // frame the parent has finished comparing: it keeps its route
            // colour, and the found node gets the success green.
            classes.push('bst-tree__node--active')
          }
        }
        if (discarded.has(node.value)) {
          classes.push('bst-tree__node--discarded')
        }
        if (frame.newNode !== null && node.value === frame.newNode) {
          classes.push('bst-tree__node--new')
        }
        return (
          <g key={node.value}>
            <circle
              className={classes.join(' ')}
              cx={node.x}
              cy={node.y}
              r={NODE_RADIUS}
            />
            <text
              className="bst-tree__value"
              x={node.x}
              y={node.y}
              textAnchor="middle"
              dominantBaseline="central"
            >
              {node.value}
            </text>
          </g>
        )
      })}
      {pendingNode !== null && (
        <g key={pendingNode.value}>
          <circle
            className={pendingClass(
              'bst-tree__node bst-tree__node--new',
              pendingLive,
            )}
            cx={pendingNode.x}
            cy={pendingNode.y}
            r={NODE_RADIUS}
          />
          <text
            className="bst-tree__value"
            x={pendingNode.x}
            y={pendingNode.y}
            textAnchor="middle"
            dominantBaseline="central"
          >
            {pendingNode.value}
          </text>
        </g>
      )}
      {visibleGapEdge !== null && (
        <line
          className={pendingClass('bst-tree__gap-line', gapLive)}
          x1={visibleGapEdge.x1}
          y1={visibleGapEdge.y1}
          x2={visibleGapEdge.x2}
          y2={visibleGapEdge.y2}
        />
      )}
      {gapGeometry?.gap != null && (
        <circle
          className={pendingClass('bst-tree__gap', gapLive)}
          cx={gapGeometry.gap.x}
          cy={gapGeometry.gap.y}
          r={NODE_RADIUS}
        />
      )}
    </svg>
  )
}

export default TreeCanvas
