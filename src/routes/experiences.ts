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
 */
export const IMPLEMENTED_EXPERIENCES = new Set(Object.keys(EXPERIENCES))
