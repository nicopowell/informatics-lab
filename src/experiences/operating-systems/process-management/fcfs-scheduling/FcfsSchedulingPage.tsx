import { useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import AppShell from '@/components/AppShell'
import PlaybackControls, { MAX_SPEED, MIN_SPEED } from '@/experience/PlaybackControls'
import { usePlayback } from '@/experience/usePlayback'
import SchedulingBoard from './visualization/SchedulingBoard'
import {
  createConvoyProcesses,
  createRandomProcesses,
  generateFcfsSteps,
} from './logic/fcfsScheduling'
import type { FcfsProcess } from './logic/fcfsScheduling'
import { createReadyFrame, toVisualFrames } from './logic/visualFrames'
import type { FcfsVisualFrame } from './logic/visualFrames'
import '@/experience/experience.css'
import './fcfsScheduling.css'

const MIN_PROCESSES = 3
const MAX_PROCESSES = 6
const INITIAL_PROCESSES = 4
const INITIAL_SPEED = 5
const SLOWEST_DELAY = 1400
const FASTEST_DELAY = 90

// A geometric ramp keeps the low speeds genuinely slow and the high speeds
// genuinely fast, with a comfortable pace around the default.
function frameDelay(speed: number): number {
  const ratio = (speed - MIN_SPEED) / (MAX_SPEED - MIN_SPEED)
  return Math.round(SLOWEST_DELAY * Math.pow(FASTEST_DELAY / SLOWEST_DELAY, ratio))
}

function describeFrame(frame: FcfsVisualFrame, processes: FcfsProcess[]): string {
  switch (frame.kind) {
    case 'ready':
      return `Ready to schedule ${processes.length} processes.`
    case 'arrive': {
      const waiting = frame.queue.length
      if (frame.running) {
        const left = frame.running.unitsLeft
        return `${frame.processId} arrives. ${frame.running.id} keeps the CPU with ${left} more ${
          left === 1 ? 'unit' : 'units'
        } to run, so it joins ${waiting === 1 ? '1 process' : `${waiting} processes`} waiting.`
      }
      if (waiting > 1) {
        return `${frame.processId} arrives and queues behind ${frame.queue[0]}.`
      }
      return `${frame.processId} arrives and finds the CPU free.`
    }
    case 'run': {
      const left = frame.running ? frame.running.unitsLeft : 1
      return left === 1
        ? `${frame.processId} runs its last burst unit.`
        : `${frame.processId} runs on the CPU — ${left} units of its burst left.`
    }
    case 'idle':
      return 'The CPU is idle: the ready queue is empty and the next process has not arrived yet.'
    case 'complete': {
      const finished = frame.completed.find(
        (process) => process.id === frame.processId,
      )
      const metrics = finished
        ? ` waited ${finished.waiting} and finished with a turnaround of ${finished.turnaround}.`
        : '.'
      const nextId = frame.queue[0]
      return `${frame.processId} finished at t=${frame.time}.${metrics}${
        nextId ? ` ${nextId} is next in the queue.` : ''
      }`
    }
    case 'done': {
      const total = frame.completed.reduce(
        (sum, process) => sum + process.waiting,
        0,
      )
      const average = frame.completed.length > 0
        ? (total / frame.completed.length).toFixed(1)
        : '0'
      return `All ${frame.completed.length} processes finished in ${frame.time} units. Average waiting time: ${average}.`
    }
  }
}

function FcfsSchedulingPage() {
  const [count, setCount] = useState(INITIAL_PROCESSES)
  const [processes, setProcesses] = useState(() =>
    createRandomProcesses(INITIAL_PROCESSES),
  )
  const [speed, setSpeed] = useState(INITIAL_SPEED)

  const frames = useMemo(
    () => [createReadyFrame(), ...toVisualFrames(generateFcfsSteps(processes))],
    [processes],
  )
  const makespan = frames[frames.length - 1].time
  const delay = frameDelay(speed)

  const playback = usePlayback(frames.length, delay)
  const frame = frames[playback.frameIndex]

  // A new input invalidates the current position in the execution.
  function restartWith(nextProcesses: FcfsProcess[]) {
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
      className="experience fcfs-scheduling"
      style={{ '--step-duration': `${delay}ms` } as CSSProperties}
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
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}

export default FcfsSchedulingPage
