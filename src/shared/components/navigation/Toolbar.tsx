import type { HTMLAttributes, ReactNode } from 'react'

export type ToolbarVariant = 'standard' | 'floating' | 'docked'

export type ToolbarProps = HTMLAttributes<HTMLDivElement> & {
  variant?: ToolbarVariant
  children: ReactNode
  className?: string
  'aria-label'?: string
}

export function Toolbar({
  variant = 'standard',
  children,
  className = '',
  'aria-label': ariaLabel = 'Toolbar',
  ...props
}: ToolbarProps) {
  return (
    <div
      role="toolbar"
      aria-label={ariaLabel}
      className={`m3-toolbar m3-toolbar--${variant} ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  )
}

export function ToolbarGroup({
  children,
  className = '',
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`m3-toolbar__group ${className}`.trim()} {...props}>
      {children}
    </div>
  )
}

export function ToolbarDivider({
  className = '',
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="separator"
      className={`m3-toolbar__divider ${className}`.trim()}
      {...props}
    />
  )
}
