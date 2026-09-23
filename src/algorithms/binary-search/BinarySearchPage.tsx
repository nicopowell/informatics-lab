import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import ArrayCells from './ArrayCells'
import PlaybackControls from './PlaybackControls'
import { createSortedArray, generateBinarySearchSteps } from './binarySearch'
import { createReadyFrame, toVisualFrames } from './visualFrames'
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

type BinarySearchPageProps = {
  onBack: () => void
}

function BinarySearchPage({ onBack }: BinarySearchPageProps) {
  const [search, setSearch] = useState(() => createSearchState(INITIAL_SIZE))
  const [frameIndex, setFrameIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(INITIAL_SPEED)

  const frames = useMemo(
    () => [
      createReadyFrame(search.values.length, search.key),
      ...toVisualFrames(generateBinarySearchSteps(search.values, search.key)),
    ],
    [search.values, search.key],
  )
  const frame = frames[frameIndex]
  const lastFrameIndex = frames.length - 1
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

  const progress = lastFrameIndex === 0 ? 1 : frameIndex / lastFrameIndex

  return (
    <main
      className="binary-search"
      style={{ '--step-duration': `${transition}ms` } as CSSProperties}
    >
      <header className="binary-search__header">
        <button
          type="button"
          className="binary-search__button"
          onClick={onBack}
        >
          Back
        </button>
        <h1>Binary Search</h1>
      </header>

      <section className="binary-search__stage">
        <div className="binary-search__search">
          <label
            className="binary-search__search-label"
            htmlFor="binary-search-key"
          >
            Searching for
          </label>
          <input
            id="binary-search-key"
            className="binary-search__key-input"
            type="number"
            value={search.keyInput}
            onChange={(event) => handleKeyInput(event.target.value)}
          />
        </div>

        <ArrayCells
          key={search.values.join(',')}
          values={search.values}
          frame={frame}
          onSelectCell={handleSelectValue}
        />
      </section>

      <div className="binary-search__panel">
        <div className="binary-search__settings">
          <label className="binary-search__field">
            Size
            <input
              type="range"
              aria-label="Size"
              min={MIN_SIZE}
              max={MAX_SIZE}
              value={search.values.length}
              onChange={(event) => handleSizeChange(event.target.value)}
            />
            <span>{search.values.length}</span>
          </label>
          <button
            type="button"
            className="binary-search__button"
            onClick={handleRandomize}
          >
            Randomize
          </button>
        </div>

        <PlaybackControls
          isPlaying={isPlaying}
          atStart={frameIndex === 0}
          atEnd={frameIndex >= lastFrameIndex}
          comparisons={frame.comparisons}
          progress={progress}
          speed={speed}
          minSpeed={MIN_SPEED}
          maxSpeed={MAX_SPEED}
          onPlayPause={handlePlayPause}
          onStepForward={handleStepForward}
          onStepBackward={handleStepBackward}
          onReset={restart}
          onSpeedChange={setSpeed}
        />
      </div>
    </main>
  )
}

export default BinarySearchPage
