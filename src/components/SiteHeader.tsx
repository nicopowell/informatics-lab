import { Link } from "react-router";

function SiteHeader() {
	return (
		<header className="site-header">
			<Link className="site-header__brand" to="/">
				<span className="site-header__wordmark">Informatics Lab</span>
			</Link>
		</header>
	);
}

export default SiteHeader;
