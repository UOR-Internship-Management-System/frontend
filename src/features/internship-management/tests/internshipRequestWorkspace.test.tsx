import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { createQueryClient } from '../../../app/config/queryClient'
import { NotificationProvider } from '../../../app/providers/NotificationProvider'
import { server } from '../../../mocks/server'
import { InternshipRequestWorkspace } from '../components/InternshipRequestWorkspace'
import type { Company, InternshipRequest } from '../types/internshipManagementTypes'

const company: Company = {
  companyId: '11111111-1111-4111-8111-111111111111',
  name: 'Example Technologies',
  websiteUrl: null,
  contactPerson: 'Nimali Perera',
  contactEmail: 'nimali@example.test',
  contactPhone: null,
  notes: null,
  version: 2,
  createdAt: '2026-07-01T08:00:00Z',
  updatedAt: '2026-07-20T08:00:00Z',
}
const request: InternshipRequest = {
  requestId: '33333333-3333-4333-8333-333333333333',
  company,
  title: 'Software Engineering Intern',
  description: 'Support product engineering work.',
  shortlistGuidanceValue: 12,
  requiredSkills: [
    {
      requiredSkillId: '44444444-4444-4444-8444-444444444444',
      skillId: '55555555-5555-4555-8555-555555555555',
      skillName: 'TypeScript',
    },
  ],
  version: 5,
  createdAt: '2026-07-18T08:00:00Z',
  updatedAt: '2026-07-20T08:30:00Z',
}

function renderWorkspace(onList = vi.fn()) {
  server.use(
    http.get('/api/v1/admin/internship-requests', ({ request: apiRequest }) => {
      onList(new URL(apiRequest.url).search)
      return HttpResponse.json({
        items: [request],
        page: { page: 0, size: 4, totalElements: 1, totalPages: 1, sort: 'createdAt,desc' },
      })
    }),
    http.get('/api/v1/admin/internship-requests/:requestId', () => HttpResponse.json(request)),
  )
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <NotificationProvider>
        <MemoryRouter>
          <InternshipRequestWorkspace
            onRetrySelectedCompany={() => undefined}
            selectedCompany={company}
            selectedCompanyId={company.companyId}
          />
        </MemoryRouter>
      </NotificationProvider>
    </QueryClientProvider>,
  )
}

describe('InternshipRequestWorkspace wireframe behavior', () => {
  it('uses server query state and displays only scope-safe request details', async () => {
    const user = userEvent.setup()
    const list = vi.fn()
    renderWorkspace(list)

    expect(await screen.findByText('Software Engineering Intern')).toBeInTheDocument()
    expect(list).toHaveBeenCalledWith(
      expect.stringContaining(`page=0&size=4&sort=createdAt%2Cdesc&companyId=${company.companyId}`),
    )
    expect(
      screen.getByText('Shortlist guidance: 12 candidates · Advisory only'),
    ).toBeInTheDocument()
    expect(screen.getByText('Required skills: TypeScript')).toBeInTheDocument()
    expect(screen.queryByText(/GPA/i)).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'View Details' }))
    const dialog = await screen.findByRole('dialog', { name: 'Internship Request Details' })
    expect(within(dialog).getByText('12 candidates (advisory only)')).toBeInTheDocument()
    expect(within(dialog).getByText('TypeScript')).toBeInTheDocument()
    expect(within(dialog).queryByText('Work Mode')).not.toBeInTheDocument()
    expect(within(dialog).queryByText('Location')).not.toBeInTheDocument()
    expect(within(dialog).queryByText('Administrative Notes')).not.toBeInTheDocument()
  })

  it('deletes through explicit destructive wording and sends the request version', async () => {
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
    expect(
      screen.queryByRole('button', { name: 'Active Internship Request' }),
    ).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Delete Internship Request' }))
    const dialog = await screen.findByRole('dialog', { name: 'Delete Internship Request' })
    expect(within(dialog).getByText(/cannot be undone/i)).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Delete Internship Request' }))
    await waitFor(() => expect(remove).toHaveBeenCalledWith('"5"'))
  })
})
