export type BinarySearchOutcome = 'less' | 'equal' | 'greater'

export type BinarySearchStep = {
  kind: 'probe' | 'notFound'
  key: number
  low: number
  high: number
  mid: number | null
  outcome: BinarySearchOutcome | null
  comparisons: number
  nextLow: number | null
  nextHigh: number | null
}

export function generateBinarySearchSteps(
  values: number[],
  key: number,
): BinarySearchStep[] {
  const steps: BinarySearchStep[] = []
  let low = 0
  let high = values.length - 1
  let comparisons = 0

  while (low <= high) {
    const mid = Math.floor((low + high) / 2)
    comparisons++

    const value = values[mid]
    let outcome: BinarySearchOutcome
    if (value === key) {
      outcome = 'equal'
    } else if (value < key) {
      outcome = 'less'
    } else {
      outcome = 'greater'
    }

    if (outcome === 'equal') {
      steps.push({
        kind: 'probe',
        key,
        low,
        high,
        mid,
        outcome,
        comparisons,
        nextLow: null,
        nextHigh: null,
      })
      return steps
    }

    // The compared value rules out one half of the current interval.
    const nextLow = outcome === 'less' ? mid + 1 : low
    const nextHigh = outcome === 'greater' ? mid - 1 : high

    steps.push({
      kind: 'probe',
      key,
      low,
      high,
      mid,
      outcome,
      comparisons,
      nextLow,
      nextHigh,
    })

    low = nextLow
    high = nextHigh
  }

  // An empty interval (low > high) means the key is not in the array.
  steps.push({
    kind: 'notFound',
    key,
    low,
    high,
    mid: null,
    outcome: null,
    comparisons,
    nextLow: null,
    nextHigh: null,
  })

  return steps
}
