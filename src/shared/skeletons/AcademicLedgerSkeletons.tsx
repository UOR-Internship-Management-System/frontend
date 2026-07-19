import type { CSSProperties } from 'react'
import { SkeletonBlock } from '../components/feedback/SkeletonBlock'

function Shape({
  height = 14,
  radius = 'md',
  width = '100%',
}: {
  height?: CSSProperties['height']
  radius?: 'sm' | 'md' | 'lg' | 'pill' | 'circle'
  width?: CSSProperties['width']
}) {
  return (
    <SkeletonBlock
      decorative
      height={height}
      lines={0}
      radius={radius}
      variant="inline"
      width={width}
    />
  )
}

function TableGrid({ columns, rows }: { columns: number; rows: number }) {
  return (
    <div className="table-responsive" aria-hidden="true">
      <div
        className="skeleton-table-grid"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(132px, 1fr))` }}
      >
        {Array.from({ length: columns }, (_, index) => (
          <div className="skeleton-table-cell skeleton-table-head" key={`head-${index}`}>
            <Shape height={12} radius="pill" width={index === columns - 1 ? '58%' : '76%'} />
          </div>
        ))}
        {Array.from({ length: rows }, (_, row) =>
          Array.from({ length: columns }, (_, column) => (
            <div
              className={`skeleton-table-cell ${row === rows - 1 ? 'is-last-row' : ''}`.trim()}
              key={`${row}-${column}`}
            >
              <Shape height={12} radius="pill" width={column === columns - 1 ? '54%' : '84%'} />
            </div>
          )),
        )}
      </div>
    </div>
  )
}

export function LedgerSelectedBatchSkeleton() {
  return (
    <section
      aria-busy="true"
      aria-label="Loading selected ledger batch"
      className="content-stack"
      role="status"
    >
      <span className="visually-hidden">Loading selected ledger batch</span>
      <section className="section-card" aria-hidden="true">
        <div className="skeleton-section-heading">
          <div>
            <Shape height={26} width={260} />
            <Shape height={12} radius="pill" width={360} />
          </div>
          <Shape height={34} radius="pill" width={122} />
        </div>
        <div className="skeleton-gpa-grid">
          {Array.from({ length: 3 }, (_, index) => (
            <div className="section-card" key={index}>
              <Shape height={12} radius="pill" width="48%" />
              <Shape height={30} width="36%" />
              <Shape height={12} radius="pill" width="72%" />
            </div>
          ))}
        </div>
        <div className="skeleton-toolbar">
          <Shape height={44} radius="pill" width={160} />
          <Shape height={44} radius="pill" width={190} />
        </div>
      </section>
    </section>
  )
}

export function LedgerUploadsTableSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading recent ledger uploads" role="status">
      <span className="visually-hidden">Loading recent ledger uploads</span>
      <div className="skeleton-toolbar" aria-hidden="true">
        <Shape height={44} width="min(340px, 100%)" />
        <Shape height={44} width={150} />
      </div>
      <TableGrid columns={6} rows={5} />
      <div className="skeleton-pagination" aria-hidden="true">
        <Shape height={14} radius="pill" width={180} />
        <Shape height={38} radius="pill" width={220} />
      </div>
    </div>
  )
}

export function AcademicLedgerRouteSkeleton() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading Academic Ledger"
      className="content-stack"
      role="status"
    >
      <span className="visually-hidden">Loading Academic Ledger</span>
      <header className="page-header" aria-hidden="true">
        <div>
          <Shape height={24} radius="pill" width={150} />
          <Shape height={44} width="min(430px, 82vw)" />
          <SkeletonBlock
            decorative
            lineWidths={['min(680px, 90vw)', 'min(460px, 70vw)']}
            lines={2}
            variant="inline"
          />
        </div>
      </header>
      <section className="section-card" aria-hidden="true">
        <Shape height={28} width={260} />
        <SkeletonBlock decorative lineWidths={['76%', '52%']} lines={2} variant="inline" />
        <Shape height={126} radius="lg" />
        <Shape height={44} radius="pill" width={190} />
      </section>
      <section className="section-card">
        <div className="skeleton-section-heading" aria-hidden="true">
          <div>
            <Shape height={28} width={210} />
            <Shape height={12} radius="pill" width={330} />
          </div>
        </div>
        <LedgerUploadsTableSkeleton />
      </section>
    </main>
  )
}

export function LedgerValidationSkeleton() {
  return (
    <section
      aria-busy="true"
      aria-label="Loading staged validation"
      className="section-card content-stack"
      role="status"
    >
      <span className="visually-hidden">Loading staged validation</span>
      <div className="skeleton-section-heading" aria-hidden="true">
        <div>
          <Shape height={26} width={250} />
          <Shape height={12} radius="pill" width={360} />
        </div>
        <Shape height={32} radius="pill" width={140} />
      </div>
      <div className="skeleton-toolbar" aria-hidden="true">
        <Shape height={44} width="min(340px, 100%)" />
        <Shape height={44} width={150} />
      </div>
      <TableGrid columns={6} rows={5} />
      <div className="skeleton-pagination" aria-hidden="true">
        <Shape height={14} radius="pill" width={180} />
        <Shape height={38} radius="pill" width={220} />
      </div>
    </section>
  )
}

export function LedgerInspectionTableSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading Student records" role="status">
      <span className="visually-hidden">Loading Student records</span>
      <TableGrid columns={6} rows={5} />
      <div className="skeleton-pagination" aria-hidden="true">
        <Shape height={14} radius="pill" width={180} />
        <Shape height={38} radius="pill" width={220} />
      </div>
    </div>
  )
}

export function LedgerRecordsModalSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading academic record details" role="status">
      <span className="visually-hidden">Loading academic record details</span>
      <TableGrid columns={6} rows={5} />
      <div className="skeleton-pagination" aria-hidden="true">
        <Shape height={14} radius="pill" width={180} />
        <Shape height={38} radius="pill" width={220} />
      </div>
    </div>
  )
}
