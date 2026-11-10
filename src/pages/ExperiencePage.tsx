import { EXPERIENCES } from "@/data/experiences";
import { MODULES } from "@/data/modules";
import { Navigate, useParams } from "react-router";

function ExperiencePage() {
	const { moduleId, topicId, experienceId } = useParams();

	const moduleInfo = MODULES.find((entry) => entry.id === moduleId);
	if (!moduleInfo) return <Navigate to="/" replace />;

	const topic = moduleInfo.topics.find((entry) => entry.id === topicId);
	if (!topic) return <Navigate to={`/${moduleInfo.id}`} replace />;

	const experience = topic.experiences.find((entry) => entry.id === experienceId);
	if (!experience) return <Navigate to={`/${moduleInfo.id}/${topic.id}`} replace />;

  const Page = experienceId ? EXPERIENCES[experienceId] : undefined;
  if (!Page) return <Navigate to={`/${moduleInfo.id}/${topic.id}`} replace />

	return <Page />;
}

export default ExperiencePage;
