import { useRef, type HTMLAttributes, type ReactNode } from 'react'
import { IconButton } from './IconButton'

export type CarouselProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
  ariaLabel?: string
  showControls?: boolean
}

export function Carousel({
  children,
  ariaLabel = 'Showcase carousel',
  showControls = true,
  className = '',
  ...props
}: CarouselProps) {
  const viewportRef = useRef<HTMLDivElement>(null)

  const scrollLeft = () => {
    if (viewportRef.current) {
      if (typeof viewportRef.current.scrollBy === 'function') {
        viewportRef.current.scrollBy({ left: -320, behavior: 'smooth' })
      } else {
        viewportRef.current.scrollLeft -= 320
      }
    }
  }

  const scrollRight = () => {
    if (viewportRef.current) {
      if (typeof viewportRef.current.scrollBy === 'function') {
        viewportRef.current.scrollBy({ left: 320, behavior: 'smooth' })
      } else {
        viewportRef.current.scrollLeft += 320
      }
    }
  }

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      className={`m3-carousel-container ${className}`.trim()}
      {...props}
    >
      <div ref={viewportRef} className="m3-carousel-viewport">
        {children}
      </div>

      {showControls ? (
        <div className="m3-carousel-controls">
          <IconButton
            variant="tonal"
            size="sm"
            aria-label="Previous items"
            icon={<span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_left</span>}
            onClick={scrollLeft}
          />
          <IconButton
            variant="tonal"
            size="sm"
            aria-label="Next items"
            icon={<span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_right</span>}
            onClick={scrollRight}
          />
        </div>
      ) : null}
    </div>
  )
}

export type CarouselItemProps = HTMLAttributes<HTMLDivElement> & {
  width?: string | number
}

export function CarouselItem({
  children,
  width = 300,
  className = '',
  style,
  ...props
}: CarouselItemProps) {
  return (
    <div
      role="group"
      aria-roledescription="slide"
      className={`m3-carousel-item ${className}`.trim()}
      style={{ width, ...style }}
      {...props}
    >
      {children}
    </div>
  )
}
