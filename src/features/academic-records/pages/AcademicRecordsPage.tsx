import { useEffect, useState } from 'react'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { PaginationBar } from '../../../shared/components/data/PaginationBar'
import { SearchInput } from '../../../shared/components/data/SearchInput'
import { EmptyState } from '../../../shared/components/feedback/EmptyState'
import { ErrorState } from '../../../shared/components/feedback/ErrorState'
import { LoadingBoundary } from '../../../shared/components/feedback/LoadingBoundary'
import { PageHeader } from '../../../shared/components/layout/PageHeader'
import { SectionCard } from '../../../shared/components/layout/SectionCard'
import { AcademicGpaSkeleton, AcademicRecordsTableSkeleton } from '../../../shared/skeletons'
import { useDebouncedValue } from '../../../shared/hooks/useDebouncedValue'
import { clampPage } from '../../../shared/utils/clampPage'
import { AcademicRecordsTable } from '../components/AcademicRecordsTable'
import { GpaSummaryCards } from '../components/GpaSummaryCards'
import { useAcademicRecords } from '../hooks/useAcademicRecords'
import { useGpaSummary } from '../hooks/useGpaSummary'

const pageSize = 5
const defaultSort = 'academicYear,desc'

export function AcademicRecordsPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const debouncedSearch = useDebouncedValue(search.trim(), 300)
  const gpa = useGpaSummary()
  const records = useAcademicRecords({
    page,
    size: pageSize,
    sort: defaultSort,
    search: debouncedSearch || undefined,
  })

  useEffect(() => {
    if (!records.data) return
    setPage((current) => clampPage(current, records.data.page.totalElements, pageSize))
  }, [records.data])

  const gpaError = gpa.error ? mapApiError(gpa.error, 'protected') : null
  const recordsError = records.error ? mapApiError(records.error, 'protected') : null

  return (
    <main className="content-stack s5-records-page">
      <PageHeader
        description="Review your official academic results and GPA summary in a clean student-facing record view."
        title="Academic Records"
      />

      <SectionCard aria-label="Computer Science GPA summary" className="s5-records-gpa-section">
        <LoadingBoundary
          isLoading={gpa.isPending}
          label="Loading official GPA"
          minHeight={112}
          skeleton={<AcademicGpaSkeleton />}
        >
          {gpaError ? (
            <ErrorState
              correlationId={gpaError.correlationId}
              message={gpaError.message}
              onAction={() => void gpa.refetch()}
              title="Official GPA unavailable"
            />
          ) : gpa.data ? (
            <GpaSummaryCards summary={gpa.data} />
          ) : null}
        </LoadingBoundary>
      </SectionCard>

      <SectionCard aria-labelledby="official-results-title" className="s5-records-list-section">
        <h2 className="visually-hidden" id="official-results-title">
          Official academic results
        </h2>

        <div className="s5-records-search">
          <SearchInput
            aria-label="Search academic records"
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(0)
            }}
            placeholder="Search by subject code or name"
            value={search}
          />
        </div>

        {records.isFetching && !records.isPending ? (
          <p aria-live="polite" className="s5-records-refreshing">
            Updating records...
          </p>
        ) : null}

        <LoadingBoundary
          isLoading={records.isPending}
          label="Loading academic records"
          minHeight={390}
          skeleton={<AcademicRecordsTableSkeleton includeToolbar={false} />}
        >
          {recordsError ? (
            <ErrorState
              correlationId={recordsError.correlationId}
              message={recordsError.message}
              onAction={() => void records.refetch()}
              title="Academic records unavailable"
            />
          ) : records.data?.items.length === 0 ? (
            <EmptyState
              message={
                debouncedSearch
                  ? `No official results match "${debouncedSearch}".`
                  : 'Official academic results will appear here after they are committed by the university.'
              }
              title={debouncedSearch ? 'No matching records' : 'No academic records yet'}
            />
          ) : records.data?.items.length ? (
            <>
              <AcademicRecordsTable records={records.data.items} />
              {records.data.page.totalPages > 0 ? (
                <PaginationBar
                  label="Academic records pagination"
                  onPageChange={setPage}
                  page={records.data.page.page}
                  size={records.data.page.size}
                  totalElements={records.data.page.totalElements}
                  totalPages={records.data.page.totalPages}
                />
              ) : null}
            </>
          ) : null}
        </LoadingBoundary>
      </SectionCard>
    </main>
  )
}
