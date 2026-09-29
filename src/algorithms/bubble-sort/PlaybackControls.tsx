import PlaybackIcon from '../../experience/PlaybackIcon'

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

        <label className="experience__slider experience__slider--speed">
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
        <span className="experience__count">
          <span className="experience__count-label">Comparisons</span>
          <span className="experience__count-value">
            {isDone ? totalComparisons : comparison} / {totalComparisons}
          </span>
        </span>
        <span className="experience__count">
          <span className="experience__count-label">Swaps</span>
          <span className="experience__count-value bubble-sort__swaps">
            {swaps}
          </span>
        </span>
      </div>
    </div>
  )
}

export default PlaybackControls
