import type { CSSProperties } from 'react'
import type { BinarySearchFrame } from './visualFrames'

type ArrayCellsProps = {
  values: number[]
  frame: BinarySearchFrame
  onSelectCell: (value: number) => void
}

type PointerName = 'low' | 'mid' | 'high'
type PointerClamp = 'none' | 'left' | 'right'

type PointerView = {
  name: PointerName
  column: number
  clamp: PointerClamp
  stack: number
}

function cellState(
  index: number,
  frame: BinarySearchFrame,
): 'active' | 'mid' | 'eliminated' | 'found' {
  if (frame.kind === 'found') {
    return index === frame.mid ? 'found' : 'eliminated'
  }

  if (frame.kind === 'notFound') {
    return 'eliminated'
  }

  if (index < frame.low || index > frame.high) {
    return 'eliminated'
  }

  return index === frame.mid ? 'mid' : 'active'
}

// Pointers are positioned by column, not rendered inside a cell, so they can
// slide when the interval moves. One past either end is clamped to the edge so
// an empty interval (low > high) stays visible.
function pointerViews(frame: BinarySearchFrame, size: number): PointerView[] {
  if (size === 0) {
    return []
  }

  const pointers: { name: PointerName; index: number | null }[] = [
    { name: 'low', index: frame.low },
    { name: 'mid', index: frame.mid },
    { name: 'high', index: frame.high },
  ]

  const views: PointerView[] = []
  for (const { name, index } of pointers) {
    if (index === null) {
      continue
    }

    let column = index
    let clamp: PointerClamp = 'none'
    if (index < 0) {
      column = 0
      clamp = 'left'
    } else if (index > size - 1) {
      column = size - 1
      clamp = 'right'
    }

    views.push({ name, column, clamp, stack: 0 })
  }

  // Pointers sharing a column stack upward in name order: low at the bottom,
  // then mid, then high on top.
  const seenInColumn = new Map<number, number>()
  for (const view of views) {
    const seen = seenInColumn.get(view.column) ?? 0
    seenInColumn.set(view.column, seen + 1)
    view.stack = seen
  }

  return views
}

function ArrayCells({ values, frame, onSelectCell }: ArrayCellsProps) {
  const pointers = pointerViews(frame, values.length)

  return (
    <div className="matrix">
      <div className="matrix-scroll">
        <div className="matrix-grid">
          <div className="pointer-rail">
            {pointers.map((pointer) => (
              <span
                className={`pointer pointer--${pointer.name}`}
                key={pointer.name}
                style={
                  {
                    '--column': pointer.column,
                    '--stack': pointer.stack,
                  } as CSSProperties
                }
              >
                {pointer.clamp === 'left' ? '← ' : ''}
                {pointer.name}
                {pointer.clamp === 'right' ? ' →' : ''}
              </span>
            ))}
          </div>

          <div className="cells">
            {values.map((value, index) => {
              const state = cellState(index, frame)
              return (
                <div className={`cell-slot cell-slot--${state}`} key={index}>
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
          <span className="legend__swatch legend__swatch--active" /> In range
        </li>
        <li>
          <span className="legend__swatch legend__swatch--mid" /> Comparing (mid)
        </li>
        <li>
          <span className="legend__swatch legend__swatch--eliminated" /> Discarded
        </li>
        <li>
          <span className="legend__swatch legend__swatch--found" /> Found
        </li>
      </ul>
    </div>
  )
}

export default ArrayCells
