import type { Notification } from '../../../app/providers/NotificationProvider'
import { Snackbar } from './Snackbar'

export type ToastViewportProps = {
  notifications: Notification[]
  onDismiss: (id: string) => void
}

export function ToastViewport({ notifications, onDismiss }: ToastViewportProps) {
  return (
    <div className="toast-viewport">
      {notifications.map((notification) => (
        <Snackbar
          className="toast"
          key={notification.id}
          message={
            <span className="toast-copy">
              <strong>{notification.title}</strong>
              {notification.message ? <span>{notification.message}</span> : null}
            </span>
          }
          onClose={() => onDismiss(notification.id)}
          tone={notification.tone}
        />
      ))}
    </div>
  )
}
