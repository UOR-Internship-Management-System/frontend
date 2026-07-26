import { SkeletonBlock } from '../components/feedback/SkeletonBlock'
import { SkeletonPageHeader, SkeletonShape, SkeletonStatusRegion } from './SkeletonPrimitives'

function StudentMetricCardSkeleton() {
  return (
    <article
      aria-hidden="true"
      className="section-card metric-skeleton-card skeleton-card-stack"
      data-skeleton-metric
    >
      <div className="skeleton-section-heading">
        <SkeletonShape height={12} radius="pill" width="48%" />
        <SkeletonShape height={42} radius="circle" width={42} />
      </div>
      <SkeletonShape height={38} width="38%" />
      <SkeletonShape height={1} radius="none" />
      <SkeletonBlock decorative lineWidths={['92%', '68%']} lines={2} variant="inline" />
    </article>
  )
}

function AdminMetricCardSkeleton() {
  return (
    <article
      aria-hidden="true"
      className="section-card admin-metric-card metric-skeleton-card skeleton-card-stack"
      data-skeleton-admin-metric
      data-skeleton-metric
    >
      <SkeletonShape height={12} radius="pill" width="48%" />
      <SkeletonShape height={38} width="38%" />
      <SkeletonShape height={1} radius="none" />
      <SkeletonBlock decorative lineWidths={['92%', '68%']} lines={2} variant="inline" />
    </article>
  )
}

function StudentSummaryHeader() {
  return (
    <div aria-hidden="true" className="student-dashboard-summary-header">
      <div className="skeleton-stack">
        <SkeletonShape height={28} width={205} />
        <SkeletonShape height={12} radius="pill" width={390} />
      </div>
      <SkeletonShape height={14} radius="pill" width={190} />
    </div>
  )
}

export function StudentDashboardSkeleton() {
  return (
    <SkeletonStatusRegion
      className="content-stack student-dashboard-page"
      label="Loading student dashboard"
    >
      <SkeletonPageHeader eyebrow />
      <section aria-hidden="true" className="section-card student-dashboard-welcome">
        <div className="skeleton-stack">
          <SkeletonShape height={12} radius="pill" width={270} />
          <SkeletonShape height={30} width="min(360px, 72vw)" />
          <SkeletonBlock decorative lineWidths={['92%', '76%']} lines={2} variant="inline" />
        </div>
        <SkeletonShape height={72} radius="circle" width={72} />
      </section>
      <section aria-hidden="true" className="student-dashboard-summary skeleton-stack">
        <StudentSummaryHeader />
        <div
          className="student-dashboard-metrics-grid"
          data-testid="student-dashboard-metrics-skeleton"
        >
          {Array.from({ length: 4 }, (_, index) => (
            <StudentMetricCardSkeleton key={index} />
          ))}
        </div>
      </section>
    </SkeletonStatusRegion>
  )
}

export function AdminDashboardSkeleton() {
  return (
    <SkeletonStatusRegion
      className="content-stack admin-dashboard-page"
      label="Loading admin dashboard"
    >
      <SkeletonPageHeader eyebrow />
      <section aria-hidden="true" className="admin-dashboard-summary">
        <div className="admin-metrics-grid" data-testid="admin-dashboard-metrics-skeleton">
          {Array.from({ length: 3 }, (_, index) => (
            <AdminMetricCardSkeleton key={index} />
          ))}
        </div>
      </section>
    </SkeletonStatusRegion>
  )
}
