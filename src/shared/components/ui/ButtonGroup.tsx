import type { HTMLAttributes } from 'react'

export type ButtonGroupProps = HTMLAttributes<HTMLDivElement> & {
  spacing?: 'compact' | 'standard' | 'loose'
  align?: 'start' | 'center' | 'end' | 'stretch'
  orientation?: 'horizontal' | 'vertical'
}

export function ButtonGroup({
  children,
  spacing = 'standard',
  align = 'start',
  orientation = 'horizontal',
  className = '',
  ...props
}: ButtonGroupProps) {
  const spacingClass = `m3-button-group--${spacing}`
  const alignClass = `m3-button-group--align-${align}`
  const orientationClass = orientation === 'vertical' ? 'm3-button-group--vertical' : ''

  return (
    <div
      role="group"
      className={`m3-button-group ${spacingClass} ${alignClass} ${orientationClass} ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  )
}
