import { useState } from 'react'
import ArrayCells from './ArrayCells'
import { generateBinarySearchSteps } from './binarySearch'
import { createReadyFrame, toVisualFrames } from './visualFrames'
import './binarySearch.css'

const EXAMPLE_VALUES = [3, 7, 12, 19, 24, 31, 38, 45]
const EXAMPLE_KEY = 38

type BinarySearchPageProps = {
  onBack: () => void
}

function BinarySearchPage({ onBack }: BinarySearchPageProps) {
  const [frameIndex, setFrameIndex] = useState(0)

  const frames = [
    createReadyFrame(EXAMPLE_VALUES.length, EXAMPLE_KEY),
    ...toVisualFrames(generateBinarySearchSteps(EXAMPLE_VALUES, EXAMPLE_KEY)),
  ]
  const frame = frames[frameIndex]
  const lastFrameIndex = frames.length - 1

  return (
    <main className="binary-search">
      <header className="binary-search__header">
        <button type="button" onClick={onBack}>
          Back
        </button>
        <h1>Binary Search</h1>
      </header>

      <p className="binary-search__key">Searching for {EXAMPLE_KEY}</p>

      <div className="binary-search__controls">
        <button
          type="button"
          onClick={() => setFrameIndex(0)}
          disabled={frameIndex === 0}
        >
          Reset
        </button>
        <button
          type="button"
          onClick={() => setFrameIndex((index) => Math.max(index - 1, 0))}
          disabled={frameIndex === 0}
        >
          Step back
        </button>
        <button
          type="button"
          onClick={() =>
            setFrameIndex((index) => Math.min(index + 1, lastFrameIndex))
          }
          disabled={frameIndex >= lastFrameIndex}
        >
          Step forward
        </button>
      </div>

      <ArrayCells values={EXAMPLE_VALUES} frame={frame} />
    </main>
  )
}

export default BinarySearchPage
