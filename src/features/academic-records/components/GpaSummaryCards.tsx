import { MetricCard } from '../../../shared/components/layout/MetricCard'
import type { GpaSummaryView } from '../types/academicRecordTypes'

export function GpaSummaryCards({ summary }: { summary: GpaSummaryView }) {
  const isAvailable = summary.status === 'AVAILABLE'

  return (
    <div className="s5-records-gpa-summary" role={isAvailable ? undefined : 'status'}>
      <MetricCard
        icon={
          <span className="material-symbols-outlined" aria-hidden="true">
            {isAvailable ? 'analytics' : 'info'}
          </span>
        }
        label="Computer Science GPA"
        tone={isAvailable ? 'primary' : 'neutral'}
        value={isAvailable ? (summary.gpaLabel ?? '') : 'Not available'}
      />
      {!isAvailable ? (
        <p className="s5-records-gpa-note">
          Your GPA will appear after official academic results are committed by the university.
        </p>
      ) : null}
    </div>
  )
}
