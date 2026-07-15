import { Button } from '../ui/Button'

export type PaginationBarProps = {
  page: number
  totalPages: number
  totalElements?: number
  size?: number
  onPageChange?: (page: number) => void
  label?: string
}

export function PaginationBar({
  label = 'Pagination',
  onPageChange,
  page,
  size,
  totalElements,
  totalPages,
}: PaginationBarProps) {
  const displayPage = totalPages === 0 ? 0 : page + 1
  const start = totalElements && size ? page * size + 1 : 0
  const end = totalElements && size ? Math.min((page + 1) * size, totalElements) : 0
  return (
    <nav aria-label={label} className="pagination-bar">
      <p className="pagination-summary">
        {totalElements !== undefined && size !== undefined
          ? `${start}–${end} of ${totalElements}`
          : null}
        {totalElements !== undefined && size !== undefined ? ' · ' : null}
        Page {displayPage} of {totalPages}
      </p>
      {onPageChange ? (
        <div className="pagination-actions">
          <Button disabled={page <= 0} onClick={() => onPageChange(page - 1)} variant="secondary">
            Previous
          </Button>
          <Button
            disabled={totalPages === 0 || page >= totalPages - 1}
            onClick={() => onPageChange(page + 1)}
            variant="secondary"
          >
            Next
          </Button>
        </div>
      ) : null}
    </nav>
  )
}
