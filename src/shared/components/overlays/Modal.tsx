import type { ReactNode } from 'react'
import { useEffect, useId, useRef } from 'react'

export function Modal({ children, title }: { children: ReactNode; title: string }) {
  const titleId = useId()
  const dialogRef = useRef<HTMLElement | null>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement | null
    window.setTimeout(() => dialogRef.current?.focus(), 0)

    return () => {
      previousFocusRef.current?.focus()
    }
  }, [])

  return (
    <div className="modal-backdrop app-modal-overlay active">
      <section
        aria-labelledby={titleId}
        aria-modal="true"
        className="modal-card card"
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <h2 id={titleId}>{title}</h2>
        {children}
      </section>
    </div>
  )
}
