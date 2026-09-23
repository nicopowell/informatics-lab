import type { BinarySearchFrame } from './visualFrames'

type ArrayCellsProps = {
  values: number[]
  frame: BinarySearchFrame
}

type PointerName = 'low' | 'mid' | 'high'
type PointerClamp = 'none' | 'left' | 'right'

type PointerMarker = {
  name: PointerName
  clamp: PointerClamp
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

// Each pointer lands on a cell; one past either end is clamped to the edge so
// an empty interval (low > high) stays visible.
function markersPerColumn(
  frame: BinarySearchFrame,
  size: number,
): PointerMarker[][] {
  const columns: PointerMarker[][] = Array.from({ length: size }, () => [])
  if (size === 0) {
    return columns
  }

  const pointers: { name: PointerName; index: number | null }[] = [
    { name: 'low', index: frame.low },
    { name: 'mid', index: frame.mid },
    { name: 'high', index: frame.high },
  ]

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

    columns[column].push({ name, clamp })
  }

  return columns
}

function ArrayCells({ values, frame }: ArrayCellsProps) {
  const markers = markersPerColumn(frame, values.length)

  return (
    <>
      <div className="cells">
        {values.map((value, index) => (
          <div className="cell-slot" key={index}>
            <div className={`cell cell--${cellState(index, frame)}`}>
              {value}
            </div>
            <div className="cell-pointers">
              {markers[index].map((marker) => (
                <span
                  className={`pointer pointer--${marker.name}`}
                  key={marker.name}
                >
                  {marker.clamp === 'left' ? '← ' : ''}
                  {marker.name}
                  {marker.clamp === 'right' ? ' →' : ''}
                </span>
              ))}
            </div>
            <span className="cell-index">{index}</span>
          </div>
        ))}
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
    </>
  )
}

export default ArrayCells
