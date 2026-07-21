import { QueryClientProvider } from '@tanstack/react-query'
import { act, render, renderHook, screen, waitFor, within } from '@testing-library/react'
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
const shortlistId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
const now = '2026-07-20T09:30:00Z'

const matchingDeclaredSkills = Array.from({ length: 4 }, (_, index) => ({
  declaredSkillId: `${index + 5}5555555-5555-4555-8555-555555555555`,
  skillId: `${index + 5}6666666-6666-4666-8666-666666666666`,
  skillName: ['TypeScript', 'React', 'Git', 'SQL'][index],
  competencyLevel: 'INTERMEDIATE' as const,
  version: 1,
  createdAt: now,
  updatedAt: now,
}))

const candidate = {
  studentId,
  indexNumber: 'SC/2022/12345',
  fullName: 'Ayesha Perera',
  officialGpa: null,
  gpaAvailabilityStatus: 'NOT_AVAILABLE' as const,
  matchingDeclaredSkills,
  declaredSkillCount: 7,
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
  matchMode: 'AND',
  runId,
  candidateSearch: '',
  candidateSort: 'officialGpa,desc',
  candidatePage: 0,
  candidateSize: 20,
}

function renderWorkspace(updateState = vi.fn()) {
  server.use(
    http.get('/api/v1/admin/candidate-filtering/runs/:runId', () =>
      HttpResponse.json({
        filterRunId: runId,
        request: {
          requestId,
          companyId,
          companyName: 'Example Technologies',
          title: 'Software Engineering Intern',
          status: 'ACTIVE',
          shortlistGuidanceValue: 10,
        },
        criteria: {
          requestId,
          runtimeGpaLowerBound: null,
          runtimeGpaUpperBound: null,
          requestSkillIds: [],
          additionalSkillIds: [],
          skillMatchMode: 'AND',
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
          size: 20,
          totalElements: 1,
          totalPages: 1,
          sort: 'officialGpa,desc',
        },
      }),
    ),
  )
  function WorkspaceHarness() {
    const selection = useCandidateSelection(runId)
    return (
      <CandidateResultsWorkspace
        candidateSearchInput=""
        selection={selection}
        setCandidateSearchInput={() => undefined}
        state={state}
        updateState={updateState}
      />
    )
  }

  render(
    <QueryClientProvider client={createQueryClient()}>
      <NotificationProvider>
        <MemoryRouter>
          <WorkspaceHarness />
        </MemoryRouter>
      </NotificationProvider>
    </QueryClientProvider>,
  )
  return updateState
}

