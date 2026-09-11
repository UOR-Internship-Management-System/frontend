import { useState } from 'react'
import { Button } from '../ui/Button'
import { ConfirmDialog } from './ConfirmDialog'

export function LogoutConfirmDialog({
  onClose,
  onConfirm,
}: {
  onClose: () => void
  onConfirm: () => Promise<void>
}) {
  const [isPending, setIsPending] = useState(false)

  const confirm = async () => {
    setIsPending(true)
    try {
      await onConfirm()
    } finally {
      setIsPending(false)
    }
  }

  return (
    <ConfirmDialog closeDisabled={isPending} onClose={onClose} title="Log Out">
      <p>Are you sure you want to log out?</p>
      <div className="modal-actions">
        <Button disabled={isPending} onClick={onClose} variant="secondary">
          Cancel
        </Button>
        <Button isLoading={isPending} onClick={() => void confirm()}>
          Log Out
        </Button>
      </div>
    </ConfirmDialog>
  )
}
