import type { PropsWithChildren, ReactNode } from 'react'
import { createContext, useCallback, useContext, useMemo, useState } from 'react'

type OverlayContextValue = {
  overlay: ReactNode | null
  showOverlay: (overlay: ReactNode) => void
  closeOverlay: () => void
}

const OverlayContext = createContext<OverlayContextValue | null>(null)

export function OverlayProvider({ children }: PropsWithChildren) {
  const [overlay, setOverlay] = useState<ReactNode | null>(null)
  const closeOverlay = useCallback(() => setOverlay(null), [])
  const showOverlay = useCallback((nextOverlay: ReactNode) => setOverlay(nextOverlay), [])
  const value = useMemo(
    () => ({ overlay, showOverlay, closeOverlay }),
    [closeOverlay, overlay, showOverlay],
  )

  return (
    <OverlayContext.Provider value={value}>
      {children}
      <div id="overlay-root">{overlay}</div>
    </OverlayContext.Provider>
  )
}

export function useOverlay() {
  const context = useContext(OverlayContext)
  if (!context) {
    throw new Error('useOverlay must be used within OverlayProvider.')
  }
  return context
}
