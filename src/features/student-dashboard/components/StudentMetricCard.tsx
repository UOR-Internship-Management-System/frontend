import type { StudentMetricCardProps } from '../types/studentDashboardTypes'

export function StudentMetricCard({ description, icon, label, value }: StudentMetricCardProps) {
  return (
    <article className="section-card student-metric-card">
      <span aria-hidden="true" className="material-symbols-outlined student-metric-card-icon">
        {icon}
      </span>

      <div className="student-metric-card-content">
        <p className="student-metric-card-label">{label}</p>
        <strong className="student-metric-card-value">{value}</strong>
        <p className="student-metric-card-description">{description}</p>
      </div>
    </article>
  )
}
