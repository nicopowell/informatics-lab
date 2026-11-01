import { Navigate, useParams } from "react-router";
import { MODULES } from "../data/modules";
import "./catalogue.css";
import { IMPLEMENTED_EXPERIENCES } from "../data/experiences";
import CatalogueCard from "../components/CatalogueCard";

function ExperiencesPage() {
	const { moduleId, topicId } = useParams<{ moduleId: string; topicId: string }>();
	const moduleInfo = MODULES.find((m) => m.id === moduleId);
	const topic = moduleInfo?.topics.find((t) => t.id === topicId);

	if (!moduleInfo) {
		return <Navigate to="/" replace />;
	}

	if (!topic) {
		return <Navigate to={`/${moduleInfo.id}`} replace />;
	}

	return (
		<section className="experiences">
			<p className="experiences__kicker">{moduleInfo.title}</p>
			<h1 className="experiences__title">{topic.title}</h1>

			<div className="experiences__grid">
				{topic.experiences.map((experience) => (
					<CatalogueCard
						key={experience.id}
						title={experience.title}
						subtitle={experience.description}
						to={
							IMPLEMENTED_EXPERIENCES.has(experience.id)
								? `/${moduleInfo.id}/${topic.id}/${experience.id}`
								: undefined
						}
						modifier={moduleInfo.id}
					/>
				))}
			</div>

			{topic.experiences.length === 0 ? (
				<p className="experiences__empty">No experiences here yet - coming soon.</p>
			) : null}
		</section>
	);
}

export default ExperiencesPage;
