import { createContext, useContext, type ReactNode } from 'react'

interface OverlayContextValue {
  readonly closeOverlay: () => void
}

const OverlayContext = createContext<OverlayContextValue | undefined>(undefined)

interface OverlayProviderProps {
  readonly children: ReactNode
}

export function OverlayProvider({ children }: OverlayProviderProps) {
  return <OverlayContext.Provider value={{ closeOverlay: () => undefined }}>{children}</OverlayContext.Provider>
}

export function useOverlay(): OverlayContextValue {
  const context = useContext(OverlayContext)

  if (!context) {
    throw new Error('useOverlay must be used inside OverlayProvider.')
  }

  return context
}
