import type { ReactNode } from 'react'
import PlaybackIcon from './PlaybackIcon'

export const MIN_SPEED = 1
export const MAX_SPEED = 10

export type PlaybackCount = {
  label: string
  value: ReactNode
}

type PlaybackControlsProps = {
  isPlaying: boolean
  atStart: boolean
  atEnd: boolean
  counts: PlaybackCount[]
  speed: number
  onPlayPause: () => void
  onStepForward: () => void
  onStepBackward: () => void
  onReset: () => void
  onSpeedChange: (speed: number) => void
}

/*
 * Shared playback band: reset, step back, play/pause, step forward, the speed
 * slider and the run counters. Each experience decides which counters to
 * display and how their values are formatted.
 */
function PlaybackControls({
  isPlaying,
  atStart,
  atEnd,
  counts,
  speed,
  onPlayPause,
  onStepForward,
  onStepBackward,
  onReset,
  onSpeedChange,
}: PlaybackControlsProps) {
  return (
    <div className="experience__playback">
      <div className="experience__playback-group">
        <div className="experience__playback-buttons">
          <button
            type="button"
            className="icon-button"
            aria-label="Reset"
            title="Reset"
            onClick={onReset}
            disabled={atStart}
          >
            <PlaybackIcon name="reset" />
          </button>
          <button
            type="button"
            className="icon-button"
            aria-label="Step back"
            title="Step back"
            onClick={onStepBackward}
            disabled={atStart}
          >
            <PlaybackIcon name="step-back" />
          </button>
          <button
            type="button"
            className="icon-button icon-button--primary"
            aria-label={isPlaying ? 'Pause' : 'Play'}
            title={isPlaying ? 'Pause' : 'Play'}
            onClick={onPlayPause}
            disabled={atEnd}
          >
            <PlaybackIcon name={isPlaying ? 'pause' : 'play'} />
          </button>
          <button
            type="button"
            className="icon-button"
            aria-label="Step forward"
            title="Step forward"
            onClick={onStepForward}
            disabled={atEnd}
          >
            <PlaybackIcon name="step-forward" />
          </button>
        </div>

        <label className="experience__slider">
          <span className="experience__slider-label">Speed</span>
          <input
            type="range"
            aria-label="Speed"
            aria-valuetext={`Speed ${speed} of ${MAX_SPEED}`}
            min={MIN_SPEED}
            max={MAX_SPEED}
            value={speed}
            onChange={(event) => onSpeedChange(Number(event.target.value))}
          />
        </label>
      </div>

      <div className="experience__counts">
        {counts.map((count) => (
          <span key={count.label} className="experience__count">
            <span className="experience__count-label">{count.label}</span>
            <span className="experience__count-value">{count.value}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

export default PlaybackControls
