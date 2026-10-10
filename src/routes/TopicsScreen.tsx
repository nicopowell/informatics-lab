import { Navigate, useParams } from 'react-router'
import TopicsPage from '../modules/TopicsPage'
import { MODULES } from '../modules/modules'
import { resolveModule } from '../router'
import { IMPLEMENTED_EXPERIENCES } from './experiences'

function TopicsScreen() {
  const params = useParams()
  const moduleInfo = resolveModule(params, MODULES)

  if (!moduleInfo) {
    return <Navigate to="/" replace />
  }

  return <TopicsPage moduleInfo={moduleInfo} implementedExperiences={IMPLEMENTED_EXPERIENCES} />
}

export default TopicsScreen
