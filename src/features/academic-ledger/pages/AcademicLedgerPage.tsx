import { useEffect, useState } from 'react'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { PaginationBar } from '../../../shared/components/data/PaginationBar'
import { SearchBar } from '../../../shared/components/data/SearchBar'
import { EmptyState } from '../../../shared/components/feedback/EmptyState'
import { ErrorState } from '../../../shared/components/feedback/ErrorState'
import { M3SelectField } from '../../../shared/components/forms/M3SelectField'
import { PageHeader } from '../../../shared/components/layout/PageHeader'
import { ConfirmDialog } from '../../../shared/components/overlays/ConfirmDialog'
import { Button } from '../../../shared/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/components/ui/Card'
import { SegmentedButton } from '../../../shared/components/ui/SegmentedButton'
import {
  SkeletonCard,
  SkeletonFormFields,
  SkeletonMobileCards,
  SkeletonStatusRegion,
  SkeletonTableGrid,
} from '../../../shared/skeletons'
import { LedgerAcademicInspection } from '../components/LedgerAcademicInspection'
import { LedgerCommitControl } from '../components/LedgerCommitControl'
import { LedgerReviewSection } from '../components/LedgerReviewSection'
import { LedgerUploadPanel } from '../components/LedgerUploadPanel'
import { LedgerUploadStatus } from '../components/LedgerUploadStatus'
import { LedgerUploadsTable } from '../components/LedgerUploadsTable'
import { LedgerUploadsCardList } from '../components/LedgerUploadsCardList'
import { useAcademicLedgerUrlState } from '../hooks/useAcademicLedgerUrlState'
import {
  useDeleteLedgerUpload,
  useLedgerUploadDetail,
  useLedgerUploads,
  useUploadLedger,
} from '../hooks/useLedgerUpload'
import type { LedgerUploadSummary } from '../schemas/ledgerSchemas'

const pageTitle = 'Academic Ledger Management | CV Management & Filtering System'
const pageDescription = 'Upload official transcripts, review them, and commit academic records.'

const viewOptions = [
  {
    value: 'table' as const,
    label: 'Table',
    icon: (
      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
        table_rows
      </span>
    ),
  },
  {
    value: 'cards' as const,
    label: 'Cards',
    icon: (
      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
        grid_view
      </span>
    ),
  },
]

