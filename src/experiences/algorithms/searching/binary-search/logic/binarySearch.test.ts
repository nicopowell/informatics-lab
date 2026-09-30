import { describe, expect, it } from 'vitest'
import { createSortedArray, generateBinarySearchSteps } from './binarySearch'
import type { BinarySearchStep } from './binarySearch'

const VALUES = [1, 3, 5, 7, 9, 11, 13, 15]

function probes(steps: BinarySearchStep[]): BinarySearchStep[] {
  return steps.filter((step) => step.kind === 'probe')
}

describe('generateBinarySearchSteps', () => {
  it('reports not found immediately for an empty array', () => {
    const steps = generateBinarySearchSteps([], 5)

    expect(steps).toHaveLength(1)
    expect(steps[0]).toMatchObject({
      kind: 'notFound',
      key: 5,
      low: 0,
      high: -1,
      mid: null,
      outcome: null,
      comparisons: 0,
      nextLow: null,
      nextHigh: null,
    })
  })

  it('finds the only element of a single-element array', () => {
    const steps = generateBinarySearchSteps([7], 7)

    expect(steps).toHaveLength(1)
    expect(steps[0]).toMatchObject({
      kind: 'probe',
      outcome: 'equal',
      low: 0,
      high: 0,
      mid: 0,
      comparisons: 1,
    })
  })

  it('exhausts a single-element array when the key is below it', () => {
    const steps = generateBinarySearchSteps([7], 3)

    expect(steps.map((step) => step.kind)).toEqual(['probe', 'notFound'])
    expect(steps[0]).toMatchObject({
      outcome: 'greater',
      mid: 0,
      nextLow: 0,
      nextHigh: -1,
    })
    expect(steps[1]).toMatchObject({ low: 0, high: -1, comparisons: 1 })
  })

  it('exhausts a single-element array when the key is above it', () => {
    const steps = generateBinarySearchSteps([7], 10)

    expect(steps.map((step) => step.kind)).toEqual(['probe', 'notFound'])
    expect(steps[0]).toMatchObject({
      outcome: 'less',
      nextLow: 1,
      nextHigh: 0,
    })
    expect(steps[1]).toMatchObject({ low: 1, high: 0, comparisons: 1 })
  })

  it('finds the first, middle, and last element at the expected index', () => {
    const expectedMidByKey = new Map([
      [1, 0],
      [9, 4],
      [15, 7],
    ])

    for (const [key, expectedMid] of expectedMidByKey) {
      const last = generateBinarySearchSteps(VALUES, key).at(-1)

      expect(last).toMatchObject({
        kind: 'probe',
        outcome: 'equal',
        mid: expectedMid,
      })
    }
  })

  it('narrows the interval by probing the midpoint of the range', () => {
    const steps = generateBinarySearchSteps(VALUES, 11)

    expect(steps).toHaveLength(2)
    expect(steps[0]).toMatchObject({
      low: 0,
      high: 7,
      mid: 3,
      outcome: 'less',
      comparisons: 1,
      nextLow: 4,
      nextHigh: 7,
    })
    expect(steps[1]).toMatchObject({
      low: 4,
      high: 7,
      mid: 5,
      outcome: 'equal',
      comparisons: 2,
    })
  })

  it('reports not found for a key below the whole array', () => {
    const steps = generateBinarySearchSteps(VALUES, 0)

    expect(steps.map((step) => step.mid)).toEqual([3, 1, 0, null])
    expect(steps.map((step) => step.outcome)).toEqual([
      'greater',
      'greater',
      'greater',
      null,
    ])
    expect(steps.at(-1)).toMatchObject({
      kind: 'notFound',
      low: 0,
      high: -1,
      comparisons: 3,
    })
  })

  it('reports not found for a key above the whole array', () => {
    const steps = generateBinarySearchSteps(VALUES, 100)

    expect(steps.map((step) => step.mid)).toEqual([3, 5, 6, 7, null])
    expect(steps.at(-1)).toMatchObject({
      kind: 'notFound',
      low: 8,
      high: 7,
      comparisons: 4,
    })
  })

  it('reports not found for a key missing in a gap', () => {
    const steps = generateBinarySearchSteps(VALUES, 8)

    expect(steps.at(-1)).toMatchObject({
      kind: 'notFound',
      low: 4,
      high: 3,
      comparisons: 3,
    })
  })

  it('counts one comparison per probe and carries the running total', () => {
    for (const key of [1, 8, 15, 0, 100]) {
      const steps = generateBinarySearchSteps(VALUES, key)

      expect(probes(steps).map((step) => step.comparisons)).toEqual(
        probes(steps).map((_, index) => index + 1),
      )
      expect(steps.at(-1)?.comparisons).toBe(probes(steps).length)
    }
  })

  it('probes only inside the array and never an empty interval', () => {
    for (const values of [[], [5], [1, 2, 3], VALUES]) {
      for (const key of Array.from({ length: 22 }, (_, index) => index - 2)) {
        for (const step of probes(generateBinarySearchSteps(values, key))) {
          if (step.mid === null) throw new Error('a probe must have a mid')
          expect(step.low).toBeGreaterThanOrEqual(0)
          expect(step.low).toBeLessThanOrEqual(step.high)
          expect(step.high).toBeLessThanOrEqual(values.length - 1)
          expect(step.mid).toBeGreaterThanOrEqual(step.low)
          expect(step.mid).toBeLessThanOrEqual(step.high)
        }
      }
    }
  })

  it('always terminates with an equal probe or a notFound step', () => {
    for (const values of [[], [5], [1, 2, 3], VALUES]) {
      for (const key of Array.from({ length: 22 }, (_, index) => index - 2)) {
        const steps = generateBinarySearchSteps(values, key)
        const last = steps.at(-1)
        const found = probes(steps).some((step) => step.outcome === 'equal')

        if (found) {
          expect(last).toMatchObject({ kind: 'probe', outcome: 'equal' })
        } else {
          expect(last?.kind).toBe('notFound')
        }
      }
    }
  })

  it('finds the key exactly when it is present', () => {
    const values = [2, 4, 6, 8, 10]

    for (const key of Array.from({ length: 13 }, (_, index) => index)) {
      const steps = generateBinarySearchSteps(values, key)
      const found = probes(steps).find((step) => step.outcome === 'equal')

      if (values.includes(key)) {
        expect(found).toBeDefined()
        if (found?.mid == null) throw new Error('expected a probed index')
        expect(values[found.mid]).toBe(key)
      } else {
        expect(found).toBeUndefined()
        expect(steps.at(-1)?.kind).toBe('notFound')
      }
    }
  })

  it('does not mutate the input array', () => {
    const input = [3, 1, 2]

    generateBinarySearchSteps(input, 2)

    expect(input).toEqual([3, 1, 2])
  })
})

describe('createSortedArray', () => {
  it('returns the requested number of distinct ascending values', () => {
    const values = createSortedArray(16)

    expect(values).toHaveLength(16)
    for (let i = 1; i < values.length; i++) {
      expect(values[i]).toBeGreaterThan(values[i - 1])
    }
  })

  it('returns integers within the generated range', () => {
    for (const value of createSortedArray(10)) {
      expect(Number.isInteger(value)).toBe(true)
      expect(value).toBeGreaterThanOrEqual(1)
      expect(value).toBeLessThanOrEqual(99)
    }
  })

  it('returns an empty array when no values are requested', () => {
    expect(createSortedArray(0)).toEqual([])
  })
})
