import { describe, expect, it } from 'vitest'
import type { BstNode } from './binary-search-tree/logic/binarySearchTree'
import {
  createTreePreset,
  INITIAL_TREE,
  TREE_PRESETS,
} from './presets'

// A tiny deterministic rng so shuffles are reproducible in assertions.
function seeded(seed: number): () => number {
  let state = seed
  return () => {
    state = (state * 1103515245 + 12345) % 2147483648
    return state / 2147483648
  }
}

function countNodes(root: BstNode | null): number {
  if (root === null) return 0
  return 1 + countNodes(root.left) + countNodes(root.right)
}

function height(root: BstNode | null): number {
  if (root === null) return -1
  return 1 + Math.max(height(root.left), height(root.right))
}

function inOrder(root: BstNode | null): number[] {
  if (root === null) return []
  return [...inOrder(root.left), root.value, ...inOrder(root.right)]
}

function isValidBst(root: BstNode | null): boolean {
  const values = inOrder(root)
  return values.every((value, index) => index === 0 || values[index - 1] < value)
}

describe('TREE_PRESETS', () => {
  it('describes every id the builder accepts, exactly once', () => {
    const ids = TREE_PRESETS.map((preset) => preset.id)

    expect(new Set(ids).size).toBe(ids.length)
    expect(ids.sort()).toEqual(['alternating', 'ascending', 'initial', 'random'])
  })
})

describe('createTreePreset', () => {
  it('returns the fixed sample tree for the initial preset', () => {
    expect(createTreePreset('initial')).toBe(INITIAL_TREE)
    expect(countNodes(INITIAL_TREE)).toBe(7)
    expect(isValidBst(INITIAL_TREE)).toBe(true)
  })

  it('builds a right-only linked list from ascending order', () => {
    const root = createTreePreset('ascending')

    expect(countNodes(root)).toBe(9)
    let cursor = root
    const walked: number[] = []
    while (cursor !== null) {
      expect(cursor.left).toBeNull()
      walked.push(cursor.value)
      cursor = cursor.right
    }
    expect(walked).toEqual([10, 20, 30, 40, 50, 60, 70, 80, 90])
  })

  it('builds a balanced tree from alternating order', () => {
    const root = createTreePreset('alternating')

    expect(countNodes(root)).toBe(15)
    // A complete 15-node tree has three levels below the root.
    expect(height(root)).toBe(3)
    expect(isValidBst(root)).toBe(true)
  })

  it('builds a valid tree of twelve nodes from random order', () => {
    const root = createTreePreset('random', seeded(7))

    expect(countNodes(root)).toBe(12)
    expect(isValidBst(root)).toBe(true)
  })

  it('is reproducible for the same rng and different across orders', () => {
    const first = createTreePreset('random', seeded(42))
    const second = createTreePreset('random', seeded(42))

    expect(first).toEqual(second)
    expect(inOrder(createTreePreset('ascending'))).not.toEqual(
      inOrder(createTreePreset('alternating')),
    )
  })
})
