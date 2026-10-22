const MAX_VALUE = 99

// Sequential search imposes no order on the data, so the fixture is a plain
// random draw; distinct values keep the found index unambiguous.
export function createRandomArray(size: number): number[] {
  const values = new Set<number>()
  while (values.size < size) {
    values.add(Math.floor(Math.random() * MAX_VALUE) + 1)
  }
  return [...values]
}

export type SequentialSearchStep = {
  kind: 'probe' | 'notFound'
  key: number
  // Position being examined; past the end (values.length) once the scan is
  // exhausted, so a failed search still shows where the cursor stopped.
  index: number
  outcome: 'equal' | 'notEqual' | null
  comparisons: number
  nextIndex: number | null
}

export function generateSequentialSearchSteps(
  values: number[],
  key: number,
): SequentialSearchStep[] {
  const steps: SequentialSearchStep[] = []
  let index = 0
  let comparisons = 0

  while (index < values.length) {
    comparisons++

    if (values[index] === key) {
      steps.push({
        kind: 'probe',
        key,
        index,
        outcome: 'equal',
        comparisons,
        nextIndex: null,
      })
      return steps
    }

    steps.push({
      kind: 'probe',
      key,
      index,
      outcome: 'notEqual',
      comparisons,
      nextIndex: index + 1,
    })
    index++
  }

  // Running past the end means every position was checked without a match.
  steps.push({
    kind: 'notFound',
    key,
    index,
    outcome: null,
    comparisons,
    nextIndex: null,
  })

  return steps
}
