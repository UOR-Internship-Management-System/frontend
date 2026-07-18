import { useEffect } from 'react'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { PaginationBar } from '../../../shared/components/data/PaginationBar'
import { EmptyState } from '../../../shared/components/feedback/EmptyState'
import { ErrorState } from '../../../shared/components/feedback/ErrorState'
import { PageHeader } from '../../../shared/components/layout/PageHeader'
import { Button } from '../../../shared/components/ui/Button'
import { TableSkeleton } from '../../../shared/skeletons'
import { RegisteredStudentsTable } from '../components/RegisteredStudentsTable'
import { RegisteredStudentsToolbar } from '../components/RegisteredStudentsToolbar'
import { useRegisteredStudents } from '../hooks/useRegisteredStudents'
import { useRegisteredStudentsUrlState } from '../hooks/useRegisteredStudentsUrlState'

export function RegisteredStudentsPage() {
  const { query, searchInput, setSearchInput, updateQuery } = useRegisteredStudentsUrlState()
  const studentsQuery = useRegisteredStudents(query)

  useEffect(() => {
    const totalPages = studentsQuery.data?.page.totalPages ?? 0
    if (totalPages > 0 && query.page >= totalPages) updateQuery({ page: totalPages - 1 })
  }, [query.page, studentsQuery.data?.page.totalPages, updateQuery])

  if (studentsQuery.isPending) return <TableSkeleton variant="registered-students" />

  if (studentsQuery.isError) {
    const error = mapApiError(studentsQuery.error, 'protected')
    return (
      <div className="content-stack">
        <PageHeader
          description="Search and inspect the registered Student directory."
          eyebrow="Administration"
          title="Registered Students"
        />
        <ErrorState
          correlationId={error.correlationId}
          message={error.message}
          onAction={() => void studentsQuery.refetch()}
          title="Unable to load registered Students"
        />
      </div>
    )
  }

  const hasFilters = Boolean(query.search || query.level)
  const hasStudents = studentsQuery.data.items.length > 0

  return (
    <div className="content-stack registered-students-page">
      <PageHeader
        description="Search and inspect the registered Student directory."
        eyebrow="Administration"
        title="Registered Students"
      />
      <section aria-labelledby="registered-students-roster-title" className="section-card">
        <RegisteredStudentsToolbar
          isFetching={studentsQuery.isFetching}
          onQueryChange={updateQuery}
          onSearchChange={setSearchInput}
          query={query}
          searchInput={searchInput}
          totalElements={studentsQuery.data.page.totalElements}
        />
        {hasStudents ? <RegisteredStudentsTable students={studentsQuery.data.items} /> : null}
        {!hasStudents && hasFilters ? (
          <EmptyState
            action={
              <Button
                onClick={() => {
                  setSearchInput('')
                  updateQuery({ search: '', level: undefined })
                }}
                variant="secondary"
              >
                Clear search and filters
              </Button>
            }
            message="No registered Students match the current search or level filter."
            title="No matching Students"
          />
        ) : null}
        {!hasStudents && !hasFilters ? (
          <EmptyState
            message="No registered Students are currently available."
            title="Student directory is empty"
          />
        ) : null}
        <PaginationBar
          label="Registered Student pages"
          onPageChange={(page) => updateQuery({ page })}
          onPageSizeChange={(size) => updateQuery({ size: size as 20 | 50 | 100 })}
          page={studentsQuery.data.page.page}
          pageSizeOptions={[20, 50, 100]}
          size={studentsQuery.data.page.size}
          totalElements={studentsQuery.data.page.totalElements}
          totalPages={studentsQuery.data.page.totalPages}
        />
      </section>
    </div>
  )
}
