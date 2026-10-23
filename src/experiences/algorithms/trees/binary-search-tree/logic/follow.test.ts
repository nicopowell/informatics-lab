import { describe, expect, it } from 'vitest'
import type { BstNode } from './binarySearchTree'
import { generateInsertSteps, generateSearchSteps } from './binarySearchTree'
import { toVisualFrames } from './visualFrames'
import type { BstFrame } from './visualFrames'
import { followScroll, followTarget } from './follow'
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

function searchFrames(tree: BstNode | null, target: number): BstFrame[] {
  return toVisualFrames(generateSearchSteps(tree, target), tree)
}

describe('followTarget', () => {
  it('follows the node under the spotlight', () => {
    const root = layoutTree(TREE).nodes.find((node) => node.parent === null)
    const target = followTarget(searchFrames(TREE, 30)[0])

    expect(target?.point).toEqual({ x: root?.x, y: root?.y })
    expect(target?.viewBox.width).toBe(layoutTree(TREE).width + NODE_GAP)
  })

  it('follows the empty slot a miss reached, canvas including its row', () => {
    const frames = searchFrames(TREE, 31)
    const target = followTarget(frames.at(-1) as BstFrame)
    const layout = layoutTree(TREE)
    const parent = layout.nodes.find((node) => node.value === 30)

    expect(target?.point).toEqual({
      x: (parent?.x ?? 0) + 32,
      y: (parent?.y ?? 0) + LEVEL_HEIGHT,
    })
    expect(target?.viewBox.height).toBe(layout.height + LEVEL_HEIGHT)
  })

  it('follows the freshly inserted node, not its parent', () => {
    const { steps, root } = generateInsertSteps(TREE, 50)
    const frames = toVisualFrames(steps, TREE, root)
    // The stable slot the insert actually drew, not a renumbered one.
    const inserted = layoutTree(root, 50).nodes.find(
      (node) => node.value === 50,
    )
    const target = followTarget(frames.at(-1) as BstFrame)

    expect(target?.point).toEqual({ x: inserted?.x, y: inserted?.y })
  })
})

describe('followScroll', () => {
  it('does nothing when the content is not larger than the viewport', () => {
    expect(
      followScroll(
        { x: 10, y: 10 },
        { width: 400, height: 400 },
        { width: 400, height: 400 },
        { width: 400, height: 400 },
        { left: 0, top: 0 },
      ),
    ).toBeNull()
  })

  it('keeps silent while the point is comfortably inside the view', () => {
    // Zoom 2, same aspect: user unit → pixel is exactly ×2.
    expect(
      followScroll(
        { x: 100, y: 100 },
        { width: 400, height: 400 },
        { width: 400, height: 400 },
        { width: 800, height: 800 },
        { left: 0, top: 0 },
      ),
    ).toBeNull()
  })

  it('centers a point that left the view, clamped to the content', () => {
    const target = followScroll(
      { x: 380, y: 380 },
      { width: 400, height: 400 },
      { width: 400, height: 400 },
      { width: 800, height: 800 },
      { left: 0, top: 0 },
    )

    // Desired center 760−200 = 560 exceeds the 400px of scrollable space.
    expect(target).toEqual({ left: 400, top: 400 })
  })

  it('accounts for the letterbox meet leaves on the wider axis', () => {
    // Box 800×400, viewBox 400×400: scale is 1 (height-limited) and the
    // drawing sits centred behind 200px of margin on each side.
    const content = { width: 800, height: 400 }
    const viewport = { width: 400, height: 200 }

    expect(
      followScroll(
        { x: 50, y: 100 },
        { width: 400, height: 400 },
        viewport,
        content,
        { left: 0, top: 0 },
      ),
    ).toBeNull() // x renders at 250, y at 100: both inside the window

    expect(
      followScroll(
        { x: 50, y: 350 },
        { width: 400, height: 400 },
        viewport,
        content,
        { left: 0, top: 0 },
      ),
    ).toEqual({ left: 50, top: 200 })
  })
})
