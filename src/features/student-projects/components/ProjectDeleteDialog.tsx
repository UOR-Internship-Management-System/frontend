import { useState } from 'react'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { ConfirmDialog } from '../../../shared/components/overlays/ConfirmDialog'
import { Button } from '../../../shared/components/ui/Button'
import type { StudentProject } from '../types/studentProjectTypes'

export function ProjectDeleteDialog({
  onClose,
  onConfirm,
  project,
}: {
  project: StudentProject
  onClose: () => void
  onConfirm: () => Promise<void>
}) {
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string>()

  const confirm = async () => {
    setIsPending(true)
    setError(undefined)
    try {
      await onConfirm()
    } catch (reason) {
      setError(mapApiError(reason, 'protected').message)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <ConfirmDialog closeDisabled={isPending} onClose={onClose} title="Remove Project">
      <p>
        Are you sure you want to remove <strong>{project.title}</strong> from your portfolio?
      </p>
      <p>This action permanently removes the project and its skill links.</p>
      {error ? (
        <p className="error-text" role="alert">
          {error}
        </p>
      ) : null}
      <div className="modal-actions">
        <Button disabled={isPending} onClick={onClose} variant="secondary">
          Close
        </Button>
        <Button
          className="s4-projects-danger-button"
          isLoading={isPending}
          onClick={() => void confirm()}
        >
          Remove
        </Button>
      </div>
    </ConfirmDialog>
  )
}