export function AcademicLedgerPage() {
  const {
    state,
    rowSearchInput,
    studentSearchInput,
    selectUpload,
    setRowSearchInput,
    setStudentSearchInput,
    updateRows,
    updateStudents,
    updateUploads,
  } = useAcademicLedgerUrlState()
  const uploads = useLedgerUploads(state.uploads)
  const selected = useLedgerUploadDetail(state.uploadId)
  const upload = useUploadLedger()
  const deleteUpload = useDeleteLedgerUpload()
  const [deleting, setDeleting] = useState<LedgerUploadSummary | null>(null)
  const [uploadsViewMode, setUploadsViewMode] = useState<'table' | 'cards'>('table')

  useEffect(() => {
    const previousTitle = document.title
    document.title = pageTitle
    return () => {
      document.title = previousTitle
    }
  }, [])

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
    <main className="content-stack academic-ledger-page">
      <PageHeader description={pageDescription} title="Academic Ledger Management" />

      <LedgerUploadPanel
        error={upload.error}
        isPending={upload.isPending}
        onReset={upload.reset}
        onUpload={(file) =>
          upload.mutate(file, { onSuccess: ({ data }) => selectUpload(data.uploadId) })
        }
      />

      {state.uploadId && selected.isPending ? (
        <SkeletonStatusRegion label="Loading selected ledger batch">
          <SkeletonCard>
            <SkeletonFormFields count={4} />
          </SkeletonCard>
        </SkeletonStatusRegion>
      ) : null}
      {selected.data ? <LedgerUploadStatus detail={selected.data} /> : null}
      {selected.isError ? (
        <ErrorState
          message={mapApiError(selected.error, 'protected').message}
          onAction={() => void selected.refetch()}
          title="Unable to load selected batch"
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

      <Card aria-labelledby="ledger-batches-title" variant="outlined">
        <CardHeader className="s5-section-heading">
          <div>
            <CardTitle id="ledger-batches-title">Ledger upload batches</CardTitle>
            <p>Open an existing batch to continue validation review or commit eligible records.</p>
          </div>
          {uploads.isFetching && !uploads.isPending ? (
            <span className="al-updating-note" role="status">
              Updating…
            </span>
          ) : null}
        </CardHeader>
        <CardContent>
          <div className="al-toolbar">
            <SearchBar
              aria-label="Search ledger upload files"
              onChange={(event) => updateUploads({ search: event.target.value.slice(0, 120) })}
              placeholder="Search by file name"
              value={state.uploads.search}
            />
            <M3SelectField
              className="al-field"
              label="Status"
              onChange={(value) =>
                updateUploads({
                  status: (value || undefined) as typeof state.uploads.status,
                })
              }
              value={state.uploads.status ?? ''}
              options={[
                { value: '', label: 'All statuses' },
                { value: 'PROCESSING', label: 'Processing' },
                { value: 'READY_TO_COMMIT', label: 'Ready to commit' },
                { value: 'COMMITTED', label: 'Committed' },
                { value: 'VALIDATION_FAILED', label: 'Validation failed' },
                { value: 'PROCESSING_FAILED', label: 'Processing failed' },
              ]}
            />
            <div className="al-toolbar-toggle">
              <SegmentedButton
                onChange={(val) => setUploadsViewMode(val as 'table' | 'cards')}
                options={viewOptions}
                value={uploadsViewMode}
              />
            </div>
          </div>

          {uploads.isPending ? (
            <SkeletonStatusRegion label="Loading recent ledger uploads">
              <SkeletonTableGrid
                columns={5}
                gridTemplateColumns="repeat(5, minmax(100px, 1fr))"
                rows={4}
              />
              <SkeletonMobileCards count={4} />
            </SkeletonStatusRegion>
          ) : null}
          {uploadsError ? (
            <ErrorState
              correlationId={uploadsError.correlationId}
              message={uploadsError.message}
              onAction={() => void uploads.refetch()}
              title="Unable to load upload batches"
            />
          ) : null}
          {uploads.data?.items.length ? (
            <div
              className={`al-data-container ${uploadsViewMode === 'cards' ? 'al-mode-cards' : 'al-mode-table'}`}
            >
              {uploadsViewMode === 'table' ? (
                <LedgerUploadsTable
                  items={uploads.data.items}
                  onDelete={setDeleting}
                  onSelect={selectUpload}
                  selectedId={state.uploadId}
                />
              ) : (
                <LedgerUploadsCardList
                  items={uploads.data.items}
                  onDelete={setDeleting}
                  onSelect={selectUpload}
                  selectedId={state.uploadId}
                />
              )}
            </div>
          ) : null}
          {uploads.data && !uploads.data.items.length ? (
            <EmptyState
              message="No ledger uploads match the current filters."
              title="No upload batches"
            />
          ) : null}
          {uploads.data?.page.totalPages ? (
            <PaginationBar
              label="Academic ledger upload pages"
              onPageChange={(page) => updateUploads({ page })}
              onPageSizeChange={(size) => updateUploads({ size: size as 20 | 50 | 100 })}
              page={uploads.data.page.page}
              pageSizeOptions={[20, 50, 100]}
              size={uploads.data.page.size}
              totalElements={uploads.data.page.totalElements}
              totalPages={uploads.data.page.totalPages}
            />
          ) : null}
        </CardContent>
      </Card>

      <LedgerAcademicInspection
        onQueryChange={updateStudents}
        onSearchChange={setStudentSearchInput}
        query={state.students}
        searchInput={studentSearchInput}
      />

      {deleting ? (
        <ConfirmDialog
          closeDisabled={deleteUpload.isPending}
          onClose={() => setDeleting(null)}
          title="Remove upload batch"
        >
          <p>
            Remove <strong>{deleting.originalFilename}</strong>? This cannot be undone.
          </p>
          {deleteUpload.isError ? (
            <p className="error-text" role="alert">
              {mapApiError(deleteUpload.error, 'protected').message}
            </p>
          ) : null}
          <div className="modal-actions">
            <Button
              disabled={deleteUpload.isPending}
              onClick={() => setDeleting(null)}
              variant="outlined"
            >
              Cancel
            </Button>
            <Button
              isLoading={deleteUpload.isPending}
              onClick={() => {
                deleteUpload.mutate(deleting.uploadId, {
                  onSuccess: () => {
                    if (state.uploadId === deleting.uploadId) selectUpload(null)
                    setDeleting(null)
                  },
                })
              }}
            >
              Remove
            </Button>
          </div>
        </ConfirmDialog>
      ) : null}
    </main>
  )
}
