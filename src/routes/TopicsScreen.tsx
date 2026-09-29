import { Navigate, useNavigate, useParams } from 'react-router'
import TopicsPage from '../modules/TopicsPage'
import { MODULES } from '../modules/modules'
import { resolveModule, topicPath } from '../router'

function TopicsScreen() {
  const params = useParams()
  const navigate = useNavigate()
  const moduleInfo = resolveModule(params, MODULES)

  if (!moduleInfo) {
    return <Navigate to="/" replace />
  }

  return (
    <TopicsPage
      moduleInfo={moduleInfo}
      onBack={() => navigate('/')}
      onSelectTopic={(topicId) => navigate(topicPath(moduleInfo.id, topicId))}
    />
  )
}

export default TopicsScreen
