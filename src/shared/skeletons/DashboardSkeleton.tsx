import type { CSSProperties } from 'react'
import { SkeletonBlock } from '../components/feedback/SkeletonBlock'

function Shape({ height = 14, rounded = false, width = '100%' }: { height?: CSSProperties['height']; rounded?: boolean; width?: CSSProperties['width'] }) {
  return <SkeletonBlock decorative height={height} lines={0} rounded={rounded} variant="inline" width={width} />
}

function PageHeaderSkeleton({ label }: { label: string }) {
  return (
    <header aria-hidden="true" className="page-header skeleton-page-header">
      <div>
        <Shape height={24} rounded width={150} />
        <Shape height={44} width="min(420px, 82vw)" />
        <SkeletonBlock decorative lineWidths={['min(620px, 90vw)', 'min(460px, 72vw)']} lines={2} variant="inline" />
      </div>
      <Shape height={42} rounded width={138} />
      <span className="visually-hidden">{label}</span>
    </header>
  )
}

function MetricCardSkeleton() {
  return (
    <article className="section-card metric-skeleton-card" aria-hidden="true">
      <Shape height={12} width="42%" />
      <Shape height={36} width="34%" />
      <Shape height={1} width="100%" />
      <SkeletonBlock decorative lineWidths={['88%', '64%']} lines={2} variant="inline" />
    </article>
  )
}

function MetricsGridSkeleton({ count }: { count: number }) {
  return (
    <div className="skeleton-metrics-grid" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <MetricCardSkeleton key={index} />
      ))}
    </div>
  )
}

export function StudentDashboardSkeleton() {
  return (
    <section aria-busy="true" aria-label="Loading student dashboard" className="content-stack" role="status">
      <span className="visually-hidden">Loading student dashboard</span>
      <PageHeaderSkeleton label="Student dashboard header loading" />
      <article className="section-card dashboard-welcome-skeleton" aria-hidden="true">
        <Shape height={30} width="min(360px, 72vw)" />
        <SkeletonBlock decorative lineWidths={['92%', '76%']} lines={2} variant="inline" />
      </article>
      <MetricsGridSkeleton count={4} />
    </section>
  )
}

export function AdminDashboardSkeleton() {
  return (
    <section aria-busy="true" aria-label="Loading admin dashboard" className="content-stack" role="status">
      <span className="visually-hidden">Loading admin dashboard</span>
      <PageHeaderSkeleton label="Admin dashboard header loading" />
      <MetricsGridSkeleton count={3} />
    </section>
  )
}
