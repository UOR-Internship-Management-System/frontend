import { Chip } from './Chip'

export type StatusBadgeProps = {
  children: string
  tone?: 'neutral' | 'success' | 'danger'
}

export function StatusBadge({ children, tone = 'neutral' }: StatusBadgeProps) {
  return <Chip className={`status-${tone}`}>{children}</Chip>
}
