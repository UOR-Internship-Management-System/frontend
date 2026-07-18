import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { ConfirmDialog } from '../../../shared/components/overlays/ConfirmDialog'
import { Button } from '../../../shared/components/ui/Button'

export function LedgerCommitDialog({
  error,
  invalidRows,
  isPending,
  onClose,
  onConfirm,
  totalRows,
}: {
  totalRows: number
  invalidRows: number
  isPending: boolean
  error: unknown
  onClose: () => void
  onConfirm: () => void
}) {
  const mappedError = error ? mapApiError(error, 'protected') : null
  return (
    <ConfirmDialog
      closeDisabled={isPending}
      onClose={onClose}
      title="Commit official academic records"
    >
      <div className="ledger-commit-dialog-content">
        <p>
          <strong>
            This action writes {totalRows} staged rows to the official academic record.
          </strong>
        </p>
        <p>
          The commit is transactional and cannot be undone from this screen. Official GPA values may
          be recalculated.
        </p>
        <dl className="ledger-stat-grid">
          <div>
            <dt>Rows to commit</dt>
            <dd>{totalRows}</dd>
          </div>
          <div>
            <dt>Invalid rows</dt>
            <dd>{invalidRows}</dd>
          </div>
        </dl>
        {mappedError ? (
          <div className="ledger-validation-summary" role="alert">
            <strong>Commit failed</strong>
            <p>{mappedError.message}</p>
            <p>No partial commit is shown. Reload the batch before trying again.</p>
            {mappedError.correlationId ? <p>Reference: {mappedError.correlationId}</p> : null}
          </div>
        ) : null}
        <div className="button-row ledger-dialog-actions">
          <Button disabled={invalidRows > 0} isLoading={isPending} onClick={onConfirm}>
            Confirm commit
          </Button>
          <Button disabled={isPending} onClick={onClose} variant="secondary">
            Cancel
          </Button>
        </div>
      </div>
    </ConfirmDialog>
  )
}
