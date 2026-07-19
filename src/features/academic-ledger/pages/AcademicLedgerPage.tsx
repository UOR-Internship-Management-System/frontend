import { useEffect } from 'react'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { PaginationBar } from '../../../shared/components/data/PaginationBar'
import { EmptyState } from '../../../shared/components/feedback/EmptyState'
import { ErrorState } from '../../../shared/components/feedback/ErrorState'
import { PageHeader } from '../../../shared/components/layout/PageHeader'
import { LedgerSelectedBatchSkeleton, LedgerUploadsTableSkeleton } from '../../../shared/skeletons'
import { LedgerUploadPanel } from '../components/LedgerUploadPanel'
import { LedgerUploadStatus } from '../components/LedgerUploadStatus'
import { LedgerUploadsTable } from '../components/LedgerUploadsTable'
import { LedgerReviewSection } from '../components/LedgerReviewSection'
import { LedgerCommitControl } from '../components/LedgerCommitControl'
import { LedgerAcademicInspection } from '../components/LedgerAcademicInspection'
import { useAcademicLedgerUrlState } from '../hooks/useAcademicLedgerUrlState'
import { useLedgerUploadDetail, useLedgerUploads, useUploadLedger } from '../hooks/useLedgerUpload'

export function AcademicLedgerPage() {
  const { state, rowSearchInput, selectUpload, setRowSearchInput, updateRows, updateUploads } =
    useAcademicLedgerUrlState()
  const uploads = useLedgerUploads(state.uploads)
  const selected = useLedgerUploadDetail(state.uploadId)
  const upload = useUploadLedger()

  useEffect(() => {
    const totalPages = uploads.data?.page.totalPages ?? 0
    if (totalPages > 0 && state.uploads.page >= totalPages) updateUploads({ page: totalPages - 1 })
  }, [state.uploads.page, updateUploads, uploads.data?.page.totalPages])

  const uploadsError = uploads.isError ? mapApiError(uploads.error, 'protected') : null
  const isReviewable = Boolean(
    selected.data &&
    !['RECEIVED', 'PROCESSING', 'PROCESSING_FAILED'].includes(selected.data.uploadStatus),
  )
  return (
    <div className="content-stack academic-ledger-page">
      <PageHeader
        eyebrow="Administration"
        title="Academic Ledger"
        description="Stage, validate, review, and transactionally commit official academic records."
      />
      <LedgerUploadPanel
        error={upload.error}
        isPending={upload.isPending}
        onUpload={(file) =>
          upload.mutate(file, { onSuccess: ({ data }) => selectUpload(data.uploadId) })
        }
      />
      {state.uploadId && selected.isPending ? <LedgerSelectedBatchSkeleton /> : null}
      {selected.data ? <LedgerUploadStatus detail={selected.data} /> : null}
      {selected.isError ? (
        <ErrorState
          title="Unable to load selected batch"
          message={mapApiError(selected.error, 'protected').message}
          onAction={() => void selected.refetch()}
        />
      ) : null}
      {state.uploadId && selected.data && isReviewable ? (
        <LedgerReviewSection
          onQueryChange={updateRows}
          onSearchChange={setRowSearchInput}
          query={state.rows}
          searchInput={rowSearchInput}
          uploadId={state.uploadId}
        />
      ) : null}
      {selected.data && isReviewable ? <LedgerCommitControl detail={selected.data} /> : null}
      <section aria-labelledby="recent-ledger-batches-title" className="section-card">
        <div className="ledger-section-heading">
          <div>
            <p className="section-kicker">History</p>
            <h2 id="recent-ledger-batches-title">Recent upload batches</h2>
          </div>
          {uploads.isFetching && !uploads.isPending ? <span role="status">Updating…</span> : null}
        </div>
        <div className="ledger-toolbar">
          <label>
            Search files
            <input
              className="input"
              value={state.uploads.search}
              onChange={(event) => updateUploads({ search: event.target.value.slice(0, 120) })}
            />
          </label>
          <label>
            Status
            <select
              className="select"
              value={state.uploads.status ?? ''}
              onChange={(event) =>
                updateUploads({
                  status: (event.target.value || undefined) as typeof state.uploads.status,
                })
              }
            >
              <option value="">All statuses</option>
              <option value="PROCESSING">Processing</option>
              <option value="READY_TO_COMMIT">Ready to commit</option>
              <option value="COMMITTED">Committed</option>
              <option value="VALIDATION_FAILED">Validation failed</option>
              <option value="PROCESSING_FAILED">Processing failed</option>
            </select>
          </label>
        </div>
        {uploads.isPending ? <LedgerUploadsTableSkeleton /> : null}
        {uploadsError ? (
          <ErrorState
            title="Unable to load upload batches"
            message={uploadsError.message}
            correlationId={uploadsError.correlationId}
            onAction={() => void uploads.refetch()}
          />
        ) : null}
        {uploads.data?.items.length ? (
          <LedgerUploadsTable
            items={uploads.data.items}
            selectedId={state.uploadId}
            onSelect={selectUpload}
          />
        ) : null}
        {uploads.data && !uploads.data.items.length ? (
          <EmptyState
            title="No upload batches"
            message="No ledger uploads match the current filters."
          />
        ) : null}
        {uploads.data ? (
          <PaginationBar
            label="Academic ledger upload pages"
            page={uploads.data.page.page}
            size={uploads.data.page.size}
            totalElements={uploads.data.page.totalElements}
            totalPages={uploads.data.page.totalPages}
            pageSizeOptions={[20, 50, 100]}
            onPageChange={(page) => updateUploads({ page })}
            onPageSizeChange={(size) => updateUploads({ size: size as 20 | 50 | 100 })}
          />
        ) : null}
      </section>
      <LedgerAcademicInspection />
    </div>
  )
}
