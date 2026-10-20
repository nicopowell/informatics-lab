import { useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import AppShell from '@/components/AppShell'
import CodePanel from '@/experience/CodePanel'
import CodeToggle from '@/experience/CodeToggle'
import MarkdownDescription from '@/experience/MarkdownDescription'
import PlaybackControls from '@/experience/PlaybackControls'
import { usePlayback } from '@/experience/usePlayback'
import SelectionBars from './visualization/SelectionBars'
import { createRandomArray, generateSelectionSortSteps } from './logic/selectionSort'
import { createReadyFrame, frameMovement, toVisualFrames } from './logic/visualFrames'
import type { FrameMovement, SelectionSortFrame } from './logic/visualFrames'
import {
  ARRAY_PRESETS,
  MIN_SIZE,
  createArrayPreset,
  type ArrayPresetId,
} from '../presets'
import description from './content/description.md?raw'
import { SELECTION_SORT_REFERENCE } from './content/selectionSortReference'
import '@/experience/experience.css'
import './selectionSort.css'

const INITIAL_SIZE = 8
const INITIAL_SPEED = 5
// UI cap: past 20 bars the visualization compresses and stops teaching.
const MAX_SIZE = 20
const MAX_DELAY = 1000

function describeFrame(frame: SelectionSortFrame): string {
  if (frame.comparing === null) {
    return frame.kind === 'done' ? 'The array is sorted' : 'Ready to sort'
  }

  const [leftIndex, rightIndex] = frame.comparing

  if (frame.kind === 'compare') {
    const scanned = frame.values[leftIndex]
    const smallest = frame.values[rightIndex]
    return `Compares ${scanned} with the smallest so far, ${smallest}`
  }

  // A pass whose minimum is the slot itself writes nothing, and that is worth
  // saying out loud: it is the one case where selection sort costs no exchange.
  if (frame.kind === 'select') {
    return leftIndex === rightIndex
      ? `${frame.values[leftIndex]} is already the smallest, so this pass writes nothing`
      : `Pass ${frame.pass} finds ${frame.values[rightIndex]} as its minimum`
  }

  // After the write, the head slot holds the minimum and the scanned slot holds
  // what used to sit in the head.
  const placed = frame.values[leftIndex]
  const displaced = frame.values[rightIndex]
  return `Places ${placed} in the sorted head, and ${displaced} moves out to the scan`
}

function SelectionSortPage() {
  const [size, setSize] = useState(INITIAL_SIZE)
  const [values, setValues] = useState(() => createRandomArray(INITIAL_SIZE))
  const [activePreset, setActivePreset] = useState<ArrayPresetId | null>(null)
  const [movement, setMovement] = useState<FrameMovement>('none')
  const [speed, setSpeed] = useState(INITIAL_SPEED)
  const [showCode, setShowCode] = useState(false)

  const steps = useMemo(() => generateSelectionSortSteps(values), [values])
  const frames = useMemo(
    () => [createReadyFrame(values), ...toVisualFrames(steps)],
    [steps, values],
  )
  const lastStep = steps[steps.length - 1]
  const totalComparisons = lastStep.comparison
  const totalPasses = lastStep.pass
  const delay = Math.round(MAX_DELAY / speed)

  // The head only grows when a pass actually writes, so an exchange animation is
  // due exactly when a step crosses into, or back out of, that write.
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

  // Moving the size slider keeps the selected shape when one is active; only
  // the plain random start regenerates randomly.
  function handleSizeChange(value: string) {
    const nextSize = Number(value)
    setSize(nextSize)
    restartWith(
      activePreset === null
        ? createRandomArray(nextSize)
        : createArrayPreset(activePreset, nextSize),
    )
  }

  function handlePresetSelect(id: ArrayPresetId) {
    setActivePreset(id)
    restartWith(createArrayPreset(id, size))
  }

  function handleRandomize() {
    setActivePreset(null)
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
      value: <span className="selection-sort__swaps">{frame.swaps}</span>,
    },
    {
      label: 'Passes',
      value: `${frame.pass} / ${totalPasses}`,
    },
  ]

  return (
    <AppShell
      className={
        showCode
          ? 'experience experience--with-code selection-sort'
          : 'experience selection-sort'
      }
      style={{ '--step-duration': `${delay}ms` } as CSSProperties}
    >
      <div className="experience__layout">
        <div className="experience__stage">
          <section className="experience__visualization">
            <p className="experience__status" aria-live="polite">
              {describeFrame(frame)}
            </p>
            <SelectionBars frame={frame} movement={movement} />
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
              <div className="experience__presets">
                <button type="button" className="ui-button" onClick={handleRandomize}>
                  Randomize
                </button>
                {ARRAY_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    className={
                      preset.id === activePreset
                        ? 'ui-button selection-sort__preset selection-sort__preset--active'
                        : 'ui-button selection-sort__preset'
                    }
                    aria-pressed={preset.id === activePreset}
                    onClick={() => handlePresetSelect(preset.id)}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="experience__explanation">
            <MarkdownDescription source={description} />
          </div>
        </div>

        <CodePanel languages={SELECTION_SORT_REFERENCE} open={showCode} />
      </div>
    </AppShell>
  )
}

export default SelectionSortPage
