import { Navigate, useParams } from 'react-router'
import { MODULES } from '../modules/modules'
import {
  modulePath,
  resolveExperience,
  resolveModule,
  resolveTopic,
  topicPath,
} from '../router'
import type { RouteParams } from '../router'
import { EXPERIENCES } from './experiences'

function ExperienceScreen() {
  const params = useParams<RouteParams>()
  const moduleInfo = resolveModule(params, MODULES)
  const topic = resolveTopic(params, MODULES)
  const experience = resolveExperience(params, MODULES)
  const Page = params.experienceId ? EXPERIENCES[params.experienceId] : undefined

  if (!moduleInfo) {
    return <Navigate to="/" replace />
  }

  if (!topic) {
    return <Navigate to={modulePath(moduleInfo.id)} replace />
  }

  // An unknown id or a not-yet-built experience falls back to the topic.
  if (!experience || !Page) {
    return <Navigate to={topicPath(moduleInfo.id, topic.id)} replace />
  }

  return <Page />
}

export default ExperienceScreen
