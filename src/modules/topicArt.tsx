import type { ReactNode } from 'react'

function SortingArt() {
  return (
    <svg viewBox="0 0 200 100" fill="none" aria-hidden="true">
      <line
        x1="28"
        y1="82"
        x2="172"
        y2="82"
        stroke="rgba(255, 255, 255, 0.22)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <g fill="currentColor">
        <rect x="38" y="58" width="12" height="24" rx="2" opacity="0.3" />
        <rect x="58" y="44" width="12" height="38" rx="2" opacity="0.45" />
        <rect x="78" y="30" width="12" height="52" rx="2" opacity="0.6" />
        <rect x="98" y="46" width="12" height="36" rx="2" opacity="0.45" />
        <rect x="118" y="20" width="12" height="62" rx="2" opacity="0.85" />
        <rect x="138" y="36" width="12" height="46" rx="2" opacity="0.55" />
      </g>
    </svg>
  )
}

function SearchingArt() {
  return (
    <svg viewBox="0 0 200 100" fill="none" aria-hidden="true">
      <g stroke="rgba(255, 255, 255, 0.28)" strokeWidth="1.4">
        <rect x="38" y="40" width="22" height="22" rx="5" />
        <rect x="64" y="40" width="22" height="22" rx="5" opacity="0.5" />
        <rect x="116" y="40" width="22" height="22" rx="5" opacity="0.5" />
        <rect x="142" y="40" width="22" height="22" rx="5" opacity="0.35" />
      </g>
      <rect x="90" y="38" width="26" height="26" rx="5" fill="currentColor" />
      <path
        d="M103 28 V76"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  )
}

function TreesArt() {
  return (
    <svg viewBox="0 0 200 100" fill="none" aria-hidden="true">
      <g stroke="currentColor" strokeWidth="1.5" opacity="0.6">
        <line x1="100" y1="26" x2="64" y2="54" />
        <line x1="100" y1="26" x2="136" y2="54" />
        <line x1="64" y1="54" x2="44" y2="80" />
        <line x1="64" y1="54" x2="84" y2="80" />
        <line x1="136" y1="54" x2="116" y2="80" />
        <line x1="136" y1="54" x2="156" y2="80" />
      </g>
      <g fill="currentColor">
        <circle cx="100" cy="26" r="5" />
        <circle cx="64" cy="54" r="5" opacity="0.8" />
        <circle cx="136" cy="54" r="5" opacity="0.8" />
        <circle cx="44" cy="80" r="4" opacity="0.55" />
        <circle cx="84" cy="80" r="4" opacity="0.55" />
        <circle cx="116" cy="80" r="4" opacity="0.55" />
        <circle cx="156" cy="80" r="4" opacity="0.55" />
      </g>
    </svg>
  )
}

function GraphsArt() {
  return (
    <svg viewBox="0 0 200 100" fill="none" aria-hidden="true">
      <g stroke="rgba(255, 255, 255, 0.28)" strokeWidth="1.4">
        <line x1="50" y1="30" x2="100" y2="50" />
        <line x1="100" y1="50" x2="150" y2="30" />
        <line x1="100" y1="50" x2="150" y2="74" />
        <line x1="50" y1="30" x2="50" y2="74" />
        <line x1="50" y1="74" x2="100" y2="50" />
      </g>
      <path
        d="M50 30 L100 50 L150 30"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <g fill="currentColor">
        <circle cx="50" cy="30" r="5" />
        <circle cx="100" cy="50" r="5" />
        <circle cx="150" cy="30" r="5" />
      </g>
      <g fill="currentColor" opacity="0.45">
        <circle cx="50" cy="74" r="4" />
        <circle cx="150" cy="74" r="4" />
      </g>
    </svg>
  )
}

