import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { MemoryRouter, useLocation } from 'react-router-dom'
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
  description: 'Build maintainable application features.',
  location: 'Matara',
  workMode: 'HYBRID',
  status: 'ACTIVE',
  shortlistGuidanceValue: 12,
  notes: 'Coordinate through the department office.',
  requiredSkills: [
    {
      requiredSkillId: '44444444-4444-4444-8444-444444444444',
      skillId: '55555555-5555-4555-8555-555555555555',
      skillName: 'TypeScript',
      requiredCompetencyLevel: 'INTERMEDIATE',
    },
  ],
  version: 5,
  createdAt: '2026-07-18T08:00:00Z',
  updatedAt: '2026-07-20T08:30:00Z',
}

function page(items: InternshipRequest[]) {
  return {
    items,
    page: {
      page: 0,
      size: 20,
      totalElements: items.length,
      totalPages: items.length ? 1 : 0,
      sort: 'createdAt,desc',
    },
  }
}

function LocationProbe() {
  return <output data-testid="location">{useLocation().search}</output>
}

function renderWorkspace(initialEntry = '/admin/internships') {
  server.use(
    http.get('/api/v1/admin/internship-requests', () => HttpResponse.json(page([request]))),
    http.get('/api/v1/admin/internship-requests/:requestId', () => HttpResponse.json(request)),
    http.get('/api/v1/admin/companies', () =>
      HttpResponse.json({
        items: [company],
        page: { page: 0, size: 100, totalElements: 1, totalPages: 1, sort: 'name,asc' },
      }),
    ),
  )

  return render(
    <QueryClientProvider client={createQueryClient()}>
      <NotificationProvider>
        <MemoryRouter initialEntries={[initialEntry]}>
          <InternshipRequestWorkspace
            onClearCompany={() => undefined}
            selectedCompany={company}
            selectedCompanyId={company.companyId}
          />
          <LocationProbe />
        </MemoryRouter>
      </NotificationProvider>
    </QueryClientProvider>,
  )
}

describe('InternshipRequestWorkspace', () => {
  it('renders server data and preserves company query state when request filters change', async () => {
    const user = userEvent.setup()
    renderWorkspace('/admin/internships?companyActive=false')
    expect(await screen.findByText('Software Engineering Intern')).toBeInTheDocument()
    expect(screen.getByText('TypeScript')).toBeInTheDocument()

    await user.selectOptions(screen.getByLabelText('Filter requests by lifecycle status'), 'ACTIVE')
    expect(screen.getByTestId('location')).toHaveTextContent('companyActive=false')
    expect(screen.getByTestId('location')).toHaveTextContent('requestStatus=ACTIVE')
  })

  it('shows required skills and updates an editable request with its current version', async () => {
    const user = userEvent.setup()
    const patch = vi.fn()
    server.use(
      http.patch(
        '/api/v1/admin/internship-requests/:requestId',
        async ({ request: apiRequest }) => {
          patch(apiRequest.headers.get('If-Match'), await apiRequest.json())
          return HttpResponse.json({ ...request, title: 'Platform Engineering Intern', version: 6 })
        },
      ),
    )
    renderWorkspace()
    await user.click(await screen.findByRole('button', { name: 'View request' }))
    const details = await screen.findByRole('dialog', { name: 'Internship request details' })
    expect(within(details).getByText('Intermediate')).toBeInTheDocument()
    await user.click(within(details).getByRole('button', { name: 'Edit request' }))

    const edit = await screen.findByRole('dialog', { name: 'Edit internship request' })
    const title = within(edit).getByLabelText(/Internship role title/i)
    await user.clear(title)
    await user.type(title, 'Platform Engineering Intern')
    await user.click(within(edit).getByRole('button', { name: 'Save request' }))

    await waitFor(() => expect(patch).toHaveBeenCalled())
    expect(patch).toHaveBeenCalledWith(
      '"5"',
      expect.objectContaining({
        title: 'Platform Engineering Intern',
        requiredSkills: [
          {
            skillId: '55555555-5555-4555-8555-555555555555',
            requiredCompetencyLevel: 'INTERMEDIATE',
          },
        ],
      }),
    )
  })

  it('cancels through an explicit confirmation while preserving the request record', async () => {
    const user = userEvent.setup()
    const remove = vi.fn()
    server.use(
      http.delete('/api/v1/admin/internship-requests/:requestId', ({ request: apiRequest }) => {
        remove(apiRequest.headers.get('If-Match'))
        return new HttpResponse(null, { status: 204 })
      }),
    )
    renderWorkspace()
    await user.click(await screen.findByRole('button', { name: 'View request' }))
    const details = await screen.findByRole('dialog', { name: 'Internship request details' })
    await user.click(within(details).getByRole('button', { name: 'Cancel request' }))

    const confirmation = await screen.findByRole('dialog', { name: 'Cancel internship request' })
    expect(
      within(confirmation).getByText(/remain available for administrative history/i),
    ).toBeInTheDocument()
    await user.click(within(confirmation).getByRole('button', { name: 'Cancel request' }))
    await waitFor(() => expect(remove).toHaveBeenCalledWith('"5"'))
  })

  it('reloads the latest request after a stale edit while preserving entered values', async () => {
    const user = userEvent.setup()
    let detailReads = 0
    renderWorkspace()
    server.use(
      http.get('/api/v1/admin/internship-requests/:requestId', () => {
        detailReads += 1
        return HttpResponse.json({ ...request, version: detailReads > 1 ? 6 : 5 })
      }),
      http.patch('/api/v1/admin/internship-requests/:requestId', () =>
        HttpResponse.json({ title: 'Precondition Failed', status: 412 }, { status: 412 }),
      ),
    )

    await user.click(await screen.findByRole('button', { name: 'View request' }))
    const details = await screen.findByRole('dialog', { name: 'Internship request details' })
    await user.click(within(details).getByRole('button', { name: 'Edit request' }))
    const edit = await screen.findByRole('dialog', { name: 'Edit internship request' })
    const title = within(edit).getByLabelText(/Internship role title/i)
    await user.clear(title)
    await user.type(title, 'Preserved role title')
    await user.click(within(edit).getByRole('button', { name: 'Save request' }))

    expect(await within(edit).findByRole('alert')).toBeInTheDocument()
    expect(title).toHaveValue('Preserved role title')
    await waitFor(() => expect(detailReads).toBeGreaterThanOrEqual(2))
  })
})
