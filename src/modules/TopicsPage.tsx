import AppShell from '../components/AppShell'
import CatalogueCard from '../components/CatalogueCard'
import { topicIsAvailable, topicPath } from '../router'
import type { ModuleInfo } from './modules'
import TopicArt from './topicArt'
import './modules.css'

type TopicsPageProps = {
  moduleInfo: ModuleInfo
  implementedExperiences: Set<string>
}

function TopicsPage({ moduleInfo, implementedExperiences }: TopicsPageProps) {
  return (
    <AppShell footer="© 2026 Informatics Lab">
      <section className="modules__main">
        <p className="modules__kicker">{moduleInfo.subtitle}</p>
        <h1 className="modules__title">{moduleInfo.title}</h1>

        <div className="modules__grid">
          {moduleInfo.topics.map((topic) => (
            <CatalogueCard
              key={topic.id}
              to={
                topicIsAvailable(topic, implementedExperiences)
                  ? topicPath(moduleInfo.id, topic.id)
                  : undefined
              }
              title={topic.title}
              description={topic.description}
              art={<TopicArt id={topic.id} />}
              className={`catalogue-card--${moduleInfo.id}`}
            />
          ))}
        </div>
      </section>
    </AppShell>
  )
}

export default TopicsPage
