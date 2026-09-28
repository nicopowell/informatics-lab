type PlaybackIconName =
  | 'reset'
  | 'step-back'
  | 'play'
  | 'pause'
  | 'step-forward'

const PATHS: Record<PlaybackIconName, string> = {
  reset: 'M4 4v6h6M4.5 13a7.5 7.5 0 1 0 1.7-5.2L4 10',
  'step-back': 'M18 5v14L8 12l10-7zM6 5v14',
  play: 'M7 5l12 7-12 7V5z',
  pause: 'M8 5v14M16 5v14',
  'step-forward': 'M6 5v14l10-7L6 5zM18 5v14',
}

type PlaybackIconProps = {
  name: PlaybackIconName
}

function PlaybackIcon({ name }: PlaybackIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={PATHS[name]} />
    </svg>
  )
}

export default PlaybackIcon
