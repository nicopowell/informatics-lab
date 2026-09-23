import type { BinarySearchOutcome, BinarySearchStep } from './binarySearch'

export type BinarySearchFrame = {
  kind: 'ready' | 'probe' | 'eliminate' | 'found' | 'notFound'
  key: number
  low: number
  high: number
  mid: number | null
  outcome: BinarySearchOutcome | null
  comparisons: number
}

export function createReadyFrame(size: number, key: number): BinarySearchFrame {
  return {
    kind: 'ready',
    key,
    low: 0,
    high: size - 1,
    mid: null,
    outcome: null,
    comparisons: 0,
  }
}

export function toVisualFrames(steps: BinarySearchStep[]): BinarySearchFrame[] {
  return steps.flatMap((step): BinarySearchFrame[] => {
    if (step.kind === 'notFound') {
      return [
        {
          kind: 'notFound',
          key: step.key,
          low: step.low,
          high: step.high,
          mid: null,
          outcome: null,
          comparisons: step.comparisons,
        },
      ]
    }

    const probeFrame: BinarySearchFrame = {
      kind: 'probe',
      key: step.key,
      low: step.low,
      high: step.high,
      mid: step.mid,
      outcome: step.outcome,
      comparisons: step.comparisons,
    }

    // An equal comparison ends the search without discarding anything else.
    if (step.outcome === 'equal') {
      return [probeFrame, { ...probeFrame, kind: 'found' }]
    }

    if (step.nextLow === null || step.nextHigh === null) {
      throw new Error('a non-equal probe must narrow the interval')
    }

    return [
      probeFrame,
      {
        kind: 'eliminate',
        key: step.key,
        low: step.nextLow,
        high: step.nextHigh,
        mid: null,
        outcome: step.outcome,
        comparisons: step.comparisons,
      },
    ]
  })
}
