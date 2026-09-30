import { Link, useParams } from 'react-router'
import { MODULES } from '../modules/modules'
import { breadcrumbTrail } from '../router'
import type { RouteParams } from '../router'

/*
 * Navigation trail for the current page. It is derived from the URL and the
 * catalogue, so every screen gets it without passing navigation props down.
 * Ancestors are links; the last item is the page currently shown.
 */
function Breadcrumb() {
  const params = useParams<RouteParams>()
  const trail = breadcrumbTrail(params, MODULES)

  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <ol className="breadcrumb__list">
        {trail.map((item, index) => {
          const isCurrent = index === trail.length - 1

          return (
            <li className="breadcrumb__item" key={item.to}>
              {index > 0 ? (
                <span className="breadcrumb__separator" aria-hidden="true">
                  /
                </span>
              ) : null}
              {isCurrent ? (
                <span className="breadcrumb__current" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link className="breadcrumb__link" to={item.to}>
                  {item.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default Breadcrumb
