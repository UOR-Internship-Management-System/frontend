import type { CSSProperties, ReactNode } from 'react'
import { SkeletonBlock, type SkeletonRadius } from '../components/feedback/SkeletonBlock'

export function SkeletonShape({
  className = '',
  height = 14,
  radius = 'md',
  width = '100%',
}: {
  className?: string
  height?: CSSProperties['height']
  radius?: SkeletonRadius
  width?: CSSProperties['width']
}) {
  return (
    <SkeletonBlock
      className={className}
      decorative
      height={height}
      lines={0}
      radius={radius}
      variant="inline"
      width={width}
    />
  )
}

export function SkeletonPageHeader({ action = false }: { action?: boolean }) {
  return (
    <header aria-hidden="true" className="page-header skeleton-page-header">
      <div>
        <SkeletonShape height={24} radius="pill" width={150} />
        <SkeletonShape height={44} width="min(430px, 82vw)" />
        <SkeletonBlock
          decorative
          lineWidths={['min(680px, 90vw)', 'min(470px, 72vw)']}
          lines={2}
          variant="inline"
        />
      </div>
      {action ? <SkeletonShape height={42} radius="pill" width={150} /> : null}
    </header>
  )
}

export function SkeletonTableGrid({
  columns,
  gridTemplateColumns,
  rows,
  testId,
}: {
  columns: number
  rows: number
  gridTemplateColumns: string
  testId?: string
}) {
  return (
    <div aria-hidden="true" className="table-responsive skeleton-desktop-table">
      <div className="skeleton-table-grid" data-testid={testId} style={{ gridTemplateColumns }}>
        {Array.from({ length: columns }, (_, index) => (
          <div
            className="skeleton-table-cell skeleton-table-head"
            data-skeleton-header
            key={`head-${index}`}
          >
            <SkeletonShape height={12} radius="pill" width={index === 1 ? '82%' : '66%'} />
          </div>
        ))}
        {Array.from({ length: rows }, (_, row) =>
          Array.from({ length: columns }, (_, column) => (
            <div
              className={`skeleton-table-cell ${row === rows - 1 ? 'is-last-row' : ''}`.trim()}
              data-skeleton-cell
              key={`${row}-${column}`}
            >
              <SkeletonShape height={12} radius="pill" width={column === 1 ? '88%' : '68%'} />
            </div>
          )),
        )}
      </div>
    </div>
  )
}

export function SkeletonPagination() {
  return (
    <div aria-hidden="true" className="skeleton-pagination">
      <SkeletonShape height={14} radius="pill" width={190} />
      <SkeletonShape height={38} radius="pill" width={220} />
    </div>
  )
}

export function SkeletonMobileCards({ count = 6 }: { count?: number }) {
  return (
    <div aria-hidden="true" className="skeleton-mobile-cards">
      {Array.from({ length: count }, (_, index) => (
        <article className="skeleton-mobile-card" key={index}>
          <div className="skeleton-section-heading">
            <SkeletonShape height={18} width="58%" />
            <SkeletonShape height={28} radius="pill" width={86} />
          </div>
          <SkeletonBlock decorative lineWidths={['92%', '74%']} lines={2} variant="inline" />
          <div className="skeleton-chip-row">
            <SkeletonShape height={28} radius="pill" width={92} />
            <SkeletonShape height={28} radius="pill" width={110} />
          </div>
          <SkeletonShape height={40} radius="pill" width={148} />
        </article>
      ))}
    </div>
  )
}

export function SkeletonStatusRegion({
  children,
  className = '',
  label,
}: {
  children: ReactNode
  className?: string
  label: string
}) {
  return (
    <section
      aria-busy="true"
      aria-label={label}
      className={className}
      data-skeleton-region
      role="status"
    >
      <span className="visually-hidden">{label}</span>
      {children}
    </section>
  )
}
