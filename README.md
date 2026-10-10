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

- **Binary Search** (`src/experiences/algorithms/searching/binary-search`): generate a sorted array,
  choose a search key, and follow how the search range narrows until the value
  is found or ruled out.

- **FCFS Scheduling**
  (`src/experiences/operating-systems/process-management/fcfs-scheduling`): step a
  set of processes through the CPU one time unit at a time and follow the Gantt
  timeline, the ready queue, and the waiting and turnaround times that accumulate
  as the simulation runs. Randomize the workload or load the convoy-effect preset
  to see how one long process at the head of the queue makes every short process
  that arrives behind it wait for all of it.

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
