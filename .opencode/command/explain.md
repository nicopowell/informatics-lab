---
description: Explain a piece of the codebase conceptually and progressively, as a learning tool. Takes a file path or a symbol name.
---

Explain `$ARGUMENTS` as a study session on the Informatics Lab codebase.

## Prepare

1. Locate the target: a path, or a function/component/hook name resolved with
   glob/grep. If the name matches more than one file, show the candidates and
   ask before continuing.
2. Read the full file, then find how it is actually used: grep its
   imports/call sites. Never explain from the name or from a diff alone.
3. Consult `AGENTS.md` and `docs/` when relevant, so the explanation matches
   the project's stated intent rather than a generic guess.

## Explain

Answer in the user's language. Keep it as short as the target allows; scale
depth to size. Follow this progression, merging or skipping a point only when
it genuinely adds nothing:

1. **Problem it solves** - why this exists at all.
2. **Place in the architecture** - which layer it belongs to, what surrounds
   it, who calls it.
3. **Input and output** - the contract: what goes in, what comes out, what it
   changes.
4. **How it works internally** - the mental model, not a line-by-line walk.
5. **Step-by-step flow** - one small, concrete, realistic trace through the
   code when the logic allows it.
6. **Design decisions** - the non-obvious choices and their trade-offs; name
   the AGENTS.md/docs rule when a decision follows one, and be honest when
   intent is a guess.
7. **Concepts involved** - the programming, React or TypeScript ideas a
   reader needs here (hooks, pure functions, union types, controlled state...),
   each with a one-line definition tied to where it appears in this code.
8. **Alternatives** - one realistic different way to build this, and why the
   current one fits this project better.
9. **To implement it yourself** - what you should understand or be able to do
   to build something similar from scratch.

End with two or three verification questions only when the target is
substantial enough to warrant them.

## Style

- No line-by-line narration unless a specific line is the actual crux.
- No preamble and no summary padding; start at the problem.
- If the code contains something subtly wrong or risky, say it - learning on
  real code beats reassurance.
