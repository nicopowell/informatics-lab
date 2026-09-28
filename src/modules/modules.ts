export type Topic = {
  id: string
  title: string
  description: string
  available: boolean
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
      },
      {
        id: 'searching',
        title: 'Searching',
        description: 'Locating values in ordered and indexed data.',
        available: true,
      },
      {
        id: 'trees',
        title: 'Trees',
        description: 'Hierarchical structures and traversals.',
        available: false,
      },
      {
        id: 'graphs',
        title: 'Graphs',
        description: 'Vertices, edges and traversal.',
        available: false,
      },
      {
        id: 'data-structures',
        title: 'Data Structures',
        description: 'Stacks, queues, lists and related ADTs.',
        available: false,
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
      },
      {
        id: 'integration',
        title: 'Numerical Integration',
        description: 'Approximating definite integrals.',
        available: false,
      },
      {
        id: 'differential-equations',
        title: 'Differential Equations',
        description: 'Solving equations step by step.',
        available: false,
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
      },
      {
        id: 'routing',
        title: 'Routing',
        description: 'Finding paths between hosts.',
        available: false,
      },
      {
        id: 'transport',
        title: 'Transport & Congestion',
        description: 'Reliable transfer and flow control.',
        available: false,
      },
    ],
  },
]
