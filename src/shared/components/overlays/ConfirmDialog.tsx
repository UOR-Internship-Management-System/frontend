import type { ReactNode } from 'react'
import { Dialog } from './Dialog'

export function ConfirmDialog({
  children,
  closeDisabled,
  onClose,
  title,
}: {
  children: ReactNode
  title: string
  onClose?: () => void
  closeDisabled?: boolean
}) {
  return (
    <Dialog
      closeDisabled={closeDisabled}
      closeOnBackdrop={false}
      isOpen
      onClose={onClose}
      size="small"
      title={title}
    >
      {children}
    </Dialog>
  )
}
