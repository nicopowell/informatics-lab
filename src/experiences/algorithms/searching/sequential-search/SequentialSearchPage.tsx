import { useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import AppShell from '@/components/AppShell'
import CodePanel from '@/experience/CodePanel'
import CodeToggle from '@/experience/CodeToggle'
import MarkdownDescription from '@/experience/MarkdownDescription'
import PlaybackControls from '@/experience/PlaybackControls'
import { frameDelay } from '@/experience/frameDelay'
import { usePlayback } from '@/experience/usePlayback'
import ScanCells from './visualization/ScanCells'
import {
  createRandomArray,
  generateSequentialSearchSteps,
} from './logic/sequentialSearch'
import { createReadyFrame, toVisualFrames } from './logic/visualFrames'
import type { SequentialSearchFrame } from './logic/visualFrames'
import { SEQUENTIAL_SEARCH_REFERENCE } from './content/sequentialSearchReference'
import description from './content/description.md?raw'
import '@/experience/experience.css'
import './sequentialSearch.css'

const MIN_SIZE = 5
const MAX_SIZE = 16
const INITIAL_SIZE = 8
const INITIAL_SPEED = 5
const SLOWEST_DELAY = 2500
const FASTEST_DELAY = 100
// Movement should not drag when playing at a slow speed.
const MAX_TRANSITION = 500

type SearchState = {
  values: number[]
  key: number
  keyInput: string
}

// The array is unsorted, so the initial key is drawn from its own values:
// the first run then ends in a match instead of always scanning everything.
function createSearchState(size: number): SearchState {
  const values = createRandomArray(size)
  const key = values[Math.floor(Math.random() * values.length)]
  return { values, key, keyInput: String(key) }
}

function describeFrame(frame: SequentialSearchFrame, values: number[]): string {
  if (frame.kind === 'ready') {
    return `Ready to search for ${frame.key}. The scan starts at index 0 and checks one position at a time.`
  }

  if (frame.kind === 'notFound') {
    return `Every position checked (${frame.comparisons} comparisons): ${frame.key} is not in the array.`
  }

  if (frame.kind === 'found') {
    const comparisons =
      frame.comparisons === 1 ? '1 comparison' : `${frame.comparisons} comparisons`
    return `Found ${frame.key} at index ${frame.index} using ${comparisons}.`
  }

  if (frame.kind === 'advance') {
    return `No match at index ${frame.index - 1}: the scan moves to index ${frame.index}.`
  }

  const value = values[frame.index]
  if (frame.outcome === 'equal') {
    return `Comparing ${value} with ${frame.key}: they match.`
  }
  return `Comparing ${value} with ${frame.key}: ${value} ≠ ${frame.key}, so the scan continues.`
}

function SequentialSearchPage() {
  const [search, setSearch] = useState(() => createSearchState(INITIAL_SIZE))
  const [speed, setSpeed] = useState(INITIAL_SPEED)
  const [showCode, setShowCode] = useState(false)

  const frames = useMemo(
    () => [
      createReadyFrame(search.key),
      ...toVisualFrames(generateSequentialSearchSteps(search.values, search.key)),
    ],
    [search.values, search.key],
  )
  const totalComparisons = frames[frames.length - 1].comparisons
  const delay = frameDelay(speed, SLOWEST_DELAY, FASTEST_DELAY)
  const transition = Math.min(delay, MAX_TRANSITION)

  const playback = usePlayback(frames.length, delay)
  const frame = frames[playback.frameIndex]

  // A new input invalidates the current execution.
  function restart() {
    playback.reset()
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

  const counts = [
    {
      label: 'Comparisons',
      value: `${frame.comparisons} / ${totalComparisons}`,
    },
  ]

  return (
    <AppShell
      className={
        showCode
          ? 'experience experience--with-code sequential-search'
          : 'experience sequential-search'
      }
      style={{ '--step-duration': `${transition}ms` } as CSSProperties}
    >
      <div className="experience__layout">
        <div className="experience__stage">
          <section className="experience__visualization">
            <p className="experience__status" aria-live="polite">
              {describeFrame(frame, search.values)}
            </p>
            <ScanCells
              key={search.values.join(',')}
              values={search.values}
              frame={frame}
              onSelectCell={handleSelectValue}
            />
            <CodeToggle open={showCode} onToggle={() => setShowCode((o) => !o)} />
          </section>

          <div className="experience__controls">
            <PlaybackControls
              isPlaying={playback.isPlaying}
              atStart={playback.atStart}
              atEnd={playback.atEnd}
              counts={counts}
              speed={speed}
              onPlayPause={playback.togglePlay}
              onStepForward={playback.stepForward}
              onStepBackward={playback.stepBackward}
              onReset={restart}
              onSpeedChange={setSpeed}
            />
            <div className="experience__input">
              <label className="sequential-search__key" htmlFor="sequential-search-key">
                <span className="experience__slider-label">Searching for</span>
                <input
                  id="sequential-search-key"
                  className="sequential-search__key-input"
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
              <button type="button" className="ui-button" onClick={handleRandomize}>
                Randomize
              </button>
            </div>
          </div>

          <div className="experience__explanation">
            <MarkdownDescription source={description} />
          </div>
        </div>

        <CodePanel languages={SEQUENTIAL_SEARCH_REFERENCE} open={showCode} />
      </div>
    </AppShell>
  )
}

export default SequentialSearchPage