describe('CandidateResultsWorkspace', () => {
  it('preserves selections within a run and clears them when the run changes', async () => {
    const { rerender, result } = renderHook(
      ({ activeRunId }) => useCandidateSelection(activeRunId),
      { initialProps: { activeRunId: runId } },
    )
    act(() => result.current.toggle(candidate))
    expect(result.current.candidates.has(studentId)).toBe(true)
    rerender({ activeRunId: '99999999-9999-4999-8999-999999999999' })
    await waitFor(() => expect(result.current.candidates.size).toBe(0))
  })

  it('renders factual candidate data and keeps manual selection explicit', async () => {
    const user = userEvent.setup()
    renderWorkspace()
    const student = await screen.findByRole('link', { name: 'Ayesha Perera' })
    expect(student).toHaveAttribute('href', `/admin/students/${studentId}`)
    expect(screen.getByText('Not available')).toBeInTheDocument()
    expect(screen.getByText('7 declared skills')).toBeInTheDocument()
    expect(screen.getByText('2 active shortlists')).toBeInTheDocument()

    const checkbox = screen.getByRole('checkbox', {
      name: 'Select Ayesha Perera (SC/2022/12345)',
    })
    expect(checkbox).not.toBeChecked()
    await user.click(checkbox)
    expect(checkbox).toBeChecked()
    expect(screen.getByRole('button', { name: 'Review selected (1)' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Review selected (1)' }))
    const review = await screen.findByRole('dialog', { name: 'Selected candidates' })
    expect(within(review).getByText('1 candidate selected.')).toBeInTheDocument()
    await user.click(within(review).getByRole('button', { name: 'Remove Ayesha Perera' }))
    expect(within(review).getByText('0 candidates selected.')).toBeInTheDocument()
    await user.click(within(review).getByRole('button', { name: 'Done' }))
    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: 'Selected candidates' })).not.toBeInTheDocument(),
    )

    await user.click(screen.getByRole('button', { name: 'View all 4' }))
    const dialog = await screen.findByRole('dialog', { name: 'Matching declared skills' })
    expect(within(dialog).getByText('SQL')).toBeInTheDocument()
  })

  it('selects and clears every candidate on the current page explicitly', async () => {
    const user = userEvent.setup()
    renderWorkspace()
    const candidateCheckbox = await screen.findByRole('checkbox', {
      name: 'Select Ayesha Perera (SC/2022/12345)',
    })
    const pageCheckbox = screen.getByRole('checkbox', {
      name: 'Select all candidates on this page',
    })
    const row = candidateCheckbox.closest('tr')

    await user.click(pageCheckbox)
    expect(pageCheckbox).toBeChecked()
    expect(candidateCheckbox).toBeChecked()
    expect(row).toHaveClass('candidate-row-selected')

    await user.click(pageCheckbox)
    expect(pageCheckbox).not.toBeChecked()
    expect(candidateCheckbox).not.toBeChecked()
    expect(row).not.toHaveClass('candidate-row-selected')
  })

  it('delegates server sort changes to URL state', async () => {
    const user = userEvent.setup()
    const updateState = renderWorkspace()
    await screen.findByText('Ayesha Perera')
    await user.selectOptions(screen.getByLabelText('Sort'), 'fullName,asc')
    expect(updateState).toHaveBeenCalledWith({ candidateSort: 'fullName,asc' })
  })

  it('creates one draft and batch-adds only the explicitly selected Students', async () => {
    const user = userEvent.setup()
    const createCall = vi.fn()
    const addCall = vi.fn()
    renderWorkspace()
    server.use(
      http.post('/api/v1/admin/shortlists', async ({ request }) => {
        createCall(await request.json())
        return HttpResponse.json(
          {
            shortlistId,
            request: {
              requestId,
              companyId,
              companyName: 'Example Technologies',
              title: 'Software Engineering Intern',
              status: 'ACTIVE',
              shortlistGuidanceValue: 10,
            },
            filterRunId: runId,
            name: null,
            status: 'DRAFT',
            guidanceValue: 10,
            selectedCandidateCount: 0,
            guidanceExceeded: false,
            guidanceWarning: null,
            version: 3,
            createdAt: now,
            updatedAt: now,
            finalizedAt: null,
          },
          { status: 201 },
        )
      }),
      http.post('/api/v1/admin/shortlists/:shortlistId/candidates', async ({ request }) => {
        addCall(request.headers.get('If-Match'), await request.json())
        return HttpResponse.json({
          shortlistId,
          addedCount: 1,
          alreadyPresentCount: 0,
          removedCount: 0,
          selectedCandidateCount: 1,
          guidanceExceeded: false,
          version: 4,
        })
      }),
    )

    await user.click(
      await screen.findByRole('checkbox', { name: 'Select Ayesha Perera (SC/2022/12345)' }),
    )
    await user.click(screen.getByRole('button', { name: 'Review selected (1)' }))
    await user.click(
      within(await screen.findByRole('dialog', { name: 'Selected candidates' })).getByRole(
        'button',
        { name: 'Create draft shortlist' },
      ),
    )

    await waitFor(() => expect(addCall).toHaveBeenCalledOnce())
    expect(createCall).toHaveBeenCalledWith({ requestId, filterRunId: runId })
    expect(addCall).toHaveBeenCalledWith('"3"', { studentIds: [studentId] })
  })

  it('shows a safe navigation choice when the request already has a shortlist', async () => {
    const user = userEvent.setup()
    renderWorkspace()
    server.use(
      http.post('/api/v1/admin/shortlists', () =>
        HttpResponse.json({ title: 'Conflict', status: 409 }, { status: 409 }),
      ),
    )
    await user.click(
      await screen.findByRole('checkbox', { name: 'Select Ayesha Perera (SC/2022/12345)' }),
    )
    await user.click(screen.getByRole('button', { name: 'Review selected (1)' }))
    const dialog = await screen.findByRole('dialog', { name: 'Selected candidates' })
    await user.click(within(dialog).getByRole('button', { name: 'Create draft shortlist' }))
    expect(await within(dialog).findByRole('alert')).toHaveTextContent('already exists')
    expect(within(dialog).getByRole('button', { name: 'Open Shortlists' })).toBeInTheDocument()
  })

  it('retries candidate addition without creating another draft after a transient failure', async () => {
    const user = userEvent.setup()
    const createCall = vi.fn()
    const addCall = vi.fn()
    let addAttempt = 0

    renderWorkspace()

    server.use(
      http.post('/api/v1/admin/shortlists', async ({ request }) => {
        createCall(await request.json())

        return HttpResponse.json(
          {
            shortlistId,
            request: {
              requestId,
              companyId,
              companyName: 'Example Technologies',
              title: 'Software Engineering Intern',
              status: 'ACTIVE',
              shortlistGuidanceValue: 10,
            },
            filterRunId: runId,
            name: null,
            status: 'DRAFT',
            guidanceValue: 10,
            selectedCandidateCount: 0,
            guidanceExceeded: false,
            guidanceWarning: null,
            version: 3,
            createdAt: now,
            updatedAt: now,
            finalizedAt: null,
          },
          { status: 201 },
        )
      }),

      http.post('/api/v1/admin/shortlists/:shortlistId/candidates', async ({ request }) => {
        addAttempt += 1

        addCall(request.headers.get('If-Match'), await request.json())

        if (addAttempt === 1) {
          return HttpResponse.json(
            {
              title: 'Service unavailable',
              status: 503,
            },
            { status: 503 },
          )
        }

        return HttpResponse.json({
          shortlistId,
          addedCount: 1,
          alreadyPresentCount: 0,
          removedCount: 0,
          selectedCandidateCount: 1,
          guidanceExceeded: false,
          version: 4,
        })
      }),
    )

    await user.click(
      await screen.findByRole('checkbox', {
        name: 'Select Ayesha Perera (SC/2022/12345)',
      }),
    )

    await user.click(
      screen.getByRole('button', {
        name: 'Review selected (1)',
      }),
    )

    const dialog = await screen.findByRole('dialog', {
      name: 'Selected candidates',
    })

    await user.click(
      within(dialog).getByRole('button', {
        name: 'Create draft shortlist',
      }),
    )

    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      'The draft shortlist was created, but the selected candidates were not added.',
    )

    /*
     * Failed candidate addition must not clear the Admin's selection.
     */
    expect(within(dialog).getByText('1 candidate selected.')).toBeInTheDocument()

    await user.click(
      within(dialog).getByRole('button', {
        name: 'Retry adding candidates',
      }),
    )

    await waitFor(() => {
      expect(addCall).toHaveBeenCalledTimes(2)
    })

    /*
     * The retry must reuse the created shortlist instead of creating
     * another one.
     */
    expect(createCall).toHaveBeenCalledTimes(1)

    expect(addCall).toHaveBeenNthCalledWith(1, '"3"', {
      studentIds: [studentId],
    })

    expect(addCall).toHaveBeenNthCalledWith(2, '"3"', {
      studentIds: [studentId],
    })
  })

  it('requires reopening a changed draft instead of retrying with a stale version', async () => {
    const user = userEvent.setup()

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
              status: 'ACTIVE',
              shortlistGuidanceValue: 10,
            },
            filterRunId: runId,
            name: null,
            status: 'DRAFT',
            guidanceValue: 10,
            selectedCandidateCount: 0,
            guidanceExceeded: false,
            guidanceWarning: null,
            version: 3,
            createdAt: now,
            updatedAt: now,
            finalizedAt: null,
          },
          { status: 201 },
        ),
      ),

      http.post('/api/v1/admin/shortlists/:shortlistId/candidates', () =>
        HttpResponse.json(
          {
            title: 'Precondition failed',
            status: 412,
          },
          { status: 412 },
        ),
      ),
    )

    await user.click(
      await screen.findByRole('checkbox', {
        name: 'Select Ayesha Perera (SC/2022/12345)',
      }),
    )

    await user.click(
      screen.getByRole('button', {
        name: 'Review selected (1)',
      }),
    )

    const dialog = await screen.findByRole('dialog', {
      name: 'Selected candidates',
    })

    await user.click(
      within(dialog).getByRole('button', {
        name: 'Create draft shortlist',
      }),
    )

    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      'The draft shortlist changed after it was created.',
    )

    expect(
      within(dialog).getByRole('button', {
        name: 'Open Shortlists',
      }),
    ).toBeInTheDocument()

    /*
     * Retrying with the same stale If-Match version must not be offered.
     */
    expect(
      within(dialog).queryByRole('button', {
        name: 'Retry adding candidates',
      }),
    ).not.toBeInTheDocument()
  })
})