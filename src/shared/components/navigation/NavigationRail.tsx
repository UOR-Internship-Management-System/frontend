import type { ElementType, HTMLAttributes, KeyboardEvent, ReactNode, Ref } from 'react'
import { createContext, forwardRef, useContext, useRef } from 'react'

const NavigationRailContext = createContext<{ expanded: boolean }>({ expanded: false })

export type NavigationRailItemProps = {
  icon: ReactNode
  activeIcon?: ReactNode
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

export const NavigationRailItem = forwardRef<
  HTMLElement,
  NavigationRailItemProps & HTMLAttributes<HTMLElement>
>(function NavigationRailItem(
  {
    icon,
    activeIcon,
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
  }: NavigationRailItemProps & HTMLAttributes<HTMLElement>,
  ref,
) {
  const { expanded } = useContext(NavigationRailContext)
  const currentIcon = active && activeIcon ? activeIcon : icon

  return (
    <Component
      ref={ref}
      type={Component === 'button' ? 'button' : undefined}
      to={to}
      href={href}
      className={`m3-navigation-rail__item ${active ? 'm3-navigation-rail__item--active' : ''} ${
        expanded ? 'm3-navigation-rail__item--expanded' : ''
      } ${className}`.trim()}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      aria-label={ariaLabel || (typeof label === 'string' ? label : undefined)}
      {...props}
    >
      <div className="m3-navigation-rail__pill">
        <span className="m3-navigation-rail__icon">{currentIcon}</span>
        {!expanded && badge && <span className="m3-navigation-rail__badge">{badge}</span>}
      </div>
      <span className="m3-navigation-rail__label">{label}</span>
      {expanded && badge && <span className="m3-navigation-rail__badge-expanded">{badge}</span>}
    </Component>
  )
})

export type NavigationRailProps = HTMLAttributes<HTMLElement> & {
  header?: ReactNode
  children: ReactNode
  footer?: ReactNode
  expanded?: boolean
  className?: string
  'aria-label'?: string
}

export const NavigationRail = forwardRef<HTMLElement, NavigationRailProps>(function NavigationRail(
  {
    header,
    children,
    footer,
    expanded = false,
    className = '',
    'aria-label': ariaLabel = 'Navigation Rail',
    ...props
  }: NavigationRailProps,
  ref: Ref<HTMLElement>,
) {
  const destinationsRef = useRef<HTMLDivElement | null>(null)

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!destinationsRef.current) return

    const items = Array.from(
      destinationsRef.current.querySelectorAll<HTMLElement>('a, button, [tabindex="0"]'),
    ).filter((item) => !item.hasAttribute('disabled'))

    if (items.length === 0) return

    const currentIndex = items.findIndex((item) => item === document.activeElement)

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0
      items[nextIndex]?.focus()
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1
      items[prevIndex]?.focus()
    } else if (event.key === 'Home') {
      event.preventDefault()
      items[0]?.focus()
    } else if (event.key === 'End') {
      event.preventDefault()
      items[items.length - 1]?.focus()
    }
  }

  return (
    <NavigationRailContext.Provider value={{ expanded }}>
      <nav
        ref={ref}
        className={`m3-navigation-rail ${expanded ? 'm3-navigation-rail--expanded' : ''} ${className}`.trim()}
        aria-label={ariaLabel}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {header && <div className="m3-navigation-rail__header">{header}</div>}
        <div className="m3-navigation-rail__destinations" ref={destinationsRef}>
          {children}
        </div>
        {footer && <div className="m3-navigation-rail__footer">{footer}</div>}
      </nav>
    </NavigationRailContext.Provider>
  )
})
