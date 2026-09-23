type PlaybackControlsProps = {
  isPlaying: boolean
  atStart: boolean
  atEnd: boolean
  comparisons: number
  progress: number
  speed: number
  minSpeed: number
  maxSpeed: number
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
  progress,
  speed,
  minSpeed,
  maxSpeed,
  onPlayPause,
  onStepForward,
  onStepBackward,
  onReset,
  onSpeedChange,
}: PlaybackControlsProps) {
  return (
    <div className="binary-search__playback">
      <div className="binary-search__controls">
        <button
          type="button"
          className="binary-search__button"
          onClick={onReset}
          disabled={atStart}
        >
          Reset
        </button>
        <button
          type="button"
          className="binary-search__button"
          onClick={onStepBackward}
          disabled={atStart}
        >
          Step back
        </button>
        <button
          type="button"
          className="binary-search__button"
          onClick={onPlayPause}
          disabled={!isPlaying && atEnd}
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button
          type="button"
          className="binary-search__button binary-search__button--primary"
          onClick={onStepForward}
          disabled={atEnd}
        >
          Step forward
        </button>
      </div>

      <label className="binary-search__speed">
        Speed
        <input
          type="range"
          aria-label="Speed"
          min={minSpeed}
          max={maxSpeed}
          value={speed}
          onChange={(event) => onSpeedChange(Number(event.target.value))}
        />
        <span>{speed}</span>
      </label>

      <div className="binary-search__progress">
        <span className="binary-search__progress-count">
          Comparisons {comparisons}
        </span>
        <div className="binary-search__progress-track" aria-hidden="true">
          <div
            className="binary-search__progress-fill"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}

export default PlaybackControls
