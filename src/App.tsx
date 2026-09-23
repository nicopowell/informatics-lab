import { useState } from 'react'
import BinarySearchPage from './algorithms/binary-search/BinarySearchPage'
import BubbleSortPage from './algorithms/bubble-sort/BubbleSortPage'
import './App.css'

type View = 'home' | 'bubble-sort' | 'binary-search'

function App() {
  const [view, setView] = useState<View>('home')

  if (view === 'bubble-sort') {
    return <BubbleSortPage onBack={() => setView('home')} />
  }

  if (view === 'binary-search') {
    return <BinarySearchPage onBack={() => setView('home')} />
  }

  return (
    <main className="home">
      <h1>Informatics Lab</h1>
      <p>
        An interactive web application for exploring and visualizing concepts
        from Informatics, with a focus on Algorithms and Data Structures.
      </p>
      <div className="home__actions">
        <button type="button" onClick={() => setView('bubble-sort')}>
          Explore Bubble Sort
        </button>
        <button type="button" onClick={() => setView('binary-search')}>
          Explore Binary Search
        </button>
      </div>
    </main>
  )
}

export default App
