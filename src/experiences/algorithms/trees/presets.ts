// Tree-shape presets live at topic level: the lesson is how the *insertion
// order* changes the shape, so each preset is an order, not a literal tree.
// The initial sample tree is the exception: it is a fixed starting point,
// and staying literal keeps it identical on every visit.

import type { BstNode } from './binary-search-tree/logic/binarySearchTree'
import { generateInsertSteps } from './binary-search-tree/logic/binarySearchTree'

export type TreePresetId = 'initial' | 'ascending' | 'alternating' | 'random'

export type TreePreset = {
  id: TreePresetId
  label: string
  description: string
}

export const TREE_PRESETS: readonly TreePreset[] = [
  {
    id: 'initial',
    label: 'Sample tree',
    description: 'A fixed seven-node tree to start from.',
  },
  {
    id: 'ascending',
    label: 'Ascending',
    description:
      'Values inserted low to high: every comparison goes right, a linked list.',
  },
  {
    id: 'alternating',
    label: 'Alternating',
    description:
      'The median first, then the median of each half: a balanced tree.',
  },
  {
    id: 'random',
    label: 'Random',
    description: 'A shuffled order: the irregular shape usual insertions give.',
  },
]

export const INITIAL_TREE: BstNode = {
  value: 50,
  left: {
    value: 25,
    left: { value: 12, left: null, right: null },
    right: { value: 37, left: null, right: null },
  },
  right: {
    value: 75,
    left: { value: 63, left: null, right: null },
    right: { value: 87, left: null, right: null },
  },
}

// Tens keep the drawn values readable inside the node circles.
function tens(count: number): number[] {
  return Array.from({ length: count }, (_, index) => (index + 1) * 10)
}

// Median first, then each half the same way: parents always precede their
// children, so the insertion order builds a complete, balanced tree.
function alternatingOrder(values: number[]): number[] {
  if (values.length === 0) return []
  const middle = Math.floor(values.length / 2)
  return [
    values[middle],
    ...alternatingOrder(values.slice(0, middle)),
    ...alternatingOrder(values.slice(middle + 1)),
  ]
}

function shuffled(values: number[], rng: () => number): number[] {
  const order = [...values]
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[order[i], order[j]] = [order[j], order[i]]
  }
  return order
}

// Reusing the experience's own insert keeps one insertion implementation:
// the presets are orders, and the tree is whatever those orders produce.
function build(order: number[]): BstNode | null {
  let root: BstNode | null = null
  for (const value of order) {
    root = generateInsertSteps(root, value).root
  }
  return root
}

export function createTreePreset(
  id: TreePresetId,
  rng: () => number = Math.random,
): BstNode | null {
  switch (id) {
    case 'initial':
      return INITIAL_TREE
    case 'ascending':
      return build(tens(9))
    case 'alternating':
      return build(alternatingOrder(tens(15)))
    case 'random':
      return build(shuffled(tens(12), rng))
  }
}
