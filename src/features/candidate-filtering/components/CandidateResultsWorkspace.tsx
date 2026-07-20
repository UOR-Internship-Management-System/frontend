import { useEffect, useMemo, useState } from 'react'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { PaginationBar } from '../../../shared/components/data/PaginationBar'
import { SearchInput } from '../../../shared/components/data/SearchInput'
import { SortSelect } from '../../../shared/components/data/SortSelect'
import { EmptyState } from '../../../shared/components/feedback/EmptyState'
import { ErrorState } from '../../../shared/components/feedback/ErrorState'
import { LoadingBoundary } from '../../../shared/components/feedback/LoadingBoundary'
import { SkeletonBlock } from '../../../shared/components/feedback/SkeletonBlock'
import { SectionCard } from '../../../shared/components/layout/SectionCard'
import { Chip } from '../../../shared/components/ui/Chip'
import { clampPage } from '../../../shared/utils/clampPage'
import {
  useCandidateFilteringCandidates,
  useCandidateFilteringRun,
} from '../hooks/useCandidateFiltering'
import type {
  CandidateFilteringCandidate,
  CandidateFilteringUrlState,
} from '../types/candidateFilteringTypes'
import { CandidateResultsTable } from './CandidateResultsTable'
import { CandidateSkillsModal } from './CandidateSkillsModal'

const sortOptions = [
  { value: 'officialGpa,desc', label: 'Official GPA · High to low' },
  { value: 'officialGpa,asc', label: 'Official GPA · Low to high' },
  { value: 'fullName,asc', label: 'Student name · A–Z' },
  { value: 'indexNumber,asc', label: 'Index number · A–Z' },
] as const

export function CandidateResultsWorkspace({
  candidateSearchInput,
  setCandidateSearchInput,
  state,
  updateState,
}: {
  candidateSearchInput: string
  setCandidateSearchInput: (value: string) => void
  state: CandidateFilteringUrlState
  updateState: (patch: Partial<CandidateFilteringUrlState>) => void
}) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [skillsCandidate, setSkillsCandidate] = useState<CandidateFilteringCandidate>()
  const run = useCandidateFilteringRun(state.runId ?? null)
  const query = useMemo(
    () =>
      state.runId
        ? {
            filterRunId: state.runId,
            page: state.candidatePage,
            size: state.candidateSize,
            search: state.candidateSearch,
            sort: state.candidateSort,
          }
        : null,
    [
      state.candidatePage,
      state.candidateSearch,
      state.candidateSize,
      state.candidateSort,
      state.runId,
    ],
  )
  const candidates = useCandidateFilteringCandidates(query)

  useEffect(() => {
    if (!candidates.data) return
    const page = clampPage(
      state.candidatePage,
      candidates.data.page.totalElements,
      state.candidateSize,
    )
    if (page !== state.candidatePage) updateState({ candidatePage: page })
  }, [candidates.data, state.candidatePage, state.candidateSize, updateState])

  useEffect(() => setSelectedIds(new Set()), [state.runId])

  if (!state.runId) {
    return (
      <SectionCard
        aria-labelledby="candidate-results-title"
        className="candidate-results-workspace"
      >
        <EmptyState
          message="Choose runtime criteria and run filtering to view deterministic candidate results."
          title="No filtering run selected"
        />
      </SectionCard>
    )
  }

  const error = run.error ?? candidates.error
  const mappedError = error ? mapApiError(error, 'protected') : null

  return (
    <SectionCard aria-labelledby="candidate-results-title" className="candidate-results-workspace">
      <div className="candidate-results-heading">
        <div>
          <h2 id="candidate-results-title">Candidate results</h2>
          <p>
            {run.data
              ? `${run.data.request.companyName} · ${run.data.request.title}`
              : 'Loading filtering run context…'}
          </p>
        </div>
        <Chip>
          {candidates.data?.page.totalElements ?? run.data?.candidateCount ?? 0} candidates
        </Chip>
      </div>

      <div className="candidate-results-toolbar">
        <label>
          <span>Search candidates</span>
          <SearchInput
            aria-label="Search candidate results"
            onChange={(event) => setCandidateSearchInput(event.target.value)}
            placeholder="Student name or index number"
            value={candidateSearchInput}
          />
        </label>
        <label>
          <span>Sort candidates</span>
          <SortSelect
            onChange={(event) =>
              updateState({ candidateSort: event.target.value as typeof state.candidateSort })
            }
            value={state.candidateSort}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SortSelect>
        </label>
      </div>
      <p aria-live="polite" className="company-updating">
        {candidates.isFetching && !candidates.isPending ? 'Updating candidate results…' : ''}
      </p>

      <LoadingBoundary
        isLoading={run.isPending || candidates.isPending}
        label="Loading candidate results"
        minHeight={440}
        skeleton={<SkeletonBlock height={340} lines={0} variant="card" />}
      >
        {mappedError ? (
          <ErrorState
            correlationId={mappedError.correlationId}
            message={mappedError.message}
            onAction={() => void Promise.all([run.refetch(), candidates.refetch()])}
            title="Candidate results unavailable"
          />
        ) : candidates.data?.items.length ? (
          <>
            <CandidateResultsTable
              candidates={candidates.data.items}
              onShowSkills={setSkillsCandidate}
              onToggle={(candidate) =>
                setSelectedIds((current) => {
                  const next = new Set(current)
                  if (next.has(candidate.studentId)) next.delete(candidate.studentId)
                  else next.add(candidate.studentId)
                  return next
                })
              }
              selectedIds={selectedIds}
            />
            <PaginationBar
              label="Candidate result pages"
              onPageChange={(candidatePage) => updateState({ candidatePage })}
              onPageSizeChange={(candidateSize) =>
                updateState({ candidateSize: candidateSize as 20 | 50 | 100 })
              }
              page={candidates.data.page.page}
              pageSizeOptions={[20, 50, 100]}
              size={candidates.data.page.size}
              totalElements={candidates.data.page.totalElements}
              totalPages={candidates.data.page.totalPages}
            />
          </>
        ) : (
          <EmptyState
            message="No candidates satisfy the current runtime GPA and declared-skill criteria."
            title="No candidates found"
          />
        )}
      </LoadingBoundary>

      {skillsCandidate ? (
        <CandidateSkillsModal
          candidate={skillsCandidate}
          onClose={() => setSkillsCandidate(undefined)}
        />
      ) : null}
    </SectionCard>
  )
}
