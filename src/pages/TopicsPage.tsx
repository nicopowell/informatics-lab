import { Link, Navigate, useParams } from "react-router";
import { MODULES } from "../data/modules";
import './catalogue.css'

function TopicsPage() {
	const { moduleId } = useParams<{ moduleId: string }>();
	const moduleInfo = MODULES.find((m) => m.id === moduleId);

	if (!moduleInfo) {
		return <Navigate to="/" replace />;
	}

	return (
    <section className="topics">
			<p className="topics__kicker">{moduleInfo.subtitle}</p>
			<h1 className="topics__title">{moduleInfo.title}</h1>

      <div className="topics__grid">
        {moduleInfo.topics.map((topic) => (
          <Link
            className="topic-card"
            to={`/${moduleInfo.id}/${topic.id}`}
            key={topic.id}
          >
            <h2 className="topic-card__title">{topic.title}</h2>
            <p className="topic-card__subtitle">{topic.description}</p>
          </Link>
        ))}
      </div>
		</section>
	);
}

export default TopicsPage;
