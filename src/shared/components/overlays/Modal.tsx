import type { ReactNode } from 'react'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

export type ModalProps = {
  children: ReactNode
  title: string
  description?: string
  onClose?: () => void
  closeDisabled?: boolean
}

export function Modal({
  children,
  closeDisabled = false,
  description,
  onClose,
  title,
}: ModalProps) {
  const titleId = useId()
  const descriptionId = useId()
  const dialogRef = useRef<HTMLElement | null>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  const [isClosing, setIsClosing] = useState(false)

  const handleClose = useCallback(() => {
    if (!onClose || closeDisabled || isClosing) return
    setIsClosing(true)
    setTimeout(() => {
      onClose()
    }, 200)
  }, [onClose, closeDisabled, isClosing])

  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement | null
    const firstFocusable = dialogRef.current?.querySelector<HTMLElement>(focusableSelector)
    window.setTimeout(
      () => (firstFocusable ?? dialogRef.current)?.focus({ preventScroll: true }),
      0,
    )

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onClose && !closeDisabled) {
        event.preventDefault()
        handleClose()
        return
      }

      if (event.key !== 'Tab' || !dialogRef.current) return
      const focusable = [...dialogRef.current.querySelectorAll<HTMLElement>(focusableSelector)]
      if (focusable.length === 0) {
        event.preventDefault()
        dialogRef.current.focus()
        return
      }
      const first = focusable[0]
      const last = focusable.at(-1)
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last?.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      previousFocusRef.current?.focus({ preventScroll: true })
    }
  }, [closeDisabled, onClose, handleClose])

  useEffect(() => {
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [])

  return createPortal(
    <div className={`modal-backdrop app-modal-overlay active ${isClosing ? 'closing' : ''}`}>
      <section
        aria-describedby={description ? descriptionId : undefined}
        aria-labelledby={titleId}
        aria-modal="true"
        className="modal-card card"
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <header className="modal-header">
          <div>
            <h2 id={titleId}>{title}</h2>
            {description ? <p id={descriptionId}>{description}</p> : null}
          </div>
          {onClose ? (
            <button
              aria-label={`Close ${title}`}
              className="modal-close-button"
              disabled={closeDisabled}
              onClick={handleClose}
              type="button"
            >
              ×
            </button>
          ) : null}
        </header>
        <div className="modal-content">{children}</div>
      </section>
    </div>,
    document.body,
  )
}
