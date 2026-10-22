import { describe, expect, it } from 'vitest'
import { generateSequentialSearchSteps } from './sequentialSearch'
import type { SequentialSearchStep } from './sequentialSearch'
import { createReadyFrame, toVisualFrames, scrollAnchor } from './visualFrames'

// Unsorted: the frame layer must not assume any ordering either.
const VALUES = [4, 9, 2, 11, 6, 14, 1, 8]

function probes(steps: SequentialSearchStep[]): SequentialSearchStep[] {
  return steps.filter((step) => step.kind === 'probe')
}

describe('createReadyFrame', () => {
  it('places the cursor at the start before the first comparison', () => {
    expect(createReadyFrame(11)).toEqual({
      kind: 'ready',
      key: 11,
      index: 0,
      outcome: null,
      comparisons: 0,
    })
  })
})

describe('toVisualFrames', () => {
  it('produces a single notFound frame for an empty array', () => {
    const frames = toVisualFrames(generateSequentialSearchSteps([], 5))

    expect(frames).toEqual([
      {
        kind: 'notFound',
        key: 5,
        index: 0,
        outcome: null,
        comparisons: 0,
      },
    ])
  })

  it('expands a successful first probe into a probe and a found frame', () => {
    const frames = toVisualFrames(generateSequentialSearchSteps([7], 7))

    expect(frames.map((frame) => frame.kind)).toEqual(['probe', 'found'])
    expect(frames[0]).toMatchObject({
      index: 0,
      outcome: 'equal',
      comparisons: 1,
    })
    expect(frames[1]).toMatchObject({ index: 0, comparisons: 1 })
  })

  it('expands a mismatched probe into a probe and an advance frame', () => {
    const frames = toVisualFrames(generateSequentialSearchSteps([7], 3))

    expect(frames.map((frame) => frame.kind)).toEqual([
      'probe',
      'advance',
      'notFound',
    ])
    expect(frames[0]).toMatchObject({
      index: 0,
      outcome: 'notEqual',
      comparisons: 1,
    })
    expect(frames[1]).toMatchObject({ index: 1, outcome: 'notEqual' })
    expect(frames[2]).toMatchObject({ index: 1, comparisons: 1 })
  })

  it('advances the cursor one position after every mismatch', () => {
    const frames = toVisualFrames(generateSequentialSearchSteps(VALUES, 1))

    expect(frames.map((frame) => frame.kind)).toEqual([
      'probe',
      'advance',
      'probe',
      'advance',
      'probe',
      'advance',
      'probe',
      'advance',
      'probe',
      'advance',
      'probe',
      'advance',
      'probe',
      'found',
    ])
    expect(frames[1]).toMatchObject({ kind: 'advance', index: 1 })
    expect(frames[3]).toMatchObject({ kind: 'advance', index: 2 })
    expect(frames.at(-2)).toMatchObject({ kind: 'probe', index: 6 })
    expect(frames.at(-1)).toMatchObject({ kind: 'found', index: 6 })
  })

  it('ends a failed search with one notFound frame past the last position', () => {
    const frames = toVisualFrames(generateSequentialSearchSteps(VALUES, 3))

    expect(frames.at(-1)).toMatchObject({
      kind: 'notFound',
      index: VALUES.length,
      comparisons: VALUES.length,
    })
  })

  it('produces two frames per probe plus one for a failed search', () => {
    for (const key of [4, 8, 1, 3, 100]) {
      const steps = generateSequentialSearchSteps(VALUES, key)
      const frames = toVisualFrames(steps)
      const failed = steps.at(-1)?.kind === 'notFound' ? 1 : 0

      expect(frames).toHaveLength(2 * probes(steps).length + failed)
    }
  })

  it('only marks the final successful frame as found', () => {
    const frames = toVisualFrames(generateSequentialSearchSteps(VALUES, 6))
    const found = frames.filter((frame) => frame.kind === 'found')

    expect(found).toHaveLength(1)
    expect(frames.indexOf(found[0])).toBe(frames.length - 1)
  })

  it('keeps the key on every frame', () => {
    const frames = toVisualFrames(generateSequentialSearchSteps(VALUES, 6))

    expect(frames.every((frame) => frame.key === 6)).toBe(true)
  })
})

describe('scrollAnchor', () => {
  it('anchors on the cursor while the search runs', () => {
    expect(scrollAnchor(createReadyFrame(6))).toBe(0)

    const running = toVisualFrames(generateSequentialSearchSteps(VALUES, 3))
    expect(scrollAnchor(running[0])).toBe(0)
    expect(scrollAnchor(running[1])).toBe(1)

    const found = toVisualFrames(generateSequentialSearchSteps(VALUES, 6))
    expect(scrollAnchor(found.at(-1)!)).toBe(4)
  })

  it('anchors nowhere once every position was checked', () => {
    const frames = toVisualFrames(generateSequentialSearchSteps(VALUES, 3))

    expect(frames.at(-1)?.kind).toBe('notFound')
    expect(scrollAnchor(frames.at(-1)!)).toBeNull()
  })
})
