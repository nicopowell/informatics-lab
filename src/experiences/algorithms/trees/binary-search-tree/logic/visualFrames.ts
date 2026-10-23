import type { BstNode, BstStep, Side } from './binarySearchTree'

export type BstFrame = {
  kind: 'ready' | 'compare' | 'descend' | 'found' | 'miss' | 'inserted' | 'duplicate'
  // The tree this frame draws. Search frames all carry the starting tree; an
  // insert switches to the updated tree only on its final frame.
  tree: BstNode | null
  target: number
  active: number | null
  // Values compared so far, root first, ending at the active node.
  path: number[]
  // Values whose subtrees each descend has ruled out, in ruling-out order.
  discarded: number[]
  // The empty child slot a miss reached: the gap the value would occupy.
  gap: { parent: number | null; side: Side | null } | null
  // The value just attached, so the render can style it as new.
  newNode: number | null
  comparisons: number
}

export function createReadyFrame(
  tree: BstNode | null,
  target: number,
): BstFrame {
  return {
    kind: 'ready',
    tree,
    target,
    active: null,
    path: [],
    discarded: [],
    gap: null,
    newNode: null,
    comparisons: 0,
  }
}

function findNode(root: BstNode | null, value: number): BstNode | null {
  let current = root
  while (current !== null && current.value !== value) {
    current = value < current.value ? current.left : current.right
  }
  return current
}

export function toVisualFrames(
  steps: BstStep[],
  tree: BstNode | null,
  resultTree: BstNode | null = tree,
): BstFrame[] {
  const frames: BstFrame[] = []
  const path: number[] = []
  const discarded: number[] = []
  let comparisons = 0

  for (const step of steps) {
    switch (step.kind) {
      case 'compare': {
        path.push(step.node)
        comparisons += 1
        frames.push({
          kind: 'compare',
          tree,
          target: step.target,
          active: step.node,
          path: [...path],
          discarded: [...discarded],
          gap: null,
          newNode: null,
          comparisons,
        })
        break
      }
      case 'descend': {
        // The comparison sent the walk one way, so the other child's whole
        // subtree is ruled out in one move.
        const node = findNode(tree, step.node)
        const opposite: Side = step.side === 'left' ? 'right' : 'left'
        const ruledOut = node ? node[opposite] : null
        if (ruledOut !== null) {
          discarded.push(ruledOut.value)
        }
        frames.push({
          kind: 'descend',
          tree,
          target: step.target,
          active: step.node,
          path: [...path],
          discarded: [...discarded],
          gap: null,
          newNode: null,
          comparisons,
        })
        break
      }
      case 'found':
        frames.push({
          kind: 'found',
          tree,
          target: step.target,
          active: step.node,
          path: [...path],
          discarded: [...discarded],
          gap: null,
          newNode: null,
          comparisons,
        })
        break
      case 'duplicate':
        frames.push({
          kind: 'duplicate',
          tree,
          target: step.target,
          active: step.node,
          path: [...path],
          discarded: [...discarded],
          gap: null,
          newNode: null,
          comparisons,
        })
        break
      case 'miss':
        frames.push({
          kind: 'miss',
          tree,
          target: step.target,
          active: step.parent,
          path: [...path],
          discarded: [...discarded],
          gap: { parent: step.parent, side: step.side },
          newNode: null,
          comparisons,
        })
        break
      case 'inserted':
        frames.push({
          kind: 'inserted',
          tree: resultTree,
          target: step.target,
          active: step.parent,
          path: [...path],
          discarded: [...discarded],
          gap: null,
          newNode: step.target,
          comparisons,
        })
        break
    }
  }

  return frames
}
