import type { ReactNode } from 'react'
import { StatusBadge } from '../../../shared/components/ui/StatusBadge'

export function ProfileEntryCard({
  actions,
  children,
  cvInclude,
  subtitle,
  title,
}: {
  actions: ReactNode
  children?: ReactNode
  cvInclude: boolean
  subtitle: string
  title: string
}) {
  return (
    <article className="profile-entry-card">
      <div className="profile-entry-heading">
        <div>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
        <StatusBadge tone={cvInclude ? 'success' : 'neutral'}>
          {cvInclude ? 'Included in CV' : 'Excluded from CV'}
        </StatusBadge>
      </div>
      {children ? <div className="profile-entry-details">{children}</div> : null}
      <div className="profile-entry-actions">{actions}</div>
    </article>
  )
}
