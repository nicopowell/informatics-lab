import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import PageHeader, { PageHeaderBack } from '../../modules/PageHeader'
import MarkdownDescription from '../../modules/MarkdownDescription'
import CodePanel from '../../experience/CodePanel'
import CodeToggle from '../../experience/CodeToggle'
import ArrayCells from './ArrayCells'
import PlaybackControls from './PlaybackControls'
import { createSortedArray, generateBinarySearchSteps } from './binarySearch'
import { createReadyFrame, toVisualFrames } from './visualFrames'
import type { BinarySearchFrame } from './visualFrames'
import { BINARY_SEARCH_REFERENCE } from './binarySearchReference'
import description from './description.md?raw'
import '../../experience/experience.css'
import './binarySearch.css'

const MIN_SIZE = 5
const MAX_SIZE = 16
const INITIAL_SIZE = 8
const MIN_SPEED = 1
const MAX_SPEED = 10
const INITIAL_SPEED = 5
const SLOWEST_DELAY = 2500
const FASTEST_DELAY = 100
// Movement should not drag when playing at a slow speed.
const MAX_TRANSITION = 500

// A geometric ramp keeps the low speeds genuinely slow and the high speeds
// genuinely fast, with a comfortable pace around the default.
function frameDelay(speed: number): number {
  const ratio = (speed - MIN_SPEED) / (MAX_SPEED - MIN_SPEED)
  return Math.round(
    SLOWEST_DELAY * Math.pow(FASTEST_DELAY / SLOWEST_DELAY, ratio),
  )
}

type SearchState = {
  values: number[]
  key: number
  keyInput: string
}

function createSearchState(size: number): SearchState {
  const values = createSortedArray(size)
  const key = values[Math.floor(values.length / 2)]
  return { values, key, keyInput: String(key) }
}

function describeFrame(frame: BinarySearchFrame, values: number[]): string {
  if (frame.kind === 'ready') {
    return `Ready to search for ${frame.key}. The whole array (indices 0–${values.length - 1}) is in range.`
  }

  if (frame.kind === 'notFound') {
    return `The range is empty (${frame.low} > ${frame.high}): ${frame.key} is not in the array.`
  }

  if (frame.kind === 'found') {
    const comparisons =
      frame.comparisons === 1 ? '1 comparison' : `${frame.comparisons} comparisons`
    return `Found ${frame.key} at index ${frame.mid} using ${comparisons}.`
  }

  if (frame.kind === 'eliminate') {
    const side = frame.outcome === 'less' ? 'smaller' : 'larger'
    return `Since the array is sorted, every discarded value is ${side} than ${frame.key}. The range is now indices ${frame.low}–${frame.high}.`
  }

  const value = frame.mid === null ? null : values[frame.mid]
  if (frame.outcome === 'equal') {
    return `Comparing ${value} with ${frame.key}: they match.`
  }
  if (frame.outcome === 'less') {
    return `Comparing ${value} with ${frame.key}: ${value} < ${frame.key}, so the key must be to the right.`
  }
  return `Comparing ${value} with ${frame.key}: ${value} > ${frame.key}, so the key must be to the left.`
}

type BinarySearchPageProps = {
  onBack: () => void
}

