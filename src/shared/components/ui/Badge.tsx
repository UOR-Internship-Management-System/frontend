import type { HTMLAttributes, ReactNode } from 'react'

export type BadgeVariant = 'error' | 'primary' | 'secondary'

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  count?: number
  maxCount?: number
  dot?: boolean
  variant?: BadgeVariant
}

export function Badge({
  count,
  maxCount = 99,
  dot = false,
  variant = 'error',
  className = '',
  ...props
}: BadgeProps) {
  if (count === undefined && !dot) return null

  const variantClass = `m3-badge--${variant}`
  const typeClass = dot ? 'm3-badge--dot' : 'm3-badge--numeric'
  const displayCount = count !== undefined && count > maxCount ? `${maxCount}+` : count

  return (
    <span
      className={`m3-badge ${variantClass} ${typeClass} ${className}`.trim()}
      aria-label={dot ? 'New notification' : `${count} notifications`}
      {...props}
    >
      {!dot ? displayCount : null}
    </span>
  )
}

export type BadgeAnchorProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode
  badge?: ReactNode
}

export function BadgeAnchor({ children, badge, className = '', ...props }: BadgeAnchorProps) {
  return (
    <span className={`m3-badge-anchor ${className}`.trim()} {...props}>
      {children}
      {badge}
    </span>
  )
}
