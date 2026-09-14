import type { HTMLAttributes } from 'react'

export type CardVariant = 'elevated' | 'filled' | 'outlined'
export type CardSurface = 'lowest' | 'low' | 'default' | 'high' | 'highest'

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: CardVariant
  surface?: CardSurface
  interactive?: boolean
}

export function Card({
  variant = 'outlined',
  surface,
  interactive = false,
  className = '',
  ...props
}: CardProps) {
  const variantClass = `m3-card--${variant}`
  const surfaceClass = surface ? `m3-card--surface-${surface}` : ''
  const interactiveClass = interactive ? 'm3-card--interactive' : ''

  return (
    <div
      className={`card m3-card ${variantClass} ${surfaceClass} ${interactiveClass} ${className}`.trim()}
      {...props}
    />
  )
}

export function CardHeader({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`m3-card-header ${className}`.trim()} {...props} />
}

export function CardTitle({
  className = '',
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={`m3-card-title ${className}`.trim()} {...props}>
      {children}
    </h3>
  )
}

export function CardSubtitle({
  className = '',
  children,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={`m3-card-subtitle ${className}`.trim()} {...props}>
      {children}
    </p>
  )
}

export function CardContent({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`m3-card-content ${className}`.trim()} {...props} />
}

export function CardActions({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`m3-card-actions ${className}`.trim()} {...props} />
}
