import { useState } from 'react'
import BinarySearchPage from './algorithms/binary-search/BinarySearchPage'
import BubbleSortPage from './algorithms/bubble-sort/BubbleSortPage'
import ModulesPage from './modules/ModulesPage'
import TopicsPage from './modules/TopicsPage'
import ExperiencesPage from './modules/ExperiencesPage'
import { MODULES } from './modules/modules'

type View = 'modules' | 'topics' | 'experiences' | 'bubble-sort' | 'binary-search'

function App() {
  const [view, setView] = useState<View>('modules')
  const [moduleId, setModuleId] = useState(MODULES[0].id)
  const [topicId, setTopicId] = useState(MODULES[0].topics[0].id)

  if (view === 'bubble-sort') {
    return <BubbleSortPage onBack={() => setView('experiences')} />
  }

  if (view === 'binary-search') {
    return <BinarySearchPage onBack={() => setView('experiences')} />
  }

  const moduleInfo =
    MODULES.find((entry) => entry.id === moduleId) ?? MODULES[0]

  if (view === 'topics') {
    return (
      <TopicsPage
        moduleInfo={moduleInfo}
        onBack={() => setView('modules')}
        onSelectTopic={(id) => {
          setTopicId(id)
          setView('experiences')
        }}
      />
    )
  }

  if (view === 'experiences') {
    const topic =
      moduleInfo.topics.find((entry) => entry.id === topicId) ??
      moduleInfo.topics[0]
    return (
      <ExperiencesPage
        moduleInfo={moduleInfo}
        topic={topic}
        onBack={() => setView('topics')}
        onSelectExperience={(id) => {
          if (id === 'bubble-sort' || id === 'binary-search') {
            setView(id)
          }
        }}
      />
    )
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
