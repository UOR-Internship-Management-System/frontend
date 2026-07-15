import type { ReactNode } from 'react'
import { Modal } from './Modal'

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
    <Modal closeDisabled={closeDisabled} onClose={onClose} title={title}>
      {children}
    </Modal>
  )
}
