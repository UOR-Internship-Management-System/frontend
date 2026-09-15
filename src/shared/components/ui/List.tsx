import type { HTMLAttributes, LiHTMLAttributes, ReactNode } from 'react'

export type ListProps = HTMLAttributes<HTMLUListElement>

export function List({ className = '', children, ...props }: ListProps) {
  return (
    <ul className={`m3-list ${className}`.trim()} {...props}>
      {children}
    </ul>
  )
}

export type ListItemProps = LiHTMLAttributes<HTMLLIElement> & {
  headline: ReactNode
  supportingText?: ReactNode
  leading?: ReactNode
  trailing?: ReactNode
  interactive?: boolean
}

export function ListItem({
  headline,
  supportingText,
  leading,
  trailing,
  interactive = false,
  className = '',
  ...props
}: ListItemProps) {
  const interactiveClass = interactive ? 'm3-list-item--interactive' : ''

  return (
    <li
      className={`m3-list-item ${interactiveClass} ${className}`.trim()}
      tabIndex={interactive ? 0 : undefined}
      {...props}
    >
      {leading ? <span className="m3-list-item-leading">{leading}</span> : null}
      <div className="m3-list-item-content">
        <span className="m3-list-item-headline">{headline}</span>
        {supportingText ? <span className="m3-list-item-supporting">{supportingText}</span> : null}
      </div>
      {trailing ? <span className="m3-list-item-trailing">{trailing}</span> : null}
    </li>
  )
}
