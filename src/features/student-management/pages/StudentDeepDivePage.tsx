import { useEffect } from 'react'
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

const defaultPageTitle = 'Student Details Deep-Dive | Administrative Inspection Suite'

export function StudentDeepDivePage() {
  const { studentId } = useParams()
  const deepDive = useStudentDeepDive(studentId)
  const loadedStudentName = deepDive.detail.data?.student.fullName

  useEffect(() => {
    const previousTitle = document.title
    document.title = loadedStudentName
      ? `${loadedStudentName} | Student Details Deep-Dive`
      : defaultPageTitle
    return () => {
      document.title = previousTitle
    }
  }, [loadedStudentName])

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
        description={`Index Number: ${student.indexNumber} | Last Synchronized: Current Session`}
        title={student.fullName}
      />
      <div className="student-deep-dive-layout">
        <aside className="section-card student-identity-panel">
          <StudentAvatar name={student.fullName} photoUrl={profile.profilePhoto?.url ?? null} />
          <dl className="student-identity-details">
            <IdentityDetail label="Degree Programme" value={student.degreeProgram} />
            <IdentityDetail label="Current Level" value={`Level ${student.currentLevel}`} />
            <IdentityDetail label="Batch" value={student.academicBatch} />
          </dl>
          <div className="student-gpa-panel">
            <span>Official Ledger CGPA</span>
            <strong>
              {student.officialGpa === null ? 'Not available' : student.officialGpa.toFixed(2)}
            </strong>
            <small>Computer Science courses only · derived from committed academic records</small>
          </div>
          <LatestSavedCvPanel latestCv={deepDive.latestCv} studentId={deepDive.studentId} />
        </aside>
        <div className="student-deep-dive-content">
          <ReadOnlyStudentProfile profile={profile} />
          <StudentDeepDiveSections deepDive={deepDive} supportingData={cvSupportingData} />
        </div>
      </div>
      <footer className="student-deep-dive-footer">
        <Link className="button button-secondary" to={routePaths.adminStudents}>
          Return to Student Roster
        </Link>
      </footer>
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
