import ArrayBars from './ArrayBars'
import { generateBubbleSortSteps } from './bubbleSort'
import './bubbleSort.css'

const demoValues = [5, 1, 4, 2, 8]
const demoSteps = generateBubbleSortSteps(demoValues)
// Temporary step chosen to show comparing, swapped and already-sorted bars.
const demoStep =
  demoSteps.find((step) => step.swapped && step.sortedFrom < step.values.length) ??
  demoSteps[demoSteps.length - 1]

type BubbleSortPageProps = {
  onBack: () => void
}

function BubbleSortPage({ onBack }: BubbleSortPageProps) {
  return (
    <main className="bubble-sort">
      <header className="bubble-sort__header">
        <button type="button" className="bubble-sort__back" onClick={onBack}>
          Back
        </button>
        <h1>Bubble Sort</h1>
      </header>

      <ArrayBars step={demoStep} />
    </main>
  )
}

export default BubbleSortPage
