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

export type FrameMovement = 'none' | 'shift' | 'place' | 'unshift' | 'unplace'

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
 * the hole itself is the only reliable witness of both. Splitting the backward
 * cases is not decoration: the view has to slide a bar for one of them and lift a
 * key out of the board for the other, and the destination frame alone cannot tell
 * them apart.
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
    // One slot left is the only way the hole travels forward, so the reverse case
    // cannot be read as a different distance.
    if (delta === -1) {
      return 'shift'
    }
    if (delta === 1) {
      return 'unshift'
    }
  }

  if (to.kind === 'place') {
    return 'place'
  }

  if (from.kind === 'place') {
    return 'unplace'
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

/*
 * Whether the board currently has a hole: from the moment a pass lifts its key
 * until the moment it places it. The view needs the same answer for the dashed
 * outline, the floating card and the height below, so it is stated once here.
 */
export function holeIsOpen(frame: InsertionSortFrame): boolean {
  return frame.kind === 'pick' || frame.kind === 'compare'
}

/*
 * The value a slot is measured by. While a pass is scanning, the array really does
 * keep a duplicate of the value it pushed aside, so `values[holeIndex]` is stale: the
 * slot is reserved for the key, and the hole has to be as tall as the key. Otherwise
 * the view draws a full bar for a value the algorithm no longer believes in, which is
 * what a dashed outline at 100% of the track used to look like. Keeping the rule here
 * rather than inline in the component is what lets a test see it.
 *
 * The result is never larger than `Math.max(...frame.values)`, so the view can
 * normalise by that maximum without clamping: either nothing has shifted yet, in which
 * case the key is still the array's own value at that slot, or something did shift, in
 * which case that something is a value in the array and it is strictly greater than the
 * key — that is the only condition under which a shift happens.
 */
export function drawnValue(frame: InsertionSortFrame, index: number): number {
  if (holeIsOpen(frame) && frame.key !== null && index === frame.holeIndex) {
    return frame.key
  }

  return frame.values[index]
}
