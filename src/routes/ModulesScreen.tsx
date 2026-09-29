import { useNavigate } from 'react-router'
import ModulesPage from '../modules/ModulesPage'
import { modulePath } from '../router'

function ModulesScreen() {
  const navigate = useNavigate()

  return <ModulesPage onSelectModule={(id) => navigate(modulePath(id))} />
}

export default ModulesScreen