function BinarySearchPage({ onBack }: BinarySearchPageProps) {
  const [search, setSearch] = useState(() => createSearchState(INITIAL_SIZE))
  const [frameIndex, setFrameIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(INITIAL_SPEED)
  const [showCode, setShowCode] = useState(false)

  const frames = useMemo(
    () => [
      createReadyFrame(search.values.length, search.key),
      ...toVisualFrames(generateBinarySearchSteps(search.values, search.key)),
    ],
    [search.values, search.key],
  )
  const frame = frames[frameIndex]
  const lastFrameIndex = frames.length - 1
  const totalComparisons = frames[lastFrameIndex].comparisons
  const delay = frameDelay(speed)
  const transition = Math.min(delay, MAX_TRANSITION)

  useEffect(() => {
    if (!isPlaying) {
      return
    }

    const timer = setTimeout(() => {
      const next = Math.min(frameIndex + 1, lastFrameIndex)
      setFrameIndex(next)
      if (next >= lastFrameIndex) {
        setIsPlaying(false)
      }
    }, delay)

    return () => clearTimeout(timer)
  }, [isPlaying, frameIndex, lastFrameIndex, delay])

  // A new input invalidates the current execution.
  function restart() {
    setIsPlaying(false)
    setFrameIndex(0)
  }

  function handleSizeChange(value: string) {
    setSearch(createSearchState(Number(value)))
    restart()
  }

  function handleRandomize() {
    setSearch(createSearchState(search.values.length))
    restart()
  }

  // The key is applied as the user types; an incomplete or invalid value keeps
  // the last valid search active.
  function handleKeyInput(value: string) {
    const key = Number(value)
    if (value.trim() === '' || !Number.isFinite(key)) {
      setSearch((current) => ({ ...current, keyInput: value }))
      return
    }
    setSearch((current) => ({ ...current, key, keyInput: value }))
    restart()
  }

  function handleSelectValue(value: number) {
    setSearch((current) => ({ ...current, key: value, keyInput: String(value) }))
    restart()
  }

  function handlePlayPause() {
    setIsPlaying((playing) => !playing)
  }

  function handleStepForward() {
    setIsPlaying(false)
    setFrameIndex((index) => Math.min(index + 1, lastFrameIndex))
  }

  function handleStepBackward() {
    setIsPlaying(false)
    setFrameIndex((index) => Math.max(index - 1, 0))
  }

  return (
    <main
      className={
        showCode
          ? 'experience experience--with-code binary-search'
          : 'experience binary-search'
      }
      style={{ '--step-duration': `${transition}ms` } as CSSProperties}
    >
      <PageHeader
        action={<PageHeaderBack label="← Experiences" onClick={onBack} />}
      />

      <div className="experience__layout">
        <div className="experience__stage">
          <section className="experience__visualization">
            <p className="experience__status" aria-live="polite">
              {describeFrame(frame, search.values)}
            </p>
            <ArrayCells
              key={search.values.join(',')}
              values={search.values}
              frame={frame}
              onSelectCell={handleSelectValue}
            />
            <CodeToggle open={showCode} onToggle={() => setShowCode((o) => !o)} />
          </section>

          <div className="experience__controls">
            <PlaybackControls
              isPlaying={isPlaying}
              atStart={frameIndex === 0}
              atEnd={frameIndex >= lastFrameIndex}
              comparisons={frame.comparisons}
              totalComparisons={totalComparisons}
              speed={speed}
              onPlayPause={handlePlayPause}
              onStepForward={handleStepForward}
              onStepBackward={handleStepBackward}
              onReset={restart}
              onSpeedChange={setSpeed}
            />
            <div className="experience__input">
              <label className="binary-search__key" htmlFor="binary-search-key">
                <span className="experience__slider-label">Searching for</span>
                <input
                  id="binary-search-key"
                  className="binary-search__key-input"
                  type="number"
                  value={search.keyInput}
                  onChange={(event) => handleKeyInput(event.target.value)}
                />
              </label>
              <label className="experience__slider">
                <span className="experience__slider-label">Size</span>
                <input
                  type="range"
                  aria-label="Size"
                  aria-valuetext={`${search.values.length} values`}
                  min={MIN_SIZE}
                  max={MAX_SIZE}
                  value={search.values.length}
                  onChange={(event) => handleSizeChange(event.target.value)}
                />
                <span className="experience__count-value">
                  {search.values.length}
                </span>
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

        <CodePanel languages={BINARY_SEARCH_REFERENCE} open={showCode} />
      </div>
    </main>
  )
}

export default BinarySearchPage
