import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { PaginationBar } from '../../../shared/components/data/PaginationBar'
import { SearchInput } from '../../../shared/components/data/SearchInput'
import { SortSelect } from '../../../shared/components/data/SortSelect'
import { EmptyState } from '../../../shared/components/feedback/EmptyState'
import { ErrorState } from '../../../shared/components/feedback/ErrorState'
import { LoadingBoundary } from '../../../shared/components/feedback/LoadingBoundary'
import { SkeletonBlock } from '../../../shared/components/feedback/SkeletonBlock'
import { SelectField } from '../../../shared/components/forms/SelectField'
import { Button } from '../../../shared/components/ui/Button'
import { Chip } from '../../../shared/components/ui/Chip'
import { StatusBadge } from '../../../shared/components/ui/StatusBadge'
import type { Company } from '../../internship-management/types/internshipManagementTypes'
import type { useShortlists } from '../hooks/useShortlists'
import type { ShortlistsUrlState } from '../types/shortlistTypes'

type ShortlistListQuery = ReturnType<typeof useShortlists>

const dateFormatter = new Intl.DateTimeFormat('en-LK', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const shortlistSortOptions = [
  { value: 'updatedAt,desc', label: 'Recently updated' },
  { value: 'createdAt,desc', label: 'Recently created' },
  { value: 'companyName,asc', label: 'Company name · A–Z' },
  { value: 'roleTitle,asc', label: 'Role title · A–Z' },
] as const

export function ShortlistDirectory({
  companies,
  companyError,
  companyLoading,
  onSearchInputChange,
  onStateChange,
  searchInput,
  selectedShortlistId,
  shortlists,
  state,
}: {
  companies: Company[]
  companyError?: unknown
  companyLoading: boolean
  onSearchInputChange: (value: string) => void
  onStateChange: (patch: Partial<ShortlistsUrlState>) => void
  searchInput: string
  selectedShortlistId?: string
  shortlists: ShortlistListQuery
  state: ShortlistsUrlState
}) {
  const listError = shortlists.isError ? mapApiError(shortlists.error, 'protected') : null
  const companyLoadError = companyError ? mapApiError(companyError, 'protected') : null
  const hasFilters = Boolean(state.search || state.status || state.companyId)
  const selectedCompanyExists = companies.some((company) => company.companyId === state.companyId)

  const clearFilters = () => {
    onSearchInputChange('')
    onStateChange({
      search: '',
      status: undefined,
      companyId: undefined,
    })
  }

  return (
    <section
      aria-labelledby="shortlist-directory-title"
      className="section-card shortlist-directory"
    >
      <div className="shortlist-directory-heading">
        <div>
          <h2 id="shortlist-directory-title">Shortlists</h2>
          <p>Choose one shortlist to review its manually selected candidates.</p>
        </div>
        <Chip>{shortlists.data?.page.totalElements ?? 0} shortlists</Chip>
      </div>

      <div className="shortlist-directory-toolbar">
        <label>
          <span>Search shortlists</span>
          <SearchInput
            aria-label="Search shortlists"
            maxLength={120}
            onChange={(event) => onSearchInputChange(event.target.value)}
            placeholder="Company, role, or shortlist name"
            value={searchInput}
          />
        </label>

        <label>
          <span>Company</span>
          <SelectField
            aria-describedby={companyLoadError ? 'shortlist-company-filter-error' : undefined}
            aria-label="Filter shortlists by company"
            disabled={companyLoading}
            onChange={(event) =>
              onStateChange({
                companyId: event.target.value || undefined,
              })
            }
            value={state.companyId ?? ''}
          >
            <option value="">All companies</option>
            {state.companyId && !selectedCompanyExists ? (
              <option value={state.companyId}>Selected company</option>
            ) : null}
            {companies.map((company) => (
              <option key={company.companyId} value={company.companyId}>
                {company.name}
              </option>
            ))}
          </SelectField>
        </label>

        <label>
          <span>Status</span>
          <SelectField
            aria-label="Filter shortlists by status"
            onChange={(event) =>
              onStateChange({
                status:
                  event.target.value === 'DRAFT' || event.target.value === 'FINALIZED'
                    ? event.target.value
                    : undefined,
              })
            }
            value={state.status ?? ''}
          >
            <option value="">All statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="FINALIZED">Finalized</option>
          </SelectField>
        </label>

        <label>
          <span>Sort</span>
          <SortSelect
            aria-label="Sort shortlists"
            onChange={(event) =>
              onStateChange({
                sort: event.target.value as ShortlistsUrlState['sort'],
              })
            }
            value={state.sort}
          >
            {shortlistSortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SortSelect>
        </label>
      </div>

      {companyLoadError ? (
        <p className="shortlist-filter-message" id="shortlist-company-filter-error" role="alert">
          Company options are unavailable. Existing shortlist results can still be reviewed.
        </p>
      ) : null}

      <p aria-live="polite" className="shortlist-updating">
        {shortlists.isFetching && !shortlists.isPending ? 'Updating shortlists…' : ''}
      </p>

      <LoadingBoundary
        isLoading={shortlists.isPending}
        label="Loading shortlist directory"
        minHeight={520}
        skeleton={<SkeletonBlock height={420} lines={0} variant="card" />}
      >
        {listError ? (
          <ErrorState
            correlationId={listError.correlationId}
            message={listError.message}
            onAction={() => void shortlists.refetch()}
            title="Shortlists unavailable"
          />
        ) : shortlists.data?.items.length ? (
          <>
            <ul className="shortlist-directory-list">
              {shortlists.data.items.map((shortlist) => {
                const selected = shortlist.shortlistId === selectedShortlistId
                return (
                  <li key={shortlist.shortlistId}>
                    <button
                      aria-pressed={selected}
                      className={`shortlist-directory-item ${selected ? 'is-selected' : ''}`.trim()}
                      onClick={() =>
                        onStateChange({
                          selectedShortlistId: shortlist.shortlistId,
                        })
                      }
                      type="button"
                    >
                      <span className="shortlist-directory-item-heading">
                        <span>
                          <strong>{shortlist.name || shortlist.request.title}</strong>
                          <small>{shortlist.request.companyName}</small>
                        </span>
                        <StatusBadge
                          tone={shortlist.status === 'FINALIZED' ? 'success' : 'neutral'}
                        >
                          {shortlist.status === 'FINALIZED' ? 'Finalized' : 'Draft'}
                        </StatusBadge>
                      </span>

                      <span className="shortlist-directory-item-summary">
                        <span>{shortlist.selectedCandidateCount} selected</span>
                        <span>
                          Guidance:{' '}
                          {shortlist.guidanceValue === null
                            ? 'Not provided'
                            : shortlist.guidanceValue}
                        </span>
                      </span>

                      <span className="shortlist-directory-item-updated">
                        Updated {dateFormatter.format(new Date(shortlist.updatedAt))}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>

            <PaginationBar
              label="Shortlist pages"
              onPageChange={(page) => onStateChange({ page })}
              onPageSizeChange={(size) =>
                onStateChange({
                  size: size as ShortlistsUrlState['size'],
                })
              }
              page={shortlists.data.page.page}
              pageSizeOptions={[20, 50, 100]}
              size={shortlists.data.page.size}
              totalElements={shortlists.data.page.totalElements}
              totalPages={shortlists.data.page.totalPages}
            />
          </>
        ) : (
          <EmptyState
            action={
              hasFilters ? (
                <Button onClick={clearFilters} variant="secondary">
                  Clear search and filters
                </Button>
              ) : undefined
            }
            message={
              hasFilters
                ? 'No shortlists match the current search and filters.'
                : 'Create a draft shortlist from Candidate Filtering to review selected candidates here.'
            }
            title={hasFilters ? 'No matching shortlists' : 'No shortlists yet'}
          />
        )}
      </LoadingBoundary>
    </section>
  )
}
