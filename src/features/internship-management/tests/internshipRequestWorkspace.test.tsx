import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { createQueryClient } from '../../../app/config/queryClient'
import { NotificationProvider } from '../../../app/providers/NotificationProvider'
import { server } from '../../../mocks/server'
import type { Company, InternshipRequest } from '../types/internshipManagementTypes'
import { InternshipRequestWorkspace } from '../components/InternshipRequestWorkspace'

const company: Company = {
  companyId: '11111111-1111-4111-8111-111111111111',
  name: 'Example Technologies',
  websiteUrl: null,
  contactPerson: 'Nimali Perera',
  contactEmail: 'nimali@example.test',
  contactPhone: null,
  notes: null,
  active: true,
  version: 2,
  createdAt: '2026-07-01T08:00:00Z',
  updatedAt: '2026-07-20T08:00:00Z',
}
const request: InternshipRequest = {
  requestId: '33333333-3333-4333-8333-333333333333',
  company,
  title: 'Software Engineering Intern',
  description: null,
  location: null,
  workMode: null,
  status: 'ACTIVE',
  shortlistGuidanceValue: 12,
  notes: null,
  requiredSkills: [
    {
      requiredSkillId: '44444444-4444-4444-8444-444444444444',
      skillId: '55555555-5555-4555-8555-555555555555',
      skillName: 'TypeScript',
      requiredCompetencyLevel: null,
    },
  ],
  version: 5,
  createdAt: '2026-07-18T08:00:00Z',
  updatedAt: '2026-07-20T08:30:00Z',
}

function renderWorkspace() {
  server.use(
    http.get('/api/v1/admin/internship-requests', () =>
      HttpResponse.json({
        items: [request],
        page: { page: 0, size: 20, totalElements: 1, totalPages: 1, sort: 'createdAt,desc' },
      }),
    ),
    http.get('/api/v1/admin/internship-requests/:requestId', () => HttpResponse.json(request)),
  )
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <NotificationProvider>
        <MemoryRouter>
          <InternshipRequestWorkspace
            selectedCompany={company}
            selectedCompanyId={company.companyId}
          />
        </MemoryRouter>
      </NotificationProvider>
    </QueryClientProvider>,
  )
}

describe('InternshipRequestWorkspace wireframe behavior', () => {
  it('renders only the role, guidance, mapped skills and wireframe actions', async () => {
    const user = userEvent.setup()
    renderWorkspace()
    expect(await screen.findByText('Software Engineering Intern')).toBeInTheDocument()
    expect(
      screen.getByText('Required Shortlist Limit Count: Max 12 Candidates'),
    ).toBeInTheDocument()
    expect(screen.getByText('Mapped Skills: TypeScript')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Deep Dive' }))
    const dialog = await screen.findByRole('dialog', { name: 'Candidate Selection Criteria' })
    expect(within(dialog).getByText('Maximum Shortlist Limit')).toBeInTheDocument()
    expect(within(dialog).getByText('TypeScript')).toBeInTheDocument()
  })

  it('deletes through the exact confirmation and sends the request version', async () => {
    const user = userEvent.setup()
    const remove = vi.fn()
    server.use(
      http.delete('/api/v1/admin/internship-requests/:requestId', ({ request: apiRequest }) => {
        remove(apiRequest.headers.get('If-Match'))
        return new HttpResponse(null, { status: 204 })
      }),
    )
    renderWorkspace()
    await screen.findByText('Software Engineering Intern')
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    const dialog = await screen.findByRole('dialog', { name: 'Confirm Deletion' })
    expect(
      within(dialog).getByText('Are you sure you want to delete this internship request?'),
    ).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Delete' }))
    await waitFor(() => expect(remove).toHaveBeenCalledWith('"5"'))
  })
})
