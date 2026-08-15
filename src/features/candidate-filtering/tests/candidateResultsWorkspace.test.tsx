import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { createQueryClient } from '../../../app/config/queryClient'
import { NotificationProvider } from '../../../app/providers/NotificationProvider'
import { server } from '../../../mocks/server'
import { CandidateResultsWorkspace } from '../components/CandidateResultsWorkspace'
import { useCandidateSelection } from '../hooks/useCandidateSelection'
import type { CandidateFilteringUrlState } from '../types/candidateFilteringTypes'

const requestId = '11111111-1111-4111-8111-111111111111'
const companyId = '22222222-2222-4222-8222-222222222222'
const runId = '33333333-3333-4333-8333-333333333333'
const studentId = '44444444-4444-4444-8444-444444444444'
const skillId = '55555555-5555-4555-8555-555555555555'
const declaredSkillId = '66666666-6666-4666-8666-666666666666'
const shortlistId = '77777777-7777-4777-8777-777777777777'
const now = '2026-07-20T09:30:00Z'
const candidate = {
  studentId,
  indexNumber: 'SC/2022/12345',
  fullName: 'Ayesha Perera',
  officialGpa: 3.82,
  gpaAvailabilityStatus: 'AVAILABLE',
  matchingDeclaredSkills: [
    {
      declaredSkillId,
      skillId,
      skillName: 'React',
      competencyLevel: 'ADVANCED',
      version: 1,
      createdAt: now,
      updatedAt: now,
    },
  ],
  declaredSkillCount: 2,
  hasLatestSavedCv: true,
  hasExistingActiveShortlist: true,
  existingActiveShortlistCount: 2,
}
const state: CandidateFilteringUrlState = {
  requestId,
  minGpa: undefined,
  maxGpa: undefined,
  requestSkillIds: [],
  additionalSkillIds: [],
  matchMode: 'OR',
  runId,
  candidateSearch: '',
  candidateSort: 'officialGpa,desc',
  candidatePage: 0,
  candidateSize: 5,
}

function renderWorkspace({
  setCandidateSearchInput = vi.fn(),
  updateState = vi.fn(),
}: {
  setCandidateSearchInput?: ReturnType<typeof vi.fn>
  updateState?: ReturnType<typeof vi.fn>
} = {}) {
  server.use(
    http.get('/api/v1/admin/candidate-filtering/runs/:runId', () =>
      HttpResponse.json({
        filterRunId: runId,
        request: {
          requestId,
          companyId,
          companyName: 'Example Technologies',
          title: 'Software Engineering Intern',
          shortlistGuidanceValue: 10,
        },
        criteria: {
          requestId,
          runtimeGpaLowerBound: null,
          runtimeGpaUpperBound: null,
          requestSkillIds: [],
          additionalSkillIds: [],
          skillMatchMode: 'OR',
        },
        candidateCount: 1,
        createdAt: now,
      }),
    ),
    http.get('/api/v1/admin/candidate-filtering/runs/:runId/candidates', () =>
      HttpResponse.json({
        items: [candidate],
        page: {
          page: 0,
          size: 5,
          totalElements: 1,
          totalPages: 1,
          sort: 'officialGpa,desc',
        },
      }),
    ),
  )
  function Harness() {
    const selection = useCandidateSelection(runId)
    return (
      <CandidateResultsWorkspace
        candidateSearchInput=""
        selection={selection}
        setCandidateSearchInput={setCandidateSearchInput}
        state={state}
        updateState={updateState}
      />
    )
  }
  render(
    <QueryClientProvider client={createQueryClient()}>
      <NotificationProvider>
        <MemoryRouter>
          <Harness />
        </MemoryRouter>
      </NotificationProvider>
    </QueryClientProvider>,
  )
  return { setCandidateSearchInput, updateState }
}

