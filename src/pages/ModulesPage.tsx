import { MODULES } from "../data/modules";
import ModuleArt from "../components/art/moduleArt";
import CatalogueCard from "../components/CatalogueCard";
import "./catalogue.css";

function ModulesPage() {
	return (
		<section className="modules">
			<h1 className="modules__title">
				Explore <span className="modules__title-accent">Computer Science,</span> one concept
				at a time.
			</h1>

			<div className="modules__grid">
				{MODULES.map((module) => {
					const isAvailable = module.topics.some((topic) => topic.experiences.length > 0);

					return (
						<CatalogueCard
							key={module.id}
							title={module.title}
							subtitle={module.subtitle}
							to={isAvailable ? `/${module.id}` : undefined}
							hero
							modifier={module.id}
							art={<ModuleArt id={module.id} />}
						/>
					);
				})}
			</div>
		</section>
	);
}

export default ModulesPage;
