import ModulesPage from '../modules/ModulesPage'
import { MODULES } from '../modules/modules'
import { IMPLEMENTED_EXPERIENCES } from './experiences'

function ModulesScreen() {
  return (
    <ModulesPage
      modules={MODULES}
      implementedExperiences={IMPLEMENTED_EXPERIENCES}
    />
  )
}

export default ModulesScreen
