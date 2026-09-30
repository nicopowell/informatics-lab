import type { ComponentType } from 'react'
import BinarySearchPage from '@/experiences/algorithms/searching/binary-search/BinarySearchPage'
import BubbleSortPage from '@/experiences/algorithms/sorting/bubble-sort/BubbleSortPage'

// Implemented experiences. This map is the single source of truth for what the
// catalogue may offer as available.
export const EXPERIENCES: Record<string, ComponentType> = {
  'bubble-sort': BubbleSortPage,
  'binary-search': BinarySearchPage,
}
