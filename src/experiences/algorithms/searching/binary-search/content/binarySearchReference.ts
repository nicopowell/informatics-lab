export type ReferenceLanguage = {
  id: string
  label: string
  color: string
  code: string
}

export const BINARY_SEARCH_REFERENCE: ReferenceLanguage[] = [
  {
    id: 'pseudocode',
    label: 'Pseudocode',
    color: '#e2e8f0',
    code: `function binarySearch(A : sorted list of numbers, key) : index or not found
    low <- 0
    high <- length(A) - 1
    while low <= high
        mid <- floor((low + high) / 2)
        if A[mid] = key
            return mid
        if A[mid] < key
            low <- mid + 1
        else
            high <- mid - 1
    return not found`,
  },
  {
    id: 'python',
    label: 'Python',
    color: '#3776ab',
    code: `def binary_search(values, key):
    low = 0
    high = len(values) - 1
    while low <= high:
        mid = (low + high) // 2
        if values[mid] == key:
            return mid
        if values[mid] < key:
            low = mid + 1
        else:
            high = mid - 1
    return -1`,
  },
  {
    id: 'javascript',
    label: 'JavaScript',
    color: '#f7df1e',
    code: `function binarySearch(values, key) {
  let low = 0
  let high = values.length - 1
  while (low <= high) {
    const mid = Math.floor((low + high) / 2)
    if (values[mid] === key) {
      return mid
    }
    if (values[mid] < key) {
      low = mid + 1
    } else {
      high = mid - 1
    }
  }
  return -1
}`,
  },
  {
    id: 'cpp',
    label: 'C++',
    color: '#00599c',
    code: `int binarySearch(const std::vector<int>& values, int key) {
  int low = 0;
  int high = static_cast<int>(values.size()) - 1;
  while (low <= high) {
    const int mid = (low + high) / 2;
    if (values[mid] == key) {
      return mid;
    }
    if (values[mid] < key) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  return -1;
}`,
  },
]
