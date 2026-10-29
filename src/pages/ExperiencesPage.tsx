import { Link, Navigate, useParams } from "react-router";
import { MODULES } from "../data/modules";

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
					<Link
						className="experience-card"
						to={`/${moduleInfo.id}/${topic.id}/${experience.id}`}
						key={experience.id}
					>
						<h2 className="experience-card__title">{experience.title}</h2>
						<p className="experience-card__subtitle">{experience.description}</p>
					</Link>
				))}
			</div>

			{topic.experiences.length === 0 ? (
				<p className="experiences__empty">No experiences here yet - coming soon.</p>
			) : null}
		</section>
	);
}

export default ExperiencesPage;
