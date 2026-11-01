import type { ReactNode } from "react";
import { Link } from "react-router";

type CatalogueCardProps = {
	title: string;
	subtitle: string;
	to?: string;
	art?: ReactNode;
	hero?: boolean;
	modifier?: string;
};

function CatalogueCard({ title, subtitle, to, art, hero, modifier }: CatalogueCardProps) {
	const className = [
		"catalogue-card",
		hero ? "catalogue-card--hero" : "",
		modifier ? `catalogue-card--${modifier}` : "",
		to ? "" : "catalogue-card--coming-soon",
	]
		.filter(Boolean)
		.join(" ");

	const body = (
		<>
			{to ? null : <span className="catalogue-card__meta">Coming soon</span>}
			<h2 className="catalogue-card__title">{title}</h2>
			<p className="catalogue-card__subtitle">{subtitle}</p>
		</>
	);

	if (to) {
		return (
			<Link className={className} to={to}>
				{art ? <div className="catalogue-card__art">{art}</div> : null}
				{body}
			</Link>
		);
	}

	return (
		<div className={className}>
			{art ? <div className="catalogue-card__art">{art}</div> : null}
			{body}
		</div>
	);
}

export default CatalogueCard;
