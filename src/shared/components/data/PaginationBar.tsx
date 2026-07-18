import { Button } from '../ui/Button'

export type PaginationBarProps = {
  page: number
  totalPages: number
  totalElements?: number
  size?: number
  onPageChange?: (page: number) => void
  label?: string
  pageSizeOptions?: readonly number[]
  onPageSizeChange?: (size: number) => void
}

export function PaginationBar({
  label = 'Pagination',
  onPageChange,
  onPageSizeChange,
  page,
  pageSizeOptions,
  size,
  totalElements,
  totalPages,
}: PaginationBarProps) {
  if (totalPages <= 0) return null

  const displayPage = page + 1
  const start = totalElements && size ? page * size + 1 : 0
  const end = totalElements && size ? Math.min((page + 1) * size, totalElements) : 0
  return (
    <nav aria-label={label} className="pagination-bar">
      <p className="pagination-summary">
        {totalElements !== undefined && size !== undefined
          ? `${start}–${end} of ${totalElements}`
          : null}
        {totalElements !== undefined && size !== undefined ? ' · ' : null}
        <span aria-current="page">
          Page {displayPage} of {totalPages}
        </span>
      </p>
      {onPageSizeChange && pageSizeOptions && size ? (
        <label className="pagination-size-control">
          <span>Rows per page</span>
          <select
            aria-label="Rows per page"
            className="select"
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            value={size}
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      {onPageChange ? (
        <div className="pagination-actions">
          <Button disabled={page <= 0} onClick={() => onPageChange(page - 1)} variant="secondary">
            Previous
          </Button>
          <Button
            disabled={page >= totalPages - 1}
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
