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
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
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
      <h1>{title}</h1>
      {description ? <p>{description}</p> : null}
      {children}
    </section>
  )
}
