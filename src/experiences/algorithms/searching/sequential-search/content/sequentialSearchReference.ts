export type ReferenceLanguage = {
  id: string
  label: string
  color: string
  code: string
}

export const SEQUENTIAL_SEARCH_REFERENCE: ReferenceLanguage[] = [
  {
    id: 'pseudocode',
    label: 'Pseudocode',
    color: '#e2e8f0',
    code: `function sequentialSearch(A : list of numbers, key) : index or not found
    for i <- 0 to length(A) - 1
        if A[i] = key
            return i
    return not found`,
  },
  {
    id: 'python',
    label: 'Python',
    color: '#3776ab',
    code: `def sequential_search(values, key):
    for i, value in enumerate(values):
        if value == key:
            return i
    return -1`,
  },
  {
    id: 'javascript',
    label: 'JavaScript',
    color: '#f7df1e',
    code: `function sequentialSearch(values, key) {
  for (let i = 0; i < values.length; i++) {
    if (values[i] === key) {
      return i
    }
  }
  return -1
}`,
  },
  {
    id: 'cpp',
    label: 'C++',
    color: '#00599c',
    code: `int sequentialSearch(const std::vector<int>& values, int key) {
  for (int i = 0; i < static_cast<int>(values.size()); i++) {
    if (values[i] == key) {
      return i;
    }
  }
  return -1;
}`,
  },
]
