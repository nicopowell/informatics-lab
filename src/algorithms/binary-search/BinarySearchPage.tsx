import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import ArrayCells from './ArrayCells'
import { createSortedArray, generateBinarySearchSteps } from './binarySearch'
import { createReadyFrame, toVisualFrames } from './visualFrames'
import './binarySearch.css'

const MIN_SIZE = 5
const MAX_SIZE = 16
const INITIAL_SIZE = 8

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

  const frames = useMemo(
    () => [
      createReadyFrame(search.values.length, search.key),
      ...toVisualFrames(generateBinarySearchSteps(search.values, search.key)),
    ],
    [search.values, search.key],
  )
  const frame = frames[frameIndex]
  const lastFrameIndex = frames.length - 1

  function handleSizeChange(value: string) {
    setSearch(createSearchState(Number(value)))
    setFrameIndex(0)
  }

  function handleRandomize() {
    setSearch(createSearchState(search.values.length))
    setFrameIndex(0)
  }

  function handleKeyInput(value: string) {
    setSearch((current) => ({ ...current, keyInput: value }))
  }

  function applyKey(raw: string) {
    const key = Number(raw)
    if (raw.trim() === '' || !Number.isFinite(key)) {
      return
    }
    setSearch((current) => ({ ...current, key, keyInput: String(key) }))
    setFrameIndex(0)
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    applyKey(search.keyInput)
  }

  function handleSelectValue(value: number) {
    setSearch((current) => ({ ...current, key: value, keyInput: String(value) }))
    setFrameIndex(0)
  }

  return (
    <main className="binary-search">
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
        <form className="binary-search__search" onSubmit={handleSubmit}>
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
          <button type="submit" className="binary-search__button">
            Search
          </button>
        </form>

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

        <div className="binary-search__controls">
          <button
            type="button"
            className="binary-search__button"
            onClick={() => setFrameIndex(0)}
            disabled={frameIndex === 0}
          >
            Reset
          </button>
          <button
            type="button"
            className="binary-search__button"
            onClick={() => setFrameIndex((index) => Math.max(index - 1, 0))}
            disabled={frameIndex === 0}
          >
            Step back
          </button>
          <button
            type="button"
            className="binary-search__button binary-search__button--primary"
            onClick={() =>
              setFrameIndex((index) => Math.min(index + 1, lastFrameIndex))
            }
            disabled={frameIndex >= lastFrameIndex}
          >
            Step forward
          </button>
        </div>
      </div>
    </main>
  )
}

export default BinarySearchPage
