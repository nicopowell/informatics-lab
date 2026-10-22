import type { SequentialSearchStep } from './sequentialSearch'

export type SequentialSearchFrame = {
  kind: 'ready' | 'probe' | 'advance' | 'found' | 'notFound'
  key: number
  // Current cursor position: ready starts at 0, notFound sits one past the
  // last position to show the scan ran out of array.
  index: number
  outcome: 'equal' | 'notEqual' | null
  comparisons: number
}

export function createReadyFrame(key: number): SequentialSearchFrame {
  return {
    kind: 'ready',
    key,
    index: 0,
    outcome: null,
    comparisons: 0,
  }
}

// The cell the visualization should keep in view: the cursor itself, which
// only leaves the array when the search fails — and then the whole scan has
// already been seen, so nothing is left to follow.
export function scrollAnchor(frame: SequentialSearchFrame): number | null {
  return frame.kind === 'notFound' ? null : frame.index
}

export function toVisualFrames(steps: SequentialSearchStep[]): SequentialSearchFrame[] {
  return steps.flatMap((step): SequentialSearchFrame[] => {
    if (step.kind === 'notFound') {
      return [
        {
          kind: 'notFound',
          key: step.key,
          index: step.index,
          outcome: null,
          comparisons: step.comparisons,
        },
      ]
    }

    const probeFrame: SequentialSearchFrame = {
      kind: 'probe',
      key: step.key,
      index: step.index,
      outcome: step.outcome,
      comparisons: step.comparisons,
    }

    // An equal comparison ends the scan without visiting anything else.
    if (step.outcome === 'equal') {
      return [probeFrame, { ...probeFrame, kind: 'found' }]
    }

    if (step.nextIndex === null) {
      throw new Error('a notEqual probe must move the cursor forward')
    }

    return [
      probeFrame,
      {
        kind: 'advance',
        key: step.key,
        index: step.nextIndex,
        outcome: step.outcome,
        comparisons: step.comparisons,
      },
    ]
  })
}
