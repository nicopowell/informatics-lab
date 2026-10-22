export type Side = 'left' | 'right'

export type BstNode = {
  value: number
  left: BstNode | null
  right: BstNode | null
}

// A step of the traversal. Nodes are identified by their value: uniqueness is
// part of the BST contract, so the value is a stable reference for frames.
export type BstStep =
  | { kind: 'compare'; node: number; target: number }
  | { kind: 'descend'; node: number; target: number; side: Side }
  | { kind: 'found'; node: number; target: number }
  | { kind: 'duplicate'; node: number; target: number }
  | { kind: 'miss'; target: number; parent: number | null; side: Side | null }
  | {
      kind: 'inserted'
      target: number
      parent: number | null
      side: Side | null
    }

export function generateSearchSteps(
  root: BstNode | null,
  target: number,
): BstStep[] {
  const steps: BstStep[] = []
  let current = root
  // The empty child slot the walk ends at, so a miss can name the gap it
  // reached (null only when the tree itself is empty).
  let parent: number | null = null
  let side: Side | null = null

  while (current !== null) {
    steps.push({ kind: 'compare', node: current.value, target })

    if (target === current.value) {
      steps.push({ kind: 'found', node: current.value, target })
      return steps
    }

    side = target < current.value ? 'left' : 'right'
    steps.push({ kind: 'descend', node: current.value, target, side })
    parent = current.value
    current = current[side]
  }

  steps.push({ kind: 'miss', target, parent, side })
  return steps
}

export function generateInsertSteps(
  root: BstNode | null,
  target: number,
): { steps: BstStep[]; root: BstNode | null } {
  const steps: BstStep[] = []
  // The path of decisions taken so far, so the new node can be attached by
  // copying only the nodes on it and sharing every other branch.
  const path: { node: BstNode; side: Side }[] = []
  let current = root

  while (current !== null) {
    steps.push({ kind: 'compare', node: current.value, target })

    if (target === current.value) {
      steps.push({ kind: 'duplicate', node: current.value, target })
      return { steps, root }
    }

    const side: Side = target < current.value ? 'left' : 'right'
    steps.push({ kind: 'descend', node: current.value, target, side })
    path.push({ node: current, side })
    current = current[side]
  }

  const parent = path.at(-1)
  steps.push({
    kind: 'inserted',
    target,
    parent: parent ? parent.node.value : null,
    side: parent ? parent.side : null,
  })

  // Rebuild the path bottom-up: every node above the attachment gets a copy
  // with its chosen side pointing at the subtree built below it.
  let inserted: BstNode = { value: target, left: null, right: null }
  for (const { node, side } of [...path].reverse()) {
    inserted = {
      ...node,
      left: side === 'left' ? inserted : node.left,
      right: side === 'right' ? inserted : node.right,
    }
  }

  return { steps, root: inserted }
}
