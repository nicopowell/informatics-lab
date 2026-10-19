import type { ReferenceLanguage } from '@/experience/CodePanel'

/*
 * Reference implementations of insertion sort, one per language, mirroring the
 * control structure of `logic/insertionSort.ts`: lift the value at the frontier,
 * walk left while the neighbour is *strictly* bigger than the held key, move that
 * neighbour one slot right into the hole, and write the key once where the scan
 * stopped.
 *
 * The strict `>` is the whole lesson. With `>=` an equal neighbour would also be
 * pushed aside, and the array would stop preserving the original order of ties —
 * the property the *Many duplicates* preset exists to show, and the one where this
 * algorithm and selection sort disagree on the same input.
 *
 * No counters here, as in the other panels: the snippets keep the shape, and the
 * comparisons and shifts a reader sees on screen are countable from it.
 */
export const INSERTION_SORT_REFERENCE: ReferenceLanguage[] = [
  {
    id: 'pseudocode',
    label: 'Pseudocode',
    color: '#e2e8f0',
    code: `procedure insertionSort(A : list of numbers)
    n <- length(A)
    for i <- 1 to n - 1
        key <- A[i]
        hole <- i
        while hole > 0 and A[hole - 1] > key
            A[hole] <- A[hole - 1]
            hole <- hole - 1
        A[hole] <- key`,
  },
  {
    id: 'python',
    label: 'Python',
    color: '#3776ab',
    code: `def insertion_sort(values):
    for i in range(1, len(values)):
        key = values[i]
        hole = i
        while hole > 0 and values[hole - 1] > key:
            values[hole] = values[hole - 1]
            hole -= 1
        values[hole] = key`,
  },
  {
    id: 'javascript',
    label: 'JavaScript',
    color: '#f7df1e',
    code: `function insertionSort(values) {
  for (let i = 1; i < values.length; i++) {
    const key = values[i]
    let hole = i
    while (hole > 0 && values[hole - 1] > key) {
      values[hole] = values[hole - 1]
      hole -= 1
    }
    values[hole] = key
  }
}`,
  },
  {
    id: 'cpp',
    label: 'C++',
    color: '#00599c',
    code: `void insertionSort(std::vector<int>& values) {
  for (size_t i = 1; i < values.size(); ++i) {
    int key = values[i];
    size_t hole = i;
    while (hole > 0 && values[hole - 1] > key) {
      values[hole] = values[hole - 1];
      --hole;
    }
    values[hole] = key;
  }
}`,
  },
]