function DataStructuresArt() {
  return (
    <svg viewBox="0 0 200 100" fill="none" aria-hidden="true">
      <g stroke="rgba(255, 255, 255, 0.28)" strokeWidth="1.4">
        <rect x="66" y="58" width="68" height="18" rx="4" />
        <rect x="66" y="38" width="68" height="18" rx="4" />
      </g>
      <rect x="66" y="18" width="68" height="18" rx="4" fill="currentColor" />
      <path
        d="M150 27 H166"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M160 21 L167 27 L160 33"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function InterpolationArt() {
  return (
    <svg viewBox="0 0 200 100" fill="none" aria-hidden="true">
      <path
        d="M40 74 C 70 30, 118 80, 160 32"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <g fill="currentColor">
        <circle cx="40" cy="74" r="4.5" />
        <circle cx="78" cy="48" r="4.5" opacity="0.85" />
        <circle cx="120" cy="56" r="4.5" opacity="0.85" />
        <circle cx="160" cy="32" r="4.5" />
      </g>
    </svg>
  )
}

function IntegrationArt() {
  return (
    <svg viewBox="0 0 200 100" fill="none" aria-hidden="true">
      <line
        x1="34"
        y1="80"
        x2="170"
        y2="80"
        stroke="rgba(255, 255, 255, 0.22)"
        strokeWidth="1.4"
      />
      <path
        d="M40 62 C 70 24, 110 70, 160 30 L160 80 L40 80 Z"
        fill="currentColor"
        opacity="0.18"
      />
      <path
        d="M40 62 C 70 24, 110 70, 160 30"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <g stroke="currentColor" strokeWidth="1.2" opacity="0.5">
        <line x1="70" y1="42" x2="70" y2="80" />
        <line x1="100" y1="46" x2="100" y2="80" />
        <line x1="130" y1="40" x2="130" y2="80" />
      </g>
    </svg>
  )
}

function DifferentialEquationsArt() {
  return (
    <svg viewBox="0 0 200 100" fill="none" aria-hidden="true">
      <g
        stroke="rgba(255, 255, 255, 0.32)"
        strokeWidth="1.3"
        strokeLinecap="round"
      >
        <line x1="50" y1="30" x2="58" y2="24" />
        <line x1="80" y1="30" x2="88" y2="24" />
        <line x1="110" y1="30" x2="118" y2="25" />
        <line x1="140" y1="30" x2="148" y2="27" />
        <line x1="50" y1="55" x2="56" y2="49" />
        <line x1="80" y1="55" x2="87" y2="52" />
        <line x1="110" y1="55" x2="118" y2="56" />
        <line x1="140" y1="55" x2="148" y2="60" />
        <line x1="50" y1="78" x2="58" y2="78" />
        <line x1="80" y1="78" x2="90" y2="82" />
        <line x1="110" y1="78" x2="120" y2="83" />
        <line x1="140" y1="78" x2="150" y2="85" />
      </g>
      <path
        d="M46 74 C 90 64, 120 46, 154 28"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function LayersArt() {
  return (
    <svg viewBox="0 0 200 100" fill="none" aria-hidden="true">
      <g stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1.4">
        <rect x="48" y="62" width="104" height="16" rx="4" />
        <rect x="48" y="42" width="104" height="16" rx="4" />
      </g>
      <rect x="48" y="22" width="104" height="16" rx="4" fill="currentColor" />
      <path
        d="M74 60 V40"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M126 40 V60"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  )
}

function RoutingArt() {
  return (
    <svg viewBox="0 0 200 100" fill="none" aria-hidden="true">
      <g stroke="rgba(255, 255, 255, 0.28)" strokeWidth="1.3">
        <line x1="40" y1="68" x2="90" y2="74" />
        <line x1="90" y1="74" x2="130" y2="66" />
        <line x1="80" y1="34" x2="130" y2="66" />
      </g>
      <path
        d="M40 68 L80 34 L130 66 L164 38"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <g fill="currentColor">
        <circle cx="40" cy="68" r="4.5" />
        <circle cx="80" cy="34" r="4.5" />
        <circle cx="130" cy="66" r="4.5" />
        <circle cx="164" cy="38" r="4.5" />
      </g>
      <circle cx="90" cy="74" r="4" fill="currentColor" opacity="0.4" />
    </svg>
  )
}

function TransportArt() {
  return (
    <svg viewBox="0 0 200 100" fill="none" aria-hidden="true">
      <line
        x1="30"
        y1="52"
        x2="150"
        y2="52"
        stroke="rgba(255, 255, 255, 0.22)"
        strokeWidth="1.4"
      />
      <g fill="currentColor">
        <rect x="40" y="42" width="16" height="12" rx="2" opacity="0.9" />
        <rect x="68" y="42" width="16" height="12" rx="2" opacity="0.65" />
        <rect x="96" y="42" width="16" height="12" rx="2" opacity="0.45" />
      </g>
      <g stroke="currentColor" strokeWidth="1.4" opacity="0.6">
        <rect x="132" y="40" width="20" height="20" rx="3" />
        <rect x="136" y="34" width="20" height="20" rx="3" />
        <rect x="140" y="28" width="20" height="20" rx="3" />
      </g>
    </svg>
  )
}

const ART: Record<string, ReactNode> = {
  sorting: <SortingArt />,
  searching: <SearchingArt />,
  trees: <TreesArt />,
  graphs: <GraphsArt />,
  'data-structures': <DataStructuresArt />,
  interpolation: <InterpolationArt />,
  integration: <IntegrationArt />,
  'differential-equations': <DifferentialEquationsArt />,
  layers: <LayersArt />,
  routing: <RoutingArt />,
  transport: <TransportArt />,
}

type TopicArtProps = {
  id: string
}

function TopicArt({ id }: TopicArtProps) {
  return <>{ART[id]}</>
}

export default TopicArt
