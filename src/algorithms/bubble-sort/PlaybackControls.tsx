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
    <div className="playback">
      <div className="playback__buttons">
        <button type="button" onClick={onReset} disabled={atStart}>
          Reset
        </button>
        <button type="button" onClick={onStepBackward} disabled={atStart}>
          Step back
        </button>
        <button type="button" onClick={onPlayPause} disabled={atEnd}>
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button type="button" onClick={onStepForward} disabled={atEnd}>
          Step forward
        </button>
      </div>

      <label className="playback__speed">
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

      <span className="playback__progress">
        {isDone ? 'Sorted' : `Comparison ${comparison} / ${totalComparisons}`}
        {' · '}
        Swaps {swaps}
      </span>
    </div>
  )
}

export default PlaybackControls
