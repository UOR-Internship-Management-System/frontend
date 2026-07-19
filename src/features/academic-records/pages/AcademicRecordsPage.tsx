import { useEffect, useState } from 'react'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { PaginationBar } from '../../../shared/components/data/PaginationBar'
import { SearchInput } from '../../../shared/components/data/SearchInput'
import { SortSelect } from '../../../shared/components/data/SortSelect'
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
import { academicSortOptions } from '../mappers/academicRecordMapper'

const pageSize = 10

export function AcademicRecordsPage() {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('academicYear,desc')
  const [page, setPage] = useState(0)
  const debouncedSearch = useDebouncedValue(search.trim(), 300)
  const gpa = useGpaSummary()
  const records = useAcademicRecords({
    page,
    size: pageSize,
    sort,
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
        description="Review your official Computer Science GPA and committed university results in one read-only workspace."
        eyebrow="Student workspace"
        title="Academic Records"
      />

      <SectionCard aria-labelledby="official-gpa-title" className="s5-records-gpa-section">
        <div className="s5-records-section-heading">
          <div>
            <span className="s5-records-kicker">Official summary</span>
            <h2 id="official-gpa-title">Computer Science GPA</h2>
            <p>Calculated by the university from committed academic records.</p>
          </div>
          <div className="s5-records-read-only-note">
            <span aria-hidden="true" className="material-symbols-outlined">
              verified_user
            </span>
            Read-only
          </div>
        </div>

        <LoadingBoundary
          isLoading={gpa.isPending}
          label="Loading official GPA"
          minHeight={170}
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

      <SectionCard aria-labelledby="committed-records-title" className="s5-records-list-section">
        <div className="s5-records-section-heading">
          <div>
            <span className="s5-records-kicker">University record</span>
            <h2 id="committed-records-title">Committed results</h2>
            <p>
              {records.data?.page.totalElements ?? 0} records from official server metadata. No
              changes can be made here.
            </p>
          </div>
        </div>

        <div className="s5-records-toolbar">
          <label>
            <span>Search records</span>
            <SearchInput
              aria-label="Search academic records"
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(0)
              }}
              placeholder="Course code or title"
              value={search}
            />
          </label>
          <label>
            <span>Sort records</span>
            <SortSelect
              aria-label="Sort academic records"
              onChange={(event) => {
                setSort(event.target.value)
                setPage(0)
              }}
              value={sort}
            >
              {academicSortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </SortSelect>
          </label>
        </div>

        {records.isFetching && !records.isPending ? (
          <p aria-live="polite" className="s5-records-refreshing">
            Updating records...
          </p>
        ) : null}

        <LoadingBoundary
          isLoading={records.isPending}
          label="Loading academic records"
          minHeight={430}
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
                  ? `No committed records match "${debouncedSearch}".`
                  : 'Committed academic results will appear here when they become available.'
              }
              title={debouncedSearch ? 'No matching records' : 'No committed records yet'}
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
