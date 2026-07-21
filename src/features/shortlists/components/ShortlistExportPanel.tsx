import { useState } from 'react'
import { useNotifications } from '../../../app/providers/NotificationProvider'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { Button } from '../../../shared/components/ui/Button'
import { StatusBadge } from '../../../shared/components/ui/StatusBadge'
import {
  useDownloadExportFile,
  getExportDownloadErrorMessage,
} from '../../exports/hooks/useDownloadFile'
import { useStartBulkCvExport, useStartSummaryExport } from '../../exports/hooks/useBulkCvExport'
import { useExportJob } from '../../exports/hooks/useExportJob'
import type { ExportJob } from '../../exports/types/exportTypes'
import type { Shortlist, ShortlistsUrlState } from '../types/shortlistTypes'

const dateFormatter = new Intl.DateTimeFormat('en-LK', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export function ShortlistExportPanel({
  onStateChange,
  shortlist,
  state,
}: {
  onStateChange: (patch: Partial<ShortlistsUrlState>) => void
  shortlist: Shortlist
  state: ShortlistsUrlState
}) {
  const { notify } = useNotifications()
  const summary = useExportJob(state.summaryExportJobId)
  const bulk = useExportJob(state.bulkCvExportJobId)
  const startSummary = useStartSummaryExport()
  const startBulk = useStartBulkCvExport()
  const download = useDownloadExportFile()
  const [downloadType, setDownloadType] = useState<'summary' | 'bulk'>()
  const [downloadMessage, setDownloadMessage] = useState<string>()
  const isFinalized = shortlist.status === 'FINALIZED'

  const start = async (type: 'summary' | 'bulk') => {
    setDownloadMessage(undefined)
    const mutation = type === 'summary' ? startSummary : startBulk
    try {
      const result = await mutation.mutateAsync(shortlist.shortlistId)
      onStateChange(
        type === 'summary'
          ? { summaryExportJobId: result.job.exportJobId }
          : { bulkCvExportJobId: result.job.exportJobId },
      )
      notify({
        tone: 'success',
        title: type === 'summary' ? 'Summary export started' : 'Bulk CV export started',
        message: 'The export job is queued and its status will update automatically.',
      })
    } catch {
      // The inline status region renders the controlled error.
    }
  }

  const downloadFile = async (type: 'summary' | 'bulk', job: ExportJob) => {
    setDownloadType(type)
    setDownloadMessage(undefined)
    try {
      await download.mutateAsync({
        exportJobId: job.exportJobId,
        contentType: type === 'summary' ? 'text/csv' : 'application/zip',
      })
      setDownloadMessage(type === 'summary' ? 'CSV download started.' : 'ZIP download started.')
    } catch (error) {
      setDownloadMessage(getExportDownloadErrorMessage(error))
    }
  }

  return (
    <section aria-labelledby="shortlist-export-title" className="shortlist-export-panel">
      <div className="shortlist-export-heading">
        <div>
          <p className="shortlist-detail-eyebrow">Finalized output</p>
          <h3 id="shortlist-export-title">Export and CV downloads</h3>
          <p>Generate audited files without changing shortlist membership.</p>
        </div>
        <StatusBadge tone={isFinalized ? 'success' : 'neutral'}>
          {isFinalized ? 'Ready for export' : 'Finalize first'}
        </StatusBadge>
      </div>

      {!isFinalized ? (
        <p className="shortlist-export-locked" role="status">
          Export actions become available after the manual shortlist is finalized.
        </p>
      ) : null}

      <div className="shortlist-export-grid">
        <ExportJobCard
          description="Candidate summary in a spreadsheet-compatible file."
          downloadBusy={download.isPending && downloadType === 'summary'}
          job={summary.data}
          jobError={summary.error}
          label="Shortlist summary"
          onDownload={(job) => void downloadFile('summary', job)}
          onRetry={() => void summary.refetch()}
          onStart={() => void start('summary')}
          startBusy={startSummary.isPending}
          startError={startSummary.error}
          startLabel="Generate CSV"
          enabled={isFinalized}
        />
        <ExportJobCard
          description="ZIP archive containing every available latest saved Student CV."
          downloadBusy={download.isPending && downloadType === 'bulk'}
          job={bulk.data}
          jobError={bulk.error}
          label="Bulk latest CVs"
          onDownload={(job) => void downloadFile('bulk', job)}
          onRetry={() => void bulk.refetch()}
          onStart={() => void start('bulk')}
          startBusy={startBulk.isPending}
          startError={startBulk.error}
          startLabel="Generate ZIP"
          enabled={isFinalized}
        />
      </div>

      <p aria-live="polite" className="shortlist-export-live-region">
        {downloadMessage ?? ''}
      </p>
    </section>
  )
}

function ExportJobCard({
  description,
  downloadBusy,
  enabled,
  job,
  jobError,
  label,
  onDownload,
  onRetry,
  onStart,
  startBusy,
  startError,
  startLabel,
}: {
  description: string
  downloadBusy: boolean
  enabled: boolean
  job?: ExportJob
  jobError: unknown
  label: string
  onDownload: (job: ExportJob) => void
  onRetry: () => void
  onStart: () => void
  startBusy: boolean
  startError: unknown
  startLabel: string
}) {
  const mappedError = jobError ? mapApiError(jobError, 'protected') : null
  const mappedStartError = startError ? mapApiError(startError, 'protected') : null
  const active = job?.status === 'QUEUED' || job?.status === 'PROCESSING'
  const ready = Boolean(job?.downloadReady && job.downloadUrl && job.status === 'COMPLETED')

  return (
    <article className="shortlist-export-card">
      <div className="shortlist-export-card-heading">
        <div>
          <h4>{label}</h4>
          <p>{description}</p>
        </div>
        {job ? <ExportStatus status={job.status} /> : null}
      </div>

      {mappedError ? (
        <div className="shortlist-export-error" role="alert">
          <strong>Export status unavailable</strong>
          <span>{mappedError.message}</span>
          <Button onClick={onRetry} variant="secondary">
            Retry status
          </Button>
        </div>
      ) : null}

      {job ? (
        <ExportJobDetails job={job} />
      ) : (
        <p className="shortlist-export-empty">No export job started.</p>
      )}

      {mappedStartError ? (
        <p className="inline-alert" role="alert">
          {mappedStartError.message}
        </p>
      ) : null}

      <div className="shortlist-export-actions">
        <Button
          disabled={!enabled || Boolean(active)}
          isLoading={startBusy}
          onClick={onStart}
          variant="secondary"
        >
          {job && !active ? `Generate new ${job.format}` : startLabel}
        </Button>
        <Button disabled={!ready} isLoading={downloadBusy} onClick={() => job && onDownload(job)}>
          Download {job?.format ?? 'file'}
        </Button>
      </div>
    </article>
  )
}

function ExportStatus({ status }: { status: ExportJob['status'] }) {
  const tone =
    status === 'COMPLETED'
      ? 'success'
      : status === 'FAILED' || status === 'CANCELLED'
        ? 'danger'
        : 'neutral'
  const label =
    status === 'QUEUED'
      ? 'Queued'
      : status === 'PROCESSING'
        ? 'Processing'
        : status === 'COMPLETED'
          ? 'Completed'
          : status === 'FAILED'
            ? 'Failed'
            : 'Cancelled'
  return <StatusBadge tone={tone}>{label}</StatusBadge>
}

function ExportJobDetails({ job }: { job: ExportJob }) {
  return (
    <div className="shortlist-export-job" aria-live="polite">
      <dl>
        <div>
          <dt>Candidates</dt>
          <dd>{job.totalCandidateCount}</dd>
        </div>
        <div>
          <dt>Files included</dt>
          <dd>{job.includedFileCount}</dd>
        </div>
        <div>
          <dt>Missing CVs</dt>
          <dd>{job.missingCvCount}</dd>
        </div>
        <div>
          <dt>Created</dt>
          <dd>{dateFormatter.format(new Date(job.createdAt))}</dd>
        </div>
        {job.completedAt ? (
          <div>
            <dt>Completed</dt>
            <dd>{dateFormatter.format(new Date(job.completedAt))}</dd>
          </div>
        ) : null}
        {job.expiresAt ? (
          <div>
            <dt>Expires</dt>
            <dd>{dateFormatter.format(new Date(job.expiresAt))}</dd>
          </div>
        ) : null}
      </dl>

      {job.warnings.length ? (
        <ul className="shortlist-export-warnings" aria-label="Export warnings">
          {job.warnings.map((warning) => (
            <li key={warning.code}>{warning.message}</li>
          ))}
        </ul>
      ) : null}

      {job.missingCvStudents.length ? (
        <div className="shortlist-missing-cvs">
          <strong>Students without a saved CV</strong>
          <ul>
            {job.missingCvStudents.map((student) => (
              <li key={student.studentId}>
                {student.fullName} ({student.indexNumber})
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {job.status === 'FAILED' ? (
        <p className="inline-alert" role="alert">
          Export generation failed{job.failureCode ? ` (${job.failureCode})` : ''}. Start a new job
          after resolving the issue.
        </p>
      ) : null}
      {job.status === 'CANCELLED' ? (
        <p className="inline-alert" role="status">
          This export job was cancelled.
        </p>
      ) : null}
    </div>
  )
}
