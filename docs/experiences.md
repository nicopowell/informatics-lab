# Experiences

An experience is the interactive screen for a single concept (Bubble Sort,
Binary Search, ...). This document records the conventions the current
implementation follows, so new experiences stay consistent.

## Folder contract

Each experience lives in `src/algorithms/<experience-id>/`, where the folder
name is the experience id in kebab-case.

```
src/algorithms/bubble-sort/
  BubbleSortPage.tsx        page: playback state, handlers and layout wiring
  bubbleSort.ts             pure algorithm logic and step generation
  bubbleSort.test.ts        tests for the pure logic
  visualFrames.ts           steps -> visual frames, pure and tested
  visualFrames.test.ts
  ArrayBars.tsx             the visualization for this concept
  PlaybackControls.tsx      the controls for this concept
  bubbleSortReference.ts    reference snippets grouped by language
  description.md            static explanation, imported with `?raw`
  bubbleSort.css            styles specific to this concept
```

The experience id is the folder name and the last URL segment
(`/algorithms/sorting/bubble-sort`). The catalogue in `src/modules/modules.ts`
lists the experience with the same id, and `src/routes/experiences.ts` maps that
id to its page component.

## Shared shell

The page frame, layout, playback controls and reference code panel are shared
between experiences in `src/experience/`:

- **`experience.css`** — page shell, visualization/controls/description layout,
  control band, sliders, counters and the code panel. Classes use the
  `experience__*`, `code-panel*` and `code-toggle*` namespaces.
- **`CodePanel.tsx`** — the collapsible reference panel with the language
  dropdown. Pass it the experience's `ReferenceLanguage[]` and an `open` flag.
- **`CodeToggle.tsx`** — the "View code / Hide code" button.
- **`PlaybackIcon.tsx`**, **`HighlightedCode.tsx`**, **`LanguageIcon.tsx`** —
  shared presentation pieces.

A page root must carry the `experience` class (plus `experience--with-code`
when the panel is open) and import `experience.css` before its own stylesheet.
Anything that differs per algorithm — the visualization, the frame-to-text
narration, the playback timing and the controls' extra inputs — stays in the
experience folder.

## Required pieces

- **`description.md`** — the explanation shown below the visualization. It uses
  a small subset of Markdown (heading, paragraphs, `- ` lists, `**bold**`)
  rendered by `src/modules/MarkdownDescription.tsx`. Import it with
  `?raw` and pass it as `source`.
- **`<name>Reference.ts`** — export a `ReferenceLanguage[]` with the algorithm
  in different languages (pseudocode, Python, JavaScript, C++). Each entry has
  `id`, `label`, `color` and `code`. The type lives in `src/experience/CodePanel.tsx`.

## Navigation

Routing is handled by React Router with `BrowserRouter` in `main.tsx`.
`src/router.ts` keeps the catalogue logic as pure functions (resolvers and path
builders) and has no React. A new experience only needs to be added to
`src/routes/experiences.ts`; the catalogue then offers it as available and its
route resolves automatically.

Deep links require the host to serve `index.html` for unknown paths.
