import { Link, useParams } from 'react-router-dom'
import { routePaths } from '../../../app/config/routePaths'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { ErrorState } from '../../../shared/components/feedback/ErrorState'
import { PageHeader } from '../../../shared/components/layout/PageHeader'
import { SectionCard } from '../../../shared/components/layout/SectionCard'
import { StudentDeepDiveSkeleton } from '../../../shared/skeletons/StudentDeepDiveSkeleton'
import { LatestSavedCvPanel } from '../components/LatestSavedCvPanel'
import { ReadOnlyStudentProfile } from '../components/ReadOnlyStudentProfile'
import { StudentDeepDiveSections } from '../components/StudentDeepDiveSections'
import { useStudentDeepDive } from '../hooks/useStudentDeepDive'

export function StudentDeepDivePage() {
  const { studentId } = useParams()
  const deepDive = useStudentDeepDive(studentId)

  if (deepDive.isNotFound) {
    return (
      <div className="content-stack">
        <PageHeader
          description="The selected Student identifier is invalid or the registered Student no longer exists."
          eyebrow="Registered Students"
          title="Student not found"
        />
        <SectionCard>
          <p>No Student information was loaded.</p>
          <Link className="button button-secondary" to={routePaths.adminStudents}>
            Back to Registered Students
          </Link>
        </SectionCard>
      </div>
    )
  }

  if (deepDive.detail.isPending) return <StudentDeepDiveSkeleton />

  if (deepDive.detail.isError) {
    const error = mapApiError(deepDive.detail.error, 'protected')
    return (
      <div className="content-stack">
        <PageHeader
          description="The read-only Student inspection could not be loaded."
          eyebrow="Registered Students"
          title="Student Deep-Dive"
        />
        <ErrorState
          correlationId={error.correlationId}
          message={error.message}
          onAction={() => void deepDive.detail.refetch()}
        />
      </div>
    )
  }

  if (!deepDive.detail.data) return <StudentDeepDiveSkeleton />
  const { profile, student, cvSupportingData } = deepDive.detail.data

  return (
    <div className="content-stack student-deep-dive-page">
      <PageHeader
        actions={
          <Link className="button button-secondary" to={routePaths.adminStudents}>
            Back to roster
          </Link>
        }
        description={`${student.indexNumber} · ${student.universityEmail}`}
        eyebrow="Read-only administrative inspection"
        title={student.fullName}
      />
      <div className="student-deep-dive-layout">
        <aside className="section-card student-identity-panel">
          <StudentAvatar name={student.fullName} photoUrl={profile.profilePhoto?.url ?? null} />
          <div className="student-identity-heading">
            <h2>{student.fullName}</h2>
            <p>{student.indexNumber}</p>
          </div>
          <dl className="student-identity-details">
            <IdentityDetail label="Degree programme" value={student.degreeProgram} />
            <IdentityDetail label="Current level" value={`Level ${student.currentLevel}`} />
            <IdentityDetail label="Academic batch" value={student.academicBatch} />
          </dl>
          <div className="student-gpa-panel">
            <span>Official Computer Science GPA</span>
            <strong>
              {student.officialGpa === null ? 'Not available' : student.officialGpa.toFixed(2)}
            </strong>
            <small>Derived from committed academic records</small>
          </div>
          <LatestSavedCvPanel latestCv={deepDive.latestCv} studentId={deepDive.studentId} />
        </aside>
        <div className="student-deep-dive-content">
          <ReadOnlyStudentProfile profile={profile} />
          <StudentDeepDiveSections deepDive={deepDive} supportingData={cvSupportingData} />
        </div>
      </div>
    </div>
  )
}

function IdentityDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}

function StudentAvatar({ name, photoUrl }: { name: string; photoUrl: string | null }) {
  if (photoUrl)
    return <img alt={`${name} profile`} className="student-identity-avatar" src={photoUrl} />
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
  return (
    <div
      aria-label={`${name} initials`}
      className="student-identity-avatar student-identity-initials"
      role="img"
    >
      {initials || 'ST'}
    </div>
  )
}
