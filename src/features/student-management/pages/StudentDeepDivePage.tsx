import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { routePaths } from '../../../app/config/routePaths'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { ErrorState } from '../../../shared/components/feedback/ErrorState'
import { PageHeader } from '../../../shared/components/layout/PageHeader'
import { SectionCard } from '../../../shared/components/layout/SectionCard'
import { SkeletonCard, SkeletonFormFields, SkeletonStatusRegion } from '../../../shared/skeletons'
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

  if (deepDive.detail.isPending) return <StudentDeepDiveLoading />

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

  if (!deepDive.detail.data) return <StudentDeepDiveLoading />
  const { profile, student, cvSupportingData } = deepDive.detail.data

  return (
    <div className="sdd-page">
      <PageHeader
        description={`Index Number: ${student.indexNumber} | Last Synchronized: Current Session`}
        title={student.fullName}
      />
      <div className="sdd-layout">
        <aside className="sdd-identity-card">
          <StudentAvatar name={student.fullName} photoUrl={profile.profilePhoto?.url ?? null} />
          <dl className="sdd-identity-details">
            <IdentityDetail label="Degree Programme" value={student.degreeProgram} />
            <IdentityDetail label="Current Level" value={`Level ${student.currentLevel}`} />
            <IdentityDetail label="Batch" value={student.academicBatch} />
          </dl>
          <div className="sdd-gpa-panel">
            <span className="sdd-gpa-label">Official Ledger CGPA</span>
            <strong className="sdd-gpa-value">
              {student.officialGpa === null ? 'Not available' : student.officialGpa.toFixed(2)}
            </strong>
            <small className="sdd-gpa-caption">
              Computer Science courses only · derived from committed academic records
            </small>
          </div>
          <LatestSavedCvPanel latestCv={deepDive.latestCv} studentId={deepDive.studentId} />
        </aside>
        <div className="sdd-content">
          <ReadOnlyStudentProfile profile={profile} />
          <StudentDeepDiveSections deepDive={deepDive} supportingData={cvSupportingData} />
        </div>
      </div>
      <footer className="sdd-footer">
        <Link className="button button-secondary" to={routePaths.adminStudents}>
          Return to Student Roster
        </Link>
      </footer>
    </div>
  )
}

function StudentDeepDiveLoading() {
  return (
    <SkeletonStatusRegion className="sdd-page" label="Loading student details">
      <div className="sdd-layout">
        <SkeletonCard className="sdd-identity-card"><SkeletonFormFields count={3} /></SkeletonCard>
        <SkeletonCard className="sdd-content" title={false}><SkeletonFormFields count={6} /></SkeletonCard>
      </div>
    </SkeletonStatusRegion>
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
    return <img alt={`${name} profile`} className="sdd-avatar" src={photoUrl} />
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
  return (
    <div
      aria-label={`${name} initials`}
      className="sdd-avatar sdd-avatar--initials"
      role="img"
    >
      {initials || 'ST'}
    </div>
  )
}
