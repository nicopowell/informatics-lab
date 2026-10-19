# Insertion Sort

Insertion Sort grows an ordered prefix one value at a time. Each pass lifts the
first value of the unscanned tail into the hand, which opens a hole at its slot,
then walks left comparing the held value against the prefix. Every prefix value
bigger than the held one slides one slot right into the hole, and the first one
that is not bigger stops the scan. The held value then closes the hole, and the
prefix is one value longer.

- **Worst and average case:** O(n²) comparisons and shifts
- **Best case:** O(n) comparisons — on an ordered array every pass costs one
  comparison and no shift, so the scan never travels
- **Extra space:** O(1), sorting in place
- **Adaptive:** the cost follows how ordered the input already is, which is what
  the "Already sorted" and "Nearly sorted" presets show
- **Stable:** the scan stops on an equal value, so equal values keep their order

The comparison against Selection Sort is the point of having both. Selection Sort
scans the whole tail on every pass whether the array is ordered or not — 28
comparisons at length 8 either way — but it writes at most n − 1 times. Insertion
Sort can stop early, dropping to 7 comparisons on an ordered array, and pays for
it with up to n(n − 1)/2 shifts when the array is reversed: one write for every
step a value has to travel, instead of one write per pass.
