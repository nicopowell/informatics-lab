import { describe, expect, it } from 'vitest'
import { generateInsertSteps, generateSearchSteps } from './binarySearchTree'
import type { BstNode, BstStep } from './binarySearchTree'

function n(
  value: number,
  left: BstNode | null = null,
  right: BstNode | null = null,
): BstNode {
  return { value, left, right }
}

function kinds(steps: BstStep[]): string[] {
  return steps.map((step) => step.kind)
}

// Tree used by most cases:
//        60
//       /  \
//     42    78
//    /
//  30
const TREE = n(60, n(42, n(30)), n(78))

describe('generateSearchSteps', () => {
  it('reports a miss on an empty tree in a single step', () => {
    const steps = generateSearchSteps(null, 5)

    expect(steps).toEqual([
      { kind: 'miss', target: 5, parent: null, side: null },
    ])
  })

  it('finds the root in two steps', () => {
    const steps = generateSearchSteps(TREE, 60)

    expect(kinds(steps)).toEqual(['compare', 'found'])
    expect(steps[0]).toMatchObject({ node: 60, target: 60 })
    expect(steps[1]).toMatchObject({ node: 60, target: 60 })
  })

  it('descends left and right according to the comparisons', () => {
    const left = generateSearchSteps(TREE, 30)
    const right = generateSearchSteps(TREE, 78)

    expect(kinds(left)).toEqual([
      'compare',
      'descend',
      'compare',
      'descend',
      'compare',
      'found',
    ])
    expect(left[1]).toMatchObject({ node: 60, side: 'left' })
    expect(left[3]).toMatchObject({ node: 42, side: 'left' })
    expect(kinds(right)).toEqual(['compare', 'descend', 'compare', 'found'])
    expect(right[1]).toMatchObject({ node: 60, side: 'right' })
  })

  it('lands the miss on the empty child slot it reached', () => {
    const steps = generateSearchSteps(TREE, 31)

    expect(kinds(steps)).toEqual([
      'compare',
      'descend',
      'compare',
      'descend',
      'compare',
      'descend',
      'miss',
    ])
    expect(steps[6]).toMatchObject({ target: 31, parent: 30, side: 'right' })
  })

  it('keeps the target on every step', () => {
    const steps = generateSearchSteps(TREE, 78)

    for (const step of steps) {
      expect(step).toMatchObject({ target: 78 })
    }
  })
})

describe('generateInsertSteps', () => {
  it('attaches the first value as the root of an empty tree', () => {
    const { steps, root } = generateInsertSteps(null, 42)

    expect(kinds(steps)).toEqual(['inserted'])
    expect(steps[0]).toMatchObject({ target: 42, parent: null, side: null })
    expect(root).toEqual(n(42))
  })

  it('follows the search path and attaches at the empty slot', () => {
    const { steps, root } = generateInsertSteps(TREE, 50)

    expect(kinds(steps)).toEqual([
      'compare',
      'descend',
      'compare',
      'descend',
      'inserted',
    ])
    expect(steps[4]).toMatchObject({ target: 50, parent: 42, side: 'right' })
    expect(root).toEqual(n(60, n(42, n(30), n(50)), n(78)))
  })

  it('never mutates the input tree', () => {
    const before = structuredClone(TREE)

    const { root } = generateInsertSteps(TREE, 50)

    expect(TREE).toEqual(before)
    expect(root).not.toBe(TREE)
    expect(root?.left).not.toBe(TREE.left)
  })

  it('shares the untouched branches with the input tree', () => {
    const { root } = generateInsertSteps(TREE, 50)

    expect(root?.right).toBe(TREE.right)
    expect(root?.left?.left).toBe(TREE.left?.left)
  })

  it('stops with a duplicate step and returns the input tree untouched', () => {
    const { steps, root } = generateInsertSteps(TREE, 42)

    expect(kinds(steps)).toEqual(['compare', 'descend', 'compare', 'duplicate'])
    expect(steps[3]).toMatchObject({ node: 42, target: 42 })
    expect(root).toBe(TREE)
  })

  it('reports the duplicate deeper in the tree', () => {
    const { steps, root } = generateInsertSteps(TREE, 30)

    expect(kinds(steps)).toEqual([
      'compare',
      'descend',
      'compare',
      'descend',
      'compare',
      'duplicate',
    ])
    expect(steps[5]).toMatchObject({ node: 30, target: 30 })
    expect(root).toBe(TREE)
  })
})
