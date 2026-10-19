import {
  drawnValue,
  holeIsOpen,
  type FrameMovement,
  type InsertionSortFrame,
} from '../logic/visualFrames'

type InsertionBarsProps = {
  frame: InsertionSortFrame
  movement: FrameMovement
}

/*
 * The board is the array plus one thing the array cannot show. While a pass holds
 * its key, `values[holeIndex]` is a literal duplicate of the neighbour, so the hole
 * is drawn as an open slot and the key floats above it. Bubble sort and selection
 * sort never need this: in both of them every value on screen is in the array.
 */
function InsertionBars({ frame, movement }: InsertionBarsProps) {
  const maxValue = frame.values.length > 0 ? Math.max(...frame.values) : 1
  const { holeIndex, keyIndex, testedIndex } = frame

  // How far the ordered prefix reaches. On the done frame the hole is gone, and the
  // whole array is the prefix.
  const settledTo =
    frame.kind === 'done' ? frame.values.length : holeIndex === null ? 0 : holeIndex

  const isOpenHole = holeIsOpen(frame)

  // A shift pushes a value one slot right, so in the frame that shows the result the
  // arriving bar sits just right of the hole and comes from the left. Stepping back
  // across a shift is the mirror image. An `unplace` moves no bar at all: the key
  // simply goes back into the hand.
  let arrivingIndex: number | null = null
  let arrivingSuffix = ''
  if (movement === 'shift' && holeIndex !== null) {
    arrivingIndex = holeIndex + 1
    arrivingSuffix = 'from-left'
  }
  if (movement === 'unshift' && holeIndex !== null) {
    arrivingIndex = holeIndex - 1
    arrivingSuffix = 'from-right'
  }
  const descendingIndex = movement === 'place' ? holeIndex : null

  return (
    <>
      <div className="insertion-sort__bars">
        {frame.values.map((value, index) => {
          const isOrdered = index < settledTo
          const isTesting = testedIndex === index
          const isHole = isOpenHole && index === holeIndex
          // The height of a slot is decided in the logic layer (`drawnValue`), next to
          // `frameMovement`, so the rule that a hole is measured by the key it is
          // reserved for is covered by vitest instead of only by a browser.
          const measuredValue = drawnValue(frame, index)
          const isMoved =
            !isHole &&
            holeIndex !== null &&
            keyIndex !== null &&
            index > holeIndex &&
            index <= keyIndex
          const isPlaced = frame.kind === 'place' && index === holeIndex

          let className = 'insertion-sort__bar'
          if (isOrdered) {
            className += ' insertion-sort__bar--ordered'
          }
          if (isMoved) {
            className += ' insertion-sort__bar--moved'
          }
          if (isPlaced) {
            className += ' insertion-sort__bar--placed'
          }
          if (isTesting) {
            className += ' insertion-sort__bar--testing'
          }
          if (isHole) {
            className += ' insertion-sort__bar--hole'
          }

          let slotClassName = 'insertion-sort__bar-slot'
          if (index === arrivingIndex) {
            slotClassName += ` insertion-sort__bar-slot--${arrivingSuffix}`
          }
          if (index === descendingIndex) {
            slotClassName += ' insertion-sort__bar-slot--descend'
          }

          return (
            <div className={slotClassName} key={index}>
              {isHole && frame.key !== null ? (
                <span className="insertion-sort__hand">
                  <span className="insertion-sort__hand-label">In hand</span>
                  {frame.key}
                </span>
              ) : null}
              <div className="insertion-sort__bar-track">
                <div
                  className={className}
                  style={{ height: `${(measuredValue / maxValue) * 100}%` }}
                />
              </div>
              <span
                className={
                  isHole
                    ? 'insertion-sort__bar-value insertion-sort__bar-value--faded'
                    : 'insertion-sort__bar-value'
                }
              >
                {value}
              </span>
            </div>
          )
        })}
      </div>

      <ul className="insertion-sort__legend">
        <li>
          <span className="insertion-sort__legend-swatch" />
          {' Not scanned'}
        </li>
        <li>
          <span className="insertion-sort__legend-swatch insertion-sort__legend-swatch--ordered" />
          {' Ordered prefix'}
        </li>
        <li>
          <span className="insertion-sort__legend-swatch insertion-sort__legend-swatch--testing" />
          {' Testing'}
        </li>
        <li>
          <span className="insertion-sort__legend-swatch insertion-sort__legend-swatch--moved" />
          {' Shifted aside'}
        </li>
        <li>
          <span className="insertion-sort__legend-swatch insertion-sort__legend-swatch--hole" />
          {' Hole'}
        </li>
      </ul>
    </>
  )
}

export default InsertionBars
