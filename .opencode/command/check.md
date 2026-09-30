---
description: Run the project verification pipeline (tests, lint, build) and report the results.
---

Run the Informatics Lab verification pipeline.

1. If the user passed an argument, use it as a test filter:
   `npx vitest run $ARGUMENTS`. Otherwise run `npm test`.
2. Run `npm run lint`.
3. Run `npm run build`.

Report compactly:

- One line per step: `PASS <step>` or `FAIL <step>`.
- For every failure, the decisive excerpt (file, line, message) and a
  one-sentence diagnosis.
- A final one-line verdict.

Do not modify any files while reporting; only run the steps above.
