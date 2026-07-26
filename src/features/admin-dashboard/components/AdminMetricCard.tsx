import type { AdminMetricView } from '../types/adminDashboardTypes'

export function AdminMetricCard({ description, label, value }: AdminMetricView) {
  return (
    <article className="section-card admin-metric-card">
      <h2 className="admin-metric-label">{label}</h2>
      <strong className="admin-metric-value">{value}</strong>
      <p className="admin-metric-description">{description}</p>
    </article>
  )
}
