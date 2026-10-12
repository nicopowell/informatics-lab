import type { InsertionSortStep } from './insertionSort'

export type InsertionSortFrame = {
  // `ready` is a frame kind with no step behind it: the page needs a board before
  // any pass has lifted a value, and the algorithm has no reason to emit one.
  kind: 'ready' | 'pick' | 'compare' | 'place' | 'done'
  values: number[]
  key: number | null
  keyIndex: number | null
  holeIndex: number | null
  testedIndex: number | null
  shifted: boolean
  pass: number
  comparison: number
  shifts: number
}

export type FrameMovement = 'none' | 'shift' | 'place' | 'rewind'

export function createReadyFrame(values: number[]): InsertionSortFrame {
  return {
    kind: 'ready',
    // Copied here, and aliased below on purpose. The ready frame receives the live
    // array the page holds in state, so it must not be able to write through it;
    // the mapped frames receive arrays each step already owns and never sees again.
    values: [...values],
    key: null,
    keyIndex: null,
    holeIndex: null,
    testedIndex: null,
    shifted: false,
    // No pass has run, so the board must not claim one.
    pass: 0,
    comparison: 0,
    shifts: 0,
  }
}

/*
 * Which of the two visible motions a frame transition deserves, and in which
 * direction. Bubble sort and selection sort could ask "did we cross into the
 * write?"; here there are two different writes, the shift and the placement, and
 * the hole itself is the only reliable witness of both.
 */
export function frameMovement(
  from: InsertionSortFrame,
  to: InsertionSortFrame,
): FrameMovement {
  // A pass boundary is never a movement: the hole jumps back to the frontier when
  // the next pass lifts its value, and animating that would read as a wrong shift.
  if (from.pass !== to.pass) {
    return 'none'
  }

  // The hand is empty on the done frame, so there is nothing left to move.
  if (from.kind === 'done' || to.kind === 'done') {
    return 'none'
  }

  if (from.holeIndex !== null && to.holeIndex !== null) {
    const delta = to.holeIndex - from.holeIndex
    if (delta === -1) {
      return 'shift'
    }
    if (delta === 1) {
      return 'rewind'
    }
  }

  if (to.kind === 'place') {
    return 'place'
  }

  if (from.kind === 'place') {
    return 'rewind'
  }

  return 'none'
}

// One frame per step: unlike selection sort, no step here hides two visible moments.
export function toVisualFrames(steps: InsertionSortStep[]): InsertionSortFrame[] {
  return steps.map((step) => ({
    kind: step.kind,
    values: step.values,
    key: step.key,
    keyIndex: step.keyIndex,
    holeIndex: step.holeIndex,
    testedIndex: step.testedIndex,
    shifted: step.shifted,
    pass: step.pass,
    comparison: step.comparison,
    shifts: step.shifts,
  }))
}
