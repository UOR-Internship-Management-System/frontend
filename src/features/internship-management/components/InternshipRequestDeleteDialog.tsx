import { ConfirmDialog } from '../../../shared/components/overlays/ConfirmDialog'
import { Button } from '../../../shared/components/ui/Button'

export function InternshipRequestDeleteDialog({
  error,
  isPending,
  onClose,
  onConfirm,
  requestTitle,
}: {
  error?: string
  isPending: boolean
  onClose: () => void
  onConfirm: () => void
  requestTitle: string
}) {
  return (
    <ConfirmDialog closeDisabled={isPending} onClose={onClose} title="Delete Internship Request">
      <div className="request-delete-dialog">
        <p>
          Delete <strong>{requestTitle}</strong>? This action cannot be undone.
        </p>
        {error ? (
          <div className="inline-alert" role="alert">
            {error}
          </div>
        ) : null}
        <div className="modal-actions">
          <Button disabled={isPending} onClick={onClose} variant="secondary">
            Keep Request
          </Button>
          <Button className="wireframe-danger-button" isLoading={isPending} onClick={onConfirm}>
            Delete Internship Request
          </Button>
        </div>
      </div>
    </ConfirmDialog>
  )
}
