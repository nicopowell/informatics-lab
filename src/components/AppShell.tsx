import type { CSSProperties, ReactNode } from 'react'
import Breadcrumb from './Breadcrumb'
import PageHeader from './PageHeader'
import './app-shell.css'

type AppShellProps = {
  /** Extra root classes for the screen, e.g. the experience scope classes. */
  className?: string
  style?: CSSProperties
  footer?: ReactNode
  children: ReactNode
}

/*
 * The single page frame every screen renders: main element, header, breadcrumb
 * and footer. Screens only provide their content.
 */
function AppShell({ className, style, footer, children }: AppShellProps) {
  return (
    <main
      className={className ? `app-shell ${className}` : 'app-shell'}
      style={style}
    >
      <PageHeader />
      <Breadcrumb />
      {children}
      {footer ? <footer className="app-shell__footer">{footer}</footer> : null}
    </main>
  )
}

export default AppShell
