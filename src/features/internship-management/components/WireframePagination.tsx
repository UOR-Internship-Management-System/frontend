type WireframePaginationProps = {
  kind: 'companies' | 'internship requests'
  label: string
  onPageChange: (page: number) => void
  page: number
  pageSize: number
  total: number
}

export function WireframePagination({
  kind,
  label,
  onPageChange,
  page,
  pageSize,
  total,
}: WireframePaginationProps) {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const start = page * pageSize + 1
  const end = Math.min(start + pageSize - 1, total)

  return (
    <nav aria-label={label} className="wireframe-pagination">
      <p>
        Showing {start} to {end} of {total} {kind}
      </p>
      <div>
        <button disabled={page === 0} onClick={() => onPageChange(page - 1)} type="button">
          <span className="material-symbols-outlined">chevron_left</span>
          Previous
        </button>
        {Array.from({ length: pages }, (_, index) => (
          <button
            aria-current={index === page ? 'page' : undefined}
            className={index === page ? 'active' : ''}
            key={index}
            onClick={() => onPageChange(index)}
            type="button"
          >
            {index + 1}
          </button>
        ))}
        <button disabled={page === pages - 1} onClick={() => onPageChange(page + 1)} type="button">
          Next
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
      </div>
    </nav>
  )
}
