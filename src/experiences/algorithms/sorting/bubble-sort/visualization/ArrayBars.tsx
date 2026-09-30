import type { BubbleSortFrame, FrameMovement } from '../logic/visualFrames'

type ArrayBarsProps = {
  frame: BubbleSortFrame
  movement: FrameMovement
}

function ArrayBars({ frame, movement }: ArrayBarsProps) {
  const maxValue = frame.values.length > 0 ? Math.max(...frame.values) : 1
  const movementPair = movement !== 'none' ? frame.comparing : null
  const swapLeftIndex = movementPair !== null ? movementPair[0] : null
  const swapRightIndex = movementPair !== null ? movementPair[1] : null
  const movementSuffix = movement === 'rewind' ? 'rewind' : 'exchange'

  return (
    <>
      <div className="bubble-sort__bars">
        {frame.values.map((value, index) => {
          const isComparing =
            frame.comparing !== null &&
            (index === frame.comparing[0] || index === frame.comparing[1])
          const isSwapped = isComparing && frame.kind === 'swap'
          const isSorted = index >= frame.sortedFrom

          let className = 'bubble-sort__bar'
          if (isSorted) {
            className += ' bubble-sort__bar--sorted'
          }
          if (isComparing) {
            className += ' bubble-sort__bar--comparing'
          }
          if (isSwapped) {
            className += ' bubble-sort__bar--swapped'
          }

          let slotClassName = 'bubble-sort__bar-slot'
          if (index === swapLeftIndex) {
            slotClassName += ` bubble-sort__bar-slot--${movementSuffix}-right`
          }
          if (index === swapRightIndex) {
            slotClassName += ` bubble-sort__bar-slot--${movementSuffix}-left`
          }

          return (
            <div className={slotClassName} key={index}>
              <div className="bubble-sort__bar-track">
                <div
                  className={className}
                  style={{ height: `${(value / maxValue) * 100}%` }}
                />
              </div>
              <span className="bubble-sort__bar-value">{value}</span>
            </div>
          )
        })}
      </div>

      <ul className="bubble-sort__legend">
        <li>
          <span className="bubble-sort__legend-swatch" /> Unordered
        </li>
        <li>
          <span className="bubble-sort__legend-swatch bubble-sort__legend-swatch--comparing" />{' '}
          Comparing
        </li>
        <li>
          <span className="bubble-sort__legend-swatch bubble-sort__legend-swatch--swapped" />{' '}
          Swapped
        </li>
        <li>
          <span className="bubble-sort__legend-swatch bubble-sort__legend-swatch--sorted" />{' '}
          Sorted
        </li>
      </ul>
    </>
  )
}

export default ArrayBars
