import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import ArrayBars from './ArrayBars'
import PlaybackControls from './PlaybackControls'
import { createRandomArray, generateBubbleSortSteps } from './bubbleSort'
import { frameMovement, toVisualFrames } from './visualFrames'
import type { BubbleSortFrame, FrameMovement } from './visualFrames'
import './bubbleSort.css'

const MIN_SIZE = 5
const MAX_SIZE = 40
const INITIAL_SIZE = 8
const INITIAL_SPEED = 5
const MAX_DELAY = 1000

function describeFrame(frame: BubbleSortFrame): string {
  if (frame.comparing === null) {
    return frame.kind === 'done' ? 'The array is sorted' : 'Ready to sort'
  }

  const [leftIndex, rightIndex] = frame.comparing

  if (frame.kind === 'compare') {
    return `Compares ${frame.values[leftIndex]} and ${frame.values[rightIndex]}`
  }

  // This frame already shows the exchanged order, so the larger value sits on
  // the right and the smaller one on the left.
  const [larger, smaller] = [frame.values[rightIndex], frame.values[leftIndex]]
  return `${larger} > ${smaller}, so they exchange places`
}

type BubbleSortPageProps = {
  onBack: () => void
}

function BubbleSortPage({ onBack }: BubbleSortPageProps) {
  const [size, setSize] = useState(INITIAL_SIZE)
  const [values, setValues] = useState(() => createRandomArray(INITIAL_SIZE))
  const [frameIndex, setFrameIndex] = useState(0)
  const [movement, setMovement] = useState<FrameMovement>('none')
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(INITIAL_SPEED)

  const steps = useMemo(() => generateBubbleSortSteps(values), [values])
  const frames = useMemo(() => {
    const readyFrame: BubbleSortFrame = {
      kind: 'compare',
      values,
      comparing: null,
      sortedFrom: values.length,
      comparison: 0,
      swaps: 0,
    }
    return [readyFrame, ...toVisualFrames(steps)]
  }, [steps, values])
  const frame = frames[frameIndex]
  const lastFrameIndex = frames.length - 1
  const totalComparisons = steps[steps.length - 1].comparison
  const delay = Math.round(MAX_DELAY / speed)

  function navigateTo(nextIndex: number) {
    setMovement(frameMovement(frames[frameIndex], frames[nextIndex]))
    setFrameIndex(nextIndex)
  }

  useEffect(() => {
    if (!isPlaying) {
      return
    }

    const timer = setTimeout(() => {
      const nextIndex = Math.min(frameIndex + 1, lastFrameIndex)
      setMovement(frameMovement(frames[frameIndex], frames[nextIndex]))
      setFrameIndex(nextIndex)
      if (frameIndex >= lastFrameIndex - 1) {
        setIsPlaying(false)
      }
    }, delay)

    return () => clearTimeout(timer)
  }, [isPlaying, frameIndex, lastFrameIndex, delay, frames])

  // A new input invalidates the current position in the execution.
  function restartWith(nextValues: number[]) {
    setValues(nextValues)
    setFrameIndex(0)
    setMovement('none')
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
    navigateTo(Math.min(frameIndex + 1, lastFrameIndex))
  }

  function handleStepBackward() {
    setIsPlaying(false)
    navigateTo(Math.max(frameIndex - 1, 0))
  }

  function handleReset() {
    setIsPlaying(false)
    setFrameIndex(0)
    setMovement('none')
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
        atStart={frameIndex === 0}
        atEnd={frameIndex >= lastFrameIndex}
        comparison={frame.comparison}
        totalComparisons={totalComparisons}
        swaps={frame.swaps}
        isDone={frame.kind === 'done'}
        speed={speed}
        onPlayPause={handlePlayPause}
        onStepForward={handleStepForward}
        onStepBackward={handleStepBackward}
        onReset={handleReset}
        onSpeedChange={setSpeed}
      />

      <p className="step-description" aria-live="polite">
        {describeFrame(frame)}
      </p>

      <ArrayBars frame={frame} movement={movement} />
    </main>
  )
}

export default BubbleSortPage
