import type { HTMLAttributes, ReactNode } from 'react'

export type TopAppBarVariant = 'small' | 'medium' | 'large' | 'center'

export type TopAppBarProps = HTMLAttributes<HTMLElement> & {
  title: ReactNode
  leading?: ReactNode
  actions?: ReactNode
  variant?: TopAppBarVariant
  isScrolled?: boolean
  className?: string
}

export function TopAppBar({
  title,
  leading,
  actions,
  variant = 'small',
  isScrolled = false,
  className = '',
  ...props
}: TopAppBarProps) {
  const isMultiRow = variant === 'medium' || variant === 'large'

  return (
    <header
      className={`m3-top-app-bar m3-top-app-bar--${variant} ${
        isScrolled ? 'm3-top-app-bar--scrolled' : ''
      } ${className}`.trim()}
      {...props}
    >
      <div className="m3-top-app-bar__row">
        <div className="m3-top-app-bar__leading">
          {leading}
          {!isMultiRow && variant !== 'center' && (
            <h1 className="m3-top-app-bar__title">{title}</h1>
          )}
        </div>

        {variant === 'center' && <h1 className="m3-top-app-bar__title">{title}</h1>}

        {actions && <div className="m3-top-app-bar__actions">{actions}</div>}
      </div>

      {isMultiRow && <h1 className="m3-top-app-bar__title">{title}</h1>}
    </header>
  )
}
