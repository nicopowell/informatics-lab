import { describe, expect, it } from 'vitest'
import type { BstNode } from './binarySearchTree'
import { layoutTree, LEVEL_HEIGHT, NODE_GAP } from './layout'

function n(
  value: number,
  left: BstNode | null = null,
  right: BstNode | null = null,
): BstNode {
  return { value, left, right }
}

//        60
//       /  \
//     42    78
//    /
//  30
const TREE = n(60, n(42, n(30)), n(78))

describe('layoutTree', () => {
  it('lays an empty tree out as a one-slot canvas', () => {
    const layout = layoutTree(null)

    expect(layout.nodes).toEqual([])
    expect(layout.edges).toEqual([])
    expect(layout.width).toBeGreaterThan(0)
    expect(layout.height).toBeGreaterThan(0)
  })

  it('places nodes left to right in sorted order', () => {
    const layout = layoutTree(TREE)
    const xByValue = new Map(layout.nodes.map((node) => [node.value, node.x]))

    expect(xByValue.get(30)).toBeLessThan(xByValue.get(42) ?? 0)
    expect(xByValue.get(42)).toBeLessThan(xByValue.get(60) ?? 0)
    expect(xByValue.get(60)).toBeLessThan(xByValue.get(78) ?? 0)
    // Every node sits in its own slot: no two share an x.
    expect(new Set(layout.nodes.map((node) => node.x)).size).toBe(4)
  })

  it('places nodes one level per depth', () => {
    const layout = layoutTree(TREE)
    const byValue = new Map(layout.nodes.map((node) => [node.value, node]))

    expect(byValue.get(60)?.depth).toBe(0)
    expect(byValue.get(42)?.depth).toBe(1)
    expect(byValue.get(78)?.depth).toBe(1)
    expect(byValue.get(30)?.depth).toBe(2)
    expect((byValue.get(78)?.y ?? 0) - (byValue.get(60)?.y ?? 0)).toBe(
      LEVEL_HEIGHT,
    )
  })

  it('records the parent and side each node hangs from', () => {
    const layout = layoutTree(TREE)
    const byValue = new Map(layout.nodes.map((node) => [node.value, node]))

    expect(byValue.get(60)).toMatchObject({ parent: null, side: null })
    expect(byValue.get(42)).toMatchObject({ parent: 60, side: 'left' })
    expect(byValue.get(78)).toMatchObject({ parent: 60, side: 'right' })
    expect(byValue.get(30)).toMatchObject({ parent: 42, side: 'left' })
  })

  it('draws one edge per child, endpoint to endpoint', () => {
    const layout = layoutTree(TREE)
    const byValue = new Map(layout.nodes.map((node) => [node.value, node]))

    expect(layout.edges).toHaveLength(3)
    const to42 = layout.edges.find((edge) => edge.child === 42)
    expect(to42).toMatchObject({ parent: 60, side: 'left' })
    expect(to42?.x1).toBe(byValue.get(60)?.x)
    expect(to42?.y1).toBe(byValue.get(60)?.y)
    expect(to42?.x2).toBe(byValue.get(42)?.x)
    expect(to42?.y2).toBe(byValue.get(42)?.y)
  })

  it('grows the canvas with the tree and keeps nodes inside it', () => {
    const single = layoutTree(n(7))
    const layout = layoutTree(TREE)

    expect(layout.width).toBeGreaterThan(single.width)
    for (const node of layout.nodes) {
      expect(node.x).toBeGreaterThanOrEqual(0)
      expect(node.x).toBeLessThanOrEqual(layout.width)
      expect(node.y).toBeGreaterThanOrEqual(0)
      expect(node.y).toBeLessThanOrEqual(layout.height)
    }
  })

  it('reserves room for a gap beside its parent', () => {
    const layout = layoutTree(TREE)
    const byValue = new Map(layout.nodes.map((node) => [node.value, node]))
    // The rightmost node: its gap sits half a slot further right.
    const parent = byValue.get(78)
    const gapX = (parent?.x ?? 0) + NODE_GAP / 2

    expect(gapX + 22).toBeLessThanOrEqual(layout.width)
  })
})
