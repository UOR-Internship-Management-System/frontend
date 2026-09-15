import type { ReactNode } from 'react'
import { Card, CardContent } from '../../../shared/components/ui/Card'
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
    <Card className="profile-entry-card" variant="outlined">
      <CardContent>
        <div className="profile-entry-heading">
          <div>
            <h3>{title}</h3>
            <p>{subtitle}</p>
          </div>
          <div className="profile-entry-heading-actions">
            <StatusBadge tone={cvInclude ? 'success' : 'neutral'}>
              {cvInclude ? 'Included in CV' : 'Excluded from CV'}
            </StatusBadge>
            {actions}
          </div>
        </div>
        {children ? <div className="profile-entry-details">{children}</div> : null}
      </CardContent>
    </Card>
  )
}
