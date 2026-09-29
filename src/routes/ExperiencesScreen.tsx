import { Navigate, useNavigate, useParams } from 'react-router'
import ExperiencesPage from '../modules/ExperiencesPage'
import { MODULES } from '../modules/modules'
import { experiencePath, modulePath, resolveModule, resolveTopic } from '../router'
import { EXPERIENCES } from './experiences'

const IMPLEMENTED_EXPERIENCES = new Set(Object.keys(EXPERIENCES))

function ExperiencesScreen() {
  const params = useParams()
  const navigate = useNavigate()
  const moduleInfo = resolveModule(params, MODULES)
  const topic = resolveTopic(params, MODULES)

  if (!moduleInfo) {
    return <Navigate to="/" replace />
  }

  if (!topic) {
    return <Navigate to={modulePath(moduleInfo.id)} replace />
  }

  return (
    <ExperiencesPage
      moduleInfo={moduleInfo}
      topic={topic}
      implementedExperiences={IMPLEMENTED_EXPERIENCES}
      onBack={() => navigate(modulePath(moduleInfo.id))}
      onSelectExperience={(experienceId) => {
        if (!EXPERIENCES[experienceId]) {
          return
        }
        navigate(experiencePath(moduleInfo.id, topic.id, experienceId))
      }}
    />
  )
}

export default ExperiencesScreen
