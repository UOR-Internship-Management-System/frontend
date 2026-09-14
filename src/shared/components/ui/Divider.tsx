import type { HTMLAttributes } from 'react'

export type DividerInset = 'none' | 'start' | 'end' | 'both'

export type DividerProps = HTMLAttributes<HTMLHRElement> & {
  vertical?: boolean
  inset?: DividerInset
}

export function Divider({
  vertical = false,
  inset = 'none',
  className = '',
  ...props
}: DividerProps) {
  const orientationClass = vertical ? 'm3-divider--vertical' : ''
  const insetClass = inset !== 'none' ? `m3-divider--inset-${inset}` : ''

  return (
    <hr
      aria-orientation={vertical ? 'vertical' : 'horizontal'}
      className={`m3-divider ${orientationClass} ${insetClass} ${className}`.trim()}
      {...props}
    />
  )
}
