import { useEffect } from 'react'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { ErrorState } from '../../../shared/components/feedback/ErrorState'
import { PageHeader } from '../../../shared/components/layout/PageHeader'
import { AdminDashboardSkeleton } from '../../../shared/skeletons'
import { AdminMetricCard } from '../components/AdminMetricCard'
import { useAdminDashboard } from '../hooks/useAdminDashboard'

const pageTitle = 'Admin Dashboard Content | CV Management & Filtering System'
const pageDescription =
  'Centralized decision-support summary tracking active candidate workflows and departmental ledger integrity status.'

export function AdminDashboardPage() {
  const metricsQuery = useAdminDashboard()

  useEffect(() => {
    const previousTitle = document.title
    document.title = pageTitle

    return () => {
      document.title = previousTitle
    }
  }, [])

  if (metricsQuery.isPending) return <AdminDashboardSkeleton />

  if (metricsQuery.isError) {
    const error = mapApiError(metricsQuery.error, 'protected')
    const unavailable = error.status === 503

    return (
      <main className="content-stack admin-dashboard-page">
        <PageHeader description={pageDescription} eyebrow="Administration" title="Admin Dashboard" />
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
      </main>
    )
  }

  return (
    <main className="content-stack admin-dashboard-page">
      <PageHeader description={pageDescription} eyebrow="Administration" title="Admin Dashboard" />
      <section aria-label="Admin dashboard metrics" className="admin-dashboard-summary">
        <div className="admin-metrics-grid">
          {metricsQuery.data.metrics.map((metric) => (
            <AdminMetricCard {...metric} key={metric.key} />
          ))}
        </div>
      </section>
    </main>
  )
}
