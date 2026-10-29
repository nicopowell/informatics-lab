import { Link, useParams } from "react-router";
import { MODULES } from "../data/modules";

function SiteBreadcrumb() {
	const { moduleId, topicId } = useParams<{ moduleId: string; topicId: string }>();
	const moduleInfo = MODULES.find((m) => m.id === moduleId);
	const topic = moduleInfo?.topics.find((t) => t.id === topicId);

	const trail: { label: string; to: string }[] = [{ label: "Home", to: "/" }];

	if (moduleInfo) {
		trail.push({ label: moduleInfo.title, to: `/${moduleInfo.id}` });
	}

	if (moduleInfo && topic) {
		trail.push({ label: topic.title, to: `/${moduleInfo.id}/${topic.id}` });
	}

	return (
		<nav className="site-breadcrumb" aria-label="Breadcrumb">
			<ol className="site-breadcrumb__list">
				{trail.map((item, index) => {
					const isCurrent = index === trail.length - 1;

					return (
						<li className="site-breadcrumb__item" key={item.to}>
							{index > 0 ? (
								<span className="site-breadcrumb__separator" aria-hidden="true">
									/
								</span>
							) : null}
							{isCurrent ? (
								<span className="site-breadcrumb__current" aria-current="page">
									{item.label}
								</span>
							) : (
								<Link className="site-breadcrumb__link" to={item.to}>
									{item.label}
								</Link>
							)}
						</li>
					);
				})}
			</ol>
		</nav>
	);
}

export default SiteBreadcrumb;
