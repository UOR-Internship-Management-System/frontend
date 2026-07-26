import type { GpaSummaryView } from '../types/academicRecordTypes'

export function GpaSummaryCards({ summary }: { summary: GpaSummaryView }) {
  const isAvailable = summary.status === 'AVAILABLE'

  return (
    <div className="s5-records-gpa-summary" role={isAvailable ? undefined : 'status'}>
      <div className="s5-records-gpa-icon" aria-hidden="true">
        <span className="material-symbols-outlined">{isAvailable ? 'analytics' : 'info'}</span>
      </div>
      <div className="s5-records-gpa-meta">
        <span className="s5-records-gpa-label">Computer Science GPA</span>
        <strong className={`s5-records-gpa-score ${isAvailable ? '' : 'is-unavailable'}`.trim()}>
          {isAvailable ? summary.gpaLabel : 'Not available'}
        </strong>
        {!isAvailable ? (
          <p>
            Your GPA will appear after official academic results are committed by the university.
          </p>
        ) : null}
      </div>
    </div>
  )
}
