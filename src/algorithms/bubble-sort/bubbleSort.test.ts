import { describe, expect, it } from 'vitest'
import { createRandomArray, generateBubbleSortSteps } from './bubbleSort'

function sorted(values: number[]): number[] {
  return [...values].sort((a, b) => a - b)
}

describe('generateBubbleSortSteps', () => {
  it('produces a single finished step for an empty array', () => {
    const steps = generateBubbleSortSteps([])

    expect(steps).toHaveLength(1)
    expect(steps[0]).toMatchObject({
      values: [],
      comparing: null,
      sortedFrom: 0,
      comparisons: 0,
      swaps: 0,
      finished: true,
    })
  })

  it('produces a single finished step for a single element', () => {
    const steps = generateBubbleSortSteps([7])

    expect(steps).toHaveLength(1)
    expect(steps[0].values).toEqual([7])
    expect(steps[0].finished).toBe(true)
  })

  it('sorts the array and tracks exact comparison and swap counts', () => {
    const steps = generateBubbleSortSteps([3, 1, 2])
    const last = steps[steps.length - 1]

    expect(last.values).toEqual([1, 2, 3])
    expect(last.comparisons).toBe(3)
    expect(last.swaps).toBe(2)
    expect(last.comparing).toBeNull()
    expect(last.sortedFrom).toBe(0)
    expect(last.finished).toBe(true)
  })

  it('stops early when the array is already sorted', () => {
    const steps = generateBubbleSortSteps([1, 2, 3])
    const last = steps[steps.length - 1]

    expect(last.comparisons).toBe(2)
    expect(last.swaps).toBe(0)
    // One comparison step per adjacent pair, plus the final step.
    expect(steps).toHaveLength(3)
  })

  it('handles the reversed worst case', () => {
    const steps = generateBubbleSortSteps([3, 2, 1])
    const last = steps[steps.length - 1]

    expect(last.values).toEqual([1, 2, 3])
    expect(last.comparisons).toBe(3)
    expect(last.swaps).toBe(3)
  })

  it('does not swap equal elements', () => {
    const steps = generateBubbleSortSteps([2, 2])

    expect(steps[0].comparing).toEqual([0, 1])
    expect(steps[0].swapped).toBe(false)
    expect(steps[steps.length - 1].values).toEqual([2, 2])
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

  it('stores an independent snapshot for every step', () => {
    const steps = generateBubbleSortSteps([2, 1])

    expect(steps).toHaveLength(2)
    expect(steps[0].values).toEqual([1, 2])
    expect(steps[0].values).not.toBe(steps[1].values)
    expect(steps[0]).toMatchObject({
      comparing: [0, 1],
      swapped: true,
      pass: 1,
      comparisons: 1,
      swaps: 1,
      finished: false,
    })
    expect(steps[1].finished).toBe(true)
  })

  it('only marks the final step as finished', () => {
    const steps = generateBubbleSortSteps([5, 1, 4, 2, 8])
    const last = steps[steps.length - 1]

    expect(last.finished).toBe(true)
    expect(steps.slice(0, -1).every((step) => !step.finished)).toBe(true)
    expect(last.values).toEqual([1, 2, 4, 5, 8])
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
