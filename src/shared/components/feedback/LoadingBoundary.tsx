import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'

type LoadingBoundaryProps = {
  isLoading: boolean
  skeleton: ReactNode
  children: ReactNode
  label?: string
  className?: string
  minHeight?: CSSProperties['minHeight']
  exitDurationMs?: number
}

/**
 * Keeps the skeleton and content in the same grid cell so the swap can cross-fade
 * without translating content or animating layout properties.
 */
export function LoadingBoundary({
  children,
  className = '',
  exitDurationMs = 160,
  isLoading,
  label = 'Loading content',
  minHeight,
  skeleton,
}: LoadingBoundaryProps) {
  const [renderSkeleton, setRenderSkeleton] = useState(isLoading)

  useEffect(() => {
    if (isLoading) {
      setRenderSkeleton(true)
      return
    }

    const timer = window.setTimeout(() => setRenderSkeleton(false), exitDurationMs)
    return () => window.clearTimeout(timer)
  }, [exitDurationMs, isLoading])

  return (
    <section
      aria-busy={isLoading}
      aria-label={isLoading ? label : undefined}
      className={`loading-boundary ${className}`.trim()}
      style={{ minHeight }}
    >
      {renderSkeleton ? (
        <div
          aria-hidden={!isLoading}
          className={`loading-boundary__skeleton ${isLoading ? '' : 'is-exiting'}`.trim()}
        >
          {skeleton}
        </div>
      ) : null}
      {!isLoading ? <div className="loading-boundary__content">{children}</div> : null}
    </section>
  )
}
