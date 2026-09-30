---
name: add-experience
description: Add or modify an interactive experience (a concept visualization screen) for any module of Informatics Lab - e.g. a sorting algorithm, a numerical method, a network protocol simulation. Use when creating a new experience, or registering one in the catalogue (modules.ts), the card art (experienceArt.tsx) or the route registry (EXPERIENCES). Do NOT use for generic edits to the shared machinery in src/experience/ or to the catalogue pages themselves.
---

# Adding an experience

An experience is a routed interactive screen for a single concept. Catalogue
availability, routes and the breadcrumb are derived from registration points,
so adding a concept means creating the files the concept needs and wiring the
experience into the points the project currently uses. Read
`docs/experiences.md` for the full conventions.

Where those files live depends on the module. Inspect one or more existing
experiences of the target module first and follow the structure they
establish. If the module has no experience yet, reuse the layout of the
closest existing module rather than inventing a new one: implementations, not
abstractions, inform the architecture.

Before writing code, decide:

- **id**: kebab-case. It must match in the folder name, the catalogue entry,
  the card art key and the route registry.
- **Module and topic**: an existing topic in `src/modules/modules.ts`. Adding
  modules or topics is a catalogue change outside this workflow.
- **Representation**: whatever explains the concept best (bars, cells, nodes
  and edges, curves...). Reuse the existing visual language first; introduce
  a new one only when the concept genuinely requires it.
- **Narration**: what each frame says to the user (see `describeFrame` in the
  existing experiences).

## Steps

1. **Catalogue** — add the experience to the topic's `experiences` array in
   `src/modules/modules.ts`: `id`, `title`, one-line `description`.
2. **Card art** — add an SVG component and its `ART[id]` entry in
   `src/modules/experienceArt.tsx`. Without it the catalogue card renders
   without artwork.
3. **Pure logic** — input and step generation for the concept, following the
   module's file layout. No React, no UI types. Covered by deterministic
   tests with fixed inputs and exact expected steps (seed or inject any
   randomness).
4. **Visual frames** — steps mapped to renderable frames, with tests. Model
   the frame `kind` variants the narration needs (ready, compare, swap,
   done, ...).
5. **Reference code** — `<name>Reference.ts` exporting a `ReferenceLanguage[]`
   (pseudocode, Python, JavaScript, C++). The type lives in
   `src/experience/CodePanel.tsx`.
6. **Description** — `description.md` explaining the concept and its
   complexity. It may only use headings, paragraphs, `- ` lists and
   `**bold**` (rendered by `MarkdownDescription`). Import it with `?raw`.
7. **Visualization component** — one component that renders the current
   frame. Encode state with the shared color roles.
8. **Styles** — `<name>.css` with BEM classes namespaced to the experience,
   theme tokens from `src/theme.css` (`--color-comparing`, `--color-success`,
   `--color-neutral`...), and the shared `.ui-button` for secondary controls.
   Do not invent new colors or button treatments.
9. **Page** — `<Name>Page.tsx`:
   - takes **no props**; navigation is handled by the breadcrumb;
   - renders `<AppShell className="experience <name>" ...>`, adding
     `experience--with-code` when the code panel is open, and passing
     `--step-duration` through `style` (cast to `CSSProperties`);
   - imports `experience.css` before its own stylesheet;
   - wires `usePlayback(frames.length, delay)` and `<PlaybackControls>`
     (pass the `onNavigate` callback only when movements animate across frame
     transitions);
   - provides the concept's inputs (size slider, randomize, value picker...)
     and formats its own counters via the `counts` list;
   - includes `<CodeToggle>`/`<CodePanel>` and `<MarkdownDescription>`.
10. **Register** — add `'<id>': <Name>Page` to `EXPERIENCES` in
    `src/routes/experiences.ts`. Today that single map is the source of truth
    for catalogue availability, topic gating and route resolution; if newer
    experiences are wired differently, follow the code, not this list.

## Verify

- `npm test && npm run lint && npm run build`
- With the dev server: the card links to the experience at
  `/<module>/<topic>/<id>`, playback play/pause/step/reset and speed behave,
  inputs restart the run cleanly, the description and code panel render, and
  the breadcrumb shows all four levels.

## Constraints

- Do not add navigation props to experience pages.
- Do not modify the shared pieces in `src/experience/` to fit a single new
  concept; generalization needs evidence from more than one concrete
  implementation (AGENTS.md).
- Do not add dependencies.
- Code, comments and descriptions in English.
