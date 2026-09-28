import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import Brand from '../../modules/Brand'
import ArrayBars from './ArrayBars'
import PlaybackControls from './PlaybackControls'
import { createRandomArray, generateBubbleSortSteps } from './bubbleSort'
import { createReadyFrame, frameMovement, toVisualFrames } from './visualFrames'
import type { BubbleSortFrame, FrameMovement } from './visualFrames'
import { BUBBLE_SORT_REFERENCE } from './bubbleSortReference'
import LanguageIcon from './LanguageIcon'
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
  const [showCode, setShowCode] = useState(false)
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false)
  const [referenceLanguage, setReferenceLanguage] = useState(
    BUBBLE_SORT_REFERENCE[0].id,
  )

  const steps = useMemo(() => generateBubbleSortSteps(values), [values])
  const frames = useMemo(
    () => [createReadyFrame(values), ...toVisualFrames(steps)],
    [steps, values],
  )
  const frame = frames[frameIndex]
  const lastFrameIndex = frames.length - 1
  const totalComparisons = steps[steps.length - 1].comparison
  const delay = Math.round(MAX_DELAY / speed)
  const reference =
    BUBBLE_SORT_REFERENCE.find((entry) => entry.id === referenceLanguage) ??
    BUBBLE_SORT_REFERENCE[0]

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
      className={showCode ? 'bubble-sort bubble-sort--with-code' : 'bubble-sort'}
      style={{ '--step-duration': `${delay}ms` } as CSSProperties}
    >
      <header className="bubble-sort__navbar">
        <Brand />
        <button type="button" className="bubble-sort__back" onClick={onBack}>
          ← Experiences
        </button>      </header>

      <div className="bubble-sort__layout">
        <div className="bubble-sort__stage">
          <section className="bubble-sort__visualization">
            <p className="bubble-sort__status" aria-live="polite">
              {describeFrame(frame)}
            </p>
            <ArrayBars frame={frame} movement={movement} />
            <button
              type="button"
              className={
                showCode
                  ? 'bubble-sort__code-toggle bubble-sort__code-toggle--active'
                  : 'bubble-sort__code-toggle'
              }
              aria-pressed={showCode}
              onClick={() => setShowCode((open) => !open)}
            >
              <span className="bubble-sort__code-toggle-icon" aria-hidden="true">
                {'</>'}
              </span>
              {showCode ? 'Hide code' : 'View code'}
            </button>
          </section>

          <div className="bubble-sort__controls">
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
            <div className="bubble-sort__input">
              <label className="bubble-sort__field">
                Size
                <input
                  type="range"
                  aria-label="Size"
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
          </div>

          <div className="bubble-sort__explanation">
            <h1 className="bubble-sort__explanation-title">Bubble Sort</h1>
            <p>
              Run Bubble Sort on a random array and step through every
              comparison and exchange to see how the order builds up.
            </p>
            <p>
              Bubble Sort walks the array comparing adjacent values and
              exchanging them when they are out of order. On each pass the
              largest remaining value drifts to the end, until a full pass
              makes no exchange and the array is already sorted.
            </p>
            <p>
              Complexity: O(n²) comparisons in the worst and average case, O(n)
              when the array is already ordered. It sorts in place, using O(1)
              extra space, and keeps equal values in their original order
              (stable).
            </p>
          </div>
        </div>

        <aside
          className={
            showCode
              ? 'bubble-sort__code bubble-sort__code--open'
              : 'bubble-sort__code'
          }
        >
          <div className="bubble-sort__code-header">
            <div className="bubble-sort__language">
              <button
                type="button"
                className="bubble-sort__language-trigger"
                aria-haspopup="listbox"
                aria-expanded={languageMenuOpen}
                onClick={() => setLanguageMenuOpen((open) => !open)}
              >
                <span
                  className="bubble-sort__language-icon"
                  style={{ color: reference.color }}
                >
                  <LanguageIcon id={reference.id} />
                </span>
                {reference.label}
                <span
                  className={
                    languageMenuOpen
                      ? 'bubble-sort__language-chevron bubble-sort__language-chevron--open'
                      : 'bubble-sort__language-chevron'
                  }
                  aria-hidden="true"
                >
                  ▾
                </span>
              </button>

              {languageMenuOpen && (
                <ul className="bubble-sort__language-menu" role="listbox">
                  {BUBBLE_SORT_REFERENCE.map((entry) => (
                    <li key={entry.id}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={entry.id === referenceLanguage}
                        className={
                          entry.id === referenceLanguage
                            ? 'bubble-sort__language-option bubble-sort__language-option--active'
                            : 'bubble-sort__language-option'
                        }
                        onClick={() => {
                          setReferenceLanguage(entry.id)
                          setLanguageMenuOpen(false)
                        }}
                      >
                        <span
                          className="bubble-sort__language-icon"
                          style={{ color: entry.color }}
                        >
                          <LanguageIcon id={entry.id} />
                        </span>
                        {entry.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <pre className="bubble-sort__code-body">
            <code>{reference.code}</code>
          </pre>
        </aside>
      </div>
    </main>
  )
}

export default BubbleSortPage
