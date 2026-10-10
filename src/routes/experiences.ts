import type { ComponentType } from 'react'
import BinarySearchPage from '@/experiences/algorithms/searching/binary-search/BinarySearchPage'
import BubbleSortPage from '@/experiences/algorithms/sorting/bubble-sort/BubbleSortPage'
import FcfsSchedulingPage from '@/experiences/operating-systems/process-management/fcfs-scheduling/FcfsSchedulingPage'
import SjfSchedulingPage from '@/experiences/operating-systems/process-management/sjf-scheduling/SjfSchedulingPage'

// Implemented experiences. This map is the single source of truth for what the
// catalogue may offer as available.
export const EXPERIENCES: Record<string, ComponentType> = {
  'bubble-sort': BubbleSortPage,
  'binary-search': BinarySearchPage,
  'fcfs-scheduling': FcfsSchedulingPage,
  'sjf-scheduling': SjfSchedulingPage,
}

/*
 * The registered ids, derived here once so every screen reads the same view of
 * what is implemented instead of rebuilding a set and drifting apart.
 *
 * The type is the guard. Availability is derived from this one binding, so a
 * single stray `add` or `delete` in any screen would silently change what the
 * whole catalogue offers as available. `ReadonlySet` removes that ability at
 * compile time: consumers keep the membership test they need and lose the
 * mutators that nothing should own. Object.freeze is not a substitute — it does
 * not seal a Set's contents.
 */
export const IMPLEMENTED_EXPERIENCES: ReadonlySet<string> = new Set(
  Object.keys(EXPERIENCES),
)
