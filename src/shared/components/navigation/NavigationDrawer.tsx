import type { ElementType, HTMLAttributes, MutableRefObject, ReactNode, Ref } from 'react'
import { forwardRef, useCallback, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

export type NavigationDrawerItemProps = {
  icon: ReactNode
  label: ReactNode
  active?: boolean
  badge?: ReactNode
  onClick?: () => void
  as?: ElementType
  to?: string
  href?: string
  className?: string
  'aria-label'?: string
}

export const NavigationDrawerItem = forwardRef<
  HTMLElement,
  NavigationDrawerItemProps & HTMLAttributes<HTMLElement>
>(function NavigationDrawerItem(
  {
    icon,
    label,
    active = false,
    badge,
    onClick,
    as: Component = 'button',
    className = '',
    'aria-label': ariaLabel,
    to,
    href,
    ...props
  }: NavigationDrawerItemProps & HTMLAttributes<HTMLElement>,
  ref,
) {
  return (
    <Component
      ref={ref}
      type={Component === 'button' ? 'button' : undefined}
      to={to}
      href={href}
      className={`m3-navigation-drawer__item ${active ? 'm3-navigation-drawer__item--active' : ''} ${className}`.trim()}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      aria-label={ariaLabel || (typeof label === 'string' ? label : undefined)}
      {...props}
    >
      <span className="m3-navigation-drawer__icon">{icon}</span>
      <span className="m3-navigation-drawer__label">{label}</span>
      {badge && <span className="m3-navigation-drawer__badge">{badge}</span>}
    </Component>
  )
})

export function NavigationDrawerSectionHeader({
  children,
  className = '',
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={`m3-navigation-drawer__section-header ${className}`.trim()} {...props}>
      {children}
    </h3>
  )
}

export type NavigationDrawerProps = HTMLAttributes<HTMLElement> & {
  header?: ReactNode
  children: ReactNode
  footer?: ReactNode
  modal?: boolean
  isOpen?: boolean
  onClose?: () => void
  closeOnBackdrop?: boolean
  closeOnEscape?: boolean
  scrimTestId?: string
  scrimClassName?: string
  className?: string
  'aria-label'?: string
}

export const NavigationDrawer = forwardRef<HTMLElement, NavigationDrawerProps>(
  function NavigationDrawer(
    {
      header,
      children,
      footer,
      modal = false,
      isOpen = true,
      onClose,
      closeOnBackdrop = true,
      closeOnEscape = true,
      scrimTestId = 'm3-navigation-drawer-scrim',
      scrimClassName = '',
      className = '',
      'aria-label': ariaLabel = 'Navigation Drawer',
      ...props
    }: NavigationDrawerProps,
    forwardedRef: Ref<HTMLElement> | null,
  ) {
    const innerRef = useRef<HTMLElement | null>(null)
    const drawerRef = (forwardedRef ?? innerRef) as MutableRefObject<HTMLElement | null>

    const handleKeyDown = useCallback(
      (event: KeyboardEvent) => {
        if (event.key === 'Escape' && modal && closeOnEscape && onClose) {
          event.preventDefault()
          onClose()
          return
        }

        if (modal && event.key === 'Tab' && drawerRef.current) {
          const focusableItems = Array.from(
            drawerRef.current.querySelectorAll<HTMLElement>(
              'a, button, [tabindex="0"], input, select, textarea, [role="button"]',
            ),
          ).filter(
            (item) => !item.hasAttribute('disabled') && item.getAttribute('tabindex') !== '-1',
          )

          if (focusableItems.length === 0) return

          const firstItem = focusableItems[0]
          const lastItem = focusableItems[focusableItems.length - 1]

          if (event.shiftKey && document.activeElement === firstItem) {
            event.preventDefault()
            lastItem.focus()
          } else if (!event.shiftKey && document.activeElement === lastItem) {
            event.preventDefault()
            firstItem.focus()
          }
        }
      },
      [closeOnEscape, drawerRef, modal, onClose],
    )

    useEffect(() => {
      if (!modal || !isOpen) return

      document.addEventListener('keydown', handleKeyDown)
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'

      return () => {
        document.removeEventListener('keydown', handleKeyDown)
        document.body.style.overflow = originalOverflow
      }
    }, [modal, isOpen, handleKeyDown])

    if (modal && !isOpen) return null

    const drawerElement = (
      <nav
        ref={drawerRef}
        role={modal ? 'dialog' : 'navigation'}
        aria-modal={modal ? 'true' : undefined}
        aria-label={ariaLabel}
        className={`m3-navigation-drawer ${
          modal ? 'm3-navigation-drawer--modal' : 'm3-navigation-drawer--standard'
        } ${className}`.trim()}
        {...props}
      >
        {header && <div className="m3-navigation-drawer__header">{header}</div>}
        <div className="m3-navigation-drawer__content">{children}</div>
        {footer && <div className="m3-navigation-drawer__footer">{footer}</div>}
      </nav>
    )

    if (modal) {
      return createPortal(
        <div
          className={`m3-navigation-drawer-scrim ${scrimClassName}`.trim()}
          data-testid={scrimTestId}
          onMouseDown={(e) => {
            if (closeOnBackdrop && e.target === e.currentTarget && onClose) {
              onClose()
            }
          }}
        >
          {drawerElement}
        </div>,
        document.body,
      )
    }

    return drawerElement
  },
)
