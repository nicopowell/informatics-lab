import { useState } from 'react'
import BinarySearchPage from './algorithms/binary-search/BinarySearchPage'
import BubbleSortPage from './algorithms/bubble-sort/BubbleSortPage'
import ModulesPage from './modules/ModulesPage'
import TopicsPage from './modules/TopicsPage'
import { MODULES } from './modules/modules'

type View = 'modules' | 'topics' | 'bubble-sort' | 'binary-search'

function App() {
  const [view, setView] = useState<View>('modules')
  const [moduleId, setModuleId] = useState(MODULES[0].id)

  if (view === 'bubble-sort') {
    return <BubbleSortPage onBack={() => setView('modules')} />
  }

  if (view === 'binary-search') {
    return <BinarySearchPage onBack={() => setView('modules')} />
  }

  if (view === 'topics') {
    const moduleInfo =
      MODULES.find((entry) => entry.id === moduleId) ?? MODULES[0]
    return <TopicsPage moduleInfo={moduleInfo} onBack={() => setView('modules')} />
  }

  return (
    <ModulesPage
      onSelectModule={(id) => {
        setModuleId(id)
        setView('topics')
      }}
    />
  )
}

export default App
