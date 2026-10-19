import { describe, expect, it } from 'vitest'
import { generateInsertionSortSteps } from './insertionSort'
import {
  createReadyFrame,
  drawnValue,
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
    // the placement that closes it. They rewind differently: undoing a shift opens
    // the hole again on the right, undoing a placement only lifts the key back.
    expect(frameMovement(frames[9], frames[8])).toBe('unshift')
    expect(frameMovement(frames[11], frames[10])).toBe('unplace')
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

describe('drawnValue', () => {
  it('measures an open hole by the key it is reserved for', () => {
    // Frame 3 of pass 3 of [1,3,5,2]: the 5 has just been pushed into the hole, so
    // the array literally reads [1,3,5,5] while the 2 is still in the hand. The slot
    // is open for the 2, so that is what it is drawn as tall as.
    expect(passThree[2].values).toEqual([1, 3, 5, 5])
    expect(passThree[2].holeIndex).toBe(2)
    expect(passThree[2].key).toBe(2)
    expect(drawnValue(passThree[2], 2)).toBe(2)
  })

  it('measures every other slot by the value the array holds there', () => {
    // The same frame: only the hole borrows the key's height. The pushed-aside copy
    // at index 3 stays a real 5, and the untouched prefix stays 1 and 3.
    expect([0, 1, 3].map((index) => drawnValue(passThree[2], index))).toEqual([
      1, 3, 5,
    ])
  })

  it('measures the hole the same way at every step of the scan', () => {
    // The hole travels left as the scan goes: index 2 after the first shift, index 1
    // after the second. Both frames must be drawn against the key, not their own copy.
    expect(passThree[3].values).toEqual([1, 3, 3, 5])
    expect(passThree[3].holeIndex).toBe(1)
    expect(drawnValue(passThree[3], 1)).toBe(2)
  })

  it('leaves closed frames on the array alone', () => {
    const frames = framesOf(PASS_THREE)

    // `pick` and `compare` are the only kinds with a hole in the board; everywhere
    // else the value in the array is the value that is there.
    const closed = frames.filter((frame) => !['pick', 'compare'].includes(frame.kind))
    for (const frame of closed) {
      for (let index = 0; index < frame.values.length; index++) {
        expect(drawnValue(frame, index)).toBe(frame.values[index])
      }
    }
  })

  it('never measures a slot taller than the track it is drawn in', () => {
    // The view normalises by the maximum of `values` and never clamps, so a drawn
    // value above that maximum would overflow the board. Ordered: [1,2,3]. Reversed:
    // every pass shifts. All equal: the key always equals the maximum.
    for (const values of [[1, 3, 5, 2], [9, 8, 7, 6], [5, 5, 5], [1, 2, 3], [2, 1]]) {
      const frames = framesOf(values)
      for (const frame of frames) {
        const maxValue = Math.max(...frame.values)
        for (let index = 0; index < frame.values.length; index++) {
          expect(drawnValue(frame, index)).toBeLessThanOrEqual(maxValue)
        }
      }
    }
  })

  it('reports the board of the reported case, frame by frame', () => {
    // The exact array the user screenshotted: [32, 98, 83]. It has three slots, so the
    // pass that lifts the 83 is pass 2 (pass = the index the key came from). The 98
    // moves aside and the array is left holding two 98s while the hole sits at index 1.
    const lastPass = framesOf([32, 98, 83]).filter(
      (frame) => frame.pass === 2 && frame.kind !== 'done',
    )

    expect(lastPass.map((frame) => frame.kind)).toEqual([
      'pick',
      'compare',
      'compare',
      'place',
    ])
    expect(lastPass.map((frame) => frame.values)).toEqual([
      [32, 98, 83],
      [32, 98, 83],
      [32, 98, 98],
      [32, 83, 98],
    ])
    expect(lastPass.map((frame) => frame.holeIndex)).toEqual([2, 2, 1, 1])

    // The two frames that used to draw a dashed box at the height of a stale 98 are
    // now measured against the 83, at 85% of the track instead of 100%.
    expect(lastPass.map((frame) => drawnValue(frame, frame.holeIndex ?? -1))).toEqual(
      [83, 83, 83, 83],
    )
    expect(drawnValue(lastPass[2], 1)).toBe(83)

    // And the slot the 98 was pushed into keeps its own measurement: the hole is the
    // only borrower.
    expect(drawnValue(lastPass[2], 2)).toBe(98)
    expect(drawnValue(lastPass[2], 0)).toBe(32)
  })
})
