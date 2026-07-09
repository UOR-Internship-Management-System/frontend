import type { CSSProperties } from 'react'

export type SkeletonBlockProps = {
  lines?: number
  label?: string
  className?: string
  width?: CSSProperties['width']
  height?: CSSProperties['height']
  rounded?: boolean
  variant?: 'block' | 'card' | 'inline' | 'circle'
  lineWidths?: Array<CSSProperties['width']>
  decorative?: boolean
}

export function SkeletonBlock({
  className = '',
  decorative = false,
  height,
  label = 'Loading content',
  lineWidths,
  lines = 3,
  rounded = false,
  variant = 'block',
  width,
}: SkeletonBlockProps) {
  const style: CSSProperties = {}

  if (width !== undefined) style.width = width
  if (height !== undefined) style.height = height

  const classNames = [
    `skeleton-${variant}`,
    lines <= 0 ? 'skeleton-empty' : '',
    rounded || variant === 'circle' ? 'skeleton-rounded' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const accessibilityProps = decorative
    ? ({ 'aria-hidden': true } as const)
    : ({ 'aria-label': label, role: 'status' } as const)

  return (
    <div className={classNames} style={style} {...accessibilityProps}>
      {!decorative ? <span className="visually-hidden">{label}</span> : null}
      {Array.from({ length: Math.max(lines, 0) }, (_, index) => {
        const lineStyle: CSSProperties = {}
        const lineWidth = lineWidths?.[index]

        if (lineWidth !== undefined) {
          lineStyle.width = lineWidth
        }

        return <span aria-hidden="true" className="skeleton-line" key={index} style={lineStyle} />
      })}
    </div>
  )
}
