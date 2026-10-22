import type { BstNode, Side } from './binarySearchTree'

export type PlacedNode = {
  value: number
  x: number
  y: number
  depth: number
  parent: number | null
  side: Side | null
}

export type PlacedEdge = {
  parent: number
  child: number
  side: Side
  x1: number
  y1: number
  x2: number
  y2: number
}

export type TreeLayout = {
  width: number
  height: number
  nodes: PlacedNode[]
  edges: PlacedEdge[]
}

export const NODE_RADIUS = 22
export const NODE_GAP = 64
export const LEVEL_HEIGHT = 76
const PADDING = 24

// The tree becomes coordinates: one slot per node in sorted order (so the
// BST property draws itself as "smaller left, larger right"), one level per
// depth, and one straight edge per child.
export function layoutTree(root: BstNode | null): TreeLayout {
  const nodes: PlacedNode[] = []
  let slot = 0

  function walk(
    node: BstNode,
    depth: number,
    parent: number | null,
    side: Side | null,
  ): void {
    if (node.left !== null) {
      walk(node.left, depth + 1, node.value, 'left')
    }
    nodes.push({
      value: node.value,
      x: PADDING + NODE_GAP / 2 + slot * NODE_GAP,
      y: PADDING + NODE_RADIUS + depth * LEVEL_HEIGHT,
      depth,
      parent,
      side,
    })
    slot += 1
    if (node.right !== null) {
      walk(node.right, depth + 1, node.value, 'right')
    }
  }

  if (root !== null) {
    walk(root, 0, null, null)
  }

  const byValue = new Map(nodes.map((node) => [node.value, node]))
  const edges: PlacedEdge[] = []
  for (const node of nodes) {
    if (node.parent === null || node.side === null) continue
    const parent = byValue.get(node.parent)
    if (parent === undefined) continue
    edges.push({
      parent: node.parent,
      child: node.value,
      side: node.side,
      x1: parent.x,
      y1: parent.y,
      x2: node.x,
      y2: node.y,
    })
  }

  const slotCount = Math.max(nodes.length, 1)
  const maxDepth = nodes.reduce((max, node) => Math.max(max, node.depth), 0)
  return {
    width: PADDING * 2 + NODE_GAP * slotCount,
    height: PADDING * 2 + NODE_RADIUS * 2 + maxDepth * LEVEL_HEIGHT,
    nodes,
    edges,
  }
}
