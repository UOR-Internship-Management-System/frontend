import { Link } from 'react-router-dom'
import { routePaths } from '../../config/routePaths'
import { PageHeader } from '../../../shared/components/layout/PageHeader'
import { SectionCard } from '../../../shared/components/layout/SectionCard'

export function NotFoundPage() {
  return (
    <article>
      <PageHeader
        description="The requested frontend route is not part of the approved route map."
        title="Not Found"
      />
      <SectionCard>
        <Link className="nav-link" to={routePaths.home}>
          Return home
        </Link>
      </SectionCard>
    </article>
  )
}
