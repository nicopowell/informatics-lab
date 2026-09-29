import PlaybackIcon from '../bubble-sort/PlaybackIcon'

const MIN_SPEED = 1
const MAX_SPEED = 10

type PlaybackControlsProps = {
  isPlaying: boolean
  atStart: boolean
  atEnd: boolean
  comparisons: number
  totalComparisons: number
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
  comparisons,
  totalComparisons,
  speed,
  onPlayPause,
  onStepForward,
  onStepBackward,
  onReset,
  onSpeedChange,
}: PlaybackControlsProps) {
  return (
    <div className="binary-search__playback">
      <div className="binary-search__playback-group">
        <div className="binary-search__playback-buttons">
          <button
            type="button"
            className="binary-search__icon-button"
            aria-label="Reset"
            title="Reset"
            onClick={onReset}
            disabled={atStart}
          >
            <PlaybackIcon name="reset" />
          </button>
          <button
            type="button"
            className="binary-search__icon-button"
            aria-label="Step back"
            title="Step back"
            onClick={onStepBackward}
            disabled={atStart}
          >
            <PlaybackIcon name="step-back" />
          </button>
          <button
            type="button"
            className="binary-search__icon-button binary-search__icon-button--primary"
            aria-label={isPlaying ? 'Pause' : 'Play'}
            title={isPlaying ? 'Pause' : 'Play'}
            onClick={onPlayPause}
            disabled={atEnd}
          >
            <PlaybackIcon name={isPlaying ? 'pause' : 'play'} />
          </button>
          <button
            type="button"
            className="binary-search__icon-button"
            aria-label="Step forward"
            title="Step forward"
            onClick={onStepForward}
            disabled={atEnd}
          >
            <PlaybackIcon name="step-forward" />
          </button>
        </div>

        <label className="binary-search__slider">
          <span className="binary-search__slider-label">Speed</span>
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

      <div className="binary-search__counts">
        <span className="binary-search__count">
          <span className="binary-search__count-label">Comparisons</span>
          <span className="binary-search__count-value">
            {comparisons} / {totalComparisons}
          </span>
        </span>
      </div>
    </div>
  )
}

export default PlaybackControls
