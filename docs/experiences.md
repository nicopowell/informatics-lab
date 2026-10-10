# Experiences

An experience is the interactive screen for a single concept (Bubble Sort,
Binary Search, ...). This document records the conventions the current
implementation follows, so new experiences stay consistent.

## Folder contract

Each experience lives in `src/experiences/<module-id>/<topic-id>/<experience-id>/`,
where the folder names mirror the catalogue ids in `src/modules/modules.ts` and
the URL (`/algorithms/sorting/bubble-sort`). The experience id (the folder name,
kebab-case) must be unique across the whole application.

```
src/experiences/algorithms/sorting/bubble-sort/
  BubbleSortPage.tsx        page (entry point): input state, playback wiring and layout
  bubbleSort.css            styles specific to this concept
  logic/
    bubbleSort.ts           pure algorithm logic and step generation
    bubbleSort.test.ts      tests for the pure logic
    visualFrames.ts         steps -> visual frames, pure and tested
    visualFrames.test.ts
  visualization/
    ArrayBars.tsx           the visualization for this concept
  content/
    description.md          static explanation, imported with `?raw`
    bubbleSortReference.ts  reference snippets grouped by language
```

The page and its stylesheet stay at the experience root; the rest is grouped by
responsibility, and every test lives next to the file it covers.

Imports follow two rules: shared machinery is always reached through the `@/`
alias (`@/experience/usePlayback`, `@/components/AppShell`), while code inside
an experience uses short relative paths (`./logic/bubbleSort`,
`../logic/visualFrames`). An experience is then free to move within the tree
without touching other files.

The catalogue in `src/modules/modules.ts` lists the experience with the same
id, and `src/routes/experiences.ts` maps that id to its page component. It is
the only file that knows where an implementation lives.

## Shared shell

The page frame and header come from `src/components/AppShell.tsx` (see below),
and the experience layout, playback controls and reference code panel are shared
in `src/experience/`:

- **`AppShell.tsx`** (`src/components/`) — the page frame, header, breadcrumb and
  grain used by every screen. Pass the experience scope classes through
  `className` and the `--step-duration` custom property through `style`. The
  breadcrumb (`Breadcrumb.tsx`) derives the navigation trail from the URL, so
  screens do not wire navigation.
- **`experience.css`** — visualization/controls/description layout, control
  band, sliders, counters and the code panel. Classes use the `experience__*`,
  `code-panel*` and `code-toggle*` namespaces. The quiet base look of buttons
  and links comes from the shared `.ui-button` (`app-shell.css`); buttons opt
  in through that class instead of a blanket selector.
- **`PlaybackControls.tsx`** — the playback band: reset, step back, play/pause,
  step forward, the speed slider and a `counts` list. Each experience decides
  which counters to show and how to format them. `MIN_SPEED` and `MAX_SPEED`
  are exported from here.
- **`usePlayback.ts`** — hook owning the frame index, the playing state, the
  auto-advance timer and the play/step/reset actions. Pass an `onNavigate`
  callback when the visualization needs the pair of frames involved in a move.
- **`CodePanel.tsx`** — the collapsible reference panel with the language
  dropdown. Pass it the experience's `ReferenceLanguage[]` and an `open` flag.
- **`CodeToggle.tsx`** — the "View code / Hide code" button.
- **`MarkdownDescription.tsx`** — renders the experience's `description.md`.
- **`PlaybackIcon.tsx`**, **`HighlightedCode.tsx`**, **`LanguageIcon.tsx`** —
  shared presentation pieces.

A page root must carry the `experience` class (plus `experience--with-code`
when the panel is open) and import `experience.css` before its own stylesheet.
Anything that differs per algorithm — the visualization, the frame-to-text
narration, the playback timing and the controls' extra inputs — stays in the
experience folder.

## Required pieces

- **`content/description.md`** — the explanation shown below the visualization. It uses
  a small subset of Markdown (heading, paragraphs, `- ` lists, `**bold**`)
  rendered by `src/experience/MarkdownDescription.tsx`. Import it with
  `?raw` and pass it as `source`.
- **`content/<name>Reference.ts`** — export a `ReferenceLanguage[]` with the algorithm
  in different languages (pseudocode, Python, JavaScript, C++). Each entry has
  `id`, `label`, `color` and `code`. The type lives in `src/experience/CodePanel.tsx`.

## Navigation

Routing is handled by React Router with `BrowserRouter` in `main.tsx`.
`src/router.ts` keeps the catalogue logic as pure functions (resolvers, path
builders and the breadcrumb trail) and has no React. The breadcrumb shown on
every screen is derived from the current URL, so navigation needs no per-screen
configuration. A new experience only needs to be added to
`src/routes/experiences.ts`: availability is then derived by the rules in
`src/router.ts` — a topic is available when at least one of its experiences is
registered in `IMPLEMENTED_EXPERIENCES`, and a module is available when at least
one of its topics is available — and its route resolves automatically.

Deep links require the host to serve `index.html` for unknown paths.
