import type { ReactNode } from 'react'
import { Chip } from './Chip'

export type StatusBadgeTone = 'neutral' | 'success' | 'danger' | 'warning' | 'info'

export type StatusBadgeProps = {
  children: ReactNode
  tone?: StatusBadgeTone
  className?: string
}

export function StatusBadge({ children, tone = 'neutral', className = '' }: StatusBadgeProps) {
  return <Chip className={`status-${tone} ${className}`.trim()}>{children}</Chip>
}
