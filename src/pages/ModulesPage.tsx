import { Link } from "react-router";
import { MODULES } from "../data/modules";
import "./catalogue.css";
import ModuleArt from "../components/art/moduleArt";

function ModulesPage() {
	return (
		<section className="modules">
			<h1 className="modules__title">
				Explore <span className="modules__title-accent">Computer Science</span>, one concept
				at a time.
			</h1>

			<div className="modules__grid">
				{MODULES.map((module) => (
					<Link
						className="module-card module-card--hero"
						to={`/${module.id}`}
						key={module.id}
					>
						<div className="module-card__art">
							<ModuleArt id={module.id} />
						</div>
						<h2 className="module-card__title">{module.title}</h2>
						<p className="module-card__subtitle">{module.subtitle}</p>
					</Link>
				))}
			</div>
		</section>
	);
}

export default ModulesPage;
