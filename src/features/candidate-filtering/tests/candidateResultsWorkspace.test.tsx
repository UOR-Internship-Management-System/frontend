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
const now = '2026-07-20T09:30:00Z'
const candidate = { studentId, indexNumber: 'SC/2022/12345', fullName: 'Ayesha Perera', officialGpa: 3.82, gpaAvailabilityStatus: 'AVAILABLE', matchingDeclaredSkills: [], declaredSkillCount: 2, hasLatestSavedCv: true, hasExistingActiveShortlist: true, existingActiveShortlistCount: 2 }
const state: CandidateFilteringUrlState = { requestId, minGpa: undefined, maxGpa: undefined, requestSkillIds: [], additionalSkillIds: [], matchMode: 'OR', runId, candidateSearch: '', candidateSort: 'officialGpa,desc', candidatePage: 0, candidateSize: 5 }

function renderWorkspace() {
  server.use(
    http.get('/api/v1/admin/candidate-filtering/runs/:runId', () => HttpResponse.json({ filterRunId: runId, request: { requestId, companyId, companyName: 'Example Technologies', title: 'Software Engineering Intern', status: 'ACTIVE', shortlistGuidanceValue: 10 }, criteria: { requestId, runtimeGpaLowerBound: null, runtimeGpaUpperBound: null, requestSkillIds: [], additionalSkillIds: [], skillMatchMode: 'OR' }, candidateCount: 1, createdAt: now })),
    http.get('/api/v1/admin/candidate-filtering/runs/:runId/candidates', () => HttpResponse.json({ items: [candidate], page: { page: 0, size: 5, totalElements: 1, totalPages: 1, sort: 'officialGpa,desc' } })),
  )
  function Harness() {
    const selection = useCandidateSelection(runId)
    return <CandidateResultsWorkspace selection={selection} state={state} updateState={vi.fn()} />
  }
  render(<QueryClientProvider client={createQueryClient()}><NotificationProvider><MemoryRouter><Harness /></MemoryRouter></NotificationProvider></QueryClientProvider>)
}

describe('CandidateResultsWorkspace wireframe behavior', () => {
  it('renders the five-column factual result table without ranking or CV workflow fields', async () => {
    renderWorkspace()
    expect(await screen.findByRole('link', { name: 'Ayesha Perera' })).toHaveAttribute('href', `/admin/students/${studentId}`)
    expect(screen.getByRole('columnheader', { name: 'Shortlisted History' })).toBeInTheDocument()
    expect(screen.getByText('2 Previous Shortlists')).toBeInTheDocument()
    expect(
      screen.queryByText(new RegExp(['score', 'rank', ['match', 'percentage'].join(' ')].join('|'), 'i')),
    ).not.toBeInTheDocument()
    expect(screen.queryByText(/latest cv/i)).not.toBeInTheDocument()
  })

  it('keeps selection manual across the table and review dialog', async () => {
    const user = userEvent.setup()
    renderWorkspace()
    const checkbox = await screen.findByRole('checkbox', { name: 'Select Ayesha Perera (SC/2022/12345)' })
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
    const master = await screen.findByRole('checkbox', { name: 'Select all candidates on this page' })
    await user.click(master)
    await waitFor(() => expect(screen.getByRole('checkbox', { name: 'Select Ayesha Perera (SC/2022/12345)' })).toBeChecked())
  })
})
