import { ConfirmDialog } from '../../../shared/components/overlays/ConfirmDialog'
import { Button } from '../../../shared/components/ui/Button'
import type { Company } from '../types/internshipManagementTypes'

export function CompanyDeactivateDialog({
  company,
  error,
  isPending,
  onClose,
  onConfirm,
}: {
  company: Company
  error?: string
  isPending: boolean
  onClose: () => void
  onConfirm: () => void
}) {
  return (
    <ConfirmDialog closeDisabled={isPending} onClose={onClose} title="Deactivate company">
      <div className="company-deactivate-dialog">
        <p>
          <strong>{company.name}</strong> will no longer be available for new internship requests.
        </p>
        <p>
          Its metadata and existing links are preserved. An administrator can reactivate it later
          through editing.
        </p>
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
            Deactivate company
          </Button>
        </div>
      </div>
    </ConfirmDialog>
  )
}
