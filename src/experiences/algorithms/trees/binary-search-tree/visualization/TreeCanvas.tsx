import type { TreeLayout } from '../logic/layout'
import { layoutTree, LEVEL_HEIGHT, NODE_GAP, NODE_RADIUS } from '../logic/layout'
import type { BstFrame } from '../logic/visualFrames'

type TreeCanvasProps = {
  frame: BstFrame
}

// Every value under the ruled-out roots, read off the parent links the layout
// already recorded instead of walking the tree again.
function discardedValues(layout: TreeLayout, roots: number[]): Set<number> {
  const children = new Map<number, number[]>()
  for (const node of layout.nodes) {
    if (node.parent === null) continue
    const siblings = children.get(node.parent) ?? []
    siblings.push(node.value)
    children.set(node.parent, siblings)
  }

  const values = new Set<number>()
  const stack = [...roots]
  while (stack.length > 0) {
    const value = stack.pop()
    if (value === undefined || values.has(value)) continue
    values.add(value)
    stack.push(...(children.get(value) ?? []))
  }
  return values
}

/*
 * The tree in SVG: edges under nodes, the subtree the walk ruled out dimmed,
 * the path walked so far lit edge by edge, the node under comparison in the
 * spotlight, and — on a miss — a dashed circle in the empty child slot the
 * walk reached. Layout is derived from the structure, so inserting a value
 * relays out the whole drawing instead of patching it.
 */
function TreeCanvas({ frame }: TreeCanvasProps) {
  const layout = layoutTree(frame.tree)
  const path = new Set(frame.path)
  const discarded = discardedValues(layout, frame.discarded)
  const byValue = new Map(layout.nodes.map((node) => [node.value, node]))

  // A miss reaches one level below the deepest node it compared, so the gap
  // gets one extra row of canvas.
  const height =
    frame.gap !== null && frame.gap.parent !== null
      ? layout.height + LEVEL_HEIGHT
      : layout.height

  let gap: { x: number; y: number } | null = null
  if (frame.gap !== null) {
    const parent =
      frame.gap.parent !== null ? byValue.get(frame.gap.parent) : undefined
    if (parent === undefined) {
      gap = { x: layout.width / 2, y: height / 2 }
    } else {
      const offset = frame.gap.side === 'right' ? NODE_GAP / 2 : -NODE_GAP / 2
      gap = { x: parent.x + offset, y: parent.y + LEVEL_HEIGHT }
    }
  }

  return (
    <svg
      className="bst-tree"
      viewBox={`0 0 ${layout.width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Binary search tree"
    >
      {layout.edges.map((edge) => {
        const classes = ['bst-tree__edge']
        if (path.has(edge.parent) && path.has(edge.child)) {
          classes.push('bst-tree__edge--path')
        }
        if (discarded.has(edge.child)) {
          classes.push('bst-tree__edge--discarded')
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
      {layout.nodes.map((node) => {
        const classes = ['bst-tree__node']
        if (frame.active === node.value) {
          classes.push('bst-tree__node--active')
        }
        if (discarded.has(node.value)) {
          classes.push('bst-tree__node--discarded')
        }
        if (frame.newNode === node.value) {
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
      {gap !== null && (
        <circle className="bst-tree__gap" cx={gap.x} cy={gap.y} r={NODE_RADIUS} />
      )}
    </svg>
  )
}

export default TreeCanvas
