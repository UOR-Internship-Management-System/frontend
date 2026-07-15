import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { ErrorState } from '../../../shared/components/feedback/ErrorState'
import { PageHeader } from '../../../shared/components/layout/PageHeader'
import { StudentDashboardSkeleton } from '../../../shared/skeletons'
import { StudentMetricCard } from '../components/StudentMetricCard'
import { useStudentDashboard } from '../hooks/useStudentDashboard'

const dashboardDateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
})

function formatOfficialGpa(value: number | null) {
  return value === null ? 'Not available' : value.toFixed(2)
}

export function StudentDashboardPage() {
  const dashboardQuery = useStudentDashboard()

  if (dashboardQuery.isPending) {
    return <StudentDashboardSkeleton />
  }

  if (dashboardQuery.isError || !dashboardQuery.data) {
    const error = mapApiError(dashboardQuery.error, 'protected')

    return (
      <article className="content-stack student-dashboard-page">
        <PageHeader
          description="Review your current CV-building and internship summary information."
          eyebrow="Student workspace"
          title="Student Dashboard"
        />

        <ErrorState
          correlationId={error.correlationId}
          message={error.message}
          onAction={() => void dashboardQuery.refetch()}
          title="Dashboard unavailable"
        />
      </article>
    )
  }

  const metrics = dashboardQuery.data

  return (
    <article className="content-stack student-dashboard-page">
      <PageHeader
        description="Review your current CV-building and internship summary information."
        eyebrow="Student workspace"
        title="Student Dashboard"
      />

      <section
        aria-labelledby="student-dashboard-welcome-title"
        className="section-card student-dashboard-welcome"
      >
        <div>
          <p className="student-dashboard-kicker">Your professional profile at a glance</p>

          <h2 id="student-dashboard-welcome-title">Keep your information current</h2>

          <p>
            Projects and declared skills support your saved CV, while official GPA and shortlist
            information are maintained by the department.
          </p>
        </div>

        <span aria-hidden="true" className="material-symbols-outlined student-dashboard-hero-icon">
          monitoring
        </span>
      </section>

      <section
        aria-labelledby="student-dashboard-summary-title"
        className="student-dashboard-summary"
      >
        <div className="student-dashboard-summary-header">
          <div>
            <h2 id="student-dashboard-summary-title">Current summary</h2>
            <p>Values are loaded from the Student dashboard API contract.</p>
          </div>

          <p className="student-dashboard-updated-at">
            Last updated{' '}
            <time dateTime={metrics.lastUpdatedAt}>
              {dashboardDateFormatter.format(new Date(metrics.lastUpdatedAt))}
            </time>
          </p>
        </div>

        <div className="student-dashboard-metrics-grid">
          <StudentMetricCard
            description="Student-owned portfolio entries available for your CV."
            icon="folder_copy"
            label="Portfolio projects"
            value={metrics.projectCount.toLocaleString()}
          />

          <StudentMetricCard
            description="Skills you selected from the developer-managed taxonomy."
            icon="psychology"
            label="Declared skills"
            value={metrics.declaredSkillCount.toLocaleString()}
          />

          <StudentMetricCard
            description="Internships where you are included in an Admin-managed shortlist."
            icon="work_history"
            label="Shortlisted internships"
            value={metrics.shortlistedInternshipCount.toLocaleString()}
          />

          <StudentMetricCard
            description="Official GPA derived from the latest committed academic records."
            icon="school"
            label="Official cumulative GPA"
            value={formatOfficialGpa(metrics.officialCumulativeGpa)}
          />
        </div>
      </section>
    </article>
  )
}
