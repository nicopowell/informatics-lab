import AppShell from '../components/AppShell'
import CatalogueCard from '../components/CatalogueCard'
import { experiencePath } from '../router'
import type { ModuleInfo, Topic } from './modules'
import ExperienceArt from './experienceArt'
import './modules.css'

type ExperiencesPageProps = {
  moduleInfo: ModuleInfo
  topic: Topic
  implementedExperiences: Set<string>
}

function ExperiencesPage({
  moduleInfo,
  topic,
  implementedExperiences,
}: ExperiencesPageProps) {
  return (
    <AppShell footer="© 2026 Informatics Lab">
      <section className="modules__main">
        <p className="modules__kicker">{moduleInfo.title}</p>
        <h1 className="modules__title">{topic.title}</h1>

        <div className="modules__grid">
          {topic.experiences.map((experience) => (
            <CatalogueCard
              key={experience.id}
              to={
                implementedExperiences.has(experience.id)
                  ? experiencePath(moduleInfo.id, topic.id, experience.id)
                  : undefined
              }
              title={experience.title}
              description={experience.description}
              art={<ExperienceArt id={experience.id} />}
              className={`catalogue-card--${moduleInfo.id}`}
            />
          ))}
        </div>
      </section>
    </AppShell>
  )
}

export default ExperiencesPage
