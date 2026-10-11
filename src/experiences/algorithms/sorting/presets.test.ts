import { describe, expect, it } from 'vitest'
import {
  ARRAY_PRESETS,
  createArrayPreset,
  type ArrayPresetId,
} from './presets'

function rngFrom(values: number[]): () => number {
  let index = 0
  return () => values[index++ % values.length]
}

// Deterministic PRNG (mulberry32). The broad invariant sweep uses it instead of
// Math.random so many different arrays are covered and a rare failure would
// still reproduce exactly.
function seededRng(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const ALL_IDS: ArrayPresetId[] = [
  'sorted',
  'reversed',
  'nearlySorted',
  'manyDuplicates',
]

const MIN_VALUE = 1
const MAX_VALUE = 99

function isInNonDecreasing(values: number[]): boolean {
  return values.every((value, index) =>
    index === 0 ? true : values[index - 1] <= value,
  )
}

function isInNonIncreasing(values: number[]): boolean {
  return values.every((value, index) =>
    index === 0 ? true : values[index - 1] >= value,
  )
}

function countInversions(values: number[]): number {
  let inversions = 0
  for (let i = 0; i < values.length; i++) {
    for (let j = i + 1; j < values.length; j++) {
      if (values[i] > values[j]) inversions++
    }
  }
  return inversions
}

function countChangedPositions(values: number[], sorted: number[]): number {
  return values.filter((value, index) => value !== sorted[index]).length
}

describe('ARRAY_PRESETS', () => {
  it('exposes one descriptor per preset id with a label and description', () => {
    expect(ARRAY_PRESETS.map((preset) => preset.id)).toEqual(ALL_IDS)
    for (const preset of ARRAY_PRESETS) {
      expect(preset.label.length).toBeGreaterThan(0)
      expect(preset.description.length).toBeGreaterThan(0)
    }
  })
})

describe('createArrayPreset', () => {
  it('returns a fresh array of exactly size values within 1..99 for every preset', () => {
    for (const id of ALL_IDS) {
      for (const size of [5, 8, 40]) {
        const values = createArrayPreset(id, size, seededRng(size))
        expect(values).toHaveLength(size)
        for (const value of values) {
          expect(value).toBeGreaterThanOrEqual(MIN_VALUE)
          expect(value).toBeLessThanOrEqual(MAX_VALUE)
          expect(Number.isInteger(value)).toBe(true)
        }
        expect(createArrayPreset(id, size, rngFrom([0.25, 0.75]))).not.toBe(
          createArrayPreset(id, size, rngFrom([0.25, 0.75])),
        )
      }
    }
  })

  it('produces identical output for two calls given the same deterministic rng', () => {
    for (const id of ALL_IDS) {
      // rngFrom cycles its sequence, so both calls consume identical inputs.
      const first = createArrayPreset(
        id,
        12,
        rngFrom([0.1, 0.4, 0.6, 0.9, 0.3, 0.7, 0.2, 0.8, 0.5, 0.95]),
      )
      const second = createArrayPreset(
        id,
        12,
        rngFrom([0.1, 0.4, 0.6, 0.9, 0.3, 0.7, 0.2, 0.8, 0.5, 0.95]),
      )
      expect(second).toEqual(first)
    }
  })

  it('sorted is non-decreasing', () => {
    expect(isInNonDecreasing(createArrayPreset('sorted', 20, seededRng(20)))).toBe(
      true,
    )
  })

  it('reversed is non-increasing and a genuine worst case for swap-based sorts', () => {
    const values = createArrayPreset('reversed', 8, seededRng(8))
    expect(isInNonIncreasing(values)).toBe(true)
    expect(isInNonDecreasing(values)).toBe(false)
  })

  it('reversed stays a worst case even when every sampled value is equal', () => {
    for (const constant of [0, 0.99]) {
      const values = createArrayPreset('reversed', 8, rngFrom([constant]))
      expect(isInNonIncreasing(values)).toBe(true)
      expect(isInNonDecreasing(values)).toBe(false)
    }
  })

  it('nearlySorted is within a small number of adjacent swaps of fully sorted', () => {
    for (const size of [5, 8, 40]) {
      const values = createArrayPreset('nearlySorted', size, seededRng(size))
      const sorted = [...values].sort((a, b) => a - b)
      const expectedTranspositions = Math.max(1, Math.round(size * 0.1))

      expect(countInversions(values)).toBeLessThanOrEqual(expectedTranspositions)
      expect(countChangedPositions(values, sorted)).toBeLessThanOrEqual(
        2 * expectedTranspositions,
      )
      // Most of the array must stay ordered; the transpositions must be real.
      expect(countChangedPositions(values, sorted)).toBeGreaterThanOrEqual(2)
    }
  })

  it('manyDuplicates uses at most 3 distinct values with visible ties', () => {
    for (const size of [5, 8, 40]) {
      const values = createArrayPreset('manyDuplicates', size, seededRng(size))
      const distinct = new Set(values)
      expect(distinct.size).toBeLessThanOrEqual(3)
      expect(distinct.size).toBeGreaterThanOrEqual(2)
    }
  })

  it('manyDuplicates is shuffled into a non-sorted order', () => {
    for (const rng of [
      rngFrom([0.9, 0.2, 0.6, 0.1, 0.8, 0.3]),
      rngFrom([0.05, 0.55, 0.35, 0.85, 0.15, 0.65]),
    ]) {
      const values = createArrayPreset('manyDuplicates', 12, rng)
      expect(isInNonDecreasing(values)).toBe(false)
      expect(isInNonIncreasing(values)).toBe(false)
    }
  })

  it.each([0, 4, 41])('throws a RangeError for size %i', (size) => {
    for (const id of ALL_IDS) {
      expect(() => createArrayPreset(id, size)).toThrow(RangeError)
    }
  })

  it.each([5, 40])('accepts boundary size %i', (size) => {
    expect(createArrayPreset('sorted', size, seededRng(size))).toHaveLength(size)
  })

  it('holds every shape invariant across 300 seeded draws at varying lengths', () => {
    const rng = seededRng(20260110)

    for (let trial = 0; trial < 300; trial++) {
      const id = ALL_IDS[trial % ALL_IDS.length]
      const size = 5 + Math.floor(rng() * 36)
      const values = createArrayPreset(id, size, rng)
      const transpositions = Math.max(1, Math.round(size * 0.1))
      const where = `${id}/${size}`

      expect(values, where).toHaveLength(size)
      for (const value of values) {
        expect(value, where).toBeGreaterThanOrEqual(MIN_VALUE)
        expect(value, where).toBeLessThanOrEqual(MAX_VALUE)
        expect(Number.isInteger(value), where).toBe(true)
      }

      switch (id) {
        case 'sorted':
          expect(isInNonDecreasing(values), where).toBe(true)
          break
        case 'reversed':
          expect(isInNonIncreasing(values), where).toBe(true)
          // A flat array would not exercise any swap, which is the whole point.
          expect(isInNonDecreasing(values), where).toBe(false)
          break
        case 'nearlySorted':
          expect(countInversions(values), where).toBeLessThanOrEqual(
            transpositions,
          )
          expect(countInversions(values), where).toBeGreaterThan(0)
          break
        case 'manyDuplicates':
          expect(new Set(values).size, where).toBeLessThanOrEqual(3)
          break
      }
    }
  })

  it('gives different arrays for different seeds, so a preset is not a literal', () => {
    const first = createArrayPreset('nearlySorted', 20, seededRng(1))
    const second = createArrayPreset('nearlySorted', 20, seededRng(2))
    expect(second).not.toEqual(first)
  })
})
