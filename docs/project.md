# Informatics Lab

## Overview

Informatics Lab is an interactive web application for exploring, visualizing, and experimenting with concepts from Computer Science and Informatics.

The project is being developed as a learning project as well as a potentially useful educational tool for students and teachers.

The main goal is not to simply present implementations or animations, but to make computational concepts understandable through interaction. Users should be able to configure inputs, execute algorithms or simulations, observe how they evolve, and inspect what is happening internally.

The project starts with Algorithms and Data Structures and may grow organically toward other areas of Informatics.

## Motivation

The project has two main purposes:

1. Consolidate and deepen the developer's understanding of concepts learned throughout the Informatics degree by implementing and visualizing them.
2. Eventually provide an accessible and useful tool that other students and teachers can use to explore those concepts.

The project should remain useful as a learning project even if some envisioned features are never implemented.

## Core idea

A concept should not be represented by a generic visualization simply because it is convenient to implement.

Each concept should use the representation and interaction model that best helps explain it.

For example:

* A sorting algorithm may be represented as an evolving array with comparisons and swaps.
* A numerical method may be better represented through a graph and successive approximations.
* A graph algorithm may use nodes, edges, traversal state, and highlighted paths.
* A network concept may require nodes, links, packets, queues, and events.

Different concepts are expected to have different visual languages and interaction models.

## Interaction philosophy

The application should support progressively deeper interaction.

### Level 1 — Observe

The user can:

* Configure or provide input data.
* Execute a concept.
* Observe its visual representation.

### Level 2 — Control

The user can, when appropriate:

* Pause and resume execution.
* Advance through the execution step by step.
* Move backward when the underlying representation supports it.
* Control execution speed.
* Inspect relevant internal information.

### Level 3 — Explore

The user can experiment by changing:

* Input data.
* Parameters.
* Configuration.

The purpose is to let users observe how different choices affect the execution.

More advanced educational functionality, such as quizzes, automatic assessment, or allowing users to implement algorithms directly inside the application, is not currently part of the project scope.

## Initial scope

The first subject is:

**Algorithms and Data Structures**

The initial implementation should focus on building one complete, understandable interactive experience rather than trying to cover the entire subject.

The first planned experience is a visualization of a sorting algorithm, starting with Bubble Sort (direct exchange).

The initial experience should eventually allow the user to:

* Work with an array of numbers.
* Configure or generate the input.
* Execute Bubble Sort.
* Observe comparisons and swaps.
* Control the execution.

The exact interaction details should be discovered while implementing the feature rather than fully designed in advance.

## Algorithms and Data Structures curriculum

The initial subject is based on the following curriculum.

### Algorithms

* Definition and characteristics of algorithms.
* Algorithm complexity.
* Big O notation.
* Analysis techniques.
* Algorithm design:

  * Recursion.
  * Divide and conquer.
  * Balance.
  * Dynamic programming.
  * Greedy algorithms.
* Program performance.
* Temporal and spatial complexity.
* Problem complexity.
* Introduction to P, NP, and NP-complete problems.

### Basic Abstract Data Types

* Formal specifications and algebraic specification.
* Stack.
* Queue.
* List and circular list.
* Applications.
* Array-based and linked-list implementations.
* Static and dynamic variables, including advantages, disadvantages, and limitations.

### Non-linear Data Types

* Trees.
* Binary trees.
* Tree representations and applications.
* Graphs.
* Directed and undirected graphs.
* Graph ADT.
* Adjacency matrices and adjacency lists.
* Eulerian and Hamiltonian cycles.
* DFS and BFS.
* Minimum spanning trees.
* Prim's algorithm.
* Shortest paths:

  * Dijkstra.
  * Floyd.
  * Warshall.

### Sorting

* Sorting problem.
* Runtime, memory usage, stability, and sensitivity.
* Selection sort.
* Insertion sort.
* Direct exchange / Bubble Sort.
* Shell sort.
* Quick sort.
* Merge sort.
* Priority queues.
* Heaps and Heap Sort.
* Radix sort.
* Linear sorting for particular keys.
* External sorting.
* Merge methods.
* Complexity and comparison of sorting methods.

### Searching

* Table ADT.
* Sequential search.
* Binary search.
* Binary search trees.
* Balanced binary search trees.
* Height and search cost.
* Multiway trees.
* B-trees.
* Search algorithms and complexity.
* Hashing.
* Hash functions.
* Collisions and collision-resolution techniques.

## Technology

The current technology direction is:

