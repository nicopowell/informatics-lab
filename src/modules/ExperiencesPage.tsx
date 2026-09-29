import AppShell from '../components/AppShell'
import type { ModuleInfo, Topic } from './modules'
import ExperienceArt from './experienceArt'
import './modules.css'

type ExperiencesPageProps = {
  moduleInfo: ModuleInfo
  topic: Topic
  implementedExperiences: Set<string>
  onBack: () => void
  onSelectExperience: (experienceId: string) => void
}

function ExperiencesPage({
  moduleInfo,
  topic,
  implementedExperiences,
  onBack,
  onSelectExperience,
}: ExperiencesPageProps) {
  return (
    <AppShell
      back={{ label: '← Topics', onClick: onBack }}
      footer="© 2026 Informatics Lab"
    >
      <section className="modules__main">
        <p className="modules__kicker">{moduleInfo.title}</p>
        <h1 className="modules__title">{topic.title}</h1>

        <div className={`modules__grid modules__grid--${moduleInfo.id}`}>
          {topic.experiences.map((experience) => {
            const isImplemented = implementedExperiences.has(experience.id)

            const art = (
              <span className="topic-card__art" aria-hidden="true">
                <ExperienceArt id={experience.id} />
              </span>
            )

            const meta = !isImplemented ? (
              <span className="topic-card__meta">
                <span className="topic-card__status">Coming soon</span>
              </span>
            ) : null

            const body = (
              <>
                <span className="topic-card__title">{experience.title}</span>
                <span className="topic-card__description">
                  {experience.description}
                </span>
              </>
            )

            if (!isImplemented) {
              return (
                <div
                  key={experience.id}
                  className="topic-card topic-card--coming-soon"
                >
                  {art}
                  {meta}
                  {body}
                </div>
              )
            }

            return (
              <button
                key={experience.id}
                type="button"
                className="topic-card"
                onClick={() => onSelectExperience(experience.id)}
              >
                {art}
                {meta}
                {body}
              </button>
            )
          })}
        </div>
      </section>
    </AppShell>
  )
}

export default ExperiencesPage
