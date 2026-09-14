import type { HTMLAttributes, ReactNode } from 'react'

export type BottomAppBarProps = HTMLAttributes<HTMLElement> & {
  children?: ReactNode
  fab?: ReactNode
  className?: string
}

export function BottomAppBar({
  children,
  fab,
  className = '',
  ...props
}: BottomAppBarProps) {
  return (
    <footer className={`m3-bottom-app-bar ${className}`.trim()} {...props}>
      <div className="m3-top-app-bar__actions">{children}</div>
      {fab && <div className="m3-bottom-app-bar__fab-slot">{fab}</div>}
    </footer>
  )
}
