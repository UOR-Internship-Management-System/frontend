import type { HTMLAttributes, ReactNode } from 'react'
import { useCallback, useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { IconButton } from '../ui/IconButton'

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

const dialogStack: symbol[] = []

export type DialogSize = 'small' | 'medium' | 'large' | 'fullscreen'

export type DialogProps = {
  isOpen: boolean
  onClose?: () => void
  title?: ReactNode
  description?: ReactNode
  icon?: ReactNode
  actions?: ReactNode
  children?: ReactNode
  size?: DialogSize
  closeOnBackdrop?: boolean
  closeOnEscape?: boolean
  closeDisabled?: boolean
  adaptiveFullscreen?: boolean
  closeLabel?: string
  className?: string
  'aria-label'?: string
}

export function Dialog({
  isOpen,
  onClose,
  title,
  description,
  icon,
  actions,
  children,
  size = 'medium',
  closeOnBackdrop = true,
  closeOnEscape = true,
  closeDisabled = false,
  adaptiveFullscreen = false,
  closeLabel,
  className = '',
  'aria-label': ariaLabel,
}: DialogProps) {
  const titleId = useId()
  const descriptionId = useId()
  const dialogRef = useRef<HTMLElement | null>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const stackTokenRef = useRef(Symbol('dialog'))

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (dialogStack.at(-1) !== stackTokenRef.current) return
      if (event.key === 'Escape' && closeOnEscape && onClose && !closeDisabled) {
        event.preventDefault()
        onClose()
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
    },
    [closeDisabled, closeOnEscape, onClose],
  )

  useEffect(() => {
    if (!isOpen) return

    const stackToken = stackTokenRef.current
    previousFocusRef.current = document.activeElement as HTMLElement | null
    dialogStack.push(stackToken)
    const firstFocusable = dialogRef.current?.querySelector<HTMLElement>(focusableSelector)
    ;(firstFocusable ?? dialogRef.current)?.focus({ preventScroll: true })

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const appRoot = document.getElementById('root')
    const rootWasInert = appRoot?.inert ?? false
    const rootHadInertAttribute = appRoot?.hasAttribute('inert') ?? false
    const previousAriaHidden = appRoot?.getAttribute('aria-hidden')
    if (appRoot) {
      appRoot.inert = true
      appRoot.setAttribute('inert', '')
      appRoot.setAttribute('aria-hidden', 'true')
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      const stackIndex = dialogStack.lastIndexOf(stackToken)
      if (stackIndex >= 0) dialogStack.splice(stackIndex, 1)
      document.body.style.overflow = originalOverflow
      if (appRoot) {
        appRoot.inert = rootWasInert
        if (!rootHadInertAttribute) appRoot.removeAttribute('inert')
        if (previousAriaHidden == null) appRoot.removeAttribute('aria-hidden')
        else appRoot.setAttribute('aria-hidden', previousAriaHidden)
      }
      previousFocusRef.current?.focus({ preventScroll: true })
    }
  }, [isOpen, handleKeyDown])

  if (!isOpen) return null

  return createPortal(
    <div
      className="m3-dialog-scrim"
      data-testid="m3-dialog-scrim"
      onMouseDown={(e) => {
        if (closeOnBackdrop && !closeDisabled && e.target === e.currentTarget && onClose) {
          onClose()
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        aria-label={!title ? ariaLabel : undefined}
        ref={dialogRef}
        tabIndex={-1}
        className={`m3-dialog m3-dialog--${size} ${
          adaptiveFullscreen ? 'm3-dialog--adaptive-fullscreen' : ''
        } ${className}`.trim()}
      >
        {(icon || title || description || onClose) && (
          <header className="m3-dialog__header">
            <div className="m3-dialog__header-copy">
              {icon && <div className="m3-dialog__icon">{icon}</div>}
              {title && (
                <h2 id={titleId} className="m3-dialog__headline">
                  {title}
                </h2>
              )}
              {description && (
                <p id={descriptionId} className="m3-dialog__supporting-text">
                  {description}
                </p>
              )}
            </div>
            {onClose ? (
              <IconButton
                aria-label={closeLabel ?? `Close ${typeof title === 'string' ? title : 'dialog'}`}
                disabled={closeDisabled}
                icon={<span className="material-symbols-outlined">close</span>}
                onClick={onClose}
                size="sm"
              />
            ) : null}
          </header>
        )}

        {children && <div className="m3-dialog__content">{children}</div>}

        {actions && <footer className="m3-dialog__actions">{actions}</footer>}
      </section>
    </div>,
    document.body,
  )
}

export function DialogTitle({
  children,
  className = '',
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 className={`m3-dialog__headline ${className}`.trim()} {...props}>
      {children}
    </h2>
  )
}

export function DialogContent({
  children,
  className = '',
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`m3-dialog__content ${className}`.trim()} {...props}>
      {children}
    </div>
  )
}

export function DialogActions({
  children,
  className = '',
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`m3-dialog__actions ${className}`.trim()} {...props}>
      {children}
    </div>
  )
}

export function DialogIcon({ children, className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`m3-dialog__icon ${className}`.trim()} {...props}>
      {children}
    </div>
  )
}
