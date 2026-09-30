---
description: Analyze the current git changes and recommend a Conventional Commits message with a short rationale. Never commits.
---

Recommend a commit message for the current state of the repository.

## Gather

1. Run `git status --short` to see what changed and what is untracked.
2. Run `git diff --cached` when something is staged; otherwise `git diff` for
   the working tree. If the user passed an argument, treat it as a range or
   branch pair (e.g. `main..HEAD`) and use `git log` and `git diff` for that
   range instead.
3. Run `git log --oneline -10` to match the project's message style.
4. Read the changed files themselves when a diff alone is not enough to
   understand the intent.

## Report

- One recommended subject line: Conventional Commits
  (`feat:` / `fix:` / `refactor:` / `chore:` / `docs:`), lowercase, imperative,
  concise, matching the recent history.
- An optional body only when the "why" is not obvious from the subject.
- Two or three bullets justifying the choice: why that type and what the
  change actually is.
- A line listing the files that belong in the commit, and a separate warning
  if any pending file looks like a scratch or test artifact that should NOT be
  committed.
- When the pending changes contain two unrelated intents, propose splitting
  them into two commits with a subject line for each.
- When there is nothing to commit, say so in one line and stop.

Never run `git commit` and never modify files; you only propose.
