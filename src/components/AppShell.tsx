import type { CSSProperties, ReactNode } from 'react'
import PageHeader, { PageHeaderBack } from './PageHeader'
import './app-shell.css'

type AppShellBack = {
  label: string
  to: string
}

type AppShellProps = {
  /** Extra root classes for the screen, e.g. the experience scope classes. */
  className?: string
  style?: CSSProperties
  back?: AppShellBack
  footer?: ReactNode
  children: ReactNode
}

/*
 * The single page frame every screen renders: main element, header and
 * footer. Screens only provide their content and the navigation they need.
 */
function AppShell({ className, style, back, footer, children }: AppShellProps) {
  return (
    <main
      className={className ? `app-shell ${className}` : 'app-shell'}
      style={style}
    >
      <PageHeader
        action={
          back ? (
            <PageHeaderBack label={back.label} to={back.to} />
          ) : undefined
        }
      />
      {children}
      {footer ? <footer className="app-shell__footer">{footer}</footer> : null}
    </main>
  )
}

export default AppShell
