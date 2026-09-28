export type ReferenceLanguage = {
  id: string
  label: string
  color: string
  code: string
}

export const BUBBLE_SORT_REFERENCE: ReferenceLanguage[] = [
  {
    id: 'pseudocode',
    label: 'Pseudocode',
    color: '#e2e8f0',
    code: `procedure bubbleSort(A : list of numbers)
    n <- length(A)
    while n > 1
        swapped <- false
        for i <- 1 to n - 1
            if A[i - 1] > A[i]
                swap A[i - 1] and A[i]
                swapped <- true
        if not swapped
            break
        n <- n - 1`,
  },
  {
    id: 'python',
    label: 'Python',
    color: '#3776ab',
    code: `def bubble_sort(values):
    n = len(values)
    while n > 1:
        swapped = False
        for i in range(1, n):
            if values[i - 1] > values[i]:
                values[i - 1], values[i] = values[i], values[i - 1]
                swapped = True
        if not swapped:
            break
        n -= 1`,
  },
  {
    id: 'javascript',
    label: 'JavaScript',
    color: '#f7df1e',
    code: `function bubbleSort(values) {
  let n = values.length
  while (n > 1) {
    let swapped = false
    for (let i = 1; i < n; i++) {
      if (values[i - 1] > values[i]) {
        const current = values[i - 1]
        values[i - 1] = values[i]
        values[i] = current
        swapped = true
      }
    }
    if (!swapped) break
    n -= 1
  }
}`,
  },
  {
    id: 'cpp',
    label: 'C++',
    color: '#00599c',
    code: `void bubbleSort(std::vector<int>& values) {
  int n = static_cast<int>(values.size());
  while (n > 1) {
    bool swapped = false;
    for (int i = 1; i < n; ++i) {
      if (values[i - 1] > values[i]) {
        std::swap(values[i - 1], values[i]);
        swapped = true;
      }
    }
    if (!swapped) break;
    --n;
  }
}`,
  },
]
