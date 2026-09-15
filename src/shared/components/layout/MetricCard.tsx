import type { ReactNode } from 'react'

export type MetricCardTone = 'primary' | 'secondary' | 'tertiary' | 'neutral'

export type MetricCardProps = {
  label: string
  value: string
  description?: string
  icon?: ReactNode
  className?: string
  tone?: MetricCardTone
}

export function MetricCard({
  className = '',
  description,
  icon,
  label,
  value,
  tone = 'primary',
}: MetricCardProps) {
  return (
    <article
      className={`card m3-card m3-card--elevated m3-card--interactive section-card student-metric-card student-metric-card--${tone} ${className}`.trim()}
    >
      {icon ? (
        <span className="student-metric-card-icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <div className="student-metric-card-content">
        <p className="student-metric-card-label">{label}</p>
        <strong className="student-metric-card-value">{value}</strong>
        {description ? <p className="student-metric-card-description">{description}</p> : null}
      </div>
    </article>
  )
}
