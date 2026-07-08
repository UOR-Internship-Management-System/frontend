export function PaginationBar({ page, totalPages }: { page: number; totalPages: number }) {
  return (
    <nav aria-label="Pagination">
      <p>
        Page {page} of {totalPages}
      </p>
    </nav>
  )
}
