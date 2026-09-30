# Bubble Sort

Bubble Sort walks the array comparing adjacent values and exchanging them when
they are out of order. On each pass the largest remaining value drifts to the
end, until a full pass makes no exchange and the array is already sorted.

- **Worst and average case:** O(n²) comparisons
- **Best case:** O(n) when the array is already ordered
- **Extra space:** O(1), sorting in place
- **Stable:** equal values keep their original order
