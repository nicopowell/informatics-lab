import type { BubbleSortStep } from './bubbleSort'

export type BubbleSortFrame = {
  kind: 'compare' | 'swap' | 'done'
  values: number[]
  comparing: [number, number] | null
  sortedFrom: number
  comparison: number
  swaps: number
}

export type FrameMovement = 'none' | 'exchange' | 'rewind'

export function frameMovement(
  from: BubbleSortFrame,
  to: BubbleSortFrame,
): FrameMovement {
  const crossesPhases =
    from.comparison === to.comparison &&
    (from.kind === 'swap') !== (to.kind === 'swap')

  if (!crossesPhases) {
    return 'none'
  }

  return to.kind === 'swap' ? 'exchange' : 'rewind'
}

export function toVisualFrames(steps: BubbleSortStep[]): BubbleSortFrame[] {
  return steps.flatMap((step) => {
    if (step.kind === 'done') {
      const doneFrame: BubbleSortFrame = {
        kind: 'done',
        values: step.values,
        comparing: step.comparing,
        sortedFrom: step.sortedFrom,
        comparison: step.comparison,
        swaps: step.swaps,
      }
      return [doneFrame]
    }

    const compareFrame: BubbleSortFrame = {
      kind: 'compare',
      values: step.values,
      comparing: step.comparing,
      sortedFrom: step.sortedFrom,
      comparison: step.comparison,
      // The pending exchange is not visible yet during the comparison.
      swaps: step.swappedValues === null ? step.swaps : step.swaps - 1,
    }

    if (step.swappedValues === null) {
      return [compareFrame]
    }

    const swapFrame: BubbleSortFrame = {
      kind: 'swap',
      values: step.swappedValues,
      comparing: step.comparing,
      sortedFrom: step.sortedFrom,
      comparison: step.comparison,
      swaps: step.swaps,
    }

    return [compareFrame, swapFrame]
  })
}
