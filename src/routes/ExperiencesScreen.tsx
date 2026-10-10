import { Navigate, useParams } from 'react-router'
import ExperiencesPage from '../modules/ExperiencesPage'
import { MODULES } from '../modules/modules'
import { modulePath, resolveModule, resolveTopic } from '../router'
import { IMPLEMENTED_EXPERIENCES } from './experiences'

function ExperiencesScreen() {
  const params = useParams()
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
    />
  )
}

export default ExperiencesScreen
