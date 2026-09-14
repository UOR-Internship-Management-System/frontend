import type { ReactNode } from 'react'

export type SnackbarProps = {
  message: ReactNode
  actionLabel?: string
  closeLabel?: string
  onAction?: () => void
  onClose?: () => void
  leadingIcon?: ReactNode
  className?: string
  tone?: 'info' | 'success' | 'error'
}

export function Snackbar({
  message,
  actionLabel,
  closeLabel = 'Close alert',
  onAction,
  onClose,
  leadingIcon,
  className = '',
  tone = 'info',
}: SnackbarProps) {
  return (
    <div
      aria-live={tone === 'error' ? 'assertive' : 'polite'}
      className={`m3-snackbar m3-snackbar--${tone} ${className}`.trim()}
      role={tone === 'error' ? 'alert' : 'status'}
    >
      <div className="m3-snackbar__message">
        {leadingIcon ? <span aria-hidden="true">{leadingIcon}</span> : null}
        <span>{message}</span>
      </div>

      <div className="m3-snackbar__actions">
        {actionLabel && onAction ? (
          <button type="button" className="m3-snackbar-action-btn" onClick={onAction}>
            {actionLabel}
          </button>
        ) : null}

        {onClose ? (
          <button
            type="button"
            aria-label={closeLabel}
            className="m3-chip-remove-btn"
            onClick={onClose}
          >
            <span aria-hidden="true" className="material-symbols-outlined">
              close
            </span>
          </button>
        ) : null}
      </div>
    </div>
  )
}
