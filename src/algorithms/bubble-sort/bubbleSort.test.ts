import { describe, expect, it } from 'vitest'
import { createRandomArray, generateBubbleSortSteps } from './bubbleSort'

function sorted(values: number[]): number[] {
  return [...values].sort((a, b) => a - b)
}

describe('generateBubbleSortSteps', () => {
  it('produces a single done step for an empty array', () => {
    const steps = generateBubbleSortSteps([])

    expect(steps).toHaveLength(1)
    expect(steps[0]).toMatchObject({
      kind: 'done',
      comparison: 0,
      values: [],
      swappedValues: null,
      comparing: null,
      sortedFrom: 0,
      swaps: 0,
    })
  })

  it('produces a single done step for a single element', () => {
    const steps = generateBubbleSortSteps([7])

    expect(steps).toHaveLength(1)
    expect(steps[0].kind).toBe('done')
    expect(steps[0].values).toEqual([7])
  })

  it('represents one comparison with the state before and after the swap', () => {
    const steps = generateBubbleSortSteps([2, 1])

    expect(steps).toHaveLength(2)
    expect(steps[0]).toMatchObject({
      kind: 'compare',
      comparison: 1,
      values: [2, 1],
      swappedValues: [1, 2],
      comparing: [0, 1],
      swaps: 1,
    })
    expect(steps[1]).toMatchObject({
      kind: 'done',
      comparison: 1,
      values: [1, 2],
    })
  })

  it('keeps swappedValues null when no exchange is needed', () => {
    const steps = generateBubbleSortSteps([1, 2])

    expect(steps).toHaveLength(2)
    expect(steps[0].swappedValues).toBeNull()
    expect(steps[0].swaps).toBe(0)
  })

  it('counts comparisons rather than visual phases', () => {
    const steps = generateBubbleSortSteps([3, 1, 2])
    const done = steps[steps.length - 1]

    expect(steps.map((step) => step.kind)).toEqual([
      'compare',
      'compare',
      'compare',
      'done',
    ])
    expect(done.comparison).toBe(3)
    expect(done.swaps).toBe(2)
    expect(done.values).toEqual([1, 2, 3])
  })

  it('stops early when the array is already sorted', () => {
    const steps = generateBubbleSortSteps([1, 2, 3])
    const done = steps[steps.length - 1]

    expect(steps).toHaveLength(3)
    expect(done.comparison).toBe(2)
    expect(done.swaps).toBe(0)
  })

  it('handles the reversed worst case', () => {
    const steps = generateBubbleSortSteps([3, 2, 1])
    const done = steps[steps.length - 1]

    expect(steps).toHaveLength(4)
    expect(done.values).toEqual([1, 2, 3])
    expect(done.comparison).toBe(3)
    expect(done.swaps).toBe(3)
  })

  it('does not swap equal elements', () => {
    const steps = generateBubbleSortSteps([2, 2])

    expect(steps.map((step) => step.kind)).toEqual(['compare', 'done'])
    expect(steps[0].comparing).toEqual([0, 1])
    expect(steps[0].swappedValues).toBeNull()
  })

  it('sorts arrays with duplicate values', () => {
    const input = [4, 2, 4, 1, 2]
    const steps = generateBubbleSortSteps(input)

    expect(steps[steps.length - 1].values).toEqual(sorted(input))
  })

  it('does not mutate the input array', () => {
    const input = [3, 1, 2]

    generateBubbleSortSteps(input)

    expect(input).toEqual([3, 1, 2])
  })

  it('continues from the state left by the previous comparison', () => {
    const inputs = [
      [5, 1, 4, 2, 8],
      [3, 1, 2],
      [3, 2, 1],
      [2, 1, 3, 1, 2],
    ]

    for (const input of inputs) {
      const steps = generateBubbleSortSteps(input)
      for (let i = 0; i < steps.length - 1; i++) {
        const carried = steps[i].swappedValues ?? steps[i].values
        expect(steps[i + 1].values).toEqual(carried)
      }
    }
  })

  it('only marks the final step as done', () => {
    const steps = generateBubbleSortSteps([5, 1, 4, 2, 8])

    expect(steps[steps.length - 1].kind).toBe('done')
    expect(steps.slice(0, -1).every((step) => step.kind === 'compare')).toBe(true)
  })

  it('stores independent snapshots', () => {
    const steps = generateBubbleSortSteps([2, 1])

    expect(steps[0].values).not.toBe(steps[0].swappedValues)
    expect(steps[0].values).not.toBe(steps[1].values)
  })

  it('tracks the sorted region and the pass number', () => {
    const steps = generateBubbleSortSteps([3, 1, 2])

    expect(steps[0]).toMatchObject({ pass: 1, sortedFrom: 3 })
    expect(steps[2]).toMatchObject({ pass: 2, sortedFrom: 2 })
  })

  it('ends sorted for varied inputs', () => {
    const inputs = [
      [5, 1, 4, 2, 8],
      [9, 8, 7, 6, 5, 4],
      [1],
      [],
      [3, 3, 3],
      [2, 1, 3, 1, 2],
    ]

    for (const input of inputs) {
      const steps = generateBubbleSortSteps(input)
      expect(steps[steps.length - 1].values).toEqual(sorted(input))
    }
  })
})

describe('createRandomArray', () => {
  it('returns the requested length with integer values in range', () => {
    const values = createRandomArray(20)

    expect(values).toHaveLength(20)
    for (const value of values) {
      expect(Number.isInteger(value)).toBe(true)
      expect(value).toBeGreaterThanOrEqual(1)
      expect(value).toBeLessThanOrEqual(99)
    }
  })
})
