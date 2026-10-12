export type SelectionSortStep = {
  kind: 'compare' | 'select' | 'done'
  comparison: number
  values: number[]
  // The array after this pass wrote, or null when the pass wrote nothing.
  exchangedValues: number[] | null
  // For a comparison this is [scanned index, running minimum index before the
  // comparison]; for a select it is [slot being filled, minimum found].
  comparing: [number, number] | null
  minIndex: number | null
  // Selection sort finalizes the head, one slot per pass, so the ordered
  // region is a prefix length rather than bubble sort's `sortedFrom` tail.
  sortedUpTo: number
  pass: number
  swaps: number
}

const MAX_VALUE = 99

export function createRandomArray(size: number): number[] {
  return Array.from(
    { length: size },
    () => Math.floor(Math.random() * MAX_VALUE) + 1,
  )
}

export function generateSelectionSortSteps(
  values: number[],
): SelectionSortStep[] {
  const array = [...values]
  const steps: SelectionSortStep[] = []
  let comparisons = 0
  let swaps = 0
  let pass = 0

  for (let i = 0; i < array.length - 1; i++) {
    pass = i + 1
    let minIndex = i

    for (let j = i + 1; j < array.length; j++) {
      comparisons++

      steps.push({
        kind: 'compare',
        comparison: comparisons,
        values: [...array],
        exchangedValues: null,
        comparing: [j, minIndex],
        minIndex,
        // Slot i is still the one being decided, so the prefix ends before it.
        sortedUpTo: i,
        pass,
        swaps,
      })

      // Strictly smaller: an equal value keeps the earlier index, so the scan
      // never exchanges for nothing.
      if (array[j] < array[minIndex]) {
        minIndex = j
      }
    }

    // Each pass ends by naming its minimum, and only then may it write. A pass
    // whose minimum already sits in place frames the slot against itself and
    // performs no exchange.
    const valuesBefore = [...array]
    let exchangedValues: number[] | null = null

    if (minIndex !== i) {
      const current = array[i]
      array[i] = array[minIndex]
      array[minIndex] = current
      swaps++
      exchangedValues = [...array]
    }

    steps.push({
      kind: 'select',
      comparison: comparisons,
      values: valuesBefore,
      exchangedValues,
      comparing: [i, minIndex],
      minIndex,
      sortedUpTo: i,
      pass,
      swaps,
    })
  }

  steps.push({
    kind: 'done',
    comparison: comparisons,
    values: [...array],
    exchangedValues: null,
    comparing: null,
    minIndex: null,
    sortedUpTo: array.length,
    pass,
    swaps,
  })

  return steps
}
