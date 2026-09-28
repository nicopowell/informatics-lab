export type Experience = {
  id: string
  title: string
  description: string
  available: boolean
}

export type Topic = {
  id: string
  title: string
  description: string
  available: boolean
  experiences: Experience[]
}

export type ModuleInfo = {
  id: string
  title: string
  subtitle: string
  topics: Topic[]
}

export const MODULES: ModuleInfo[] = [
  {
    id: 'algorithms',
    title: 'Algorithms & Data Structures',
    subtitle: 'Complexity, ADTs, sorting and searching',
    topics: [
      {
        id: 'sorting',
        title: 'Sorting',
        description: 'Ordering data and comparing strategies.',
        available: true,
        experiences: [
          {
            id: 'bubble-sort',
            title: 'Bubble Sort',
            description: 'Compare and exchange adjacent values.',
            available: true,
          },
          {
            id: 'selection-sort',
            title: 'Selection Sort',
            description: 'Select the smallest value each pass.',
            available: false,
          },
          {
            id: 'insertion-sort',
            title: 'Insertion Sort',
            description: 'Insert each value into the sorted prefix.',
            available: false,
          },
          {
            id: 'merge-sort',
            title: 'Merge Sort',
            description: 'Divide, sort and merge the halves.',
            available: false,
          },
        ],
      },
      {
        id: 'searching',
        title: 'Searching',
        description: 'Locating values in ordered and indexed data.',
        available: true,
        experiences: [
          {
            id: 'binary-search',
            title: 'Binary Search',
            description: 'Halve a sorted range until the value is found.',
            available: true,
          },
          {
            id: 'sequential-search',
            title: 'Sequential Search',
            description: 'Check each value from the start.',
            available: false,
          },
        ],
      },
      {
        id: 'trees',
        title: 'Trees',
        description: 'Hierarchical structures and traversals.',
        available: false,
        experiences: [],
      },
      {
        id: 'graphs',
        title: 'Graphs',
        description: 'Vertices, edges and traversal.',
        available: false,
        experiences: [],
      },
      {
        id: 'data-structures',
        title: 'Data Structures',
        description: 'Stacks, queues, lists and related ADTs.',
        available: false,
        experiences: [],
      },
    ],
  },
  {
    id: 'numerical',
    title: 'Numerical Methods',
    subtitle: 'Approximation, convergence and error',
    topics: [
      {
        id: 'interpolation',
        title: 'Interpolation',
        description: 'Fitting functions through known points.',
        available: false,
        experiences: [],
      },
      {
        id: 'integration',
        title: 'Numerical Integration',
        description: 'Approximating definite integrals.',
        available: false,
        experiences: [],
      },
      {
        id: 'differential-equations',
        title: 'Differential Equations',
        description: 'Solving equations step by step.',
        available: false,
        experiences: [],
      },
    ],
  },
  {
    id: 'networks',
    title: 'Computer Networks',
    subtitle: 'Protocols, layers, routing and latency',
    topics: [
      {
        id: 'layers',
        title: 'Layers & Protocols',
        description: 'How communication is organised in layers.',
        available: false,
        experiences: [],
      },
      {
        id: 'routing',
        title: 'Routing',
        description: 'Finding paths between hosts.',
        available: false,
        experiences: [],
      },
      {
        id: 'transport',
        title: 'Transport & Congestion',
        description: 'Reliable transfer and flow control.',
        available: false,
        experiences: [],
      },
    ],
  },
]
