import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { ErrorState } from '../../../shared/components/feedback/ErrorState'
import { SkeletonBlock } from '../../../shared/components/feedback/SkeletonBlock'
import { Button } from '../../../shared/components/ui/Button'
import { StatusBadge } from '../../../shared/components/ui/StatusBadge'
import type { useStudentDeepDive } from '../hooks/useStudentDeepDive'
import {
  getAdminCvDownloadErrorMessage,
  useAdminLatestCvDownload,
} from '../hooks/useAdminLatestCvDownload'

type LatestCvQuery = ReturnType<typeof useStudentDeepDive>['latestCv']

export function LatestSavedCvPanel({
  latestCv,
  studentId,
}: {
  latestCv: LatestCvQuery
  studentId: string
}) {
  const download = useAdminLatestCvDownload(studentId)
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
          <dt>Generated</dt>
          <dd>{formatDateTime(cv.generatedAt)}</dd>
        </div>
        <div>
          <dt>File</dt>
          <dd>{cv.fileName}</dd>
        </div>
        <div>
          <dt>File size</dt>
          <dd>{formatFileSize(cv.fileSizeBytes)}</dd>
        </div>
      </dl>
      <Button isLoading={download.isPending} onClick={() => download.mutate()} variant="secondary">
        Download latest CV
      </Button>
      {download.isError ? (
        <p className="deep-dive-download-message is-error" role="alert">
          {getAdminCvDownloadErrorMessage(download.error)}
        </p>
      ) : null}
      {download.isSuccess ? (
        <p aria-live="polite" className="deep-dive-download-message is-success">
          Download started: {download.data.filename}
        </p>
      ) : null}
    </div>
  )
}

function formatFileSize(value: number | null) {
  if (!value) return 'Not available'
  if (value < 1024) return `${value} bytes`
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`
  return `${(value / (1024 * 1024)).toFixed(1)} MB`
}

function formatDateTime(value: string | null) {
  if (!value) return 'Not available'
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(value),
  )
}
