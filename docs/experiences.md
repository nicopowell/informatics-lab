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

A topic may also hold shared modules directly under
`src/experiences/<module-id>/<topic-id>/`, outside any experience folder, but
only once more than one experience in that topic needs the identical thing —
never on the first consumer's hunch. In
`operating-systems/process-management`, `workloads.ts`, `schedule.ts`,
`SchedulingBoard.tsx` and `schedulingBoard.css` live at that level because
both scheduling experiences consume them unchanged: what is shared is the
data shape (`Process`, `ScheduleStep`, `SchedulingFrame`) and the rendering
of that shape on the Gantt board. What stays per-experience is the policy
(`fcfs-scheduling/logic/fcfsScheduling.ts`,
`sjf-scheduling/logic/sjfScheduling.ts`) and the page narration. This is a
plain module, not a framework: nothing discovers or registers these files,
the experiences import them with explicit relative paths (`../workloads`,
`../SchedulingBoard`), and a first consumer keeps its own copies until a
second real one exists.

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
## Optional pieces

- **`content/<name>Reference.ts`** — export a `ReferenceLanguage[]`, one entry per
  language with `id`, `label`, `color` and `code`. The type lives in
  `src/experience/CodePanel.tsx`, which renders the panel with
  `src/experience/CodeToggle.tsx`.

Not every concept teaches code, so an experience is not incomplete for lacking a
reference panel. Add one when reading implementations is part of what the
concept is about — for Bubble Sort and Binary Search it is, because the loop
nesting and the swap are the thing being studied and they change shape across
languages.

Do not add one by default. A simulation teaches the consequence of a rule, not
the rule's source text, and the panel carries a cost the visualization does not:
the snippets are strings, so no test covers them, they ship to the browser, and
they drift silently from the implementation they claim to show. The scheduling
panels had already drifted. The FCFS snippet skipped the CPU forward per process:

```python
start = max(clock, arrival)
clock = start + burst
```

That is a closed form. The board on the same screen advances one unit at a time,
with a ready queue and an idle gap whenever nothing has arrived — a shortcut the
visualization never takes, and nothing could have reported the difference. The
file was removed in `dee1db4`; the example is kept here on purpose.

Anything a panel would be the only place to say belongs in `description.md`
instead, where it is short, reviewable and actually read. The SJF dispatch order
(smallest burst, then earliest arrival, then queue order) is a rule of the
concept, not an implementation detail, so it is prose.

## Navigation

Routing is handled by React Router with `BrowserRouter` in `main.tsx`.
`src/router.ts` keeps the catalogue logic as pure functions (resolvers, path
builders and the breadcrumb trail) and has no React. The breadcrumb shown on
every screen is derived from the current URL, so navigation needs no per-screen
configuration. A new experience only needs to be added to
`src/routes/experiences.ts`: availability is then derived by the rules in
`src/router.ts` — a topic is available when at least one of its experiences is
registered in `IMPLEMENTED_EXPERIENCES`, and a module is available when at least
one of its topics is available — and its route resolves automatically. That set
is exported as `ReadonlySet<string>` on purpose: it is derived from the registry
and is the only source of availability, so screens read membership and cannot
add or remove ids (the predicates in `src/router.ts` take the same read-only
type).
Registration is everything: an experience is reachable because it is
registered there, not because anything else marks it available. Each new id
also needs a card in `src/modules/experienceArt.tsx`, because `ExperienceArt`
falls back to a dashed placeholder when an id has no dedicated art.

Deep links require the host to serve `index.html` for unknown paths. On Vercel
this is satisfied by the catch-all rewrite in `vercel.json` at the repository
root, so it belongs to the project and not to dashboard settings nobody can
review: without that file, any shared URL or browser refresh answers 404 before
the app is downloaded. `vite dev` and `vite preview` hide the problem, because
both already fall back to `index.html` — the bug only ever appears on a real
deployment.
