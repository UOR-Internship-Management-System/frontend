import { useState, type ReactNode } from 'react'
import { Fab } from './Fab'

export type FabMenuItem = {
  id: string
  label: string
  icon: ReactNode
  onClick: () => void
}

export type FabMenuProps = {
  icon: ReactNode
  activeIcon?: ReactNode
  items: FabMenuItem[]
  'aria-label': string
  position?: 'bottom-right' | 'bottom-left'
}

export function FabMenu({
  icon,
  activeIcon,
  items,
  'aria-label': ariaLabel,
  position = 'bottom-right',
}: FabMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  const toggle = () => setIsOpen((prev) => !prev)

  const currentIcon = isOpen && activeIcon ? activeIcon : icon

  return (
    <div className={`m3-fab-menu-wrapper m3-fab-menu--${position}`} aria-expanded={isOpen}>
      {isOpen ? (
        <div className="m3-fab-menu-items" role="menu">
          {items.map((item) => (
            <button
              key={item.id}
              role="menuitem"
              type="button"
              className="m3-button m3-button--elevated m3-button--size-sm m3-fab-menu-item"
              onClick={() => {
                item.onClick()
                setIsOpen(false)
              }}
            >
              <span aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      ) : null}

      <Fab icon={currentIcon} aria-label={ariaLabel} onClick={toggle} variant="primary" />
    </div>
  )
}
