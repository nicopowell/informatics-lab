import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import AppShell from '../../components/AppShell'
import MarkdownDescription from '../../modules/MarkdownDescription'
import CodePanel from '../../experience/CodePanel'
import CodeToggle from '../../experience/CodeToggle'
import ArrayBars from './ArrayBars'
import PlaybackControls from './PlaybackControls'
import { createRandomArray, generateBubbleSortSteps } from './bubbleSort'
import { createReadyFrame, frameMovement, toVisualFrames } from './visualFrames'
import type { BubbleSortFrame, FrameMovement } from './visualFrames'
import { BUBBLE_SORT_REFERENCE } from './bubbleSortReference'
import description from './description.md?raw'
import '../../experience/experience.css'
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
  backTo: string
}

function BubbleSortPage({ backTo }: BubbleSortPageProps) {
  const [size, setSize] = useState(INITIAL_SIZE)
  const [values, setValues] = useState(() => createRandomArray(INITIAL_SIZE))
  const [frameIndex, setFrameIndex] = useState(0)
  const [movement, setMovement] = useState<FrameMovement>('none')
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(INITIAL_SPEED)
  const [showCode, setShowCode] = useState(false)

  const steps = useMemo(() => generateBubbleSortSteps(values), [values])
  const frames = useMemo(
    () => [createReadyFrame(values), ...toVisualFrames(steps)],
    [steps, values],
  )
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
    <AppShell
      className={
        showCode
          ? 'experience experience--with-code bubble-sort'
          : 'experience bubble-sort'
      }
      style={{ '--step-duration': `${delay}ms` } as CSSProperties}
      back={{ label: '← Experiences', to: backTo }}
    >
      <div className="experience__layout">
        <div className="experience__stage">
          <section className="experience__visualization">
            <p className="experience__status" aria-live="polite">
              {describeFrame(frame)}
            </p>
            <ArrayBars frame={frame} movement={movement} />
            <CodeToggle open={showCode} onToggle={() => setShowCode((o) => !o)} />
          </section>

          <div className="experience__controls">
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
            <div className="experience__input">
              <label className="experience__slider">
                <span className="experience__slider-label">Size</span>
                <input
                  type="range"
                  aria-label="Size"
                  aria-valuetext={`${size} values`}
                  min={MIN_SIZE}
                  max={MAX_SIZE}
                  value={size}
                  onChange={(event) => handleSizeChange(event.target.value)}
                />
                <span className="experience__count-value">{size}</span>
              </label>
              <button type="button" onClick={handleRandomize}>
                Randomize
              </button>
            </div>
          </div>

          <div className="experience__explanation">
            <MarkdownDescription source={description} />
          </div>
        </div>

        <CodePanel languages={BUBBLE_SORT_REFERENCE} open={showCode} />
      </div>
    </AppShell>
  )
}

export default BubbleSortPage
