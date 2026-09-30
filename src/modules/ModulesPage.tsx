import AppShell from '../components/AppShell'
import CatalogueCard from '../components/CatalogueCard'
import { modulePath } from '../router'
import { MODULES } from './modules'
import ModuleArt from './moduleArt'
import './modules.css'

function ModulesPage() {
  return (
    <AppShell footer="© 2026 Informatics Lab">
      <section className="modules__main">
        <h1 className="modules__title">
          Explore{' '}
          <span className="modules__title-accent">Computer Science,</span> one
          concept at a time.
        </h1>

        <div className="modules__grid">
          {MODULES.map((module) => (
            <CatalogueCard
              key={module.id}
              hero
              to={modulePath(module.id)}
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
