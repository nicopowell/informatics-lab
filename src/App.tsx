import { useState } from 'react'
import BubbleSortPage from './algorithms/bubble-sort/BubbleSortPage'
import './App.css'

type View = 'home' | 'bubble-sort'

function App() {
  const [view, setView] = useState<View>('home')

  if (view === 'bubble-sort') {
    return <BubbleSortPage onBack={() => setView('home')} />
  }

  return (
    <main className="home">
      <h1>Informatics Lab</h1>
      <p>
        An interactive web application for exploring and visualizing concepts
        from Informatics, with a focus on Algorithms and Data Structures.
      </p>
      <button type="button" onClick={() => setView('bubble-sort')}>
        Explore Bubble Sort
      </button>
    </main>
  )
}

export default App
