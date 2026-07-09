import type { CSSProperties } from 'react'
import { SkeletonBlock } from '../components/feedback/SkeletonBlock'

export type TableSkeletonVariant =
  | 'generic'
  | 'academic-ledger'
  | 'academic-records'
  | 'registered-students'
  | 'student-projects'
  | 'internship-management'
  | 'candidate-filtering'
  | 'shortlists'

const TABLE_CONFIG: Record<
  TableSkeletonVariant,
  { columns: number; rows: number; showUpload?: boolean; showFilters?: boolean }
> = {
  generic: { columns: 4, rows: 5 },
  'academic-ledger': { columns: 5, rows: 5, showUpload: true },
  'academic-records': { columns: 5, rows: 4 },
  'registered-students': { columns: 5, rows: 6, showFilters: true },
  'student-projects': { columns: 4, rows: 4 },
  'internship-management': { columns: 5, rows: 5, showFilters: true },
  'candidate-filtering': { columns: 6, rows: 6, showFilters: true },
  shortlists: { columns: 5, rows: 5, showFilters: true },
}

function Shape({
  height = 14,
  rounded = false,
  width = '100%',
}: {
  height?: CSSProperties['height']
  rounded?: boolean
  width?: CSSProperties['width']
}) {
  return (
    <SkeletonBlock
      decorative
      height={height}
      lines={0}
      rounded={rounded}
      variant="inline"
      width={width}
    />
  )
}

function PageHeaderSkeleton() {
  return (
    <header className="page-header skeleton-page-header" aria-hidden="true">
      <div>
        <Shape height={24} rounded width={150} />
        <Shape height={44} width="min(420px, 82vw)" />
        <SkeletonBlock
          decorative
          lineWidths={['min(620px, 90vw)', 'min(460px, 72vw)']}
          lines={2}
          variant="inline"
        />
      </div>
      <Shape height={42} rounded width={150} />
    </header>
  )
}

function ToolbarSkeleton({ showFilters }: { showFilters?: boolean }) {
  return (
    <div className="table-skeleton-toolbar" aria-hidden="true">
      <Shape height={42} rounded width="min(320px, 100%)" />
      <div className="table-skeleton-actions">
        {showFilters ? <Shape height={42} rounded width={132} /> : null}
        <Shape height={42} rounded width={132} />
      </div>
    </div>
  )
}

function UploadPanelSkeleton() {
  return (
    <section className="section-card upload-skeleton-panel" aria-hidden="true">
      <Shape height={28} width={260} />
      <SkeletonBlock decorative lineWidths={['72%', '48%']} lines={2} variant="inline" />
      <Shape height={120} rounded />
      <Shape height={44} rounded width={190} />
    </section>
  )
}

function TableGridSkeleton({ columns, rows }: { columns: number; rows: number }) {
  return (
    <div className="table-responsive table-skeleton-wrapper" aria-hidden="true">
      <div
        className="table-skeleton-grid"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(120px, 1fr))` }}
      >
        {Array.from({ length: columns }, (_, index) => (
          <div className="table-skeleton-cell table-skeleton-head" key={`head-${index}`}>
            <Shape height={14} width={index === columns - 1 ? '58%' : '76%'} />
          </div>
        ))}
        {Array.from({ length: rows }, (_, rowIndex) =>
          Array.from({ length: columns }, (_, columnIndex) => (
            <div className="table-skeleton-cell" key={`row-${rowIndex}-col-${columnIndex}`}>
              <Shape height={12} width={columnIndex === columns - 1 ? '52%' : '84%'} />
            </div>
          )),
        )}
      </div>
    </div>
  )
}

function PaginationSkeleton() {
  return (
    <div className="pagination-skeleton" aria-hidden="true">
      <Shape height={36} rounded width={120} />
      <Shape height={36} rounded width={168} />
    </div>
  )
}

export function TableSkeleton({ variant = 'generic' }: { variant?: TableSkeletonVariant }) {
  const config = TABLE_CONFIG[variant]

  return (
    <section
      aria-busy="true"
      aria-label="Loading table content"
      className="content-stack"
      role="status"
    >
      <span className="visually-hidden">Loading table content</span>
      <PageHeaderSkeleton />
      {config.showUpload ? <UploadPanelSkeleton /> : null}
      <section className="section-card table-skeleton-card">
        <ToolbarSkeleton showFilters={config.showFilters} />
        <TableGridSkeleton columns={config.columns} rows={config.rows} />
        <PaginationSkeleton />
      </section>
    </section>
  )
}
