import { QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { createQueryClient } from '../../../app/config/queryClient'
import { server } from '../../../mocks/server'
import { CandidateSelectionPanel } from '../components/CandidateSelectionPanel'
import { useCandidateFilteringUrlState } from '../hooks/useCandidateFilteringUrlState'

const requestId = '11111111-1111-4111-8111-111111111111'
const companyId = '22222222-2222-4222-8222-222222222222'
const runId = '33333333-3333-4333-8333-333333333333'
const now = '2026-07-20T09:30:00Z'
const company = { companyId, name: 'Example Technologies', websiteUrl: null, contactPerson: null, contactEmail: null, contactPhone: null, notes: null, active: true, version: 1, createdAt: now, updatedAt: now }
const internshipRequest = { requestId, company, title: 'Software Engineering Intern', description: null, location: 'Matara', workMode: 'HYBRID', status: 'ACTIVE', shortlistGuidanceValue: 10, notes: null, requiredSkills: [], version: 2, createdAt: now, updatedAt: now }

function Harness() {
  const { state, updateState } = useCandidateFilteringUrlState()
  return <CandidateSelectionPanel state={state} updateState={updateState} />
}

function renderPanel(onRun: ReturnType<typeof vi.fn>) {
  server.use(
    http.get('/api/v1/admin/companies', () => HttpResponse.json({ items: [company], page: { page: 0, size: 100, totalElements: 1, totalPages: 1, sort: 'name,asc' } })),
    http.get('/api/v1/admin/internship-requests', () => HttpResponse.json({ items: [internshipRequest], page: { page: 0, size: 100, totalElements: 1, totalPages: 1, sort: 'companyName,asc' } })),
    http.get('/api/v1/admin/internship-requests/:requestId', () => HttpResponse.json(internshipRequest)),
    http.get('/api/v1/skill-taxonomy', () => HttpResponse.json({ clusters: [] })),
    http.post('/api/v1/admin/candidate-filtering/runs', async ({ request }) => {
      const body = await request.json() as Record<string, unknown>
      onRun(body)
      return HttpResponse.json({ filterRunId: runId, request: { requestId, companyId, companyName: company.name, title: internshipRequest.title, status: 'ACTIVE', shortlistGuidanceValue: 10 }, criteria: { ...body, runtimeGpaLowerBound: body.runtimeGpaLowerBound ?? null, runtimeGpaUpperBound: body.runtimeGpaUpperBound ?? null, requestSkillIds: [], additionalSkillIds: [] }, candidateCount: 1, createdAt: now }, { status: 201 })
    }),
  )
  return render(<QueryClientProvider client={createQueryClient()}><MemoryRouter><Harness /></MemoryRouter></QueryClientProvider>)
}

async function selectRequest(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: /Select internship request/i }))
  const dialog = await screen.findByRole('dialog', { name: 'Select an internship request' })
  await user.selectOptions(within(dialog).getByLabelText('Select company for candidate filtering'), companyId)
  await user.selectOptions(within(dialog).getByLabelText('Select internship request for candidate filtering'), requestId)
  await user.click(within(dialog).getByRole('button', { name: 'Select request' }))
}

describe('CandidateSelectionPanel wireframe behavior', () => {
  it('runs deterministic filtering automatically after request selection and criteria changes', async () => {
    const user = userEvent.setup()
    const onRun = vi.fn()
    renderPanel(onRun)
    await selectRequest(user)
    await waitFor(() => expect(onRun).toHaveBeenCalled(), { timeout: 3000 })
    await user.clear(screen.getByLabelText('Min Bound'))
    await user.type(screen.getByLabelText('Min Bound'), '2.75')
    await waitFor(() => expect(onRun).toHaveBeenLastCalledWith(expect.objectContaining({ runtimeGpaLowerBound: 2.75, skillMatchMode: 'OR' })), { timeout: 3000 })
    expect(screen.queryByRole('button', { name: 'Run filtering' })).not.toBeInTheDocument()
  })

  it('blocks a reversed GPA range before creating a filtering run', async () => {
    const user = userEvent.setup()
    const onRun = vi.fn()
    renderPanel(onRun)
    await selectRequest(user)
    await waitFor(() => expect(onRun).toHaveBeenCalled())
    onRun.mockClear()
    await user.clear(screen.getByLabelText('Min Bound'))
    await user.type(screen.getByLabelText('Min Bound'), '3.5')
    fireEvent.change(screen.getByLabelText('Max Bound'), { target: { value: '3.25' } })
    expect(await screen.findByText('Minimum GPA cannot exceed maximum GPA.')).toBeInTheDocument()
    await new Promise((resolve) => window.setTimeout(resolve, 350))
    expect(onRun).not.toHaveBeenCalled()
  })
})
