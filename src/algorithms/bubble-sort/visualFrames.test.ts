import { describe, expect, it } from 'vitest'
import { generateBubbleSortSteps } from './bubbleSort'
import { frameMovement, toVisualFrames } from './visualFrames'

describe('toVisualFrames', () => {
  it('produces a single done frame for an empty array', () => {
    const frames = toVisualFrames(generateBubbleSortSteps([]))

    expect(frames).toHaveLength(1)
    expect(frames[0].kind).toBe('done')
  })

  it('expands a comparison with swap into a compare and a swap frame', () => {
    const frames = toVisualFrames(generateBubbleSortSteps([2, 1]))

    expect(frames.map((frame) => frame.kind)).toEqual(['compare', 'swap', 'done'])
    expect(frames[0]).toMatchObject({ kind: 'compare', values: [2, 1] })
    expect(frames[1]).toMatchObject({ kind: 'swap', values: [1, 2] })
    expect(frames[0].comparing).toEqual([0, 1])
    expect(frames[1].comparing).toEqual([0, 1])
  })

  it('does not add a swap frame when there is no exchange', () => {
    const frames = toVisualFrames(generateBubbleSortSteps([1, 2]))

    expect(frames.map((frame) => frame.kind)).toEqual(['compare', 'done'])
  })

  it('adds one frame per exchange and keeps the comparison ordinal', () => {
    const steps = generateBubbleSortSteps([3, 1, 2])
    const frames = toVisualFrames(steps)
    const swapCount = steps.filter((step) => step.swappedValues !== null).length

    expect(frames).toHaveLength(steps.length + swapCount)
    expect(frames.map((frame) => frame.comparison)).toEqual([1, 1, 2, 2, 3, 3])
  })

  it('shows the swap counter only once the exchange happened', () => {
    const frames = toVisualFrames(generateBubbleSortSteps([2, 1]))

    expect(frames[0]).toMatchObject({ kind: 'compare', swaps: 0 })
    expect(frames[1]).toMatchObject({ kind: 'swap', swaps: 1 })
  })

  it('marks the final frame as done with a fully sorted region', () => {
    const frames = toVisualFrames(generateBubbleSortSteps([3, 1, 2]))
    const last = frames[frames.length - 1]

    expect(last).toMatchObject({ kind: 'done', comparing: null, sortedFrom: 0 })
    expect(last.values).toEqual([1, 2, 3])
  })
})

describe('frameMovement', () => {
  it('classifies moving forward into the swap phase as exchange', () => {
    const frames = toVisualFrames(generateBubbleSortSteps([2, 1]))

    expect(frameMovement(frames[0], frames[1])).toBe('exchange')
  })

  it('classifies moving back from the swap phase as rewind', () => {
    const frames = toVisualFrames(generateBubbleSortSteps([2, 1]))

    expect(frameMovement(frames[1], frames[0])).toBe('rewind')
  })

  it('does not animate between different comparisons', () => {
    const frames = toVisualFrames(generateBubbleSortSteps([3, 1, 2]))

    // swap of comparison 1 -> compare of comparison 2
    expect(frameMovement(frames[1], frames[2])).toBe('none')
    // last comparison -> done
    expect(
      frameMovement(frames[frames.length - 2], frames[frames.length - 1]),
    ).toBe('none')
  })

  it('returns none for the same frame', () => {
    const frames = toVisualFrames(generateBubbleSortSteps([2, 1]))

    expect(frameMovement(frames[0], frames[0])).toBe('none')
  })

  it('has one edge per exchange in each direction', () => {
    const input = [5, 1, 4, 2, 8]
    const steps = generateBubbleSortSteps(input)
    const frames = toVisualFrames(steps)
    const swaps = steps[steps.length - 1].swaps
    let exchanges = 0
    let rewinds = 0

    for (let i = 1; i < frames.length; i++) {
      if (frameMovement(frames[i - 1], frames[i]) === 'exchange') {
        exchanges++
      }
      if (frameMovement(frames[i], frames[i - 1]) === 'rewind') {
        rewinds++
      }
    }

    expect(exchanges).toBe(swaps)
    expect(rewinds).toBe(swaps)
  })
})