describe('CandidateResultsWorkspace wireframe behavior', () => {
  it('renders factual deterministic results without ranking or CV workflow fields', async () => {
    renderWorkspace()
    expect(await screen.findByRole('link', { name: 'Ayesha Perera' })).toHaveAttribute(
      'href',
      `/admin/students/${studentId}`,
    )
    expect(screen.getByRole('columnheader', { name: 'Cross-shortlist status' })).toBeInTheDocument()
    expect(screen.getByText('Already shortlisted in 2 active requests')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'View skills for Ayesha Perera' })).toBeEnabled()
    expect(
      screen.queryByText(
        new RegExp(['score', 'rank', ['match', 'percentage'].join(' ')].join('|'), 'i'),
      ),
    ).not.toBeInTheDocument()
    expect(screen.queryByText(/latest cv/i)).not.toBeInTheDocument()
  })

  it('connects search, sorting, and page size to server-backed URL state', async () => {
    const user = userEvent.setup()
    const { setCandidateSearchInput, updateState } = renderWorkspace()

    await user.type(
      await screen.findByRole('searchbox', { name: 'Search candidates by name or index number' }),
      'Ayesha',
    )
    expect(setCandidateSearchInput).toHaveBeenLastCalledWith('a')
    expect(setCandidateSearchInput).toHaveBeenCalledTimes(6)

    await user.selectOptions(screen.getByLabelText('Sort candidate results'), 'fullName,asc')
    expect(updateState).toHaveBeenCalledWith({ candidateSort: 'fullName,asc' })

    await user.selectOptions(screen.getByLabelText('Rows per page'), '20')
    expect(updateState).toHaveBeenCalledWith({ candidateSize: 20 })
  })

  it('keeps selection manual across the table and review dialog', async () => {
    const user = userEvent.setup()
    renderWorkspace()
    const checkbox = await screen.findByRole('checkbox', {
      name: 'Select Ayesha Perera (SC/2022/12345)',
    })
    await user.click(checkbox)
    expect(checkbox).toBeChecked()
    await user.click(screen.getByRole('button', { name: 'Review Selected Shortlist' }))
    const dialog = await screen.findByRole('dialog', { name: 'Review Selected Shortlist' })
    expect(within(dialog).getByText('1 candidate selected.')).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Remove Ayesha Perera' }))
    expect(within(dialog).getByText('0 candidates selected.')).toBeInTheDocument()
  })

  it('selects only the currently visible result page', async () => {
    const user = userEvent.setup()
    renderWorkspace()
    const master = await screen.findByRole('checkbox', {
      name: 'Select all candidates on this page',
    })
    await user.click(master)
    await waitFor(() =>
      expect(
        screen.getByRole('checkbox', { name: 'Select Ayesha Perera (SC/2022/12345)' }),
      ).toBeChecked(),
    )
  })

  it('retries only finalization after candidates were added to the draft', async () => {
    const user = userEvent.setup()
    let addCalls = 0
    let finalizeCalls = 0
    renderWorkspace()
    server.use(
      http.post('/api/v1/admin/shortlists', () =>
        HttpResponse.json(
          {
            shortlistId,
            request: {
              requestId,
              companyId,
              companyName: 'Example Technologies',
              title: 'Software Engineering Intern',
              shortlistGuidanceValue: 10,
            },
            filterRunId: runId,
            name: null,
            status: 'DRAFT',
            guidanceValue: 10,
            selectedCandidateCount: 0,
            guidanceExceeded: false,
            guidanceWarning: null,
            version: 1,
            createdAt: now,
            updatedAt: now,
            finalizedAt: null,
          },
          { status: 201 },
        ),
      ),
      http.post('/api/v1/admin/shortlists/:shortlistId/candidates', () => {
        addCalls += 1
        return HttpResponse.json({
          shortlistId,
          addedCount: 1,
          alreadyPresentCount: 0,
          removedCount: 0,
          selectedCandidateCount: 1,
          guidanceExceeded: false,
          version: 2,
        })
      }),
      http.post('/api/v1/admin/shortlists/:shortlistId/finalize', () => {
        finalizeCalls += 1
        if (finalizeCalls === 1) {
          return HttpResponse.json(
            {
              title: 'Unavailable',
              status: 503,
              code: 'SERVICE_UNAVAILABLE',
              message: 'Try again.',
            },
            { status: 503 },
          )
        }
        return HttpResponse.json({
          shortlistId,
          status: 'FINALIZED',
          selectedCandidateCount: 1,
          guidanceValue: 10,
          guidanceExceeded: false,
          guidanceAcknowledged: false,
          version: 3,
          finalizedAt: now,
        })
      }),
    )

    await user.click(
      await screen.findByRole('checkbox', { name: 'Select Ayesha Perera (SC/2022/12345)' }),
    )
    await user.click(screen.getByRole('button', { name: 'Finalize Shortlist' }))
    const dialog = await screen.findByRole('dialog', { name: 'Review Selected Shortlist' })
    await user.click(within(dialog).getByRole('button', { name: 'Finalize Shortlist' }))

    expect(
      await within(dialog).findByText(
        /candidates were added to the draft, but finalization failed/i,
      ),
    ).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Retry finalization' }))

    await waitFor(() => expect(finalizeCalls).toBe(2))
    expect(addCalls).toBe(1)
  })
})
