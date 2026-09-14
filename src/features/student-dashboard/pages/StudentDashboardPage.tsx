import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { ErrorState } from '../../../shared/components/feedback/ErrorState'
import { MetricCard } from '../../../shared/components/layout/MetricCard'
import { PageHeader } from '../../../shared/components/layout/PageHeader'
import { SkeletonMetricGrid, SkeletonPageHeader, SkeletonStatusRegion } from '../../../shared/skeletons'
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
    return (
      <SkeletonStatusRegion
        className="content-stack student-dashboard-page"
        label="Loading student dashboard"
      >
        <SkeletonPageHeader />
        <SkeletonMetricGrid count={4} />
      </SkeletonStatusRegion>
    )
  }

  if (dashboardQuery.isError || !dashboardQuery.data) {
    const error = mapApiError(dashboardQuery.error, 'protected')

    return (
      <article className="content-stack student-dashboard-page">
        <PageHeader
          description="Review your current CV-building and internship summary information."
          title="Student dashboard"
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
        title="Student dashboard"
      />

      <section
        aria-labelledby="student-dashboard-welcome-title"
        className="card m3-card m3-card--filled section-card student-dashboard-welcome"
      >
        <div className="student-dashboard-welcome-copy">
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
            <p>Your latest saved profile and department-managed records.</p>
          </div>

          <p className="student-dashboard-updated-at">
            Last updated{' '}
            <time dateTime={metrics.lastUpdatedAt}>
              {dashboardDateFormatter.format(new Date(metrics.lastUpdatedAt))}
            </time>
          </p>
        </div>

        <div className="student-dashboard-metrics-grid">
          <MetricCard
            description="Student-owned portfolio entries available for your CV."
            icon={
              <span aria-hidden="true" className="material-symbols-outlined">
                folder_copy
              </span>
            }
            label="Portfolio projects"
            tone="primary"
            value={metrics.projectCount.toLocaleString()}
          />

          <MetricCard
            description="Skills you selected from the developer-managed taxonomy."
            icon={
              <span aria-hidden="true" className="material-symbols-outlined">
                psychology
              </span>
            }
            label="Declared skills"
            tone="tertiary"
            value={metrics.declaredSkillCount.toLocaleString()}
          />

          <MetricCard
            description="Internships where you are included in an Admin-managed shortlist."
            icon={
              <span aria-hidden="true" className="material-symbols-outlined">
                work_history
              </span>
            }
            label="Shortlisted internships"
            tone="secondary"
            value={metrics.shortlistedInternshipCount.toLocaleString()}
          />

          <MetricCard
            description="Official GPA derived from the latest committed academic records."
            icon={
              <span aria-hidden="true" className="material-symbols-outlined">
                school
              </span>
            }
            label="Official cumulative GPA"
            tone="primary"
            value={formatOfficialGpa(metrics.officialCumulativeGpa)}
          />
        </div>
      </section>
    </article>
  )
}
