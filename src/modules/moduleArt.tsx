import type { ReactNode } from 'react'

function AlgorithmsArt() {
  return (
    <svg
      className="module-art--algorithms"
      viewBox="0 0 320 200"
      fill="none"
      aria-hidden="true"
    >
      <g stroke="currentColor" strokeWidth="1.4" opacity="0.85">
        <line x1="160" y1="52" x2="108" y2="100" />
        <line x1="160" y1="52" x2="212" y2="100" />
        <line x1="108" y1="100" x2="76" y2="148" strokeDasharray="4 5" opacity="0.55" />
        <line x1="108" y1="100" x2="140" y2="148" />
        <line x1="212" y1="100" x2="180" y2="148" />
        <line x1="212" y1="100" x2="244" y2="148" />
      </g>
      <g stroke="currentColor" strokeWidth="1.4" fill="var(--color-surface)">
        <circle cx="160" cy="52" r="5" />
        <circle cx="108" cy="100" r="5" />
        <circle cx="212" cy="100" r="5" />
        <circle cx="76" cy="148" r="5" />
        <circle cx="140" cy="148" r="5" />
        <circle cx="180" cy="148" r="5" />
        <circle cx="244" cy="148" r="5" />
      </g>
    </svg>
  )
}

function NumericalArt() {
  return (
    <svg
      className="module-art--numerical"
      viewBox="0 0 320 200"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M60 158 H266 M60 158 V42"
        stroke="rgba(255, 255, 255, 0.18)"
        strokeWidth="1"
      />
      <path
        d="M60 150 C 100 70, 140 168, 190 92 S 248 58, 266 74"
        stroke="#60a5fa"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M60 154 C 108 122, 158 148, 208 112 S 248 100, 266 104"
        stroke="#a78bfa"
        strokeWidth="1.6"
        strokeDasharray="5 6"
        strokeLinecap="round"
        opacity="0.85"
      />
      <g fill="var(--color-surface)" stroke="#60a5fa" strokeWidth="1.6">
        <circle cx="60" cy="150" r="3.5" />
        <circle cx="140" cy="118" r="3.5" />
        <circle cx="190" cy="92" r="3.5" />
        <circle cx="266" cy="74" r="3.5" />
      </g>
    </svg>
  )
}

function NetworksArt() {
  return (
    <svg
      className="module-art--networks"
      viewBox="0 0 320 200"
      fill="none"
      aria-hidden="true"
    >
      <g stroke="currentColor" strokeWidth="1.3" opacity="0.8">
        <line x1="160" y1="44" x2="84" y2="100" />
        <line x1="160" y1="44" x2="236" y2="100" />
        <line x1="84" y1="100" x2="160" y2="156" />
        <line x1="236" y1="100" x2="160" y2="156" />
        <line x1="84" y1="100" x2="236" y2="100" />
        <line x1="160" y1="44" x2="160" y2="156" strokeDasharray="4 5" opacity="0.5" />
      </g>
      <g stroke="currentColor" strokeWidth="1.4" fill="var(--color-surface)">
        <circle cx="160" cy="44" r="5" />
        <circle cx="84" cy="100" r="5" />
        <circle cx="236" cy="100" r="5" />
        <circle cx="160" cy="156" r="5" />
      </g>
    </svg>
  )
}

const ART: Record<string, ReactNode> = {
  algorithms: <AlgorithmsArt />,
  numerical: <NumericalArt />,
  networks: <NetworksArt />,
}

type ModuleArtProps = {
  id: string
}

function ModuleArt({ id }: ModuleArtProps) {
  return <>{ART[id]}</>
}

export default ModuleArt
