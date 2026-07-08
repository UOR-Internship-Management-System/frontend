import { Link } from 'react-router-dom'
import { routePaths } from '../../config/routePaths'
import { PageHeader } from '../../../shared/components/layout/PageHeader'
import { SectionCard } from '../../../shared/components/layout/SectionCard'

export function UnauthorizedPage() {
  return (
    <article>
      <PageHeader
        description="Your current foundation role does not have access to this route shell."
        title="Unauthorized"
      />
      <SectionCard>
        <Link className="nav-link" to={routePaths.home}>
          Return home
        </Link>
      </SectionCard>
    </article>
  )
}
