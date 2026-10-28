import { Link } from "react-router";

function PageHeader() {
	return (
		<header className="page-header">
			<Link className="page-header__brand" to="/">
				<span className="page-header_wordmark">Informatics Lab</span>
			</Link>
		</header>
	);
}

export default PageHeader;
