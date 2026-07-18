import { StatusBadge } from '../../../shared/components/ui/StatusBadge'
import type { GpaSummaryView } from '../types/academicRecordTypes'

export function GpaSummaryCards({ summary }: { summary: GpaSummaryView }) {
  if (summary.status === 'NOT_AVAILABLE') {
    return (
      <div className="s5-records-gpa-unavailable" role="status">
        <span aria-hidden="true" className="material-symbols-outlined">
          info
        </span>
        <div>
          <StatusBadge>Not available</StatusBadge>
          <h3>Official GPA is not available yet</h3>
          <p>
            Your Computer Science GPA will appear after academic results have been committed by the
            university.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="s5-records-gpa-grid">
      <article className="s5-records-gpa-card s5-records-gpa-primary">
        <div className="s5-records-card-label">
          <span>Computer Science GPA</span>
          <StatusBadge tone="success">Official</StatusBadge>
        </div>
        <strong>{summary.gpaLabel}</strong>
        <p>Calculated from committed academic records.</p>
      </article>
      <article className="s5-records-gpa-card">
        <span className="s5-records-card-label">Credits counted</span>
        <strong>{summary.creditsLabel}</strong>
        <p>Total credits included in this calculation.</p>
      </article>
      <article className="s5-records-gpa-card">
        <span className="s5-records-card-label">Last calculated</span>
        <strong className="s5-records-date-value">{summary.calculatedAtLabel}</strong>
        <p>{summary.sourceLabel}</p>
      </article>
    </div>
  )
}
