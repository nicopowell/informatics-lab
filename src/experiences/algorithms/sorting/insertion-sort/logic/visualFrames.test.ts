import { describe, expect, it } from 'vitest'
import { generateInsertionSortSteps } from './insertionSort'
import {
  createReadyFrame,
  frameMovement,
  toVisualFrames,
} from './visualFrames'

// Traced by hand and confirmed against the real step generator: pass 3 of
// [1,3,5,2] holds the 2, runs the 5 and the 3 right, and stops at the 1.
const PASS_THREE = [1, 3, 5, 2]

/*
 * The frame list the page builds: a ready frame, then one frame per step. The
 * composition lives here and in the page, exactly as in bubble sort and selection
 * sort, so `toVisualFrames` stays a pure map over steps.
 */
const framesOf = (values: number[]) => [
  createReadyFrame(values),
  ...toVisualFrames(generateInsertionSortSteps(values)),
]

const passThree = framesOf(PASS_THREE).filter(
  (frame) => frame.pass === 3 && frame.kind !== 'done',
)

describe('toVisualFrames', () => {
  it('maps one frame per step instead of expanding a pass', () => {
    const steps = generateInsertionSortSteps(PASS_THREE)

    // Selection sort needed two frames for a pass that wrote, because its logic
    // folds the decision and the write into one step. Here the scan already emits
    // one step per visible moment, so expanding would duplicate the animation.
    expect(framesOf(PASS_THREE)).toHaveLength(steps.length + 1)
    expect(passThree.map((frame) => frame.kind)).toEqual([
      'pick',
      'compare',
      'compare',
      'compare',
      'place',
    ])
  })

  it('offers a ready frame before any pass has run', () => {
    const frames = framesOf(PASS_THREE)

    expect(frames[0]).toMatchObject({
      kind: 'ready',
      key: null,
      holeIndex: null,
      testedIndex: null,
      shifted: false,
      pass: 0,
      comparison: 0,
      shifts: 0,
    })
    expect(frames[0].values).toEqual(PASS_THREE)
  })

  it('keeps the hole and the key visible on every frame of a pass', () => {
    expect(passThree.map((frame) => frame.holeIndex)).toEqual([3, 3, 2, 1, 1])
    expect(passThree.map((frame) => frame.key)).toEqual([2, 2, 2, 2, 2])
    expect(passThree.map((frame) => frame.testedIndex)).toEqual([
      null, 2, 1, 0, null,
    ])
  })

  it('shows the shift one frame after the comparison that decided it', () => {
    expect(passThree.map((frame) => frame.values)).toEqual([
      [1, 3, 5, 2],
      [1, 3, 5, 2],
      [1, 3, 5, 5],
      [1, 3, 3, 5],
      [1, 2, 3, 5],
    ])
  })

  it('clears the hand on the done frame', () => {
    const frames = framesOf(PASS_THREE)
    const done = frames[frames.length - 1]

    // The done frame shares the last pass number, which is what makes it show up in
    // a pass filter. The readout needs that; the per-pass tests must exclude it.
    expect(done.pass).toBe(3)
    expect(done.kind).toBe('done')
    expect(done.key).toBeNull()
    expect(done.holeIndex).toBeNull()
    expect(done.values).toEqual([1, 2, 3, 5])
  })

  it('carries the running counters onto every frame', () => {
    // Passes 1 and 2 cost one comparison each, pass 3 costs three.
    expect(passThree.map((frame) => frame.comparison)).toEqual([2, 3, 4, 5, 5])
    expect(passThree.map((frame) => frame.shifts)).toEqual([0, 0, 1, 2, 2])
  })

  it('does not alias the array of the ready frame', () => {
    const values = [3, 1, 2]
    const frame = createReadyFrame(values)

    frame.values[0] = 99

    expect(values).toEqual([3, 1, 2])
  })
})

describe('frameMovement', () => {
  const between = (values: number[], index: number) => {
    const frames = framesOf(values)
    return frameMovement(frames[index], frames[index + 1])
  }

  it('reports no movement while the hole has not moved', () => {
    const frames = framesOf(PASS_THREE)

    expect(frameMovement(frames[0], frames[1])).toBe('none')
    expect(frameMovement(passThree[0], passThree[1])).toBe('none')
  })

  it('reports a shift when the hole steps one slot left', () => {
    // The three pass-3 frames that open the hole, and the two that move it.
    expect(between(PASS_THREE, 8)).toBe('shift')
    expect(between(PASS_THREE, 9)).toBe('shift')
  })

  it('reports a placement when the pass closes the hole', () => {
    expect(between(PASS_THREE, 10)).toBe('place')
  })

  it('reports a placement even when the key returns to its own slot', () => {
    // Pass 1 of [1,3,5,2] costs one comparison that shifts nothing: the pass still
    // ends by placing, and the view has to say so.
    const first = framesOf(PASS_THREE).filter((frame) => frame.pass === 1)

    expect(first.map((frame) => frame.kind)).toEqual(['pick', 'compare', 'place'])
    expect(frameMovement(first[1], first[2])).toBe('place')
    expect(first[2].keyIndex).toBe(first[2].holeIndex)
  })

  it('reports a rewind when stepping back out of a shift or a placement', () => {
    const frames = framesOf(PASS_THREE)

    // [9] and [10] are pass-3 comparisons with the hole one slot apart; [11] is
    // the placement that closes it.
    expect(frameMovement(frames[9], frames[8])).toBe('rewind')
    expect(frameMovement(frames[11], frames[10])).toBe('rewind')
  })

  it('reports no movement going back to the pick that opened a pass', () => {
    // The pick and the first comparison share the same hole, so nothing has moved
    // yet in either direction.
    expect(frameMovement(passThree[1], passThree[0])).toBe('none')
  })

  it('reports no movement between the placement and the done frame', () => {
    const frames = framesOf(PASS_THREE)
    const last = frames.length - 1

    expect(frameMovement(frames[last - 1], frames[last])).toBe('none')
    expect(frameMovement(frames[last], frames[last - 1])).toBe('none')
  })

  it('never reads a pass boundary as a movement', () => {
    const frames = framesOf(PASS_THREE)
    // Find each place -> next pick boundary and check them all.
    for (let index = 0; index < frames.length - 1; index++) {
      const from = frames[index]
      const to = frames[index + 1]
      if (from.pass !== to.pass && from.kind === 'place') {
        expect(frameMovement(from, to)).toBe('none')
      }
    }
  })

  it('moves the hole by exactly one slot, never further', () => {
    const frames = framesOf([9, 8, 7, 6])
    for (let index = 0; index < frames.length - 1; index++) {
      const from = frames[index]
      const to = frames[index + 1]
      if (from.pass === to.pass && from.holeIndex !== null && to.holeIndex !== null) {
        expect(Math.abs(to.holeIndex - from.holeIndex)).toBeLessThanOrEqual(1)
      }
    }
  })
})
