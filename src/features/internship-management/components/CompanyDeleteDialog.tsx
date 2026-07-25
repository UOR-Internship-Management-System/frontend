import { ConfirmDialog } from '../../../shared/components/overlays/ConfirmDialog'
import { Button } from '../../../shared/components/ui/Button'

export function CompanyDeleteDialog({
  companyName,
  error,
  isPending,
  onClose,
  onConfirm,
}: {
  companyName: string
  error?: string
  isPending: boolean
  onClose: () => void
  onConfirm: () => void
}) {
  return (
    <ConfirmDialog closeDisabled={isPending} onClose={onClose} title="Delete Company">
      <div className="company-delete-dialog">
        <p>
          Delete <strong>{companyName}</strong>? Its internship requests will also be deleted. This
          action cannot be undone.
        </p>
        {error ? (
          <div className="inline-alert" role="alert">
            {error}
          </div>
        ) : null}
        <div className="modal-actions">
          <Button disabled={isPending} onClick={onClose} variant="secondary">
            Keep Company
          </Button>
          <Button className="wireframe-danger-button" isLoading={isPending} onClick={onConfirm}>
            Delete Company
          </Button>
        </div>
      </div>
    </ConfirmDialog>
  )
}
