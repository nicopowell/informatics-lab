import { describe, expect, it } from 'vitest'
import { generateBinarySearchSteps } from './binarySearch'
import type { BinarySearchStep } from './binarySearch'
import { createReadyFrame, toVisualFrames } from './visualFrames'

const VALUES = [1, 3, 5, 7, 9, 11, 13, 15]

function probes(steps: BinarySearchStep[]): BinarySearchStep[] {
  return steps.filter((step) => step.kind === 'probe')
}

describe('createReadyFrame', () => {
  it('covers the whole array before the first comparison', () => {
    expect(createReadyFrame(8, 11)).toEqual({
      kind: 'ready',
      key: 11,
      low: 0,
      high: 7,
      mid: null,
      outcome: null,
      comparisons: 0,
    })
  })

  it('represents an empty array with an empty interval', () => {
    expect(createReadyFrame(0, 5)).toMatchObject({ low: 0, high: -1 })
  })
})

describe('toVisualFrames', () => {
  it('produces a single notFound frame for an empty array', () => {
    const frames = toVisualFrames(generateBinarySearchSteps([], 5))

    expect(frames).toEqual([
      {
        kind: 'notFound',
        key: 5,
        low: 0,
        high: -1,
        mid: null,
        outcome: null,
        comparisons: 0,
      },
    ])
  })

  it('expands a successful probe into a probe and a found frame', () => {
    const frames = toVisualFrames(generateBinarySearchSteps([7], 7))

    expect(frames.map((frame) => frame.kind)).toEqual(['probe', 'found'])
    expect(frames[0]).toMatchObject({ low: 0, high: 0, mid: 0, outcome: 'equal' })
    expect(frames[1]).toMatchObject({ low: 0, high: 0, mid: 0, outcome: 'equal' })
  })

  it('expands a discarded half into a probe and an eliminate frame', () => {
    const frames = toVisualFrames(generateBinarySearchSteps([7], 3))

    expect(frames.map((frame) => frame.kind)).toEqual([
      'probe',
      'eliminate',
      'notFound',
    ])
    expect(frames[0]).toMatchObject({
      low: 0,
      high: 0,
      mid: 0,
      outcome: 'greater',
      comparisons: 1,
    })
    expect(frames[1]).toMatchObject({
      low: 0,
      high: -1,
      mid: null,
      outcome: 'greater',
      comparisons: 1,
    })
  })

  it('moves the interval to the surviving half after eliminating', () => {
    const frames = toVisualFrames(generateBinarySearchSteps(VALUES, 11))

    expect(frames.map((frame) => frame.kind)).toEqual([
      'probe',
      'eliminate',
      'probe',
      'found',
    ])
    expect(frames[0]).toMatchObject({
      low: 0,
      high: 7,
      mid: 3,
      outcome: 'less',
      comparisons: 1,
    })
    expect(frames[1]).toMatchObject({
      low: 4,
      high: 7,
      mid: null,
      outcome: 'less',
      comparisons: 1,
    })
    expect(frames[2]).toMatchObject({
      low: 4,
      high: 7,
      mid: 5,
      outcome: 'equal',
      comparisons: 2,
    })
    expect(frames[3]).toMatchObject({ kind: 'found', mid: 5, comparisons: 2 })
  })

  it('alternates probe and eliminate until the interval is empty', () => {
    const frames = toVisualFrames(generateBinarySearchSteps(VALUES, 8))

    expect(frames.map((frame) => frame.kind)).toEqual([
      'probe',
      'eliminate',
      'probe',
      'eliminate',
      'probe',
      'eliminate',
      'notFound',
    ])
    expect(frames.at(-1)).toMatchObject({
      kind: 'notFound',
      low: 4,
      high: 3,
      mid: null,
      comparisons: 3,
    })
  })

  it('produces two frames per probe plus one for a failed search', () => {
    for (const key of [1, 8, 11, 0, 100]) {
      const steps = generateBinarySearchSteps(VALUES, key)
      const frames = toVisualFrames(steps)
      const failed = steps.at(-1)?.kind === 'notFound' ? 1 : 0

      expect(frames).toHaveLength(2 * probes(steps).length + failed)
    }
  })

  it('only marks the final successful frame as found', () => {
    const frames = toVisualFrames(generateBinarySearchSteps(VALUES, 11))
    const found = frames.filter((frame) => frame.kind === 'found')

    expect(found).toHaveLength(1)
    expect(frames.indexOf(found[0])).toBe(frames.length - 1)
  })

  it('keeps the key on every frame', () => {
    const frames = toVisualFrames(generateBinarySearchSteps(VALUES, 11))

    expect(frames.every((frame) => frame.key === 11)).toBe(true)
  })
})
