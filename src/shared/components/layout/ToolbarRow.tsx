import type { HTMLAttributes } from 'react'

export function ToolbarRow({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`toolbar-row ${className}`.trim()} {...props} />
}
