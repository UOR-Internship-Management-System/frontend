import type { AnimationEvent, ReactNode } from 'react'
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
  size?: 'default' | 'wide'
}

export function Modal({
  children,
  closeDisabled = false,
  description,
  onClose,
  size = 'default',
  title,
}: ModalProps) {
  const titleId = useId()
  const descriptionId = useId()
  const dialogRef = useRef<HTMLElement | null>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const closeTimerRef = useRef<number | null>(null)
  const isClosingRef = useRef(false)
  const onCloseRef = useRef(onClose)
  const closeDisabledRef = useRef(closeDisabled)

  onCloseRef.current = onClose
  closeDisabledRef.current = closeDisabled

  const [isClosing, setIsClosing] = useState(false)

  const finishClose = useCallback(() => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
    onCloseRef.current?.()
  }, [])

  const handleClose = useCallback(() => {
    if (!onCloseRef.current || closeDisabledRef.current || isClosingRef.current) return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      finishClose()
      return
    }
    isClosingRef.current = true
    setIsClosing(true)
    closeTimerRef.current = window.setTimeout(finishClose, 250)
  }, [finishClose])

  const handleCloseAnimationEnd = useCallback(
    (event: AnimationEvent<HTMLDivElement>) => {
      if (isClosing && event.target === event.currentTarget) finishClose()
    },
    [finishClose, isClosing],
  )

  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement | null
    const firstFocusable = dialogRef.current?.querySelector<HTMLElement>(focusableSelector)
    ;(firstFocusable ?? dialogRef.current)?.focus({ preventScroll: true })

    const appRoot = document.getElementById('root')
    const rootWasInert = appRoot?.inert ?? false
    const rootHadInertAttribute = appRoot?.hasAttribute('inert') ?? false
    const previousAriaHidden = appRoot?.getAttribute('aria-hidden')
    if (appRoot) {
      appRoot.inert = true
      appRoot.setAttribute('inert', '')
      appRoot.setAttribute('aria-hidden', 'true')
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onCloseRef.current && !closeDisabledRef.current) {
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
      if (appRoot) {
        appRoot.inert = rootWasInert
        if (!rootHadInertAttribute) appRoot.removeAttribute('inert')
        if (previousAriaHidden == null) appRoot.removeAttribute('aria-hidden')
        else appRoot.setAttribute('aria-hidden', previousAriaHidden)
      }
      previousFocusRef.current?.focus({ preventScroll: true })
    }
  }, [handleClose])

  useEffect(
    () => () => {
      if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current)
    },
    [],
  )

  useEffect(() => {
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [])

  return createPortal(
    <div
      className={`modal-backdrop app-modal-overlay active ${isClosing ? 'closing' : ''}`}
      onAnimationEnd={handleCloseAnimationEnd}
    >
      <section
        aria-describedby={description ? descriptionId : undefined}
        aria-labelledby={titleId}
        aria-modal="true"
        className={`modal-card modal-card-${size} card`}
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
