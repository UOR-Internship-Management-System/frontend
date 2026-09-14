import type { ButtonHTMLAttributes, HTMLAttributes, KeyboardEvent, ReactNode } from 'react'
import { useCallback, useEffect, useRef } from 'react'

export type MenuProps = {
  isOpen: boolean
  onClose?: () => void
  children: ReactNode
  className?: string
  anchorRef?: React.RefObject<HTMLElement | null>
  style?: React.CSSProperties
  'aria-label'?: string
}

export function Menu({
  isOpen,
  onClose,
  children,
  className = '',
  style,
  'aria-label': ariaLabel = 'Menu',
}: MenuProps) {
  const menuRef = useRef<HTMLUListElement | null>(null)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLUListElement>) => {
      if (!menuRef.current) return

      const items = Array.from(
        menuRef.current.querySelectorAll<HTMLButtonElement>(
          'button[role="menuitem"]:not(:disabled)',
        ),
      )

      if (items.length === 0) return

      const activeIndex = items.indexOf(document.activeElement as HTMLButtonElement)

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        const nextIndex = activeIndex < items.length - 1 ? activeIndex + 1 : 0
        items[nextIndex]?.focus()
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        const prevIndex = activeIndex > 0 ? activeIndex - 1 : items.length - 1
        items[prevIndex]?.focus()
      } else if (e.key === 'Home') {
        e.preventDefault()
        items[0]?.focus()
      } else if (e.key === 'End') {
        e.preventDefault()
        items[items.length - 1]?.focus()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onClose?.()
      }
    },
    [onClose],
  )

  useEffect(() => {
    if (!isOpen) return

    // Focus first non-disabled item on open
    const timer = setTimeout(() => {
      const firstItem = menuRef.current?.querySelector<HTMLButtonElement>(
        'button[role="menuitem"]:not(:disabled)',
      )
      firstItem?.focus()
    }, 0)

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose?.()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <ul
      ref={menuRef}
      role="menu"
      aria-label={ariaLabel}
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      className={`m3-menu ${className}`.trim()}
      style={style}
    >
      {children}
    </ul>
  )
}

export type MenuItemProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: ReactNode
  trailingText?: ReactNode
  selected?: boolean
  destructive?: boolean
}

export function MenuItem({
  children,
  icon,
  trailingText,
  selected = false,
  destructive = false,
  disabled = false,
  className = '',
  onClick,
  ...props
}: MenuItemProps) {
  return (
    <li role="none">
      <button
        role="menuitem"
        type="button"
        disabled={disabled}
        aria-selected={selected}
        className={`m3-menu-item ${selected ? 'm3-menu-item--selected' : ''} ${
          destructive ? 'm3-menu-item--destructive' : ''
        } ${className}`.trim()}
        onClick={onClick}
        {...props}
      >
        {icon && (
          <span className="m3-menu-item__icon" aria-hidden="true">
            {icon}
          </span>
        )}
        <span className="m3-menu-item__label">{children}</span>
        {trailingText && (
          <span className="m3-menu-item__trailing">{trailingText}</span>
        )}
      </button>
    </li>
  )
}

export function MenuDivider({ className = '', ...props }: HTMLAttributes<HTMLLIElement>) {
  return (
    <li
      role="separator"
      className={`m3-menu-divider ${className}`.trim()}
      {...props}
    />
  )
}
