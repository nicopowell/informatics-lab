import type { SelectionSortStep } from './selectionSort'

export type SelectionSortFrame = {
  // `select` is the beat bubble sort has no equivalent for: the pass naming
  // its minimum before anything moves. `exchange` is that minimum landing.
  kind: 'compare' | 'select' | 'exchange' | 'done'
  values: number[]
  comparing: [number, number] | null
  minIndex: number | null
  sortedUpTo: number
  comparison: number
  swaps: number
  pass: number
}

export type FrameMovement = 'none' | 'exchange' | 'rewind'

export function createReadyFrame(values: number[]): SelectionSortFrame {
  return {
    kind: 'compare',
    values,
    comparing: null,
    minIndex: null,
    // The head region is what grows here, so it starts empty — the mirror of
    // bubble sort, whose ready frame marks the whole tail as sorted.
    sortedUpTo: 0,
    comparison: 0,
    swaps: 0,
    // No pass has run yet, so the board must not claim one.
    pass: 0,
  }
}

export function frameMovement(
  from: SelectionSortFrame,
  to: SelectionSortFrame,
): FrameMovement {
  const crossesPhases =
    from.comparison === to.comparison &&
    (from.kind === 'exchange') !== (to.kind === 'exchange')

  if (!crossesPhases) {
    return 'none'
  }

  return to.kind === 'exchange' ? 'exchange' : 'rewind'
}

export function toVisualFrames(steps: SelectionSortStep[]): SelectionSortFrame[] {
  return steps.flatMap((step) => {
    if (step.kind === 'compare') {
      const compareFrame: SelectionSortFrame = {
        kind: 'compare',
        values: step.values,
        comparing: step.comparing,
        minIndex: step.minIndex,
        sortedUpTo: step.sortedUpTo,
        comparison: step.comparison,
        swaps: step.swaps,
        pass: step.pass,
      }
      return [compareFrame]
    }

    if (step.kind === 'done') {
      const doneFrame: SelectionSortFrame = {
        kind: 'done',
        values: step.values,
        comparing: step.comparing,
        minIndex: step.minIndex,
        sortedUpTo: step.sortedUpTo,
        comparison: step.comparison,
        swaps: step.swaps,
        pass: step.pass,
      }
      return [doneFrame]
    }

    const writes = step.exchangedValues !== null

    const selectFrame: SelectionSortFrame = {
      kind: 'select',
      values: step.values,
      comparing: step.comparing,
      minIndex: step.minIndex,
      sortedUpTo: step.sortedUpTo,
      comparison: step.comparison,
      // The pending write is not visible yet while the pass is still naming
      // its minimum, so the counter must not jump ahead of the board.
      swaps: writes ? step.swaps - 1 : step.swaps,
      pass: step.pass,
    }

    if (step.exchangedValues === null) {
      return [selectFrame]
    }

    const exchangeFrame: SelectionSortFrame = {
      kind: 'exchange',
      values: step.exchangedValues,
      comparing: step.comparing,
      minIndex: step.minIndex,
      // The write is what decides the slot, so the head grows on landing.
      sortedUpTo: step.sortedUpTo + 1,
      comparison: step.comparison,
      swaps: step.swaps,
      pass: step.pass,
    }

    return [selectFrame, exchangeFrame]
  })
}
