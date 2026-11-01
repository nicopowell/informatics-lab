import { Navigate, useParams } from "react-router";
import { MODULES } from "../data/modules";
import "./catalogue.css";
import CatalogueCard from "../components/CatalogueCard";
import TopicArt from "../components/art/topicArt";

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
					<CatalogueCard
						key={topic.id}
						title={topic.title}
						subtitle={topic.description}
						to={`/${moduleInfo.id}/${topic.id}`}
						modifier={moduleInfo.id}
            art={<TopicArt id={topic.id} />}
					/>
				))}
			</div>
		</section>
	);
}

export default TopicsPage;
