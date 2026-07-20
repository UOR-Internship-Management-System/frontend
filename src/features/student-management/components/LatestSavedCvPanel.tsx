import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { ErrorState } from '../../../shared/components/feedback/ErrorState'
import { SkeletonBlock } from '../../../shared/components/feedback/SkeletonBlock'
import { StatusBadge } from '../../../shared/components/ui/StatusBadge'
import type { useStudentDeepDive } from '../hooks/useStudentDeepDive'

type LatestCvQuery = ReturnType<typeof useStudentDeepDive>['latestCv']

export function LatestSavedCvPanel({ latestCv }: { latestCv: LatestCvQuery }) {
  if (latestCv.isPending) {
    return (
      <div aria-label="Loading latest saved CV" className="deep-dive-cv-panel" role="status">
        <SkeletonBlock decorative lines={3} variant="inline" />
      </div>
    )
  }

  if (latestCv.isError) {
    const error = mapApiError(latestCv.error, 'protected')
    return (
      <ErrorState
        actionLabel="Retry CV metadata"
        correlationId={error.correlationId}
        message={error.message}
        onAction={() => void latestCv.refetch()}
        title="CV metadata unavailable"
      />
    )
  }

  if (!latestCv.data || latestCv.data.availability === 'NOT_SAVED') {
    return (
      <div className="deep-dive-cv-panel">
        <div className="deep-dive-cv-heading">
          <strong>Latest saved CV</strong>
          <StatusBadge tone="neutral">Not saved</StatusBadge>
        </div>
        <p>This Student has not saved a CV yet.</p>
      </div>
    )
  }

  const cv = latestCv.data
  return (
    <div className="deep-dive-cv-panel">
      <div className="deep-dive-cv-heading">
        <strong>Latest saved CV</strong>
        <StatusBadge tone={cv.freshnessStatus === 'CURRENT' ? 'success' : 'neutral'}>
          {cv.freshnessStatus === 'CURRENT' ? 'Current' : 'Outdated'}
        </StatusBadge>
      </div>
      <dl className="deep-dive-cv-metadata">
        <div>
          <dt>Revision</dt>
          <dd>{cv.revision}</dd>
        </div>
        <div>
          <dt>Saved</dt>
          <dd>{formatDateTime(cv.savedAt)}</dd>
        </div>
        <div>
          <dt>File</dt>
          <dd>{cv.fileName}</dd>
        </div>
      </dl>
    </div>
  )
}

function formatDateTime(value: string | null) {
  if (!value) return 'Not available'
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(value),
  )
}
