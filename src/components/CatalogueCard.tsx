import type { ReactNode } from 'react'
import { Link } from 'react-router'
import './catalogue-card.css'

type CatalogueCardProps = {
  /** Destination path. Without it the card is inert and marked coming soon. */
  to?: string
  title: string
  description: string
  art: ReactNode
  /** The large artwork-filled cards used by the modules page. */
  hero?: boolean
  /** Extra modifier classes, e.g. the per-module accent. */
  className?: string
}

function CatalogueCard({
  to,
  title,
  description,
  art,
  hero,
  className,
}: CatalogueCardProps) {
  const classNames = [
    'catalogue-card',
    hero ? 'catalogue-card--hero' : null,
    to ? null : 'catalogue-card--coming-soon',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const content = (
    <>
      <span className="catalogue-card__art" aria-hidden="true">
        {art}
      </span>
      {!to && (
        <span className="catalogue-card__meta">
          <span className="catalogue-card__status">Coming soon</span>
        </span>
      )}
      <span className="catalogue-card__body">
        <span className="catalogue-card__title">{title}</span>
        <span className="catalogue-card__description">{description}</span>
      </span>
    </>
  )

  if (to) {
    return (
      <Link to={to} className={classNames}>
        {content}
      </Link>
    )
  }

  return <div className={classNames}>{content}</div>
}

export default CatalogueCard
