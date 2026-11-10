import { Link } from "react-router";
import logoUrl from '../assets/logo.svg'

function SiteHeader() {
	return (
		<header className="site-header">
			<Link className="site-header__brand" to="/">
        <img className="site-header__logo" src={logoUrl} alt="Informatics Lab Icon" />
				<span className="site-header__wordmark">Informatics Lab</span>
			</Link>
		</header>
	);
}

export default SiteHeader;