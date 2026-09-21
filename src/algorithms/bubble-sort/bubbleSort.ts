export type BubbleSortStep = {
  values: number[]
  comparing: [number, number] | null
  swapped: boolean
  sortedFrom: number
  pass: number
  comparisons: number
  swaps: number
  finished: boolean
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

      if (shouldSwap) {
        const current = array[j]
        array[j] = array[j + 1]
        array[j + 1] = current
        swaps++
        swappedInPass = true
      }

      steps.push({
        values: [...array],
        comparing: [j, j + 1],
        swapped: shouldSwap,
        sortedFrom,
        pass,
        comparisons,
        swaps,
        finished: false,
      })
    }

    // No swap in a full pass means the remaining prefix is already sorted.
    if (!swappedInPass) {
      break
    }
  }

  steps.push({
    values: [...array],
    comparing: null,
    swapped: false,
    sortedFrom: 0,
    pass,
    comparisons,
    swaps,
    finished: true,
  })

  return steps
}
