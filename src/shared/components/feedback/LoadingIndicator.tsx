import type { HTMLAttributes } from 'react'

export type LoadingIndicatorProps = HTMLAttributes<HTMLDivElement> & {
  ariaLabel?: string
}

export function LoadingIndicator({
  ariaLabel = 'Loading',
  className = '',
  ...props
}: LoadingIndicatorProps) {
  return (
    <div
      role="status"
      aria-label={ariaLabel}
      className={`m3-loading-morph ${className}`.trim()}
      {...props}
    >
      <span className="visually-hidden">{ariaLabel}</span>
    </div>
  )
}
