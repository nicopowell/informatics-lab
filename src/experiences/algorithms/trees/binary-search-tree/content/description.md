# Binary search tree

A **binary search tree** keeps its values ordered by construction: for every
node, everything in its left subtree is smaller and everything in its right
subtree is larger. That single rule is all the structure has.

Searching walks the rule one comparison at a time. Each visit compares the
target with one node and discards the whole subtree on the other side — the
same idea binary search applies to a sorted array, except the halving follows
the tree instead of an index.

Inserting is searching that did not find its value. The walk follows exactly
the same comparisons until it reaches an empty child slot, and the new node
hangs there. Nothing else in the tree moves.

The shape of the tree depends on the order the values arrive, and the shape is
what search performance depends on:

- Inserting ascending values builds a right-only chain: a linked list, where
  every search walks every node.
- Inserting medians first builds a balanced tree, where each comparison rules
  out about half of what is left.
- Random orders land somewhere in between, which is why real trees are built
  with balanced insertions or rotations.

Inserting a value the tree already holds stops the walk where it is found: the
value is already there, so nothing changes.
