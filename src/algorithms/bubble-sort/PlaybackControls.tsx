const MIN_SPEED = 1
const MAX_SPEED = 10

type PlaybackControlsProps = {
  isPlaying: boolean
  stepIndex: number
  totalSteps: number
  speed: number
  onPlayPause: () => void
  onStepForward: () => void
  onStepBackward: () => void
  onReset: () => void
  onSpeedChange: (speed: number) => void
}

function PlaybackControls({
  isPlaying,
  stepIndex,
  totalSteps,
  speed,
  onPlayPause,
  onStepForward,
  onStepBackward,
  onReset,
  onSpeedChange,
}: PlaybackControlsProps) {
  const atStart = stepIndex === 0
  const atEnd = stepIndex >= totalSteps - 1

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
          min={MIN_SPEED}
          max={MAX_SPEED}
          value={speed}
          onChange={(event) => onSpeedChange(Number(event.target.value))}
        />
        <span>{speed}</span>
      </label>

      <span className="playback__progress">
        Step {stepIndex + 1} / {totalSteps}
      </span>
    </div>
  )
}

export default PlaybackControls
