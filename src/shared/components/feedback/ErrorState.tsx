import { Button } from '../ui/Button'

export type ErrorStateProps = {
  message: string
  title?: string
  actionLabel?: string
  correlationId?: string
  onAction?: () => void
}

export function ErrorState({
  actionLabel = 'Try again',
  correlationId,
  message,
  onAction,
  title = 'Unable to load this page',
}: ErrorStateProps) {
  return (
    <div className="section-card error-state" role="alert">
      <h2>{title}</h2>
      <p>{message}</p>
      {correlationId ? <p className="error-reference">Reference: {correlationId}</p> : null}
      {onAction ? <Button onClick={onAction}>{actionLabel}</Button> : null}
    </div>
  )
}
