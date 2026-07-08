import type { Notification } from '../../../app/providers/NotificationProvider'

export type ToastViewportProps = {
  notifications: Notification[]
  onDismiss: (id: string) => void
}

export function ToastViewport({ notifications, onDismiss }: ToastViewportProps) {
  return (
    <div aria-live="polite" className="toast-viewport">
      {notifications.map((notification) => (
        <div className="toast" key={notification.id}>
          <strong>{notification.title}</strong>
          {notification.message ? <p>{notification.message}</p> : null}
          <button onClick={() => onDismiss(notification.id)} type="button">
            Dismiss
          </button>
        </div>
      ))}
    </div>
  )
}
