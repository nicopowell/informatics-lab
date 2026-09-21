import type { BubbleSortStep } from './bubbleSort'

type ArrayBarsProps = {
  step: BubbleSortStep
}

function ArrayBars({ step }: ArrayBarsProps) {
  const maxValue = step.values.length > 0 ? Math.max(...step.values) : 1

  return (
    <>
      <div className="bars">
        {step.values.map((value, index) => {
          const isComparing =
            step.comparing !== null &&
            (index === step.comparing[0] || index === step.comparing[1])
          const isSwapped = isComparing && step.kind === 'swap'
          const isSorted = index >= step.sortedFrom

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

          return (
            <div className="bar-slot" key={index}>
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
