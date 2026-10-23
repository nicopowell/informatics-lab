import { describe, expect, it } from 'vitest'
import { generateInsertSteps, generateSearchSteps } from './binarySearchTree'
import type { BstNode } from './binarySearchTree'
import { createReadyFrame, toVisualFrames } from './visualFrames'

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

describe('createReadyFrame', () => {
  it('starts on the given tree with nothing highlighted', () => {
    const frame = createReadyFrame(TREE, 42)

    expect(frame).toEqual({
      kind: 'ready',
      tree: TREE,
      target: 42,
      active: null,
      path: [],
      discarded: [],
      gap: null,
      newNode: null,
      comparisons: 0,
    })
  })
})

describe('toVisualFrames', () => {
  it('produces one frame per step, in order', () => {
    const steps = generateSearchSteps(TREE, 30)
    const frames = toVisualFrames(steps, TREE)

    expect(frames.map((frame) => frame.kind)).toEqual([
      'compare',
      'descend',
      'compare',
      'descend',
      'compare',
      'found',
    ])
  })

  it('counts comparisons only when a node is actually compared', () => {
    const steps = generateSearchSteps(TREE, 30)
    const frames = toVisualFrames(steps, TREE)

    expect(frames.map((frame) => frame.comparisons)).toEqual([1, 1, 2, 2, 3, 3])
  })

  it('grows the highlighted path as the walk descends', () => {
    const steps = generateSearchSteps(TREE, 30)
    const frames = toVisualFrames(steps, TREE)

    expect(frames[0].path).toEqual([60])
    expect(frames[3].path).toEqual([60, 42])
    expect(frames[5]).toMatchObject({ active: 30, path: [60, 42, 30] })
  })

  it('dims the subtree ruled out by each descend', () => {
    const steps = generateSearchSteps(TREE, 30)
    const frames = toVisualFrames(steps, TREE)

    // 60 sent the walk left, so the whole 78 subtree is out from then on.
    expect(frames[0].discarded).toEqual([])
    expect(frames[1].discarded).toEqual([78])
    // 42 also goes left, but has no right subtree to rule out.
    expect(frames[3].discarded).toEqual([78])
    expect(frames[5].discarded).toEqual([78])
  })

  it('marks the empty slot a miss reached', () => {
    const steps = generateSearchSteps(TREE, 31)
    const frames = toVisualFrames(steps, TREE)
    const last = frames.at(-1)

    expect(last).toMatchObject({
      kind: 'miss',
      active: 30,
      gap: { parent: 30, side: 'right' },
      comparisons: 3,
    })
  })

  it('reports a miss on an empty tree without a path', () => {
    const steps = generateSearchSteps(null, 9)
    const frames = toVisualFrames(steps, null)
    const last = frames.at(-1)

    expect(last).toMatchObject({
      kind: 'miss',
      tree: null,
      active: null,
      path: [],
      gap: { parent: null, side: null },
      comparisons: 0,
    })
  })

  it('draws the updated tree from the insert frame on', () => {
    const { steps, root } = generateInsertSteps(TREE, 50)
    const frames = toVisualFrames(steps, TREE, root)
    const last = frames.at(-1)

    // Every frame before the attachment still shows the original tree...
    expect(frames.slice(0, -1).every((frame) => frame.tree === TREE)).toBe(true)
    // ...and the final frame switches to the tree with the new node hanging.
    expect(last).toMatchObject({
      kind: 'inserted',
      tree: root,
      newNode: 50,
      active: 42,
      gap: null,
      comparisons: 2,
    })
    expect(last?.tree).not.toBe(TREE)
  })

  it('keeps the original tree when the insert hits a duplicate', () => {
    const { steps } = generateInsertSteps(TREE, 42)
    const frames = toVisualFrames(steps, TREE, TREE)
    const last = frames.at(-1)

    expect(last).toMatchObject({
      kind: 'duplicate',
      tree: TREE,
      active: 42,
      newNode: null,
      comparisons: 2,
    })
  })

  it('never mutates the tree it receives', () => {
    const before = structuredClone(TREE)
    const steps = generateSearchSteps(TREE, 31)
    const { steps: insertSteps, root } = generateInsertSteps(TREE, 50)

    toVisualFrames(steps, TREE)
    toVisualFrames(insertSteps, TREE, root)

    expect(TREE).toEqual(before)
  })
})
