// Array-shape presets live at topic level so every sorting experience can be
// started from the same characteristic inputs: already sorted, reverse sorted,
// nearly sorted, and many duplicates. A preset is a shape materialized at the
// caller's current length, not a fixed literal array.

export type ArrayPresetId =
  | 'sorted'
  | 'reversed'
  | 'nearlySorted'
  | 'manyDuplicates'

export type ArrayPreset = {
  id: ArrayPresetId
  label: string
  description: string
}

export const ARRAY_PRESETS: readonly ArrayPreset[] = [
  {
    id: 'sorted',
    label: 'Already sorted',
    description: 'A non-decreasing array, the best case for early-exit passes.',
  },
  {
    id: 'reversed',
    label: 'Reverse sorted',
    description: 'A non-increasing array, the worst case for swap-based sorts.',
  },
  {
    id: 'nearlySorted',
    label: 'Nearly sorted',
    description: 'A few misplaced neighbours; most of the array stays ordered.',
  },
  {
    id: 'manyDuplicates',
    label: 'Many duplicates',
    description: 'At most three distinct values, so ties are easy to see.',
  },
]

// Exported so every experience's size slider shares the preset contract's
// lower bound; pages may cap their own slider below MAX_SIZE for legibility.
export const MIN_SIZE = 5
export const MAX_SIZE = 40
const MIN_VALUE = 1
const MAX_VALUE = 99
const NEARLY_SORTED_RATIO = 0.1

function ascendingValues(size: number, rng: () => number): number[] {
  const values = Array.from(
    { length: size },
    () => MIN_VALUE + Math.floor(rng() * (MAX_VALUE - MIN_VALUE + 1)),
  )
  values.sort((a, b) => a - b)
  return values
}

function descendingValues(size: number, rng: () => number): number[] {
  const values = ascendingValues(size, rng).reverse()

  // Equal values at both ends would leave the array non-decreasing as well,
  // which would not exercise a swap-based sort; force one strict drop.
  if (size > 1 && values[0] === values[size - 1]) {
    if (values[0] === MAX_VALUE) {
      values[size - 1] -= 1
    } else {
      values[0] += 1
    }
  }

  return values
}

// Swaps one adjacent pair starting at `start`, scanning forward past equal
// neighbours so the transposition actually changes the array.
function transposeOnce(values: number[], start: number): void {
  for (let position = start; position < values.length - 1; position++) {
    if (values[position] !== values[position + 1]) {
      ;[values[position], values[position + 1]] = [
        values[position + 1],
        values[position],
      ]
      return
    }
  }
}

function nearlySortedValues(size: number, rng: () => number): number[] {
  const values = ascendingValues(size, rng)
  const swapCount = Math.max(1, Math.round(size * NEARLY_SORTED_RATIO))
  const stride = Math.max(1, Math.floor((size - 1) / swapCount))
  const start = Math.floor(rng() * stride)

  // Transpositions are spread a stride apart, so the shape stays almost sorted.
  for (let swap = 0; swap < swapCount; swap++) {
    const position = start + swap * stride
    if (position < size - 1) {
      transposeOnce(values, position)
    }
  }

  return values
}

function duplicatedValues(size: number, rng: () => number): number[] {
  // Three disjoint value bands guarantee three distinct values without
  // rejection loops.
  const pool = [
    MIN_VALUE + Math.floor(rng() * 33),
    34 + Math.floor(rng() * 33),
    67 + Math.floor(rng() * 33),
  ]
  const values = Array.from({ length: size }, (_, index) => pool[index % pool.length])

  // Fisher–Yates over the multiset shuffles the order while keeping each
  // value present, so duplicates stay visible.
  for (let i = values.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[values[i], values[j]] = [values[j], values[i]]
  }

  return values
}

export function createArrayPreset(
  id: ArrayPresetId,
  size: number,
  rng: () => number = Math.random,
): number[] {
  if (size < MIN_SIZE || size > MAX_SIZE) {
    throw new RangeError(
      `Array preset size must be between ${MIN_SIZE} and ${MAX_SIZE}, received ${size}`,
    )
  }

  switch (id) {
    case 'sorted':
      return ascendingValues(size, rng)
    case 'reversed':
      return descendingValues(size, rng)
    case 'nearlySorted':
      return nearlySortedValues(size, rng)
    case 'manyDuplicates':
      return duplicatedValues(size, rng)
  }
}
