import { ConfirmDialog } from '../../../shared/components/overlays/ConfirmDialog'
import { Button } from '../../../shared/components/ui/Button'
import type { InternshipRequest } from '../types/internshipManagementTypes'

export function InternshipRequestCancelDialog({
  error,
  isPending,
  onClose,
  onConfirm,
  request,
}: {
  error?: string
  isPending: boolean
  onClose: () => void
  onConfirm: () => void
  request: InternshipRequest
}) {
  return (
    <ConfirmDialog closeDisabled={isPending} onClose={onClose} title="Cancel internship request">
      <div className="request-cancel-dialog">
        <p>
          Cancel <strong>{request.title}</strong> for {request.company.name}?
        </p>
        <p>
          The request record and its required skills remain available for administrative history. A
          cancelled request cannot be reopened from this workflow.
        </p>
        {error ? (
          <div className="inline-alert" role="alert">
            {error}
          </div>
        ) : null}
        <div className="modal-actions">
          <Button disabled={isPending} onClick={onClose} variant="secondary">
            Keep request
          </Button>
          <Button isLoading={isPending} onClick={onConfirm}>
            Cancel request
          </Button>
        </div>
      </div>
    </ConfirmDialog>
  )
}
