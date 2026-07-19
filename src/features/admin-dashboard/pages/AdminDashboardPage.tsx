import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { ErrorState } from '../../../shared/components/feedback/ErrorState'
import { PageHeader } from '../../../shared/components/layout/PageHeader'
import { AdminDashboardSkeleton } from '../../../shared/skeletons'
import { AdminMetricCard } from '../components/AdminMetricCard'
import { useAdminDashboard } from '../hooks/useAdminDashboard'

export function AdminDashboardPage() {
  const metricsQuery = useAdminDashboard()

  if (metricsQuery.isPending) return <AdminDashboardSkeleton />

  if (metricsQuery.isError) {
    const error = mapApiError(metricsQuery.error, 'protected')
    const unavailable = error.status === 503
    return (
      <div className="content-stack admin-dashboard-page">
        <PageHeader
          description="Live operational totals for Student registration and internship requests."
          eyebrow="Administration"
          title="Admin Dashboard"
        />
        <ErrorState
          correlationId={error.correlationId}
          message={
            unavailable
              ? 'Dashboard metrics are temporarily unavailable. Your session remains active.'
              : error.message
          }
          onAction={() => void metricsQuery.refetch()}
          title={unavailable ? 'Dashboard service unavailable' : 'Unable to load dashboard metrics'}
        />
      </div>
    )
  }

  return (
    <div className="content-stack admin-dashboard-page">
      <PageHeader
        description="Live operational totals for Student registration and internship requests."
        eyebrow="Administration"
        title="Admin Dashboard"
      />
      <section aria-labelledby="admin-dashboard-summary-title" className="admin-dashboard-summary">
        <div className="admin-dashboard-summary-header">
          <div>
            <h2 id="admin-dashboard-summary-title">System overview</h2>
            <p>Backend-provided counts from the current operational dataset.</p>
          </div>
          <p aria-live="polite" className="admin-dashboard-freshness">
            {metricsQuery.isFetching
              ? 'Updating metrics…'
              : `Last updated ${metricsQuery.data.lastUpdatedLabel}`}
          </p>
        </div>
        <div className="admin-metrics-grid">
          {metricsQuery.data.metrics.map((metric) => (
            <AdminMetricCard {...metric} key={metric.key} />
          ))}
        </div>
      </section>
    </div>
  )
}
