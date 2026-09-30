import type { ReactNode } from 'react'
import { Link } from 'react-router'

function LogoMark() {
  return (
    <svg className="page-header__logo" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <rect
        x="1"
        y="1"
        width="26"
        height="26"
        rx="7"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <g stroke="currentColor" strokeWidth="1.5">
        <line x1="11" y1="14" x2="17.5" y2="10" />
        <line x1="11" y1="14" x2="17.5" y2="18" />
      </g>
      <g fill="currentColor">
        <circle cx="10" cy="14" r="1.8" />
        <circle cx="18" cy="9.5" r="1.8" />
        <circle cx="18" cy="18.5" r="1.8" />
      </g>
    </svg>
  )
}

type PageHeaderProps = {
  action?: ReactNode
}

function PageHeader({ action }: PageHeaderProps) {
  return (
    <header className="page-header">
      <div className="page-header__brand">
        <LogoMark />
        <span className="page-header__wordmark">Informatics Lab</span>
      </div>
      {action}
    </header>
  )
}

type PageHeaderBackProps = {
  label: string
  to: string
}

function PageHeaderBack({ label, to }: PageHeaderBackProps) {
  return (
    <Link to={to} className="ui-button">
      {label}
    </Link>
  )
}

export { PageHeaderBack }
export default PageHeader
