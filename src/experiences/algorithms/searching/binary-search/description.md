# Binary Search

Binary Search looks for a value in a sorted array by halving the range on every
comparison. It checks the middle element, then keeps only the half that can
still contain the value: the right half when the middle is smaller than the
target, the left half when it is larger. The range empties when the value is not
present, which is how the search proves that.

- **Worst and average case:** O(log n) comparisons
- **Best case:** O(1) when the middle value matches straight away
- **Extra space:** O(1) for the iterative version
- **Requires:** the array must be sorted
