export type BubbleSortStep = {
  kind: 'compare' | 'done'
  comparison: number
  values: number[]
  swappedValues: number[] | null
  comparing: [number, number] | null
  sortedFrom: number
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

export function generateBubbleSortSteps(values: number[]): BubbleSortStep[] {
  const array = [...values]
  const steps: BubbleSortStep[] = []
  let comparisons = 0
  let swaps = 0
  let pass = 0

  for (let currentPass = 1; currentPass < array.length; currentPass++) {
    pass = currentPass
    let swappedInPass = false
    // The tail finalized by previous passes is already ordered.
    const sortedFrom = array.length - currentPass + 1

    for (let j = 0; j < array.length - currentPass; j++) {
      comparisons++
      const shouldSwap = array[j] > array[j + 1]
      const valuesBefore = [...array]
      let swappedValues: number[] | null = null

      if (shouldSwap) {
        const current = array[j]
        array[j] = array[j + 1]
        array[j + 1] = current
        swaps++
        swappedInPass = true
        swappedValues = [...array]
      }

      steps.push({
        kind: 'compare',
        comparison: comparisons,
        values: valuesBefore,
        swappedValues,
        comparing: [j, j + 1],
        sortedFrom,
        pass,
        swaps,
      })
    }

    // No swap in a full pass means the remaining prefix is already sorted.
    if (!swappedInPass) {
      break
    }
  }

  steps.push({
    kind: 'done',
    comparison: comparisons,
    values: [...array],
    swappedValues: null,
    comparing: null,
    sortedFrom: 0,
    pass,
    swaps,
  })

  return steps
}
