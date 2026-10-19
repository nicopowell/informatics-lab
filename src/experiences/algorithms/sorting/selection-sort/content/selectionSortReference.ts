import type { ReferenceLanguage } from '@/experience/CodePanel'

/*
 * Reference implementations of selection sort, one per language, mirroring the
 * control structure of `logic/selectionSort.ts`: n − 1 passes, a scan of the tail
 * from `i + 1`, the running minimum tracked with a strict `<` (so a tie keeps the
 * earlier index and the pass never exchanges for nothing), and a single guarded
 * exchange that writes only when the minimum is not already in place.
 *
 * The counters the screen shows are deliberately absent here. These snippets are
 * strings, so no test covers them: what keeps them honest is that a reader can
 * line them up against the logic file and count the same comparisons by hand.
 */
export const SELECTION_SORT_REFERENCE: ReferenceLanguage[] = [
  {
    id: 'pseudocode',
    label: 'Pseudocode',
    color: '#e2e8f0',
    code: `procedure selectionSort(A : list of numbers)
    n <- length(A)
    for i <- 0 to n - 2
        minIndex <- i
        for j <- i + 1 to n - 1
            if A[j] < A[minIndex]
                minIndex <- j
        if minIndex != i
            swap A[i] and A[minIndex]`,
  },
  {
    id: 'python',
    label: 'Python',
    color: '#3776ab',
    code: `def selection_sort(values):
    n = len(values)
    for i in range(n - 1):
        min_index = i
        for j in range(i + 1, n):
            if values[j] < values[min_index]:
                min_index = j
        if min_index != i:
            values[i], values[min_index] = values[min_index], values[i]`,
  },
  {
    id: 'javascript',
    label: 'JavaScript',
    color: '#f7df1e',
    code: `function selectionSort(values) {
  const n = values.length
  for (let i = 0; i < n - 1; i++) {
    let minIndex = i
    for (let j = i + 1; j < n; j++) {
      if (values[j] < values[minIndex]) {
        minIndex = j
      }
    }
    if (minIndex !== i) {
      const current = values[i]
      values[i] = values[minIndex]
      values[minIndex] = current
    }
  }
}`,
  },
  {
    id: 'cpp',
    label: 'C++',
    color: '#00599c',
    code: `void selectionSort(std::vector<int>& values) {
  int n = static_cast<int>(values.size());
  for (int i = 0; i < n - 1; ++i) {
    int minIndex = i;
    for (int j = i + 1; j < n; ++j) {
      if (values[j] < values[minIndex]) {
        minIndex = j;
      }
    }
    if (minIndex != i) {
      std::swap(values[i], values[minIndex]);
    }
  }
}`,
  },
]
