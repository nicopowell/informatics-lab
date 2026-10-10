export type Experience = {
  id: string
  title: string
  description: string
}

export type Topic = {
  id: string
  title: string
  description: string
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
        experiences: [
          {
            id: 'bubble-sort',
            title: 'Bubble Sort',
            description: 'Compare and exchange adjacent values.',
          },
          {
            id: 'selection-sort',
            title: 'Selection Sort',
            description: 'Select the smallest value each pass.',
          },
          {
            id: 'insertion-sort',
            title: 'Insertion Sort',
            description: 'Insert each value into the sorted prefix.',
          },
          {
            id: 'merge-sort',
            title: 'Merge Sort',
            description: 'Divide, sort and merge the halves.',
          },
        ],
      },
      {
        id: 'searching',
        title: 'Searching',
        description: 'Locating values in ordered and indexed data.',
        experiences: [
          {
            id: 'binary-search',
            title: 'Binary Search',
            description: 'Halve a sorted range until the value is found.',
          },
          {
            id: 'sequential-search',
            title: 'Sequential Search',
            description: 'Check each value from the start.',
          },
        ],
      },
      {
        id: 'trees',
        title: 'Trees',
        description: 'Hierarchical structures and traversals.',
        experiences: [],
      },
      {
        id: 'graphs',
        title: 'Graphs',
        description: 'Vertices, edges and traversal.',
        experiences: [],
      },
      {
        id: 'data-structures',
        title: 'Data Structures',
        description: 'Stacks, queues, lists and related ADTs.',
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
        experiences: [],
      },
      {
        id: 'integration',
        title: 'Numerical Integration',
        description: 'Approximating definite integrals.',
        experiences: [],
      },
      {
        id: 'differential-equations',
        title: 'Differential Equations',
        description: 'Solving equations step by step.',
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
        experiences: [],
      },
      {
        id: 'routing',
        title: 'Routing',
        description: 'Finding paths between hosts.',
        experiences: [],
      },
      {
        id: 'transport',
        title: 'Transport & Congestion',
        description: 'Reliable transfer and flow control.',
        experiences: [],
      },
    ],
  },
  {
    id: 'operating-systems',
    title: 'Operating Systems',
    subtitle: 'Processes, scheduling and resource management',
    topics: [
      {
        id: 'process-management',
        title: 'Process Management',
        description: 'Processes, CPU scheduling and their timing.',
        experiences: [
          {
            id: 'fcfs-scheduling',
            title: 'FCFS Scheduling',
            description: 'Dispatch processes in arrival order and watch them wait.',
          },
        ],
      },
    ],
  },
]
