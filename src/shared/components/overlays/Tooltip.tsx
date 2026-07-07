import type { ReactNode } from 'react'

export function Tooltip({ children, label }: { children: ReactNode; label: string }) {
  return <span title={label}>{children}</span>
}