* TypeScript.
* React.
* Vite.
* SVG and/or Canvas for visualizations, depending on what is appropriate for each concept.

The project is intentionally a client-side web application at this stage.

There is currently no need for:

* A backend.
* A database.
* Authentication.
* Server-side rendering.
* A complex state-management framework.
* A component library.
* An animation framework.

These may be reconsidered later if a concrete need appears.

## Design principles

### Visualization with purpose

Animations and visual elements should help explain the underlying concept.

Visual complexity should not be added merely to make the application look impressive.

### Experimentation

Users should be able to change inputs or parameters when doing so helps them understand the concept.

### Explicit execution

When useful, the application should make the evolution of an algorithm or simulation observable rather than hiding it behind a single final result.

### Simplicity first

Prefer the simplest implementation that solves the current problem.

Do not design a generalized system before multiple concrete examples demonstrate that it is necessary.

### Generalize from evidence

Different concepts may eventually share common execution or visualization patterns.

However, shared abstractions should emerge from real implementations and repeated needs rather than being designed in advance.

### Separate concerns when useful

Algorithmic or computational logic should remain reasonably independent from UI and visualization logic when doing so improves clarity.

This does not require creating abstractions solely to enforce separation.

## Visual design guidelines

These guidelines keep the experiences recognizably part of Informatics Lab. They are principles to consult while building, not a design system or a component architecture.

### One visual identity

Every experience should feel like part of the same application: typography, spacing, color roles, button treatment, and page structure should stay consistent. Moving between experiences should not feel like switching applications.

### The visualization is the protagonist

The representation of the concept should dominate the screen. Give it the largest scale, the central position, and the most space. Everything else supports it.

### Controls are secondary

Controls belong in the background relative to the visualization. Keep them visually quiet, with a single clear primary action when there is one. Chrome should not compete with the concept.

### Color carries consistent meaning

Color encodes state, not decoration. The same role uses the same color across experiences, and each color has a single meaning within an experience. Prefer a small, reused palette over many colors.

### States and motion before decoration

Prefer clear states and purposeful transitions over decorative effects. Gradients, shadows, and flourishes are acceptable when they reinforce hierarchy or state, never as the reason an element exists.

### Animations explain

Animation should clarify what the algorithm or process does — a comparison, a movement, a narrowing range — rather than make the interface feel dynamic. If an animation does not help explain something, it does not belong.

### Technical information is a second layer

Indices, counters, and internal values matter, but they support the main representation. Keep them legible and present without competing with it.

### Consistency without uniformity

A shared visual language does not mean identical visualizations. Each concept uses the representation and interaction that explain it best. Sorting may use bars; searching may use cells; graphs will use nodes and edges.

### Reuse before inventing

New experiences should reuse the existing visual language first. A new representation, color role, or interaction pattern should be introduced only when the concept genuinely requires it.

## Scope philosophy

The project is intentionally ambitious in its long-term vision but conservative in its immediate scope.

The intended development process is:

1. Build a small complete experience.
2. Learn from the implementation.
3. Identify real recurring patterns.
4. Improve the design when those patterns justify it.
5. Expand to another concept.
6. Generalize only when there is evidence that the abstraction is useful.

Avoid spending significant development time deciding how every future concept will work before implementing the first ones.

The implementation should inform the architecture.

## Future direction

The project may eventually expand beyond Algorithms and Data Structures into other areas of Informatics, potentially including subjects such as:

* Numerical Methods.
* Computer Networks and Communications.
* Other subjects encountered throughout the Informatics degree.

These are possibilities, not current requirements.

Future concepts should be added based on their educational value and on what the existing project architecture can support naturally.

## What the project is not

Informatics Lab is not currently intended to be:

* A complete online course.
* A quiz or assessment platform.
* A programming judge.
* A generic algorithm animation framework.
* A plugin platform.
* A full educational management system.

Those directions should not influence current implementation unless a concrete future requirement makes them relevant.

## Current development status

The project currently contains:

* A Vite + React + TypeScript application.
* A minimal Informatics Lab landing screen.
* The first interactive experience: a Bubble Sort visualization.
* Pure, deterministic algorithm logic and step generation, covered by tests.
* Project documentation and development guidelines.

The Bubble Sort experience lets the user generate an array, run the algorithm,
pause, move forward and backward, control the speed, and read a description of
each comparison and exchange.

The next implementation target is a second algorithm experience. Building it
should reveal which parts are genuinely shared and which are specific to each
concept, before introducing any shared abstraction.
