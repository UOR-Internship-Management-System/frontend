import type { ButtonHTMLAttributes, HTMLAttributes, KeyboardEvent, ReactNode } from 'react'
import { useCallback, useRef } from 'react'

export type TabVariant = 'primary' | 'secondary'

export type TabItem = {
  id: string
  label: ReactNode
  icon?: ReactNode
  badge?: ReactNode
  disabled?: boolean
}

export type TabProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean
  icon?: ReactNode
  badge?: ReactNode
  variant?: TabVariant
}

export function Tab({ active = false, icon, badge, children, className = '', ...props }: TabProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      className={`m3-tab ${active ? 'm3-tab--active' : ''} ${className}`.trim()}
      {...props}
    >
      <span className="m3-tab__content">
        {icon && (
          <span className="m3-tab__icon" aria-hidden="true">
            {icon}
          </span>
        )}
        <span className="m3-tab__label">{children}</span>
        {badge && <span className="m3-tab__badge">{badge}</span>}
      </span>
      {active && <span className="m3-tab__indicator" aria-hidden="true" />}
    </button>
  )
}

export type TabsProps = Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> & {
  tabs?: TabItem[]
  activeId?: string
  onChange?: (id: string) => void
  variant?: TabVariant
  children?: ReactNode
  'aria-label'?: string
}

export function Tabs({
  tabs,
  activeId,
  onChange,
  variant = 'primary',
  children,
  className = '',
  'aria-label': ariaLabel = 'Tabs',
  ...props
}: TabsProps) {
  const tabsListRef = useRef<HTMLDivElement | null>(null)

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    if (!tabsListRef.current) return

    const tabButtons = Array.from(
      tabsListRef.current.querySelectorAll<HTMLButtonElement>('button[role="tab"]:not(:disabled)'),
    )

    if (tabButtons.length === 0) return
    const activeIndex = tabButtons.indexOf(document.activeElement as HTMLButtonElement)

    if (e.key === 'ArrowRight') {
      e.preventDefault()
      const nextIndex = activeIndex < tabButtons.length - 1 ? activeIndex + 1 : 0
      tabButtons[nextIndex]?.focus()
      tabButtons[nextIndex]?.click()
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      const prevIndex = activeIndex > 0 ? activeIndex - 1 : tabButtons.length - 1
      tabButtons[prevIndex]?.focus()
      tabButtons[prevIndex]?.click()
    } else if (e.key === 'Home') {
      e.preventDefault()
      tabButtons[0]?.focus()
      tabButtons[0]?.click()
    } else if (e.key === 'End') {
      e.preventDefault()
      tabButtons[tabButtons.length - 1]?.focus()
      tabButtons[tabButtons.length - 1]?.click()
    }
  }, [])

  return (
    <div
      ref={tabsListRef}
      role="tablist"
      aria-label={ariaLabel}
      onKeyDown={handleKeyDown}
      className={`m3-tabs m3-tabs--${variant} ${className}`.trim()}
      {...props}
    >
      {tabs
        ? tabs.map((tab) => (
            <Tab
              key={tab.id}
              active={tab.id === activeId}
              icon={tab.icon}
              badge={tab.badge}
              disabled={tab.disabled}
              variant={variant}
              onClick={() => onChange?.(tab.id)}
            >
              {tab.label}
            </Tab>
          ))
        : children}
    </div>
  )
}
