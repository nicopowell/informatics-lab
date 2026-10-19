import { useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import AppShell from '@/components/AppShell'
import MarkdownDescription from '@/experience/MarkdownDescription'
import PlaybackControls, { MAX_SPEED, MIN_SPEED } from '@/experience/PlaybackControls'
import { usePlayback } from '@/experience/usePlayback'
import {
  createConvoyProcesses,
  createRandomProcesses,
  createStarvationProcesses,
} from '../workloads'
import type { Process } from '../workloads'
import { createReadyFrame, toVisualFrames } from '../schedule'
import { describeFrame } from './logic/frameNarration'
import SchedulingBoard from '../SchedulingBoard'
import { generateSjfSteps } from './logic/sjfScheduling'
import description from './content/description.md?raw'
import '@/experience/experience.css'
import '../schedulingBoard.css'

const MIN_PROCESSES = 3
const MAX_PROCESSES = 6
const INITIAL_PROCESSES = 4
const INITIAL_SPEED = 5
const SLOWEST_DELAY = 1400
const FASTEST_DELAY = 90
// Movement should not drag when playing at a slow speed.
const MAX_TRANSITION = 500

// A geometric ramp keeps the low speeds genuinely slow and the high speeds
// genuinely fast, with a comfortable pace around the default.
function frameDelay(speed: number): number {
  const ratio = (speed - MIN_SPEED) / (MAX_SPEED - MIN_SPEED)
  return Math.round(SLOWEST_DELAY * Math.pow(FASTEST_DELAY / SLOWEST_DELAY, ratio))
}

function SjfSchedulingPage() {
  const [count, setCount] = useState(INITIAL_PROCESSES)
  const [processes, setProcesses] = useState(() =>
    createRandomProcesses(INITIAL_PROCESSES),
  )
  const [speed, setSpeed] = useState(INITIAL_SPEED)

  const frames = useMemo(
    () => [createReadyFrame(), ...toVisualFrames(generateSjfSteps(processes))],
    [processes],
  )
  const makespan = frames[frames.length - 1].time
  const delay = frameDelay(speed)
  const transition = Math.min(delay, MAX_TRANSITION)

  const playback = usePlayback(frames.length, delay)
  const frame = frames[playback.frameIndex]

  // A new input invalidates the current position in the execution.
  function restartWith(nextProcesses: Process[]) {
    setProcesses(nextProcesses)
    playback.reset()
  }

  function handleCountChange(value: string) {
    const nextCount = Number(value)
    setCount(nextCount)
    restartWith(createRandomProcesses(nextCount))
  }

  function handleRandomize() {
    restartWith(createRandomProcesses(count))
  }

  function handleConvoy() {
    const convoy = createConvoyProcesses()
    setCount(convoy.length)
    restartWith(convoy)
  }

  function handleStarvation() {
    const starvation = createStarvationProcesses()
    setCount(starvation.length)
    restartWith(starvation)
  }

  const totalWaiting = frame.completed.reduce(
    (sum, process) => sum + process.waiting,
    0,
  )
  const counts = [
    { label: 'Time', value: `${frame.time} / ${makespan}` },
    { label: 'Completed', value: `${frame.completed.length} / ${processes.length}` },
    {
      label: 'Avg waiting',
      value:
        frame.completed.length > 0
          ? (totalWaiting / frame.completed.length).toFixed(1)
          : '—',
    },
  ]

  return (
    <AppShell
      className="experience scheduling-board"
      style={{ '--step-duration': `${transition}ms` } as CSSProperties}
    >
      <div className="experience__layout">
        <div className="experience__stage">
          <section className="experience__visualization">
            <p className="experience__status" aria-live="polite">
              {describeFrame(frame, processes)}
            </p>
            <SchedulingBoard frame={frame} processes={processes} makespan={makespan} />
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
              onReset={playback.reset}
              onSpeedChange={setSpeed}
            />
            <div className="experience__input">
              <label className="experience__slider">
                <span className="experience__slider-label">Processes</span>
                <input
                  type="range"
                  aria-label="Number of processes"
                  aria-valuetext={`${count} processes`}
                  min={MIN_PROCESSES}
                  max={MAX_PROCESSES}
                  value={count}
                  onChange={(event) => handleCountChange(event.target.value)}
                />
                <span className="experience__count-value">{count}</span>
              </label>
              <button type="button" className="ui-button" onClick={handleRandomize}>
                Randomize
              </button>
              <button type="button" className="ui-button" onClick={handleConvoy}>
                Convoy effect
              </button>
              <button type="button" className="ui-button" onClick={handleStarvation}>
                Starvation
              </button>
            </div>
          </div>

          <div className="experience__explanation">
            <MarkdownDescription source={description} />
          </div>
        </div>
      </div>
    </AppShell>
  )
}

export default SjfSchedulingPage
