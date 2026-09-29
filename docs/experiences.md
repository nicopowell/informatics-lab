# Experiences

An experience is the interactive screen for a single concept (Bubble Sort,
Binary Search, ...). This document records the conventions the current
implementation already follows, so new experiences stay consistent and the
shared pieces can be extracted from evidence rather than guessed.

## Folder contract

Each experience lives in `src/algorithms/<experience-id>/`, where the folder
name is the experience id in kebab-case.

```
src/algorithms/bubble-sort/
  BubbleSortPage.tsx        page: shell, playback state and handlers
  bubbleSort.ts             pure algorithm logic and step generation
  bubbleSort.test.ts        tests for the pure logic
  visualFrames.ts           steps -> visual frames, pure and tested
  visualFrames.test.ts
  ArrayBars.tsx             the visualization for this concept
  PlaybackControls.tsx      controls for this concept
  bubbleSortReference.ts    reference snippets grouped by language
  description.md            static explanation, imported with `?raw`
  bubbleSort.css            styles scoped to this experience
```

The experience id is the folder name and the last URL segment
(`/algorithms/sorting/bubble-sort`). The catalogue in `src/modules/modules.ts`
lists the experience with the same id, and `src/routes/experiences.ts` maps that
id to its page component.

## Required pieces

- **`description.md`** — the explanation shown below the visualization. It uses
  a small subset of Markdown (heading, paragraphs, `- ` lists, `**bold**`)
  rendered by `src/modules/MarkdownDescription.tsx`. Import it with
  `?raw` and pass it as `source`.
- **`<name>Reference.ts`** — export a `ReferenceLanguage[]` with the algorithm
  in different languages (pseudocode, Python, JavaScript, C++). Each entry has
  `id`, `label`, `color` and `code`. The code panel renders one entry at a time
  through `HighlightedCode.tsx`.

## Navigation

Routing is handled by React Router with `BrowserRouter` in `main.tsx`.
`src/router.ts` keeps the catalogue logic as pure functions (resolvers and path
builders) and has no React. A new experience only needs to be added to
`src/routes/experiences.ts`; the catalogue then offers it as available and its
route resolves automatically.

Deep links require the host to serve `index.html` for unknown paths.

## Pending extraction

The experience shell (layout, code toggle, panel and language selector) currently
exists only in Bubble Sort. It will be extracted when a second experience reuses
this layout (adapting Binary Search is the planned trigger). Until then, keep the
per-experience files explicit rather than generalising from a single example.
