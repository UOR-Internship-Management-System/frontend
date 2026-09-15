import type { ElementType, HTMLAttributes, ReactNode } from 'react'
import { forwardRef } from 'react'

export type NavigationBarItemProps = {
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

export const NavigationBarItem = forwardRef<
  HTMLElement,
  NavigationBarItemProps & HTMLAttributes<HTMLElement>
>(function NavigationBarItem(
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
  }: NavigationBarItemProps & HTMLAttributes<HTMLElement>,
  ref,
) {
  const currentIcon = active && activeIcon ? activeIcon : icon

  return (
    <Component
      ref={ref}
      type={Component === 'button' ? 'button' : undefined}
      to={to}
      href={href}
      className={`m3-navigation-bar__item ${active ? 'm3-navigation-bar__item--active' : ''} ${className}`.trim()}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      aria-label={ariaLabel || (typeof label === 'string' ? label : undefined)}
      {...props}
    >
      <div className="m3-navigation-bar__pill">
        <span className="m3-navigation-bar__icon">{currentIcon}</span>
        {badge && <span className="m3-navigation-bar__badge">{badge}</span>}
      </div>
      <span className="m3-navigation-bar__label">{label}</span>
    </Component>
  )
})

export type NavigationBarProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode
  className?: string
  'aria-label'?: string
}

export function NavigationBar({
  children,
  className = '',
  'aria-label': ariaLabel = 'Mobile Navigation',
  ...props
}: NavigationBarProps) {
  return (
    <nav className={`m3-navigation-bar ${className}`.trim()} aria-label={ariaLabel} {...props}>
      {children}
    </nav>
  )
}
