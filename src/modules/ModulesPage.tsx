import AppShell from '../components/AppShell'
import CatalogueCard from '../components/CatalogueCard'
import {
  moduleIsAvailable,
  modulePath,
} from '../router'
import type { ModuleInfo } from './modules'
import ModuleArt from './moduleArt'
import './modules.css'

function ModulesPage({
  modules,
  implementedExperiences,
}: {
  modules: ModuleInfo[]
  implementedExperiences: Set<string>
}) {
  return (
    <AppShell footer="© 2026 Informatics Lab">
      <section className="modules__main">
        <h1 className="modules__title">
          Explore{' '}
          <span className="modules__title-accent">Computer Science,</span> one
          concept at a time.
        </h1>

        <div className="modules__grid">
          {modules.map((module) => (
            <CatalogueCard
              key={module.id}
              hero
              to={
                moduleIsAvailable(module, implementedExperiences)
                  ? modulePath(module.id)
                  : undefined
              }
              title={module.title}
              description={module.subtitle}
              art={<ModuleArt id={module.id} />}
              className={`catalogue-card--${module.id}`}
            />
          ))}
        </div>
      </section>
    </AppShell>
  )
}

export default ModulesPage
