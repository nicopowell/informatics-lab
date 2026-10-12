import { describe, expect, it } from 'vitest'
import { generateSelectionSortSteps } from './selectionSort'
import {
  createReadyFrame,
  frameMovement,
  toVisualFrames,
} from './visualFrames'

function framesFor(values: number[]) {
  return [
    createReadyFrame(values),
    ...toVisualFrames(generateSelectionSortSteps(values)),
  ]
}

describe('createReadyFrame', () => {
  it('claims no pass and no finalized slot', () => {
    expect(createReadyFrame([3, 1, 2])).toMatchObject({
      kind: 'compare',
      values: [3, 1, 2],
      comparing: null,
      minIndex: null,
      // Nothing is finalized yet: the head region starts empty, which is the
      // mirror image of bubble sort's ready frame.
      sortedUpTo: 0,
      comparison: 0,
      swaps: 0,
      pass: 0,
    })
  })
})

describe('toVisualFrames', () => {
  it('gives each pass its own select beat before any exchange', () => {
    const frames = toVisualFrames(generateSelectionSortSteps([3, 1, 2]))

    expect(frames.map((frame) => frame.kind)).toEqual([
      'compare',
      'compare',
      'select',
      'exchange',
      'compare',
      'select',
      'exchange',
      'done',
    ])
  })

  it('shows the selected pair with the array still unwritten', () => {
    const frames = toVisualFrames(generateSelectionSortSteps([3, 1, 2]))

    // The select frame names the minimum while the bars are still in their old
    // order, so the exchange that follows is the only thing that moves them.
    expect(frames[2]).toMatchObject({
      kind: 'select',
      values: [3, 1, 2],
      comparing: [0, 1],
      minIndex: 1,
      comparison: 2,
      swaps: 0,
      pass: 1,
    })
    expect(frames[3]).toMatchObject({
      kind: 'exchange',
      values: [1, 3, 2],
      comparing: [0, 1],
      minIndex: 1,
      comparison: 2,
      swaps: 1,
      pass: 1,
    })
  })

  it('hides a pending exchange from the counter during the select beat', () => {
    const frames = toVisualFrames(generateSelectionSortSteps([3, 1, 2]))
    const select = frames[2]
    const exchange = frames[3]

    expect(select.swaps).toBe(0)
    expect(exchange.swaps).toBe(1)
  })

  it('keeps the select frame alone when the pass writes nothing', () => {
    const frames = toVisualFrames(generateSelectionSortSteps([1, 2]))

    expect(frames.map((frame) => frame.kind)).toEqual(['compare', 'select', 'done'])
    expect(frames[1]).toMatchObject({
      kind: 'select',
      values: [1, 2],
      comparing: [0, 0],
      minIndex: 0,
      swaps: 0,
    })
  })

  it('grows the finalized head the moment the write lands', () => {
    const frames = framesFor([3, 1, 2])

    // ready, compare, compare, select, exchange, compare, select, exchange, done
    expect(frames.map((frame) => frame.sortedUpTo)).toEqual([
      0, 0, 0, 0, 1, 1, 1, 2, 3,
    ])
  })

  it('keeps the scanning pair and the running minimum in step with the scan', () => {
    const frames = toVisualFrames(generateSelectionSortSteps([5, 4, 3, 2, 1]))

    expect(frames.slice(0, 4).map((frame) => frame.comparing)).toEqual([
      [1, 0],
      [2, 1],
      [3, 2],
      [4, 3],
    ])
    expect(frames[4]).toMatchObject({ kind: 'select', comparing: [0, 4], minIndex: 4 })
  })

  it('spends one frame per comparison plus one select per pass plus one exchange per write', () => {
    const frames = toVisualFrames(generateSelectionSortSteps([5, 4, 3, 2, 1]))

    // 10 comparisons + 4 selects + the 2 writes + the final frame. Selection
    // sort is 17 frames here where bubble sort costs 21 on the same input.
    expect(frames).toHaveLength(17)
    expect(frames.filter((frame) => frame.kind === 'exchange')).toHaveLength(2)
    expect(frames.filter((frame) => frame.kind === 'select')).toHaveLength(4)
  })

  it('ends with a done frame holding the sorted array and the full totals', () => {
    const frames = toVisualFrames(generateSelectionSortSteps([5, 4, 3, 2, 1]))
    const done = frames[frames.length - 1]

    expect(done).toMatchObject({
      kind: 'done',
      values: [1, 2, 3, 4, 5],
      comparing: null,
      minIndex: null,
      sortedUpTo: 5,
      comparison: 10,
      swaps: 2,
      pass: 4,
    })
  })

  it('produces a ready frame and a done frame only for a one element array', () => {
    const frames = framesFor([7])

    expect(frames.map((frame) => frame.kind)).toEqual(['compare', 'done'])
    expect(frames[1].sortedUpTo).toBe(1)
  })

  it('never reuses the same array object between frames', () => {
    const frames = framesFor([3, 1, 2])

    for (let i = 0; i < frames.length - 1; i++) {
      expect(frames[i].values).not.toBe(frames[i + 1].values)
    }
  })

  it('keeps the select beat of a no-write pass, then ends', () => {
    const frames = toVisualFrames(generateSelectionSortSteps([2, 1, 3]))

    // pass 1: compares indices 1 and 2 against the running minimum, then
    // selects index 1 and writes. Pass 2 finds its minimum already in place.
    expect(frames.map((frame) => frame.kind)).toEqual([
      'compare',
      'compare',
      'select',
      'exchange',
      'compare',
      'select',
      'done',
    ])
  })
})

describe('frameMovement', () => {
  const frames = framesFor([3, 1, 2])
  const [, compare1, compare2, select1, exchange1] = frames

  it('does not move the bars while the scan runs or when a pass only selects', () => {
    expect(frameMovement(compare1, compare2)).toBe('none')
    expect(frameMovement(compare2, select1)).toBe('none')
  })

  it('moves the bars only when a pass commits its exchange', () => {
    expect(frameMovement(select1, exchange1)).toBe('exchange')
  })

  it('rewinds the exchange when stepping backward out of it', () => {
    expect(frameMovement(exchange1, select1)).toBe('rewind')
  })

  it('does not move the bars across passes', () => {
    expect(frameMovement(exchange1, frames[5])).toBe('none')
  })
})
