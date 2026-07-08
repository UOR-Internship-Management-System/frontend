import type { PropsWithChildren } from 'react'
import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { ToastViewport } from '../../shared/components/feedback/ToastViewport'

export type NotificationTone = 'info' | 'success' | 'error'
export type Notification = {
  id: string
  title: string
  message?: string
  tone: NotificationTone
}

type NotificationContextValue = {
  notifications: Notification[]
  notify: (notification: Omit<Notification, 'id'>) => void
  dismiss: (id: string) => void
}

const NotificationContext = createContext<NotificationContextValue | null>(null)

export function NotificationProvider({ children }: PropsWithChildren) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const dismiss = useCallback((id: string) => {
    setNotifications((current) => current.filter((notification) => notification.id !== id))
  }, [])

  const notify = useCallback((notification: Omit<Notification, 'id'>) => {
    const id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}`
    setNotifications((current) => [...current, { ...notification, id }])
  }, [])

  const value = useMemo(
    () => ({ notifications, notify, dismiss }),
    [dismiss, notifications, notify],
  )

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <ToastViewport notifications={notifications} onDismiss={dismiss} />
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider.')
  }
  return context
}
