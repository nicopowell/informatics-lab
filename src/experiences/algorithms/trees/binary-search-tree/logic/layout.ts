import type { BstNode, Side } from './binarySearchTree'
import type { BstFrame } from './visualFrames'

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

/*
 * The tree becomes coordinates: one slot per node in sorted order (so the
 * BST property draws itself as "smaller left, larger right"), one level per
 * depth, and one straight edge per child.
 *
 * skipValue models the frame of an insert: that leaf is left out of the slot
 * count and dropped into the free half-slot between its in-order neighbours,
 * so every other node keeps the exact position it already had. A relayout
 * that renumbered the untouched branches would animate motion nobody asked
 * for — and would rescale the canvas under the reader's feet.
 */
export function layoutTree(
  root: BstNode | null,
  skipValue?: number,
): TreeLayout {
  const nodes: PlacedNode[] = []
  let slot = 0
  // Collected (not a plain let) so TypeScript does not narrow it away: the
  // walk runs deep inside the call and assigns it on the way past the leaf.
  // Only the parent's VALUE is kept — its placed record exists after the walk.
  const attached: { parentValue: number; side: Side }[] = []

  function walk(
    node: BstNode,
    depth: number,
    parent: number | null,
    side: Side | null,
  ): void {
    if (node.left !== null) {
      if (node.left.value === skipValue) {
        attached.push({ parentValue: node.value, side: 'left' })
      } else {
        walk(node.left, depth + 1, node.value, 'left')
      }
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
      if (node.right.value === skipValue) {
        attached.push({ parentValue: node.value, side: 'right' })
      } else {
        walk(node.right, depth + 1, node.value, 'right')
      }
    }
  }

  if (root !== null) {
    walk(root, 0, null, null)
  }

  // Canvas size counts the base only: the dropped leaf lives inside the
  // spare slot and row frameGeometry always reserves.
  const slotCount = Math.max(nodes.length, 1)
  const maxDepth = nodes.reduce((max, node) => Math.max(max, node.depth), 0)

  const attach = attached[0]
  if (attach !== undefined && skipValue !== undefined) {
    const parentNode = nodes.find((node) => node.value === attach.parentValue)
    if (parentNode !== undefined) {
      // The in-order rank of the new value: how many drawn values sit left
      // of it. Half a slot before that rank lands it between the neighbours.
      const rank = nodes.filter((node) => node.value < skipValue).length
      const depth = parentNode.depth + 1
      nodes.push({
        value: skipValue,
        x: PADDING + NODE_GAP / 2 + (rank - 0.5) * NODE_GAP,
        y: PADDING + NODE_RADIUS + depth * LEVEL_HEIGHT,
        depth,
        parent: parentNode.value,
        side: attach.side,
      })
    }
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

  return {
    width: PADDING * 2 + NODE_GAP * slotCount,
    height: PADDING * 2 + NODE_RADIUS * 2 + maxDepth * LEVEL_HEIGHT,
    nodes,
    edges,
  }
}

export type FrameGeometry = {
  layout: TreeLayout
  // The canvas this frame draws. One spare slot and one spare row are
  // reserved in EVERY frame — a miss's slot and the next insert's column —
  // so the viewBox stays identical across a whole operation and nothing
  // re-scales in the middle of a search.
  width: number
  height: number
  gap: { x: number; y: number } | null
  gapEdge: { x1: number; y1: number; x2: number; y2: number } | null
}

// The frame's drawable geometry in one place: the canvas that draws it and
// the viewport follow that aims at it must agree on the exact viewBox and
// slot position, so neither is allowed to recompute them alone.
export function frameGeometry(frame: BstFrame): FrameGeometry {
  const layout = layoutTree(frame.tree, frame.newNode ?? undefined)
  const width = layout.width + NODE_GAP
  const height = layout.height + LEVEL_HEIGHT

  if (frame.gap === null) {
    return { layout, width, height, gap: null, gapEdge: null }
  }

  const byValue = new Map(layout.nodes.map((node) => [node.value, node]))
  const parent =
    frame.gap.parent !== null ? byValue.get(frame.gap.parent) : undefined
  if (parent === undefined) {
    return {
      layout,
      width,
      height,
      gap: { x: width / 2, y: height / 2 },
      gapEdge: null,
    }
  }

  const offset = frame.gap.side === 'right' ? NODE_GAP / 2 : -NODE_GAP / 2
  const gap = { x: parent.x + offset, y: parent.y + LEVEL_HEIGHT }
  return {
    layout,
    width,
    height,
    gap,
    gapEdge: { x1: parent.x, y1: parent.y, x2: gap.x, y2: gap.y },
  }
}
