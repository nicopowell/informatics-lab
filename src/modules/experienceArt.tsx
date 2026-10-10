import type { ReactNode } from 'react'

function BubbleSortArt() {
  return (
    <svg viewBox="0 0 200 100" fill="none" aria-hidden="true">
      <line
        x1="40"
        y1="84"
        x2="160"
        y2="84"
        stroke="rgba(255, 255, 255, 0.22)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <g fill="currentColor">
        <rect x="48" y="54" width="18" height="30" rx="2" opacity="0.35" />
        <rect x="74" y="34" width="18" height="50" rx="2" opacity="0.9" />
        <rect x="100" y="60" width="18" height="24" rx="2" opacity="0.9" />
        <rect x="126" y="26" width="18" height="58" rx="2" opacity="0.35" />
      </g>
      <path
        d="M84 22 H108"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M84 22 l4 -3 M84 22 l4 3 M108 22 l-4 -3 M108 22 l-4 3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function SelectionSortArt() {
  return (
    <svg viewBox="0 0 200 100" fill="none" aria-hidden="true">
      <line
        x1="40"
        y1="84"
        x2="160"
        y2="84"
        stroke="rgba(255, 255, 255, 0.22)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <g fill="currentColor">
        <rect x="52" y="48" width="18" height="36" rx="2" opacity="0.35" />
        <rect x="78" y="38" width="18" height="46" rx="2" opacity="0.35" />
        <rect x="104" y="30" width="18" height="54" rx="2" opacity="0.35" />
        <rect x="130" y="66" width="18" height="18" rx="2" />
      </g>
      <path
        d="M139 90 v5 M135 91 l4 4 l4 -4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function InsertionSortArt() {
  return (
    <svg viewBox="0 0 200 100" fill="none" aria-hidden="true">
      <line
        x1="40"
        y1="84"
        x2="160"
        y2="84"
        stroke="rgba(255, 255, 255, 0.22)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <g fill="currentColor">
        <rect x="52" y="46" width="18" height="38" rx="2" opacity="0.9" />
        <rect x="78" y="34" width="18" height="50" rx="2" opacity="0.9" />
        <rect x="104" y="26" width="18" height="58" rx="2" opacity="0.9" />
        <rect x="130" y="40" width="18" height="44" rx="2" opacity="0.9" />
      </g>
      <path
        d="M132 18 H108"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M108 18 l5 -3 M108 18 l5 3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function MergeSortArt() {
  return (
    <svg viewBox="0 0 200 100" fill="none" aria-hidden="true">
      <g fill="currentColor" opacity="0.55">
        <rect x="42" y="18" width="10" height="20" rx="2" />
        <rect x="56" y="12" width="10" height="26" rx="2" />
        <rect x="108" y="12" width="10" height="26" rx="2" />
        <rect x="122" y="18" width="10" height="20" rx="2" />
      </g>
      <path
        d="M52 46 C 62 62, 68 70, 74 76"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M132 46 C 122 62, 116 70, 110 76"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <g fill="currentColor">
        <rect x="72" y="74" width="10" height="16" rx="2" />
        <rect x="86" y="68" width="10" height="22" rx="2" />
        <rect x="100" y="62" width="10" height="28" rx="2" />
        <rect x="114" y="56" width="10" height="34" rx="2" />
      </g>
    </svg>
  )
}

function BinarySearchArt() {
  return (
    <svg viewBox="0 0 200 100" fill="none" aria-hidden="true">
      <g stroke="rgba(255, 255, 255, 0.28)" strokeWidth="1.4">
        <rect x="34" y="42" width="22" height="22" rx="5" opacity="0.35" />
        <rect x="60" y="42" width="22" height="22" rx="5" opacity="0.5" />
        <rect x="112" y="42" width="22" height="22" rx="5" opacity="0.5" />
        <rect x="138" y="42" width="22" height="22" rx="5" opacity="0.35" />
      </g>
      <rect x="86" y="40" width="26" height="26" rx="5" fill="currentColor" />
      <path
        d="M60 34 H138 M60 34 v-5 M138 34 v-5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  )
}

function SequentialSearchArt() {
  return (
    <svg viewBox="0 0 200 100" fill="none" aria-hidden="true">
      <g stroke="rgba(255, 255, 255, 0.28)" strokeWidth="1.4">
        <rect x="34" y="42" width="20" height="20" rx="5" opacity="0.5" />
        <rect x="60" y="42" width="20" height="20" rx="5" opacity="0.5" />
        <rect x="112" y="42" width="20" height="20" rx="5" opacity="0.35" />
        <rect x="138" y="42" width="20" height="20" rx="5" opacity="0.35" />
      </g>
      <rect x="86" y="40" width="24" height="24" rx="5" fill="currentColor" />
      <path
        d="M44 32 H98 M44 32 v-6"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  )
}

function FcfsSchedulingArt() {
  return (
    <svg viewBox="0 0 200 100" fill="none" aria-hidden="true">
      <g fill="currentColor">
        <rect x="28" y="52" width="26" height="20" rx="3" opacity="0.9" />
        <rect x="58" y="52" width="16" height="20" rx="3" opacity="0.6" />
        <rect x="78" y="52" width="30" height="20" rx="3" opacity="0.35" />
      </g>
      <line
        x1="24"
        y1="76"
        x2="118"
        y2="76"
        stroke="rgba(255, 255, 255, 0.22)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <g stroke="currentColor" strokeWidth="1.4" opacity="0.6">
        <rect x="140" y="40" width="14" height="14" rx="3" />
        <rect x="158" y="40" width="14" height="14" rx="3" />
        <rect x="176" y="40" width="14" height="14" rx="3" />
      </g>
      <path
        d="M140 62 H122 M122 62 l6 -4 M122 62 l6 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function SjfSchedulingArt() {
  return (
    <svg viewBox="0 0 200 100" fill="none" aria-hidden="true">
      <g fill="currentColor">
        <rect x="28" y="52" width="12" height="20" rx="3" opacity="0.9" />
        <rect x="46" y="52" width="22" height="20" rx="3" opacity="0.6" />
        <rect x="74" y="52" width="40" height="20" rx="3" opacity="0.35" />
      </g>
      <line
        x1="24"
        y1="76"
        x2="176"
        y2="76"
        stroke="rgba(255, 255, 255, 0.22)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Hollow block: the long job that keeps waiting while short ones run. */}
      <rect
        x="118"
        y="52"
        width="52"
        height="20"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.4"
        opacity="0.25"
      />
      <path
        d="M24 40 H40 M40 40 l-5 -4 M40 40 l-5 8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.6"
      />
    </svg>
  )
}

function FallbackExperienceArt() {
  return (
    <svg viewBox="0 0 200 100" fill="none" aria-hidden="true">
      <rect
        x="62"
        y="38"
        width="76"
        height="24"
        rx="6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="5 6"
        opacity="0.35"
      />
      <rect x="94" y="46" width="12" height="12" rx="3" fill="currentColor" opacity="0.5" />
    </svg>
  )
}

const ART: Record<string, ReactNode> = {
  'bubble-sort': <BubbleSortArt />,
  'selection-sort': <SelectionSortArt />,
  'insertion-sort': <InsertionSortArt />,
  'merge-sort': <MergeSortArt />,
  'binary-search': <BinarySearchArt />,
  'sequential-search': <SequentialSearchArt />,
  'fcfs-scheduling': <FcfsSchedulingArt />,
  'sjf-scheduling': <SjfSchedulingArt />,
}

type ExperienceArtProps = {
  id: string
}

function ExperienceArt({ id }: ExperienceArtProps) {
  // A new catalogue entry without an ART key would otherwise render an empty
  // card slot silently, so fall back to a "not drawn yet" placeholder.
  return <>{ART[id] ?? <FallbackExperienceArt />}</>
}

export default ExperienceArt
