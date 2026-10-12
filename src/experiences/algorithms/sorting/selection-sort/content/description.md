# Selection Sort

Selection Sort splits the array into a sorted head and an unordered tail. Each
pass scans the whole tail to find the smallest value, then exchanges it into the
first free slot, so the head grows by exactly one place per pass. The scan only
remembers an index and writes once at the end.

- **Worst and average case:** O(n²) comparisons
- **Best case:** O(n²) — the scan cannot stop early, so an ordered array costs
  the same work as a reversed one
- **Extra space:** O(1), sorting in place
- **Exchanges:** at most n − 1, one per pass, which is why it is chosen when
  writing is expensive
- **Stable:** no — an exchange can carry a value past an equal one

Compare it against Bubble Sort on the same shape. An already-sorted array makes
bubble quit after one pass while selection still scans the whole tail, but on a
reversed array selection sort spends far fewer exchanges, because bubble pays one
for every adjacent step a value has to travel.
