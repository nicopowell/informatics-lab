# Informatics Lab

An interactive web application for exploring and visualizing concepts from
Informatics.

It currently covers two areas: Algorithms and Data Structures, and Operating
Systems.

Experiences are reached through a catalogue: Modules → Topics → Experiences.
Topics and experiences that are not implemented yet appear as "coming soon".

## Experiences

- **Bubble Sort** (`src/experiences/algorithms/sorting/bubble-sort`): generate an array, run the
  algorithm and follow each comparison and exchange step by step. It also shows
  a description of the algorithm and its reference implementation in pseudocode,
  Python, JavaScript and C++.

  You can also load the array by shape instead of rolling dice: *Already sorted*,
  *Reverse sorted*, *Nearly sorted* or *Many duplicates*. A preset is a shape, not a
  fixed array, so it regenerates at whatever length the size control shows. What
  makes the shapes worth having is the `Passes` readout: at length 8 an
  already-sorted run costs one pass while a reversed one costs seven, so the best
  and worst case of this algorithm are visible without any theory. The write counts
  are not exact, because the shape draws values that can tie: a reversed run costs
  bubble sort between 26 and 28 exchanges and Selection Sort between 3 and 5, while
  the 28 comparisons stay fixed. The file lives at
  topic level (`src/experiences/algorithms/sorting/presets.ts`), like the scheduling
  workloads, so a second sorting experience can be started from identical inputs and
  then compare behaviour rather than luck.

- **Selection Sort** (`src/experiences/algorithms/sorting/selection-sort`): scan the
  unordered tail for the smallest value, exchange it into the first free slot, and follow
  the sorted head grow one place per pass. Like Bubble Sort, it shows its reference
  implementation in pseudocode, Python, JavaScript and C++. It shares `presets.ts` with
  Bubble Sort, so the same shape can be read on both screens: at length 8 an
  already-sorted array costs bubble sort 7 comparisons in one pass and selection sort 28
  comparisons in seven, while a reversed one costs bubble sort 28 exchanges against
  selection sort's 4. Selection sort pays the full scan either way, which is the lesson
  the presets were built to show.

- **Insertion Sort** (`src/experiences/algorithms/sorting/insertion-sort`): lift one value
  into the hand, walk left through the ordered prefix sliding every bigger value one slot
  right, and close the hole where the scan stops. Like the other two sorting experiences,
  it shows its reference implementation in pseudocode, Python, JavaScript and C++, where
  the scan's strict `>` is the line that keeps equal values in place. It is the adaptive
  one of the three. At length 8 an *Already sorted* array costs it 7 comparisons and no
  shift at all — one comparison per pass, which is the best case the algorithm has — while
  the same shape costs Selection Sort its full 28. On *Reverse sorted* all three pay 28
  comparisons, and the difference is in the writes: insertion shifts once for every step a
  value travels, selection exchanges at most once per pass. A preset is a shape rather
  than a fixed array, so the write counts move a little between loads; the comparison
  counts above are the ones that hold every time.

- **Binary Search** (`src/experiences/algorithms/searching/binary-search`): generate a sorted array,
  choose a search key, and follow how the search range narrows until the value
  is found or ruled out.

- **FCFS Scheduling**
  (`src/experiences/operating-systems/process-management/fcfs-scheduling`): step a
  set of processes through the CPU one time unit at a time and follow the Gantt
  timeline, the ready queue, and the waiting and turnaround times that accumulate
  as the simulation runs. Randomize the workload, or load the convoy-effect
  preset to see how one long process at the head of the queue makes every short
  process that arrives behind it wait for all of it, or the starvation preset to
  see five one-unit jobs wait the full burst of a long one behind them.

  Both presets are the same workloads the SJF experience offers, and that is the
  point: the two pages share their processes and their board at topic level, so
  running the same workload on both compares the dispatch rule and nothing else.

- **SJF Scheduling**
  (`src/experiences/operating-systems/process-management/sjf-scheduling`): the same
  processes and the same board under a different dispatch rule — whenever the CPU
  becomes free, the shortest of the already-arrived bursts runs. Only the policy
  changes between the two experiences, so the comparison shows what the rule is
  worth on its own: Shortest-Job-First cuts waiting time dramatically on a
  starvation workload, and on the convoy workload it produces exactly FCFS's
  schedule, because a non-preemptive policy never displaces the long process that
  already owns the CPU.

## Structure

Implementations live under `src/experiences/<module>/<topic>/<experience>/`,
mirroring the catalogue hierarchy and the URL. Each experience keeps its page
and stylesheet at the root and its files grouped by responsibility (`logic/`,
`visualization/`, `content/`). Code that several experiences of one topic share
lives at that topic's level: the two scheduling experiences share their workload
factory and their process board, and keep only their dispatch policy and
narration to themselves. The shared machinery every experience reuses is
in `src/experience/`, and the catalogue data in `src/modules/modules.ts`.

## Documentation

- `docs/project.md` — goals, scope, design principles and current status.
- `docs/experiences.md` — conventions for adding or modifying an experience.

## Scripts

- `npm run dev` starts the development server.
- `npm run build` type-checks and builds for production.
- `npm run preview` serves the production build locally.
- `npm run lint` runs ESLint.
- `npm run test` runs the tests with Vitest.
