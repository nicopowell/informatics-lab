import { describe, expect, it } from 'vitest'
import {
  createRandomArray,
  generateSequentialSearchSteps,
} from './sequentialSearch'
import type { SequentialSearchStep } from './sequentialSearch'

// Unsorted on purpose: unlike binary search, sequential search makes no
// assumption about the order of the data.
const VALUES = [4, 9, 2, 11, 6, 14, 1, 8]

function probes(steps: SequentialSearchStep[]): SequentialSearchStep[] {
  return steps.filter((step) => step.kind === 'probe')
}

describe('generateSequentialSearchSteps', () => {
  it('reports not found immediately for an empty array', () => {
    const steps = generateSequentialSearchSteps([], 5)

    expect(steps).toHaveLength(1)
    expect(steps[0]).toMatchObject({
      kind: 'notFound',
      key: 5,
      index: 0,
      outcome: null,
      comparisons: 0,
      nextIndex: null,
    })
  })

  it('finds the only element of a single-element array', () => {
    const steps = generateSequentialSearchSteps([7], 7)

    expect(steps).toHaveLength(1)
    expect(steps[0]).toMatchObject({
      kind: 'probe',
      index: 0,
      outcome: 'equal',
      comparisons: 1,
      nextIndex: null,
    })
  })

  it('exhausts a single-element array when the key differs', () => {
    const steps = generateSequentialSearchSteps([7], 3)

    expect(steps.map((step) => step.kind)).toEqual(['probe', 'notFound'])
    expect(steps[0]).toMatchObject({
      index: 0,
      outcome: 'notEqual',
      comparisons: 1,
      nextIndex: 1,
    })
    expect(steps[1]).toMatchObject({
      kind: 'notFound',
      index: 1,
      comparisons: 1,
    })
  })

  it('finds the key in an unsorted array without reordering it', () => {
    const steps = generateSequentialSearchSteps(VALUES, 6)
    const last = steps.at(-1)

    expect(last).toMatchObject({ kind: 'probe', index: 4, outcome: 'equal' })
    expect(VALUES).toEqual([4, 9, 2, 11, 6, 14, 1, 8])
  })

  it('stops at the first element when it matches', () => {
    const steps = generateSequentialSearchSteps(VALUES, 4)

    expect(steps).toHaveLength(1)
    expect(steps[0]).toMatchObject({
      kind: 'probe',
      index: 0,
      outcome: 'equal',
      comparisons: 1,
    })
  })

  it('needs one comparison per position up to the last element', () => {
    const steps = generateSequentialSearchSteps(VALUES, 8)

    expect(steps).toHaveLength(VALUES.length)
    expect(steps.at(-1)).toMatchObject({
      kind: 'probe',
      index: VALUES.length - 1,
      outcome: 'equal',
      comparisons: VALUES.length,
    })
  })

  it('probes positions in order from the start', () => {
    const steps = generateSequentialSearchSteps(VALUES, 1)

    expect(steps.map((step) => step.index)).toEqual([0, 1, 2, 3, 4, 5, 6])
  })

  it('reports not found only after every position was checked', () => {
    const steps = generateSequentialSearchSteps(VALUES, 3)

    expect(steps.map((step) => step.kind)).toEqual([
      'probe',
      'probe',
      'probe',
      'probe',
      'probe',
      'probe',
      'probe',
      'probe',
      'notFound',
    ])
    expect(steps.at(-1)).toMatchObject({
      index: VALUES.length,
      comparisons: VALUES.length,
    })
  })

  it('counts one comparison per probe and carries the running total', () => {
    for (const key of [4, 8, 1, 3, 100]) {
      const steps = generateSequentialSearchSteps(VALUES, key)

      expect(probes(steps).map((step) => step.comparisons)).toEqual(
        probes(steps).map((_, index) => index + 1),
      )
      expect(steps.at(-1)?.comparisons).toBe(probes(steps).length)
    }
  })

  it('always terminates with an equal probe or a notFound step', () => {
    for (const values of [[], [5], [1, 2, 3], VALUES]) {
      for (const key of Array.from({ length: 22 }, (_, index) => index - 2)) {
        const steps = generateSequentialSearchSteps(values, key)
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
    for (const key of Array.from({ length: 22 }, (_, index) => index - 2)) {
      const steps = generateSequentialSearchSteps(VALUES, key)
      const found = probes(steps).find((step) => step.outcome === 'equal')

      if (VALUES.includes(key)) {
        expect(found).toBeDefined()
        if (found?.index == null) throw new Error('expected a probed index')
        expect(VALUES[found.index]).toBe(key)
      } else {
        expect(found).toBeUndefined()
        expect(steps.at(-1)?.kind).toBe('notFound')
      }
    }
  })

  it('does not mutate the input array', () => {
    const input = [3, 1, 2]

    generateSequentialSearchSteps(input, 2)

    expect(input).toEqual([3, 1, 2])
  })
})

describe('createRandomArray', () => {
  it('returns the requested number of distinct values', () => {
    const values = createRandomArray(16)

    expect(values).toHaveLength(16)
    expect(new Set(values).size).toBe(16)
  })

  it('returns integers within the generated range', () => {
    for (const value of createRandomArray(10)) {
      expect(Number.isInteger(value)).toBe(true)
      expect(value).toBeGreaterThanOrEqual(1)
      expect(value).toBeLessThanOrEqual(99)
    }
  })

  it('returns an empty array when no values are requested', () => {
    expect(createRandomArray(0)).toEqual([])
  })
})
