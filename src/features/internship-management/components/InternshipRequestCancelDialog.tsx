import { ConfirmDialog } from '../../../shared/components/overlays/ConfirmDialog'
import { Button } from '../../../shared/components/ui/Button'
export function InternshipRequestCancelDialog({
  error,
  isPending,
  onClose,
  onConfirm,
}: {
  error?: string
  isPending: boolean
  onClose: () => void
  onConfirm: () => void
}) {
  return (
    <ConfirmDialog closeDisabled={isPending} onClose={onClose} title="Confirm Deletion">
      <div className="request-cancel-dialog">
        <p>Are you sure you want to delete this internship request?</p>
        {error ? (
          <div className="inline-alert" role="alert">
            {error}
          </div>
        ) : null}
        <div className="modal-actions">
          <Button disabled={isPending} onClick={onClose} variant="secondary">
            Cancel
          </Button>
          <Button isLoading={isPending} onClick={onConfirm}>
            Delete
          </Button>
        </div>
      </div>
    </ConfirmDialog>
  )
}
