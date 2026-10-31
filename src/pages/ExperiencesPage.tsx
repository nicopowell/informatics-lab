import { Link, Navigate, useParams } from "react-router";
import { MODULES } from "../data/modules";
import "./catalogue.css";
import { IMPLEMENTED_EXPERIENCES } from "../data/experiences";

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
				{topic.experiences.map((experience) => {
					const isImplemented = IMPLEMENTED_EXPERIENCES.has(experience.id);
					const cardContent = (
						<>
							<h2 className="experience-card__title">{experience.title}</h2>
							<p className="experience-card__subtitle">{experience.description}</p>
						</>
					);

					if (isImplemented) {
						return (
							<Link
								className="experience-card"
								to={`/${moduleInfo.id}/${topic.id}/${experience.id}`}
								key={experience.id}
							>
								{cardContent}
							</Link>
						);
					}

					return (
						<div
							className="experience-card experience-card--coming-soon"
							key={experience.id}
						>
              <span className="experience-card__meta">Coming Soon</span>
              {cardContent}
            </div>
					);
				})}
			</div>

			{topic.experiences.length === 0 ? (
				<p className="experiences__empty">No experiences here yet - coming soon.</p>
			) : null}
		</section>
	);
}

export default ExperiencesPage;
