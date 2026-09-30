import type { ComponentType } from 'react'
import BinarySearchPage from '../algorithms/binary-search/BinarySearchPage'
import BubbleSortPage from '../algorithms/bubble-sort/BubbleSortPage'

export type ExperiencePageProps = {
  backTo: string
}

// Implemented experiences. This map is the single source of truth for what the
// catalogue may offer as available.
export const EXPERIENCES: Record<string, ComponentType<ExperiencePageProps>> = {
  'bubble-sort': BubbleSortPage,
  'binary-search': BinarySearchPage,
}
