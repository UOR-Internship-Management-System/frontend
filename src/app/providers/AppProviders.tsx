import type { PropsWithChildren } from 'react'
import { AuthProvider } from './AuthProvider'
import { NotificationProvider } from './NotificationProvider'
import { OverlayProvider } from './OverlayProvider'
import { QueryProvider } from './QueryProvider'
import { ThemeProvider } from './ThemeProvider'

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryProvider>
      <AuthProvider>
        <ThemeProvider>
          <NotificationProvider>
            <OverlayProvider>{children}</OverlayProvider>
          </NotificationProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryProvider>
  )
}
