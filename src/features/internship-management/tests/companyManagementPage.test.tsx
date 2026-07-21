import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { createQueryClient } from '../../../app/config/queryClient'
import { NotificationProvider } from '../../../app/providers/NotificationProvider'
import { server } from '../../../mocks/server'
import type { Company } from '../types/internshipManagementTypes'
import { InternshipManagementPage } from '../pages/InternshipManagementPage'

const company: Company = {
  companyId: '11111111-1111-4111-8111-111111111111',
  name: 'Acme Lanka',
  websiteUrl: 'https://acme.example',
  contactPerson: 'Nimali Perera',
  contactEmail: 'nimali@acme.example',
  contactPhone: '+94 11 234 5678',
  notes: null,
  active: true,
  version: 4,
  createdAt: '2026-07-01T08:00:00Z',
  updatedAt: '2026-07-18T09:30:00Z',
}
const companyPage = {
  items: [company],
  page: { page: 0, size: 20, totalElements: 1, totalPages: 1, sort: 'name,asc' },
}

function renderPage() {
  server.use(
    http.get('/api/v1/admin/companies', () => HttpResponse.json(companyPage)),
    http.get('/api/v1/admin/companies/:companyId', () => HttpResponse.json(company)),
    http.get('/api/v1/admin/internship-requests', () =>
      HttpResponse.json({
        items: [],
        page: { page: 0, size: 20, totalElements: 0, totalPages: 0, sort: 'createdAt,desc' },
      }),
    ),
  )
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <NotificationProvider>
        <MemoryRouter>
          <InternshipManagementPage />
        </MemoryRouter>
      </NotificationProvider>
    </QueryClientProvider>,
  )
}

describe('InternshipManagementPage wireframe behavior', () => {
  it('renders the supplied company row inventory and enables request creation after selection', async () => {
    const user = userEvent.setup()
    renderPage()
    expect(await screen.findByText('Acme Lanka')).toBeInTheDocument()
    expect(screen.getByText('https://acme.example · HR Rep: Nimali Perera')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create internship request' })).toBeDisabled()
    await user.click(screen.getByText('Acme Lanka'))
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Create internship request' })).toBeEnabled(),
    )
    expect(screen.getByRole('navigation', { name: 'Company list pagination' })).toHaveTextContent(
      'Showing 1 to 1 of 1 companies',
    )
  })

  it('uses the five required wireframe fields when creating a company', async () => {
    const user = userEvent.setup()
    const create = vi.fn()
    server.use(
      http.post('/api/v1/admin/companies', async ({ request }) => {
        create(await request.json())
        return HttpResponse.json(company, { status: 201 })
      }),
    )
    renderPage()
    await screen.findByText('Acme Lanka')
    await user.click(screen.getByRole('button', { name: 'Create a Company' }))
    const dialog = screen.getByRole('dialog', { name: 'Create Corporate CRM Profile Parameters' })
    await user.click(within(dialog).getByRole('button', { name: 'Save Profile' }))
    expect(await within(dialog).findByText('Company name is required.')).toBeInTheDocument()
    expect(within(dialog).getByText('Corporate website is required.')).toBeInTheDocument()
    await user.type(within(dialog).getByLabelText('Company Legal Name'), 'Acme Lanka')
    await user.type(within(dialog).getByLabelText('Corporate Website URL'), 'https://acme.example')
    await user.type(within(dialog).getByLabelText('HR Representative Name'), 'Nimali Perera')
    await user.type(
      within(dialog).getByLabelText('Office / HR Email Address'),
      'nimali@acme.example',
    )
    await user.type(within(dialog).getByLabelText('Direct Line Phone'), '+94 11 234 5678')
    await user.click(within(dialog).getByRole('button', { name: 'Save Profile' }))
    await waitFor(() =>
      expect(create).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Acme Lanka', notes: null }),
      ),
    )
  })

  it('opens the exact delete confirmation and submits the version precondition', async () => {
    const user = userEvent.setup()
    const remove = vi.fn()
    server.use(
      http.delete('/api/v1/admin/companies/:companyId', ({ request }) => {
        remove(request.headers.get('If-Match'))
        return new HttpResponse(null, { status: 204 })
      }),
    )
    renderPage()
    await screen.findByText('Acme Lanka')
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    const dialog = await screen.findByRole('dialog', { name: 'Confirm Deletion' })
    expect(
      within(dialog).getByText('Are you sure you want to delete this company?'),
    ).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Delete' }))
    await waitFor(() => expect(remove).toHaveBeenCalledWith('"4"'))
  })
})
