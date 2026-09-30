# Informatics Lab

An interactive web application for exploring and visualizing concepts from
Informatics.

The project currently focuses on Algorithms and Data Structures.

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

## Structure

Implementations live under `src/experiences/<module>/<topic>/<experience>/`,
mirroring the catalogue hierarchy and the URL. Each experience keeps its page
and stylesheet at the root and its files grouped by responsibility (`logic/`,
`visualization/`, `content/`). The shared machinery every experience reuses is
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
