import type { ReactNode } from 'react'
import { useCallback, useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'

export type BottomSheetProps = {
  isOpen: boolean
  onClose?: () => void
  title?: ReactNode
  showDragHandle?: boolean
  children: ReactNode
  actions?: ReactNode
  modal?: boolean
  closeOnBackdrop?: boolean
  closeOnEscape?: boolean
  className?: string
  'aria-label'?: string
}

export function BottomSheet({
  isOpen,
  onClose,
  title,
  showDragHandle = true,
  children,
  actions,
  modal = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  className = '',
  'aria-label': ariaLabel,
}: BottomSheetProps) {
  const titleId = useId()
  const sheetRef = useRef<HTMLElement | null>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape' && closeOnEscape && onClose) {
        event.preventDefault()
        onClose()
      }
    },
    [closeOnEscape, onClose],
  )

  useEffect(() => {
    if (!isOpen) return

    previousFocusRef.current = document.activeElement as HTMLElement | null
    sheetRef.current?.focus({ preventScroll: true })

    const originalOverflow = document.body.style.overflow
    if (modal) {
      document.body.style.overflow = 'hidden'
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      if (modal) {
        document.body.style.overflow = originalOverflow
      }
      previousFocusRef.current?.focus({ preventScroll: true })
    }
  }, [isOpen, modal, handleKeyDown])

  if (!isOpen) return null

  const sheetContent = (
    <section
      role={modal ? 'dialog' : 'region'}
      aria-modal={modal ? 'true' : undefined}
      aria-labelledby={title ? titleId : undefined}
      aria-label={!title ? ariaLabel || 'Bottom sheet' : undefined}
      ref={sheetRef}
      tabIndex={-1}
      className={`m3-bottom-sheet ${className}`.trim()}
    >
      {showDragHandle && (
        <div className="m3-bottom-sheet__drag-handle-container" aria-hidden="true">
          <div className="m3-bottom-sheet__drag-handle" />
        </div>
      )}

      {title && (
        <header className="m3-bottom-sheet__header">
          <h2 id={titleId} className="m3-bottom-sheet__title">
            {title}
          </h2>
          {onClose && (
            <button
              type="button"
              className="modal-close-button"
              onClick={onClose}
              aria-label="Close bottom sheet"
            >
              ×
            </button>
          )}
        </header>
      )}

      <div className="m3-bottom-sheet__content">{children}</div>

      {actions && <footer className="m3-bottom-sheet__actions">{actions}</footer>}
    </section>
  )

  if (modal) {
    return createPortal(
      <div
        className="m3-bottom-sheet-scrim"
        data-testid="m3-bottom-sheet-scrim"
        onMouseDown={(e) => {
          if (closeOnBackdrop && e.target === e.currentTarget && onClose) {
            onClose()
          }
        }}
      >
        {sheetContent}
      </div>,
      document.body,
    )
  }

  return sheetContent
}
