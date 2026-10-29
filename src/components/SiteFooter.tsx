import { Link } from "react-router"

const REPOSITORY_URL = 'https://github.com/nicopowell/informatics-lab'

function SiteFooter() {
  return (
    <footer className="site-footer">
      <span>© 2026 Nico Powell - Informatics Lab</span>
      <nav className="site-footer__links" aria-label="Footer">
        <Link to="/about">About</Link>
        <a href={REPOSITORY_URL}>GitHub</a>
      </nav>
    </footer>
  )
}

export default SiteFooter