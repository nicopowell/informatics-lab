import PlaybackIcon from './PlaybackIcon'

const MIN_SPEED = 1
const MAX_SPEED = 10

type PlaybackControlsProps = {
  isPlaying: boolean
  atStart: boolean
  atEnd: boolean
  comparison: number
  totalComparisons: number
  swaps: number
  isDone: boolean
  speed: number
  onPlayPause: () => void
  onStepForward: () => void
  onStepBackward: () => void
  onReset: () => void
  onSpeedChange: (speed: number) => void
}

function PlaybackControls({
  isPlaying,
  atStart,
  atEnd,
  comparison,
  totalComparisons,
  swaps,
  isDone,
  speed,
  onPlayPause,
  onStepForward,
  onStepBackward,
  onReset,
  onSpeedChange,
}: PlaybackControlsProps) {
  return (
    <div className="bubble-sort__playback">
      <div className="bubble-sort__playback-buttons">
        <button
          type="button"
          className="bubble-sort__icon-button"
          aria-label="Reset"
          title="Reset"
          onClick={onReset}
          disabled={atStart}
        >
          <PlaybackIcon name="reset" />
        </button>
        <button
          type="button"
          className="bubble-sort__icon-button"
          aria-label="Step back"
          title="Step back"
          onClick={onStepBackward}
          disabled={atStart}
        >
          <PlaybackIcon name="step-back" />
        </button>
        <button
          type="button"
          className="bubble-sort__icon-button bubble-sort__icon-button--primary"
          aria-label={isPlaying ? 'Pause' : 'Play'}
          title={isPlaying ? 'Pause' : 'Play'}
          onClick={onPlayPause}
          disabled={atEnd}
        >
          <PlaybackIcon name={isPlaying ? 'pause' : 'play'} />
        </button>
        <button
          type="button"
          className="bubble-sort__icon-button"
          aria-label="Step forward"
          title="Step forward"
          onClick={onStepForward}
          disabled={atEnd}
        >
          <PlaybackIcon name="step-forward" />
        </button>
      </div>

      <label className="bubble-sort__playback-speed">
        Speed
        <input
          type="range"
          aria-label="Speed"
          min={MIN_SPEED}
          max={MAX_SPEED}
          value={speed}
          onChange={(event) => onSpeedChange(Number(event.target.value))}
        />
        <span>{speed}</span>
      </label>

      <span className="bubble-sort__playback-progress">
        {isDone ? 'Sorted' : `Comparison ${comparison} / ${totalComparisons}`}
        {' · '}
        Swaps {swaps}
      </span>
    </div>
  )
}

export default PlaybackControls
