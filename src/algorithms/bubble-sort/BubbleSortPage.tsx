import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import ArrayBars from './ArrayBars'
import PlaybackControls from './PlaybackControls'
import { createRandomArray, generateBubbleSortSteps } from './bubbleSort'
import './bubbleSort.css'

const MIN_SIZE = 5
const MAX_SIZE = 40
const INITIAL_SIZE = 8
const INITIAL_SPEED = 5
const MAX_DELAY = 1000

type BubbleSortPageProps = {
  onBack: () => void
}

function BubbleSortPage({ onBack }: BubbleSortPageProps) {
  const [size, setSize] = useState(INITIAL_SIZE)
  const [values, setValues] = useState(() => createRandomArray(INITIAL_SIZE))
  const [stepIndex, setStepIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(INITIAL_SPEED)

  const steps = useMemo(() => generateBubbleSortSteps(values), [values])
  const step = steps[stepIndex]
  const lastStepIndex = steps.length - 1
  const delay = Math.round(MAX_DELAY / speed)

  useEffect(() => {
    if (!isPlaying) {
      return
    }

    const timer = setTimeout(() => {
      setStepIndex((index) => index + 1)
      if (stepIndex >= lastStepIndex - 1) {
        setIsPlaying(false)
      }
    }, delay)

    return () => clearTimeout(timer)
  }, [isPlaying, stepIndex, lastStepIndex, delay])

  // A new input invalidates the current position in the execution.
  function restartWith(nextValues: number[]) {
    setValues(nextValues)
    setStepIndex(0)
    setIsPlaying(false)
  }

  function handleSizeChange(value: string) {
    const nextSize = Number(value)
    setSize(nextSize)
    restartWith(createRandomArray(nextSize))
  }

  function handleRandomize() {
    restartWith(createRandomArray(size))
  }

  function handlePlayPause() {
    setIsPlaying((playing) => !playing)
  }

  function handleStepForward() {
    setIsPlaying(false)
    setStepIndex((index) => Math.min(index + 1, lastStepIndex))
  }

  function handleStepBackward() {
    setIsPlaying(false)
    setStepIndex((index) => Math.max(index - 1, 0))
  }

  function handleReset() {
    setIsPlaying(false)
    setStepIndex(0)
  }

  return (
    <main
      className="bubble-sort"
      style={{ '--step-duration': `${delay}ms` } as CSSProperties}
    >
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

      <PlaybackControls
        isPlaying={isPlaying}
        stepIndex={stepIndex}
        totalSteps={steps.length}
        speed={speed}
        onPlayPause={handlePlayPause}
        onStepForward={handleStepForward}
        onStepBackward={handleStepBackward}
        onReset={handleReset}
        onSpeedChange={setSpeed}
      />

      <ArrayBars step={step} />
    </main>
  )
}

export default BubbleSortPage
