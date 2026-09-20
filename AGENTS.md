# Informatics Lab

## Project

Informatics Lab is an interactive web application for exploring and visualizing concepts from Informatics.

The project currently focuses on Algorithms and Data Structures.

## Development principles

- Keep implementations simple, readable, and easy to understand.
- Prefer working features over premature abstractions.
- Do not introduce generic frameworks, factories, registries, or complex abstractions unless the current implementation clearly requires them.
- Keep algorithmic logic independent from UI logic when practical.
- Visualizations should help explain the underlying concept, not merely decorate the interface.
- Avoid speculative features and unnecessary dependencies.
- Keep changes focused on the current task.

## Code conventions

- Write code, identifiers, and comments in English.
- Use clear and descriptive names.
- Add comments when they explain why something is done or clarify non-obvious logic.
- Do not add comments that merely restate what the code already expresses.
- Prefer explicit and readable code over clever or overly abstract solutions.
- Follow the conventions already established in the project before introducing new patterns.

## Testing

- Add tests for important algorithmic or computational logic when practical.
- Prefer deterministic tests that are easy to understand and maintain.
- Do not add tests solely for the sake of increasing coverage.

## Dependencies and documentation

- Avoid adding dependencies unless they provide clear value.
- Prefer existing project capabilities when they are sufficient.
- Use current official documentation when library behavior or APIs need verification.

## Workflow

- Keep changes focused and avoid unrelated refactors.
- Before making significant architectural changes, explain the reasoning.
- When an implementation reveals a recurring pattern, prefer observing the pattern first and generalizing only when there is a concrete need.