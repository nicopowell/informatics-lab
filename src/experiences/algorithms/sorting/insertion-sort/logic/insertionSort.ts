export type InsertionSortStep = {
  kind: 'pick' | 'compare' | 'place' | 'done'
  // The pass is the index the key was taken from, so pass 1 is the second slot.
  pass: number
  comparison: number
  shifts: number
  // The array as it stood when this step happened. A `compare` shows the state
  // *entering* the comparison, so the shift it decides is still ahead of it.
  values: number[]
  // The value held in the hand, and the slot it was lifted from. That slot is the
  // frontier of the ordered region: everything past it has never been looked at.
  key: number | null
  keyIndex: number | null
  // The slot the key will land in. The cell is logically free even while it still
  // holds a duplicated value, which is why the view needs this and not the array.
  holeIndex: number | null
  // The slot tested against the key, always one left of the hole.
  testedIndex: number | null
  shifted: boolean
}

const MAX_VALUE = 99

export function createRandomArray(size: number): number[] {
  return Array.from(
    { length: size },
    () => Math.floor(Math.random() * MAX_VALUE) + 1,
  )
}

export function generateInsertionSortSteps(
  values: number[],
): InsertionSortStep[] {
  const array = [...values]
  const steps: InsertionSortStep[] = []
  let comparison = 0
  let shifts = 0
  let pass = 0

  // The first slot is ordered on its own, so the passes start at index 1.
  for (let i = 1; i < array.length; i++) {
    pass = i
    const key = array[i]
    let hole = i

    steps.push({
      kind: 'pick',
      pass,
      comparison,
      shifts,
      values: [...array],
      key,
      keyIndex: i,
      holeIndex: hole,
      testedIndex: null,
      shifted: false,
    })

    // The scan walks left while the neighbour is bigger than the key. Strictly
    // greater: an equal value stops it, and that is what keeps equal values in
    // their original order.
    while (hole > 0) {
      const testedIndex = hole - 1
      const shifted = array[testedIndex] > key
      comparison++

      steps.push({
        kind: 'compare',
        pass,
        comparison,
        shifts,
        values: [...array],
        key,
        keyIndex: i,
        holeIndex: hole,
        testedIndex,
        shifted,
      })

      if (!shifted) {
        break
      }

      array[hole] = array[testedIndex]
      hole = testedIndex
      shifts++
    }

    // Closing the hole is the pass's one real write. When nothing shifted the key
    // returns to the slot it came from, which is still worth showing: the pass
    // looked, and the answer was "here".
    array[hole] = key

    steps.push({
      kind: 'place',
      pass,
      comparison,
      shifts,
      values: [...array],
      key,
      keyIndex: i,
      holeIndex: hole,
      testedIndex: null,
      shifted: false,
    })
  }

  steps.push({
    kind: 'done',
    pass,
    comparison,
    shifts,
    values: [...array],
    key: null,
    keyIndex: null,
    holeIndex: null,
    testedIndex: null,
    shifted: false,
  })

  return steps
}
