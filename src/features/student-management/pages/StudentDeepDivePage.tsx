import { Link, useParams } from 'react-router-dom'
import { routePaths } from '../../../app/config/routePaths'
import { PageHeader } from '../../../shared/components/layout/PageHeader'
import { SectionCard } from '../../../shared/components/layout/SectionCard'

export function StudentDeepDivePage() {
  const { studentId } = useParams()
  return (
    <div className="content-stack">
      <PageHeader
        description="The complete read-only Student Deep-Dive will be delivered in Sprint 7."
        eyebrow="Deferred to Sprint 7"
        title="Student Deep-Dive"
      />
      <SectionCard>
        <h2>Student detail route is ready</h2>
        <p>
          This route is reserved for the selected Student and does not load Sprint 7 profile, Skill,
          project, or CV data.
        </p>
        <p className="visually-hidden">Selected Student identifier: {studentId}</p>
        <Link className="button button-secondary" to={routePaths.adminStudents}>
          Back to Registered Students
        </Link>
      </SectionCard>
    </div>
  )
}
