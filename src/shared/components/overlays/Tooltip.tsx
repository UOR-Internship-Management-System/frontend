import { useState, type ReactNode } from 'react'

export type TooltipProps = {
  children: ReactNode
  label: string
  className?: string
}

export function Tooltip({ children, label, className = '' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <span
      className={`m3-tooltip-wrapper ${className}`.trim()}
      title={label}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible ? (
        <span role="tooltip" className="m3-tooltip-bubble">
          {label}
        </span>
      ) : null}
    </span>
  )
}
