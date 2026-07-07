import { Link } from 'react-router-dom'
import { routePaths } from '../../../app/config/routePaths'
import { PageHeader } from '../../../shared/components/layout/PageHeader'
import { SectionCard } from '../../../shared/components/layout/SectionCard'

export function HomePage() {
  return (
    <article>
      <PageHeader
        description="Frontend foundation landing shell with route groups, providers, shared primitives, and scope guardrails."
        title="CV Management Frontend"
      />
      <SectionCard>
        <h2>Approved route groups</h2>
        <nav aria-label="Foundation route shortcuts">
          <ul className="nav-list">
            <li>
              <Link className="nav-link" to={routePaths.studentLogin}>
                Student access
              </Link>
            </li>
            <li>
              <Link className="nav-link" to={routePaths.adminLogin}>
                Admin access
              </Link>
            </li>
          </ul>
        </nav>
      </SectionCard>
    </article>
  )
}
