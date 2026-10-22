import type { CSSProperties } from 'react'
import type { SequentialSearchFrame } from '../logic/visualFrames'
import { scrollAnchor } from '../logic/visualFrames'
import { useActiveCellScroll } from '../../useActiveCellScroll'

type ScanCellsProps = {
  values: number[]
  frame: SequentialSearchFrame
  onSelectCell: (value: number) => void
}

type CellState = 'pending' | 'comparing' | 'checked' | 'found'

// Checked positions are the ones behind the cursor; everything at or ahead of
// it has not been visited yet (except the position being compared now).
function cellState(index: number, frame: SequentialSearchFrame): CellState {
  if (frame.kind === 'found') {
    if (index === frame.index) return 'found'
    return index < frame.index ? 'checked' : 'pending'
  }

  if (frame.kind === 'notFound') {
    return 'checked'
  }

  if (frame.kind === 'probe') {
    if (index === frame.index) return 'comparing'
    return index < frame.index ? 'checked' : 'pending'
  }

  // 'advance' and 'ready': the cursor position itself is not compared yet.
  return index < frame.index ? 'checked' : 'pending'
}

// The single cursor of the scan. It can sit one past the end when the search
// fails, so it clamps to the last column with a right arrow instead of
// disappearing off the grid.
function pointerView(
  frame: SequentialSearchFrame,
  size: number,
): { column: number; clamp: 'none' | 'right' } | null {
  if (size === 0) {
    return null
  }

  const clamp = frame.index > size - 1 ? 'right' : 'none'
  return { column: Math.min(frame.index, size - 1), clamp }
}

function ScanCells({ values, frame, onSelectCell }: ScanCellsProps) {
  const pointer = pointerView(frame, values.length)
  const anchor = scrollAnchor(frame)
  const scrollRef = useActiveCellScroll(anchor, frame)

  return (
    <div className="matrix">
      <div className="matrix-scroll" ref={scrollRef}>
        <div className="matrix-grid">
          <div className="pointer-rail">
            {pointer && (
              <span
                className="pointer pointer--scan"
                style={{ '--column': pointer.column } as CSSProperties}
              >
                scan{pointer.clamp === 'right' ? ' →' : ''}
              </span>
            )}
          </div>

          <div className="cells">
            {values.map((value, index) => {
              const state = cellState(index, frame)
              return (
                <div
                  className={`cell-slot cell-slot--${state}`}
                  key={index}
                  data-active={index === anchor ? '' : undefined}
                >
                  <button
                    type="button"
                    className={`cell cell--${state}`}
                    aria-label={`Search for ${value}`}
                    title={`Search for ${value}`}
                    onClick={() => onSelectCell(value)}
                  >
                    {value}
                  </button>
                  <span className="cell-index">{index}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <ul className="legend">
        <li>
          <span className="legend__swatch legend__swatch--pending" /> Not checked
        </li>
        <li>
          <span className="legend__swatch legend__swatch--comparing" /> Comparing
        </li>
        <li>
          <span className="legend__swatch legend__swatch--checked" /> Checked, no match
        </li>
        <li>
          <span className="legend__swatch legend__swatch--found" /> Found
        </li>
      </ul>
    </div>
  )
}

export default ScanCells
