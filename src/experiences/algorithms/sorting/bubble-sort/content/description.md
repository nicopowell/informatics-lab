# Bubble Sort

Bubble Sort walks the array comparing each adjacent pair and exchanging them when
they are out of order. One pass carries the largest remaining value all the way to
the end, so the ordered region grows from the right and the next pass can stop one
slot before it. A pass that exchanges nothing proves the rest is already ordered,
and the run ends there — the only one of the three O(n²) sorts that can quit early.

- **Worst and average case:** O(n²) comparisons, the full n(n − 1)/2 when no pass ends clean
- **Best case:** O(n) comparisons, because one exchange-free pass ends the run
- **Extra space:** O(1), sorting in place
- **Exchanges:** one per adjacent step a value travels; each removes one inversion
- **Stable:** equal values never exchange, so equal values keep their original order

Load the same array shape in the three experiences and compare the counters. On
"Already sorted" at length 8 bubble sort spends 7 comparisons, 0 exchanges and 1
pass, while selection sort spends 28 comparisons for 0 exchanges and still runs all
7 passes: it cannot tell an ordered array from a reversed one without looking. On
"Reverse sorted" both spend the same 28 comparisons, and bubble sort's cost moves
into the writes — up to 28 exchanges against selection sort's 3 to 5, one for every
step each value has to travel instead of one per pass.

"Nearly sorted" is where the early exit pays: the usual single transposition costs
13 comparisons, 1 exchange and 2 passes, because the pass that fixes it is followed
by one that exchanges nothing. "Many duplicates" is the honest counterexample: with
ties, whether a pass ends clean depends on where they fall, so the numbers move
between loads of the same shape (6 to 14 exchanges). Insertion sort beats both of
them on these arrays for a different reason: it also stops scanning early, and it
places a value with one write per pass rather than one per step.
