import { useState } from 'react'
import BinarySearchPage from './algorithms/binary-search/BinarySearchPage'
import BubbleSortPage from './algorithms/bubble-sort/BubbleSortPage'
import ModulesPage from './modules/ModulesPage'

type View = 'modules' | 'bubble-sort' | 'binary-search'

function App() {
  const [view, setView] = useState<View>('modules')

  if (view === 'bubble-sort') {
    return <BubbleSortPage onBack={() => setView('modules')} />
  }

  if (view === 'binary-search') {
    return <BinarySearchPage onBack={() => setView('modules')} />
  }

  return <ModulesPage />
}

export default App
