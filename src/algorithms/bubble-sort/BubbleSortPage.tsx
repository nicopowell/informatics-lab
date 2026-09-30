import { useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import AppShell from '../../components/AppShell'
import CodePanel from '../../experience/CodePanel'
import CodeToggle from '../../experience/CodeToggle'
import MarkdownDescription from '../../experience/MarkdownDescription'
import PlaybackControls from '../../experience/PlaybackControls'
import { usePlayback } from '../../experience/usePlayback'
import ArrayBars from './ArrayBars'
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
  const [movement, setMovement] = useState<FrameMovement>('none')
  const [speed, setSpeed] = useState(INITIAL_SPEED)
  const [showCode, setShowCode] = useState(false)

  const steps = useMemo(() => generateBubbleSortSteps(values), [values])
  const frames = useMemo(
    () => [createReadyFrame(values), ...toVisualFrames(steps)],
    [steps, values],
  )
  const totalComparisons = steps[steps.length - 1].comparison
  const delay = Math.round(MAX_DELAY / speed)

  // The bars animate an exchange or a rewind only when a step crosses between
  // the comparison and the swap that carries it out.
  function trackMovement(from: number, to: number) {
    setMovement(frameMovement(frames[from], frames[to]))
  }

  const playback = usePlayback(frames.length, delay, trackMovement)
  const frame = frames[playback.frameIndex]

  // A reset returns to the start without replaying the movement animation.
  function handleReset() {
    setMovement('none')
    playback.reset()
  }

  // A new input invalidates the current position in the execution.
  function restartWith(nextValues: number[]) {
    setValues(nextValues)
    handleReset()
  }

  function handleSizeChange(value: string) {
    const nextSize = Number(value)
    setSize(nextSize)
    restartWith(createRandomArray(nextSize))
  }

  function handleRandomize() {
    restartWith(createRandomArray(size))
  }

  const isDone = frame.kind === 'done'
  const counts = [
    {
      label: 'Comparisons',
      value: `${isDone ? totalComparisons : frame.comparison} / ${totalComparisons}`,
    },
    {
      label: 'Swaps',
      value: <span className="bubble-sort__swaps">{frame.swaps}</span>,
    },
  ]

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
              isPlaying={playback.isPlaying}
              atStart={playback.atStart}
              atEnd={playback.atEnd}
              counts={counts}
              speed={speed}
              onPlayPause={playback.togglePlay}
              onStepForward={playback.stepForward}
              onStepBackward={playback.stepBackward}
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
              <button type="button" className="ui-button" onClick={handleRandomize}>
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
