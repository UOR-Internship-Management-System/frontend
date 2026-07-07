import { createContext, useContext, type ReactNode } from 'react'

interface NotificationContextValue {
  readonly notify: (title: string) => void
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined)

interface NotificationProviderProps {
  readonly children: ReactNode
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  return <NotificationContext.Provider value={{ notify: () => undefined }}>{children}</NotificationContext.Provider>
}

export function useNotifications(): NotificationContextValue {
  const context = useContext(NotificationContext)

  if (!context) {
    throw new Error('useNotifications must be used inside NotificationProvider.')
  }

  return context
}
