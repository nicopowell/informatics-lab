import { useMemo, useState } from 'react'
import ArrayBars from './ArrayBars'
import { createRandomArray, generateBubbleSortSteps } from './bubbleSort'
import './bubbleSort.css'

const MIN_SIZE = 5
const MAX_SIZE = 40
const INITIAL_SIZE = 8

type BubbleSortPageProps = {
  onBack: () => void
}

function BubbleSortPage({ onBack }: BubbleSortPageProps) {
  const [size, setSize] = useState(INITIAL_SIZE)
  const [values, setValues] = useState(() => createRandomArray(INITIAL_SIZE))
  const [stepIndex, setStepIndex] = useState(0)

  const steps = useMemo(() => generateBubbleSortSteps(values), [values])
  const step = steps[stepIndex]

  // A new input invalidates the current position in the execution.
  function restartWith(nextValues: number[]) {
    setValues(nextValues)
    setStepIndex(0)
  }

  function handleSizeChange(value: string) {
    const nextSize = Number(value)
    setSize(nextSize)
    restartWith(createRandomArray(nextSize))
  }

  function handleRandomize() {
    restartWith(createRandomArray(size))
  }

  return (
    <main className="bubble-sort">
      <header className="bubble-sort__header">
        <button type="button" onClick={onBack}>
          Back
        </button>
        <h1>Bubble Sort</h1>
      </header>

      <div className="bubble-sort__controls">
        <label className="bubble-sort__field">
          Size
          <input
            type="range"
            min={MIN_SIZE}
            max={MAX_SIZE}
            value={size}
            onChange={(event) => handleSizeChange(event.target.value)}
          />
          <span>{size}</span>
        </label>
        <button type="button" onClick={handleRandomize}>
          Randomize
        </button>
      </div>

      <ArrayBars step={step} />
    </main>
  )
}

export default BubbleSortPage
