import { Navigate, Route, Routes } from 'react-router'
import ScrollToTop from './routes/ScrollToTop'
import ModulesPage from './modules/ModulesPage'
import TopicsScreen from './routes/TopicsScreen'
import ExperiencesScreen from './routes/ExperiencesScreen'
import ExperienceScreen from './routes/ExperienceScreen'

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<ModulesPage />} />
        <Route path="/:moduleId" element={<TopicsScreen />} />
        <Route path="/:moduleId/:topicId" element={<ExperiencesScreen />} />
        <Route
          path="/:moduleId/:topicId/:experienceId"
          element={<ExperienceScreen />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App
