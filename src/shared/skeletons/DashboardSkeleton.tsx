import { SkeletonBlock } from '../components/feedback/SkeletonBlock'
import { SkeletonPageHeader, SkeletonShape, SkeletonStatusRegion } from './SkeletonPrimitives'

function MetricCardSkeleton() {
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

function SummaryHeader({ admin = false }: { admin?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={admin ? 'admin-dashboard-summary-header' : 'student-dashboard-summary-header'}
    >
      <div className="skeleton-stack">
        <SkeletonShape height={28} width={admin ? 210 : 205} />
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
      <SkeletonPageHeader />
      <section aria-hidden="true" className="section-card student-dashboard-welcome">
        <div className="skeleton-stack">
          <SkeletonShape height={12} radius="pill" width={270} />
          <SkeletonShape height={30} width="min(360px, 72vw)" />
          <SkeletonBlock decorative lineWidths={['92%', '76%']} lines={2} variant="inline" />
        </div>
        <SkeletonShape height={72} radius="circle" width={72} />
      </section>
      <section aria-hidden="true" className="student-dashboard-summary skeleton-stack">
        <SummaryHeader />
        <div
          className="student-dashboard-metrics-grid"
          data-testid="student-dashboard-metrics-skeleton"
        >
          {Array.from({ length: 4 }, (_, index) => (
            <MetricCardSkeleton key={index} />
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
      <SkeletonPageHeader />
      <section aria-hidden="true" className="admin-dashboard-summary skeleton-stack">
        <SummaryHeader admin />
        <div className="admin-metrics-grid" data-testid="admin-dashboard-metrics-skeleton">
          {Array.from({ length: 3 }, (_, index) => (
            <MetricCardSkeleton key={index} />
          ))}
        </div>
      </section>
    </SkeletonStatusRegion>
  )
}
