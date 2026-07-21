import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
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
const requiredSkillId = '33333333-3333-4333-8333-333333333333'
const additionalSkillId = '44444444-4444-4444-8444-444444444444'
const requiredLinkId = '55555555-5555-4555-8555-555555555555'
const runId = '66666666-6666-4666-8666-666666666666'
const clusterId = '77777777-7777-4777-8777-777777777777'
const categoryId = '88888888-8888-4888-8888-888888888888'
const now = '2026-07-20T09:30:00Z'

const company = {
  companyId,
  name: 'Example Technologies',
  websiteUrl: null,
  contactPerson: null,
  contactEmail: null,
  contactPhone: null,
  notes: null,
  active: true,
  version: 1,
  createdAt: now,
  updatedAt: now,
}

const internshipRequest = {
  requestId,
  company,
  title: 'Software Engineering Intern',
  description: null,
  location: 'Matara',
  workMode: 'HYBRID' as const,
  status: 'ACTIVE' as const,
  shortlistGuidanceValue: 10,
  notes: null,
  requiredSkills: [
    {
      requiredSkillId: requiredLinkId,
      skillId: requiredSkillId,
      skillName: 'TypeScript',
      requiredCompetencyLevel: 'INTERMEDIATE' as const,
    },
  ],
  version: 2,
  createdAt: now,
  updatedAt: now,
}

function Harness() {
  const { state, updateState } = useCandidateFilteringUrlState()
  return <CandidateSelectionPanel state={state} updateState={updateState} />
}

function renderPanel(onRun: ReturnType<typeof vi.fn>) {
  server.use(
    http.get('/api/v1/admin/companies', () =>
      HttpResponse.json({
        items: [company],
        page: { page: 0, size: 100, totalElements: 1, totalPages: 1, sort: 'name,asc' },
      }),
    ),
    http.get('/api/v1/admin/internship-requests', () =>
      HttpResponse.json({
        items: [internshipRequest],
        page: { page: 0, size: 100, totalElements: 1, totalPages: 1, sort: 'companyName,asc' },
      }),
    ),
    http.get('/api/v1/admin/internship-requests/:requestId', () =>
      HttpResponse.json(internshipRequest),
    ),
    http.get('/api/v1/skill-taxonomy', () =>
      HttpResponse.json({
        clusters: [
          {
            clusterId,
            name: 'Software Engineering',
            description: null,
            categories: [
              {
                categoryId,
                name: 'Development',
                description: null,
                skills: [
                  { skillId: requiredSkillId, name: 'TypeScript', description: null },
                  { skillId: additionalSkillId, name: 'Python', description: null },
                ],
              },
            ],
          },
        ],
      }),
    ),
    http.post('/api/v1/admin/candidate-filtering/runs', async ({ request }) => {
      const body = (await request.json()) as Record<string, unknown>
      onRun(body)
      return HttpResponse.json(
        {
          filterRunId: runId,
          request: {
            requestId,
            companyId,
            companyName: company.name,
            title: internshipRequest.title,
            status: 'ACTIVE',
            shortlistGuidanceValue: 10,
          },
          criteria: {
            ...body,
            runtimeGpaLowerBound: body.runtimeGpaLowerBound ?? null,
            runtimeGpaUpperBound: body.runtimeGpaUpperBound ?? null,
            requestSkillIds: body.requestSkillIds ?? [],
            additionalSkillIds: body.additionalSkillIds ?? [],
          },
          candidateCount: 3,
          createdAt: now,
        },
        { status: 201 },
      )
    }),
  )

  return render(
    <QueryClientProvider client={createQueryClient()}>
      <MemoryRouter>
        <Harness />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('CandidateSelectionPanel', () => {
  async function selectRequest(user: ReturnType<typeof userEvent.setup>) {
    expect(screen.queryByText('Software Engineering Intern')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Select internship request' }))
    const dialog = await screen.findByRole('dialog', { name: 'Select an internship request' })
    await user.selectOptions(
      within(dialog).getByLabelText('Select company for candidate filtering'),
      companyId,
    )
    await waitFor(() =>
      expect(
        within(dialog).getByLabelText('Select internship request for candidate filtering'),
      ).not.toBeDisabled(),
    )
    await user.selectOptions(
      within(dialog).getByLabelText('Select internship request for candidate filtering'),
      requestId,
    )
    await user.click(within(dialog).getByRole('button', { name: 'Select request' }))
    expect(await screen.findByText('Software Engineering Intern')).toBeInTheDocument()
  }

  it('uses an explicitly selected active request and submits runtime criteria', async () => {
    const user = userEvent.setup()
    const onRun = vi.fn()
    renderPanel(onRun)

    await selectRequest(user)
    expect(await screen.findByRole('button', { name: /TypeScript/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await user.type(screen.getByLabelText('Minimum GPA'), '2.75')
    await user.type(screen.getByLabelText('Maximum GPA'), '4')
    await user.click(screen.getByRole('button', { name: 'Browse custom skills' }))
    const skillDialog = await screen.findByRole('dialog', {
      name: 'Select additional declared skills',
    })
    await user.click(within(skillDialog).getByRole('checkbox', { name: /Python/ }))
    await user.click(within(skillDialog).getByRole('button', { name: 'Apply selected skills' }))
    await user.click(screen.getByRole('switch', { name: 'Matching logic' }))
    await user.click(screen.getByRole('button', { name: 'Run filtering' }))

    await waitFor(() => expect(onRun).toHaveBeenCalledOnce())
    expect(onRun).toHaveBeenCalledWith({
      requestId,
      runtimeGpaLowerBound: 2.75,
      runtimeGpaUpperBound: 4,
      requestSkillIds: [requiredSkillId],
      additionalSkillIds: [additionalSkillId],
      skillMatchMode: 'OR',
    })
  })

  it('blocks reversed GPA bounds before creating a run', async () => {
    const user = userEvent.setup()
    const onRun = vi.fn()
    renderPanel(onRun)
    await selectRequest(user)
    await user.type(screen.getByLabelText('Minimum GPA'), '3.5')
    await user.type(screen.getByLabelText('Maximum GPA'), '3.25')
    await user.click(screen.getByRole('button', { name: 'Run filtering' }))

    expect(await screen.findByText('Minimum GPA cannot exceed maximum GPA.')).toBeInTheDocument()
    expect(onRun).not.toHaveBeenCalled()
  })
})