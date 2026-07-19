import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { ErrorState } from '../../../shared/components/feedback/ErrorState'
import { LedgerValidationSkeleton } from '../../../shared/skeletons'
import { useLedgerStagedRows, useLedgerValidation } from '../hooks/useLedgerRecords'
import type { LedgerStagedRowsQuery } from '../types/academicLedgerTypes'
import { LedgerValidationTable } from './LedgerValidationTable'

export function LedgerReviewSection({
  onQueryChange,
  onSearchChange,
  query,
  searchInput,
  uploadId,
}: {
  uploadId: string
  query: LedgerStagedRowsQuery
  searchInput: string
  onSearchChange: (value: string) => void
  onQueryChange: (patch: Partial<LedgerStagedRowsQuery>) => void
}) {
  const stagedRows = useLedgerStagedRows(uploadId, query)
  const validation = useLedgerValidation(uploadId)

  if (stagedRows.isPending || validation.isPending) return <LedgerValidationSkeleton />
  if (stagedRows.isError || validation.isError) {
    const sourceError = stagedRows.error ?? validation.error
    const error = mapApiError(sourceError, 'protected')
    return (
      <ErrorState
        title="Unable to load staged validation"
        message={error.message}
        correlationId={error.correlationId}
        onAction={() => {
          void stagedRows.refetch()
          void validation.refetch()
        }}
      />
    )
  }
  if (!stagedRows.data || !validation.data) return null
  return (
    <LedgerValidationTable
      rows={stagedRows.data.items}
      validation={validation.data}
      query={query}
      searchInput={searchInput}
      isFetching={stagedRows.isFetching || validation.isFetching}
      page={stagedRows.data.page}
      onSearchChange={onSearchChange}
      onQueryChange={onQueryChange}
    />
  )
}
