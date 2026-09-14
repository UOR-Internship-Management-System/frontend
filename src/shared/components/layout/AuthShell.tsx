import type { ReactNode } from 'react'

type AuthSplitShellProps = {
  title: ReactNode
  description?: string
  children: ReactNode
}

type AuthCardShellProps = {
  icon: string
  title: string
  description?: string
  children: ReactNode
  className?: string
}

export function AuthSplitShell({ children, description, title }: AuthSplitShellProps) {
  return (
    <section className="auth-split-shell">
      <aside className="auth-welcome-panel">
        <div className="auth-welcome-decor" aria-hidden="true">
          <span className="auth-welcome-shape auth-welcome-shape--a" />
          <span className="auth-welcome-shape auth-welcome-shape--b" />
        </div>
        <div className="auth-brand">
          <span className="auth-brand-mark material-symbols-outlined" aria-hidden="true">
            school
          </span>
          <span className="m3-label-large auth-brand-name">CV Management</span>
        </div>
        <div className="auth-welcome-copy">
          <h1 className="m3-display-small">{title}</h1>
          {description ? <p className="m3-body-large">{description}</p> : null}
        </div>
      </aside>
      <div className="auth-form-panel">{children}</div>
    </section>
  )
}

export function AuthCardShell({
  children,
  className = '',
  description,
  icon,
  title,
}: AuthCardShellProps) {
  return (
    <section className={`auth-centered-card ${className}`.trim()}>
      <div className="auth-icon" aria-hidden="true">
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <h1 className="m3-headline-small">{title}</h1>
      {description ? <p className="m3-body-medium auth-centered-card-description">{description}</p> : null}
      {children}
    </section>
  )
}
