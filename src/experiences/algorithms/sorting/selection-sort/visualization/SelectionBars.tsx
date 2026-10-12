import type { CSSProperties } from 'react'
import type { FrameMovement, SelectionSortFrame } from '../logic/visualFrames'

type SelectionBarsProps = {
  frame: SelectionSortFrame
  movement: FrameMovement
}

/*
 * The two bars of an exchange are highlighted and slid into each other's slot.
 * Bubble sort could hardcode a one-slot shift because it only ever exchanges
 * neighbours; here the distance is whatever the pass ran, so it travels to the
 * keyframes as `--bar-shift`, measured in slots.
 */
function SelectionBars({ frame, movement }: SelectionBarsProps) {
  const maxValue = frame.values.length > 0 ? Math.max(...frame.values) : 1

  // The pair only animates while a step crosses into, or back out of, the
  // write that carries it out.
  const movementPair = movement !== 'none' ? frame.comparing : null
  const landingIndex = movementPair !== null ? movementPair[0] : null
  const outgoingIndex = movementPair !== null ? movementPair[1] : null
  const shift = movementPair !== null ? Math.abs(movementPair[1] - movementPair[0]) : 0
  const movementSuffix = movement === 'rewind' ? 'rewind' : 'exchange'

  // The slot the current pass is trying to fill. Only the `select` beat shows it
  // as an empty target: on the `exchange` frame the value has already landed, so
  // that bar reads as sorted instead.
  const isSelectBeat = frame.kind === 'select'
  const targetIndex = isSelectBeat && frame.comparing !== null ? frame.comparing[0] : null

  return (
    <>
      <div className="selection-sort__bars">
        {frame.values.map((value, index) => {
          const isSorted = index < frame.sortedUpTo
          const isScanning =
            frame.kind === 'compare' &&
            frame.comparing !== null &&
            index === frame.comparing[0]
          const isMinimum =
            (frame.kind === 'compare' || frame.kind === 'select') && frame.minIndex === index

          let className = 'selection-sort__bar'
          if (isSorted) {
            className += ' selection-sort__bar--sorted'
          }
          if (isScanning) {
            className += ' selection-sort__bar--scanning'
          }
          if (isMinimum) {
            className += ' selection-sort__bar--minimum'
          }
          if (index === targetIndex) {
            className += ' selection-sort__bar--target'
          }

          let slotClassName = 'selection-sort__bar-slot'
          if (index === landingIndex) {
            slotClassName += ` selection-sort__bar-slot--${movementSuffix}-from-right`
          }
          if (index === outgoingIndex) {
            slotClassName += ` selection-sort__bar-slot--${movementSuffix}-from-left`
          }

          const slotStyle =
            index === landingIndex || index === outgoingIndex
              ? ({ '--bar-shift': shift } as CSSProperties)
              : undefined

          return (
            <div className={slotClassName} key={index} style={slotStyle}>
              <div className="selection-sort__bar-track">
                <div
                  className={className}
                  style={{ height: `${(value / maxValue) * 100}%` }}
                />
              </div>
              <span className="selection-sort__bar-value">{value}</span>
            </div>
          )
        })}
      </div>

      <ul className="selection-sort__legend">
        <li>
          <span className="selection-sort__legend-swatch" />
          {' Unordered'}
        </li>
        <li>
          <span
            className="selection-sort__legend-swatch selection-sort__legend-swatch--scanning"
          />
          {' Scanning'}
        </li>
        <li>
          <span
            className="selection-sort__legend-swatch selection-sort__legend-swatch--minimum"
          />
          {' Smallest so far'}
        </li>
        <li>
          <span
            className="selection-sort__legend-swatch selection-sort__legend-swatch--target"
          />
          {' Slot to fill'}
        </li>
        <li>
          <span
            className="selection-sort__legend-swatch selection-sort__legend-swatch--sorted"
          />
          {' Sorted'}
        </li>
      </ul>
    </>
  )
}

export default SelectionBars
