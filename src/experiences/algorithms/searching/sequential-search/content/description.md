# Sequential Search

Sequential Search (also called linear search) looks for a value by checking
every position from the start, one at a time, until it finds a match or runs
out of array. Nothing in the algorithm cares about the order of the data, which
is its advantage: it works on any list. The cost shows up in the last position
— a value there, or a value that is not present at all, pays for every position.

Compare it with Binary Search: that one requires a sorted array but halves the
range on every comparison, while this one accepts any array and buys nothing
back except in the best case.

- **Worst and average case:** O(n) comparisons
- **Best case:** O(1) when the first position matches
- **Extra space:** O(1)
- **Requires:** nothing — the data may be unsorted
