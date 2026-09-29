import PageHeader, { PageHeaderBack } from './PageHeader'
import type { ModuleInfo } from './modules'
import TopicArt from './topicArt'
import './modules.css'

type TopicsPageProps = {
  moduleInfo: ModuleInfo
  onBack: () => void
  onSelectTopic: (topicId: string) => void
}

function TopicsPage({ moduleInfo, onBack, onSelectTopic }: TopicsPageProps) {
  return (
    <main className="modules">
      <PageHeader action={<PageHeaderBack label="← Modules" onClick={onBack} />} />

      <section className="modules__main">
        <p className="modules__kicker">{moduleInfo.subtitle}</p>
        <h1 className="modules__title">{moduleInfo.title}</h1>

        <div className={`modules__grid modules__grid--${moduleInfo.id}`}>
          {moduleInfo.topics.map((topic) => {
            const art = (
              <span className="topic-card__art" aria-hidden="true">
                <TopicArt id={topic.id} />
              </span>
            )

            const meta = !topic.available ? (
              <span className="topic-card__meta">
                <span className="topic-card__status">Coming soon</span>
              </span>
            ) : null

            const body = (
              <>
                <span className="topic-card__title">{topic.title}</span>
                <span className="topic-card__description">
                  {topic.description}
                </span>
              </>
            )

            if (!topic.available) {
              return (
                <div
                  key={topic.id}
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
                key={topic.id}
                type="button"
                className="topic-card"
                onClick={() => onSelectTopic(topic.id)}
              >
                {art}
                {meta}
                {body}
              </button>
            )
          })}
        </div>
      </section>

      <footer className="modules__footer">© 2026 Informatics Lab</footer>
    </main>
  )
}

export default TopicsPage
