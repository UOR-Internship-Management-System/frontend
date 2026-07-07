import type { ReactNode } from 'react'
import { Modal } from './Modal'

export function ConfirmDialog({ children, title }: { children: ReactNode; title: string }) {
  return <Modal title={title}>{children}</Modal>
}
