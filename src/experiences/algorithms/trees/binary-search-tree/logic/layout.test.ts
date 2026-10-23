import { describe, expect, it } from 'vitest'
import type { BstNode } from './binarySearchTree'
import { generateInsertSteps, generateSearchSteps } from './binarySearchTree'
import { createReadyFrame, toVisualFrames } from './visualFrames'
import type { BstFrame } from './visualFrames'
import { frameGeometry, layoutTree, LEVEL_HEIGHT, NODE_GAP } from './layout'

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

describe('frameGeometry', () => {
  it('always reserves one spare slot and row so the viewBox never jumps', () => {
    const geometry = frameGeometry(createReadyFrame(TREE, 42))

    // A miss's slot and the next insert's column live in that spare space;
    // keeping it in every frame makes the canvas identical across a search.
    expect(geometry.width).toBe(layoutTree(TREE).width + NODE_GAP)
    expect(geometry.height).toBe(layoutTree(TREE).height + LEVEL_HEIGHT)
    expect(geometry.gap).toBeNull()
    expect(geometry.gapEdge).toBeNull()
  })

  it('points the dashed edge at the slot one row below its parent', () => {
    const frames = toVisualFrames(generateSearchSteps(TREE, 31), TREE)
    const geometry = frameGeometry(frames.at(-1) as BstFrame)
    const layout = layoutTree(TREE)
    const byValue = new Map(layout.nodes.map((node) => [node.value, node]))
    const parent = byValue.get(30)

    expect(geometry.height).toBe(layout.height + LEVEL_HEIGHT)
    expect(geometry.gap).toEqual({
      x: (parent?.x ?? 0) + NODE_GAP / 2,
      y: (parent?.y ?? 0) + LEVEL_HEIGHT,
    })
    expect(geometry.gapEdge).toEqual({
      x1: parent?.x,
      y1: parent?.y,
      x2: geometry.gap?.x,
      y2: geometry.gap?.y,
    })
  })

  it('draws the insert on the very same canvas as the frame before it', () => {
    const ready = frameGeometry(createReadyFrame(TREE, 64))
    const { steps, root } = generateInsertSteps(TREE, 64)
    const frames = toVisualFrames(steps, TREE, root)
    const grown = frameGeometry(frames.at(-1) as BstFrame)

    expect(grown.width).toBe(ready.width)
    expect(grown.height).toBe(ready.height)
  })
})

describe('layoutTree with a freshly inserted value', () => {
  const { root } = generateInsertSteps(TREE, 64)

  it('leaves every existing node exactly where it was', () => {
    const base = layoutTree(TREE)
    const grown = layoutTree(root, 64)
    const baseByValue = new Map(base.nodes.map((node) => [node.value, node]))

    for (const node of grown.nodes) {
      if (node.value === 64) continue
      expect(node.x).toBe(baseByValue.get(node.value)?.x)
      expect(node.y).toBe(baseByValue.get(node.value)?.y)
    }
    expect(grown.width).toBe(base.width)
    expect(grown.height).toBe(base.height)
  })

  it('drops the new node midway between its in-order neighbours', () => {
    const base = layoutTree(TREE)
    const grown = layoutTree(root, 64)
    const inserted = grown.nodes.find((node) => node.value === 64)
    const node60 = grown.nodes.find((node) => node.value === 60)
    const node78 = grown.nodes.find((node) => node.value === 78)

    expect(inserted?.x).toBe(((node60?.x ?? 0) + (node78?.x ?? 0)) / 2)
    expect(inserted?.y).toBe((node78?.y ?? 0) + LEVEL_HEIGHT)
    expect(inserted).toMatchObject({ parent: 78, side: 'left' })
    expect(grown.edges).toHaveLength(base.edges.length + 1)
  })
})
