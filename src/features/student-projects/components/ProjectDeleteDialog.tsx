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
    <ConfirmDialog closeDisabled={isPending} onClose={onClose} title={`Delete ${project.title}?`}>
      <p>This permanently removes the project from your portfolio.</p>
      {error ? (
        <p className="error-text" role="alert">
          {error}
        </p>
      ) : null}
      <div className="modal-actions">
        <Button disabled={isPending} onClick={onClose} variant="secondary">
          Cancel
        </Button>
        <Button isLoading={isPending} onClick={() => void confirm()}>
          Delete project
        </Button>
      </div>
    </ConfirmDialog>
  )
}
