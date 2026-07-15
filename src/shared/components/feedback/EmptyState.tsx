import type { ReactNode } from 'react'

export function EmptyState({
  action,
  message,
  title,
}: {
  message: string
  title?: string
  action?: ReactNode
}) {
  return (
    <div className="empty-state-message">
      {title ? <strong>{title}</strong> : null}
      <p>{message}</p>
      {action}
    </div>
  )
}
