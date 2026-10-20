import { useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import AppShell from '@/components/AppShell'
import CodePanel from '@/experience/CodePanel'
import CodeToggle from '@/experience/CodeToggle'
import MarkdownDescription from '@/experience/MarkdownDescription'
import PlaybackControls from '@/experience/PlaybackControls'
import { usePlayback } from '@/experience/usePlayback'
import InsertionBars from './visualization/InsertionBars'
import { createRandomArray, generateInsertionSortSteps } from './logic/insertionSort'
import { createReadyFrame, frameMovement, toVisualFrames } from './logic/visualFrames'
import type { FrameMovement, InsertionSortFrame } from './logic/visualFrames'
import {
  ARRAY_PRESETS,
  MAX_SIZE,
  MIN_SIZE,
  createArrayPreset,
  type ArrayPresetId,
} from '../presets'
import description from './content/description.md?raw'
import { INSERTION_SORT_REFERENCE } from './content/insertionSortReference'
import '@/experience/experience.css'
import './insertionSort.css'

const INITIAL_SIZE = 8
const INITIAL_SPEED = 5
const MAX_DELAY = 1000

function describeFrame(frame: InsertionSortFrame): string {
  if (frame.kind === 'ready') {
    return 'Ready to sort'
  }

  if (frame.kind === 'done' || frame.key === null) {
    return 'The array is sorted'
  }

  if (frame.kind === 'pick') {
    return `Pass ${frame.pass} lifts ${frame.key} into the hand and opens a hole at it`
  }

  if (frame.kind === 'compare') {
    const testedValue = frame.testedIndex === null ? frame.key : frame.values[frame.testedIndex]

    return frame.shifted
      ? `${testedValue} > ${frame.key}, so it slides one slot right into the hole`
      : `${testedValue} <= ${frame.key}, so the scan stops and the hole stays here`
  }

  // The placement is what grows the prefix, and saying the size is the point: the
  // pass just proved every value left of the key belongs there.
  return `${frame.key} closes the hole, so ${String((frame.keyIndex ?? 0) + 1)} values are ordered`
}

function InsertionSortPage() {
  const [size, setSize] = useState(INITIAL_SIZE)
  const [values, setValues] = useState(() => createRandomArray(INITIAL_SIZE))
  const [activePreset, setActivePreset] = useState<ArrayPresetId | null>(null)
  const [movement, setMovement] = useState<FrameMovement>('none')
  const [speed, setSpeed] = useState(INITIAL_SPEED)
  const [showCode, setShowCode] = useState(false)

  const steps = useMemo(() => generateInsertionSortSteps(values), [values])
  const frames = useMemo(
    () => [createReadyFrame(values), ...toVisualFrames(steps)],
    [steps, values],
  )
  const lastStep = steps[steps.length - 1]
  const totalComparisons = lastStep.comparison
  const totalPasses = lastStep.pass
  const delay = Math.round(MAX_DELAY / speed)

  // The board animates what the hole did between two frames, which is the only
  // record of whether a shift or a placement happened.
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
      label: 'Shifts',
      value: <span className="insertion-sort__shifts">{frame.shifts}</span>,
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
          ? 'experience experience--with-code insertion-sort'
          : 'experience insertion-sort'
      }
      style={{ '--step-duration': `${delay}ms` } as CSSProperties}
    >
      <div className="experience__layout">
        <div className="experience__stage">
          <section className="experience__visualization">
            <p className="experience__status" aria-live="polite">
              {describeFrame(frame)}
            </p>
            <InsertionBars frame={frame} movement={movement} />
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
                        ? 'ui-button insertion-sort__preset insertion-sort__preset--active'
                        : 'ui-button insertion-sort__preset'
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

        <CodePanel languages={INSERTION_SORT_REFERENCE} open={showCode} />
      </div>
    </AppShell>
  )
}

export default InsertionSortPage
