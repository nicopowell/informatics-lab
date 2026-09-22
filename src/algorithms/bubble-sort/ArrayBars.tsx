import type { BubbleSortFrame, FrameMovement } from './visualFrames'

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
      <div className="bars">
        {frame.values.map((value, index) => {
          const isComparing =
            frame.comparing !== null &&
            (index === frame.comparing[0] || index === frame.comparing[1])
          const isSwapped = isComparing && frame.kind === 'swap'
          const isSorted = index >= frame.sortedFrom

          let className = 'bar'
          if (isSorted) {
            className += ' bar--sorted'
          }
          if (isComparing) {
            className += ' bar--comparing'
          }
          if (isSwapped) {
            className += ' bar--swapped'
          }

          let slotClassName = 'bar-slot'
          if (index === swapLeftIndex) {
            slotClassName += ` bar-slot--${movementSuffix}-right`
          }
          if (index === swapRightIndex) {
            slotClassName += ` bar-slot--${movementSuffix}-left`
          }

          return (
            <div className={slotClassName} key={index}>
              <div className="bar-track">
                <div
                  className={className}
                  style={{ height: `${(value / maxValue) * 100}%` }}
                />
              </div>
              <span className="bar-value">{value}</span>
            </div>
          )
        })}
      </div>

      <ul className="legend">
        <li>
          <span className="legend__swatch" /> Unordered
        </li>
        <li>
          <span className="legend__swatch legend__swatch--comparing" /> Comparing
        </li>
        <li>
          <span className="legend__swatch legend__swatch--swapped" /> Swapped
        </li>
        <li>
          <span className="legend__swatch legend__swatch--sorted" /> Sorted
        </li>
      </ul>
    </>
  )
}

export default ArrayBars
