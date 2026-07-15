const sessionExpiredEventName = 'cv-management:session-expired'

export const sessionEvents = {
  notifyExpired() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event(sessionExpiredEventName))
    }
  },
  subscribe(listener: () => void) {
    if (typeof window === 'undefined') {
      return () => undefined
    }

    window.addEventListener(sessionExpiredEventName, listener)
    return () => window.removeEventListener(sessionExpiredEventName, listener)
  },
}
