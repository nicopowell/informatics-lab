# Informatics Lab

An interactive web application for exploring and visualizing concepts from
Informatics.

The project currently focuses on Algorithms and Data Structures.

Experiences are reached through a catalogue: Modules → Topics → Experiences.
Topics and experiences that are not implemented yet appear as "coming soon".

## Experiences

- **Bubble Sort** (`src/algorithms/bubble-sort`): generate an array, run the
  algorithm and follow each comparison and exchange step by step. It also shows
  a description of the algorithm and its reference implementation in pseudocode,
  Python, JavaScript and C++.

- **Binary Search** (`src/algorithms/binary-search`): generate a sorted array,
  choose a search key, and follow how the search range narrows until the value
  is found or ruled out.

## Documentation

- `docs/project.md` — goals, scope, design principles and current status.
- `docs/experiences.md` — conventions for adding or modifying an experience.

## Scripts

- `npm run dev` starts the development server.
- `npm run build` type-checks and builds for production.
- `npm run preview` serves the production build locally.
- `npm run lint` runs ESLint.
- `npm run test` runs the tests with Vitest.
