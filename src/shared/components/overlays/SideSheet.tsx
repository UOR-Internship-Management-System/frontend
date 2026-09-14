import type { CSSProperties, ReactNode } from 'react'
import { useCallback, useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'

export type SideSheetPosition = 'right' | 'left'

export type SideSheetProps = {
  isOpen: boolean
  onClose?: () => void
  title?: ReactNode
  subtitle?: ReactNode
  children: ReactNode
  actions?: ReactNode
  position?: SideSheetPosition
  modal?: boolean
  closeOnBackdrop?: boolean
  closeOnEscape?: boolean
  width?: string | number
  className?: string
  'aria-label'?: string
}

export function SideSheet({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  actions,
  position = 'right',
  modal = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  width,
  className = '',
  'aria-label': ariaLabel,
}: SideSheetProps) {
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

  const style: CSSProperties = width ? { width } : {}

  const sheetContent = (
    <section
      role={modal ? 'dialog' : 'region'}
      aria-modal={modal ? 'true' : undefined}
      aria-labelledby={title ? titleId : undefined}
      aria-label={!title ? ariaLabel || 'Side sheet' : undefined}
      ref={sheetRef}
      tabIndex={-1}
      style={style}
      className={`m3-side-sheet m3-side-sheet--${position} ${className}`.trim()}
    >
      {(title || subtitle || onClose) && (
        <header className="m3-side-sheet__header">
          <div className="m3-side-sheet__title-group">
            {title && (
              <h2 id={titleId} className="m3-side-sheet__title">
                {title}
              </h2>
            )}
            {subtitle && <p className="m3-side-sheet__subtitle">{subtitle}</p>}
          </div>
          {onClose && (
            <button
              type="button"
              className="modal-close-button"
              onClick={onClose}
              aria-label="Close side sheet"
            >
              ×
            </button>
          )}
        </header>
      )}

      <div className="m3-side-sheet__content">{children}</div>

      {actions && <footer className="m3-side-sheet__actions">{actions}</footer>}
    </section>
  )

  if (modal) {
    return createPortal(
      <div
        className={`m3-side-sheet-scrim m3-side-sheet-scrim--${position}`}
        data-testid="m3-side-sheet-scrim"
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
