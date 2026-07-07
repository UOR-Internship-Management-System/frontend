import { type ReactNode } from 'react'
import { AuthProvider } from './AuthProvider'
import { NotificationProvider } from './NotificationProvider'
import { OverlayProvider } from './OverlayProvider'
import { QueryProvider } from './QueryProvider'
import { ThemeProvider } from './ThemeProvider'

interface AppProvidersProps {
  readonly children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryProvider>
      <ThemeProvider>
        <NotificationProvider>
          <OverlayProvider>
            <AuthProvider>{children}</AuthProvider>
          </OverlayProvider>
        </NotificationProvider>
      </ThemeProvider>
    </QueryProvider>
  )
}
