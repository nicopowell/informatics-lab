import { describe, expect, it } from 'vitest'
import {
  createRandomArray,
  generateInsertionSortSteps,
} from './insertionSort'

const kinds = (values: number[]) =>
  generateInsertionSortSteps(values).map((step) => step.kind)

const ofKind = (values: number[], kind: 'pick' | 'compare' | 'place' | 'done') =>
  generateInsertionSortSteps(values).filter((step) => step.kind === kind)

/*
 * The steps of one pass. Filtering by `pass` alone would also return the `done`
 * step, which carries the pass count for the readout, so the kind is excluded on
 * purpose here rather than at each call site.
 */
const ofPass = (values: number[], pass: number) =>
  generateInsertionSortSteps(values).filter(
    (step) => step.pass === pass && step.kind !== 'done',
  )

const totals = (values: number[]) => {
  const steps = generateInsertionSortSteps(values)
  return steps[steps.length - 1]
}

describe('createRandomArray', () => {
  it('builds the requested size with values between 1 and 99', () => {
    for (const value of createRandomArray(8)) {
      expect(value).toBeGreaterThanOrEqual(1)
      expect(value).toBeLessThanOrEqual(99)
    }
    expect(createRandomArray(1)).toHaveLength(1)
  })
})

describe('generateInsertionSortSteps pass structure', () => {
  it('picks one value per pass, starting at the second slot', () => {
    // [5,3,4,1,2]: the passes take 3, 4, 1 and 2 -- never the first slot.
    const picks = ofKind([5, 3, 4, 1, 2], 'pick')

    expect(picks.map((step) => step.pass)).toEqual([1, 2, 3, 4])
    expect(picks.map((step) => step.key)).toEqual([3, 4, 1, 2])
    expect(picks.map((step) => step.holeIndex)).toEqual([1, 2, 3, 4])
    expect(picks.map((step) => step.keyIndex)).toEqual([1, 2, 3, 4])
  })

  it('closes every pass with exactly one place step', () => {
    // Traced by hand: the keys 3, 4, 1 and 2 land in slots 0, 1, 0 and 1.
    const places = ofKind([5, 3, 4, 1, 2], 'place')

    expect(places.map((step) => step.pass)).toEqual([1, 2, 3, 4])
    expect(places.map((step) => step.holeIndex)).toEqual([0, 1, 0, 1])
    expect(places[places.length - 1].values).toEqual([1, 2, 3, 4, 5])
  })

  it('ends with a single done step holding the sorted array', () => {
    const steps = generateInsertionSortSteps([5, 3, 4, 1, 2])
    const done = steps[steps.length - 1]

    expect(steps.filter((step) => step.kind === 'done')).toHaveLength(1)
    expect(done.kind).toBe('done')
    expect(done.values).toEqual([1, 2, 3, 4, 5])
    expect(done.key).toBeNull()
    expect(done.holeIndex).toBeNull()
    expect(done.testedIndex).toBeNull()
  })

  it('runs no pass at all for a single value', () => {
    expect(kinds([7])).toEqual(['done'])
    expect(totals([7])).toMatchObject({ comparison: 0, shifts: 0 })
  })

  it('leaves the input array untouched', () => {
    const input = [5, 3, 4, 1, 2]
    generateInsertionSortSteps(input)

    expect(input).toEqual([5, 3, 4, 1, 2])
  })
})

describe('generateInsertionSortSteps the scan', () => {
  it('records what each comparison tested and how it decided', () => {
    // [1,3,5,2]: pass 3 holds the 2, runs the 5 and the 3 right, stops at the 1.
    const passThree = ofPass([1, 3, 5, 2], 3)

    expect(passThree.map((step) => step.kind)).toEqual([
      'pick',
      'compare',
      'compare',
      'compare',
      'place',
    ])
    expect(passThree.filter((step) => step.kind === 'compare')).toMatchObject([
      { testedIndex: 2, holeIndex: 3, shifted: true },
      { testedIndex: 1, holeIndex: 2, shifted: true },
      { testedIndex: 0, holeIndex: 1, shifted: false },
    ])
  })

  it('shows the array as it was while the comparison was made', () => {
    const compares = ofKind([1, 3, 5, 2], 'compare').filter((step) => step.pass === 3)

    expect(compares.map((step) => step.values)).toEqual([
      [1, 3, 5, 2],
      [1, 3, 5, 5],
      [1, 3, 3, 5],
    ])
  })

  it('keeps the key in hand for the whole pass', () => {
    for (const step of ofPass([1, 3, 5, 2], 3)) {
      expect(step.key).toBe(2)
    }
  })

  it('walks the hole all the way to the first slot when the key is the smallest', () => {
    const passTwo = ofPass([9, 8, 7], 2)

    // pick holds the hole at 2, the two comparisons each report the hole they
    // found on entering, and the place closes it at 0.
    expect(passTwo.map((step) => step.holeIndex)).toEqual([2, 2, 1, 0])
    expect(passTwo[passTwo.length - 1]).toMatchObject({ kind: 'place', key: 7 })
    expect(passTwo[passTwo.length - 1].values).toEqual([7, 8, 9])
  })
})

describe('generateInsertionSortSteps counters', () => {
  it('numbers comparisons sequentially from one across the whole run', () => {
    const comparisons = ofKind([5, 3, 4, 1, 2], 'compare').map((step) => step.comparison)

    expect(comparisons).toEqual(comparisons.map((_, index) => index + 1))
  })

  it('carries the running shift count, not only the decision', () => {
    const shifts = ofKind([1, 3, 5, 2], 'compare')
      .filter((step) => step.pass === 3)
      .map((step) => step.shifts)

    expect(shifts).toEqual([0, 1, 2])
  })

  it('counts the total cost of a run', () => {
    // 1 + 2 + 3 + 4 comparisons and 8 shifts on [5,3,4,1,2], by hand.
    expect(totals([5, 3, 4, 1, 2])).toMatchObject({ comparison: 10, shifts: 8 })
  })

  it('costs one comparison per pass and no shift on an ordered array', () => {
    const done = totals([1, 2, 3, 4])

    expect(done.comparison).toBe(3)
    expect(done.shifts).toBe(0)
    expect(ofKind([1, 2, 3, 4], 'compare').filter((step) => step.shifted)).toHaveLength(0)
  })

  it('stops the scan on an equal value, which is what makes it stable', () => {
    const steps = generateInsertionSortSteps([5, 5, 5])

    expect(ofKind([5, 5, 5], 'compare').every((step) => !step.shifted)).toBe(true)
    expect(totals([5, 5, 5])).toMatchObject({ comparison: 2, shifts: 0 })
    expect(steps[steps.length - 1].values).toEqual([5, 5, 5])
  })

  it('costs the worst case on a reversed array', () => {
    // [4,3,2,1]: every comparison shifts, so 6 comparisons and 6 shifts.
    expect(totals([4, 3, 2, 1])).toMatchObject({ comparison: 6, shifts: 6 })
  })
})
