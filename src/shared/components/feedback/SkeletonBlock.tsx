import type { CSSProperties } from 'react'

export type SkeletonRadius = 'none' | 'sm' | 'md' | 'lg' | 'pill' | 'circle'

export type SkeletonBlockProps = {
  lines?: number
  label?: string
  className?: string
  width?: CSSProperties['width']
  height?: CSSProperties['height']
  /** @deprecated Use radius. Kept temporarily for safe incremental migration. */
  rounded?: boolean
  radius?: SkeletonRadius
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
  radius,
  rounded = false,
  variant = 'block',
  width,
}: SkeletonBlockProps) {
  const style: CSSProperties = {}
  if (width !== undefined) style.width = width
  if (height !== undefined) style.height = height

  const resolvedRadius: SkeletonRadius =
    radius ?? (variant === 'circle' ? 'circle' : rounded ? 'pill' : 'md')
  const isEmpty = lines <= 0
  const classNames = [
    `skeleton-${variant}`,
    `skeleton-radius-${resolvedRadius}`,
    isEmpty ? 'skeleton-empty skeleton-shimmer-surface' : '',
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
        const lineWidth = lineWidths?.[index] ?? (index === lines - 1 ? '72%' : '100%')
        return (
          <span
            aria-hidden="true"
            className="skeleton-line skeleton-shimmer-surface"
            key={index}
            style={{ width: lineWidth }}
          />
        )
      })}
    </div>
  )
}
