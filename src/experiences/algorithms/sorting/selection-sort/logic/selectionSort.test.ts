import { describe, expect, it } from 'vitest'
import { createRandomArray, generateSelectionSortSteps } from './selectionSort'

function sorted(values: number[]): number[] {
  return [...values].sort((a, b) => a - b)
}

function totals(values: number[]) {
  const steps = generateSelectionSortSteps(values)
  const done = steps[steps.length - 1]

  return {
    comparisons: done.comparison,
    swaps: done.swaps,
    passes: done.pass,
    kinds: steps.map((step) => step.kind),
  }
}

function selectSteps(values: number[]) {
  return generateSelectionSortSteps(values).filter((step) => step.kind === 'select')
}

describe('generateSelectionSortSteps', () => {
  // The headline of the whole experience: selection sort has no early exit, so
  // the comparison count is n(n-1)/2 for *every* input shape. Bubble sort's
  // early exit is what this counter is being compared against.
  it('performs n(n-1)/2 comparisons on every shape, sorted or not', () => {
    const shapes = [
      [1, 2, 3, 4],
      [4, 3, 2, 1],
      [2, 4, 1, 3],
      [4, 4, 4, 4],
    ]

    for (const shape of shapes) {
      expect(totals(shape).comparisons).toBe(6)
    }
  })

  it('stays at n(n-1)/2 comparisons on the already-sorted best case', () => {
    const steps = generateSelectionSortSteps([1, 2, 3, 4, 5])
    const done = steps[steps.length - 1]

    expect(done.comparison).toBe(10)
    expect(done.swaps).toBe(0)
    expect(done.values).toEqual([1, 2, 3, 4, 5])
  })

  // The beat that makes the two algorithms look different on screen: every pass
  // ends by naming its minimum, and only then may it write. A no-write pass
  // still names it, so the scan never seems to vanish.
  it('closes every pass with exactly one select step, written or not', () => {
    const writes = selectSteps([5, 4, 3, 2, 1])

    expect(writes).toHaveLength(4)
    expect(writes.map((step) => step.pass)).toEqual([1, 2, 3, 4])
    expect(writes.filter((step) => step.exchangedValues !== null)).toHaveLength(2)
    expect(writes.filter((step) => step.exchangedValues === null)).toHaveLength(2)
  })

  // The other half of the trade: at most n-1 swaps, one per pass, and fewer
  // than that when a pass finds its minimum already in place.
  it('exchanges at most once per pass, so the reversed case swaps less than bubble sort', () => {
    const steps = generateSelectionSortSteps([5, 4, 3, 2, 1])

    expect(steps.filter((step) => step.exchangedValues !== null)).toHaveLength(2)
    expect(steps[steps.length - 1].swaps).toBe(2)
    expect(steps[steps.length - 1].comparison).toBe(10)
  })

  it('produces the full step trace for a three element array', () => {
    const steps = generateSelectionSortSteps([3, 1, 2])

    expect(steps.map((step) => step.kind)).toEqual([
      'compare',
      'compare',
      'select',
      'compare',
      'select',
      'done',
    ])
    expect(steps[0]).toMatchObject({
      comparison: 1,
      values: [3, 1, 2],
      comparing: [1, 0],
      minIndex: 0,
      sortedUpTo: 0,
      pass: 1,
      swaps: 0,
    })
    expect(steps[2]).toMatchObject({
      kind: 'select',
      comparison: 2,
      values: [3, 1, 2],
      exchangedValues: [1, 3, 2],
      comparing: [0, 1],
      minIndex: 1,
      sortedUpTo: 0,
      pass: 1,
      swaps: 1,
    })
    expect(steps[5]).toMatchObject({
      kind: 'done',
      comparison: 3,
      values: [1, 2, 3],
      exchangedValues: null,
      comparing: null,
      minIndex: null,
      sortedUpTo: 3,
      pass: 2,
      swaps: 2,
    })
  })

  it('moves the running minimum while the scan advances', () => {
    const steps = generateSelectionSortSteps([3, 1, 2])

    // The first comparison holds against index 0; the minimum moves to index 1
    // as a result, so the second comparison is framed against index 1.
    expect(steps[0].comparing).toEqual([1, 0])
    expect(steps[1].comparing).toEqual([2, 1])
  })

  it('names a non-adjacent minimum, which no adjacent-pair sort produces', () => {
    const steps = generateSelectionSortSteps([5, 4, 3, 2, 1])
    const firstWrite = steps.find((step) => step.exchangedValues !== null)

    expect(firstWrite?.kind).toBe('select')
    expect(firstWrite?.comparing).toEqual([0, 4])
    expect(firstWrite?.exchangedValues).toEqual([1, 4, 3, 2, 5])
  })

  it('frames a no-write pass as the slot against itself, and writes nothing', () => {
    const steps = generateSelectionSortSteps([1, 2])

    expect(steps.map((step) => step.kind)).toEqual(['compare', 'select', 'done'])
    expect(steps[1]).toMatchObject({
      comparing: [0, 0],
      minIndex: 0,
      exchangedValues: null,
      swaps: 0,
    })
    expect(steps[steps.length - 1].swaps).toBe(0)
  })

  it('grows the finalized region from the left, one slot per pass', () => {
    const steps = generateSelectionSortSteps([3, 1, 2])

    expect(steps[0]).toMatchObject({ pass: 1, sortedUpTo: 0 })
    expect(steps[3]).toMatchObject({ pass: 2, sortedUpTo: 1 })
    expect(selectSteps([3, 1, 2]).map((step) => step.sortedUpTo)).toEqual([0, 1])
  })

  it('treats equal values as no new minimum', () => {
    const steps = generateSelectionSortSteps([2, 2, 1])
    const [first, second] = steps

    expect(first.comparing).toEqual([1, 0])
    expect(second.comparing).toEqual([2, 0])
    expect(steps[steps.length - 1].values).toEqual([1, 2, 2])
    expect(steps[steps.length - 1].swaps).toBe(1)
  })

  it('produces a single done step for an empty array', () => {
    const steps = generateSelectionSortSteps([])

    expect(steps).toHaveLength(1)
    expect(steps[0]).toMatchObject({
      kind: 'done',
      comparison: 0,
      values: [],
      exchangedValues: null,
      comparing: null,
      minIndex: null,
      sortedUpTo: 0,
      pass: 0,
      swaps: 0,
    })
  })

  it('produces a single done step for a single element', () => {
    const steps = generateSelectionSortSteps([7])

    expect(steps).toHaveLength(1)
    expect(steps[0].kind).toBe('done')
    expect(steps[0].values).toEqual([7])
    expect(steps[0].pass).toBe(0)
    expect(steps[0].sortedUpTo).toBe(1)
  })

  it('runs n-1 passes and reports the last one on the done step', () => {
    expect(generateSelectionSortSteps([4, 1, 3, 2])[3]).toMatchObject({
      kind: 'select',
      pass: 1,
    })
    expect(totals([4, 1, 3, 2]).passes).toBe(3)
    expect(totals([9, 8, 7, 6, 5, 4]).passes).toBe(5)
  })

  it('carries the array state from one step to the next', () => {
    const inputs = [
      [5, 1, 4, 2, 8],
      [3, 1, 2],
      [3, 2, 1],
      [2, 1, 3, 1, 2],
    ]

    for (const input of inputs) {
      const steps = generateSelectionSortSteps(input)
      for (let i = 0; i < steps.length - 1; i++) {
        const carried = steps[i].exchangedValues ?? steps[i].values
        expect(steps[i + 1].values).toEqual(carried)
      }
    }
  })

  it('does not mutate the input array', () => {
    const input = [3, 1, 2]

    generateSelectionSortSteps(input)

    expect(input).toEqual([3, 1, 2])
  })

  it('stores independent snapshots', () => {
    const steps = generateSelectionSortSteps([2, 1])

    expect(steps[1].values).not.toBe(steps[1].exchangedValues)
    expect(steps[0].values).not.toBe(steps[1].values)
  })

  it('ends sorted for varied inputs', () => {
    const inputs = [
      [5, 1, 4, 2, 8],
      [9, 8, 7, 6, 5, 4],
      [1],
      [],
      [3, 3, 3],
      [2, 1, 3, 1, 2],
      [4, 2, 4, 1, 2],
    ]

    for (const input of inputs) {
      const steps = generateSelectionSortSteps(input)
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
