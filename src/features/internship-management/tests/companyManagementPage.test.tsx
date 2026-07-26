import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { createQueryClient } from '../../../app/config/queryClient'
import { NotificationProvider } from '../../../app/providers/NotificationProvider'
import { server } from '../../../mocks/server'
import { InternshipManagementPage } from '../pages/InternshipManagementPage'
import type { Company } from '../types/internshipManagementTypes'

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
  page: { page: 0, size: 3, totalElements: 1, totalPages: 1, sort: 'name,asc' },
}

function renderPage(onCompanyList = vi.fn(), currentCompany: Company = company) {
  server.use(
    http.get('/api/v1/admin/companies', ({ request }) => {
      onCompanyList(new URL(request.url).search)
      return HttpResponse.json({ ...companyPage, items: [currentCompany] })
    }),
    http.get('/api/v1/admin/companies/:companyId', () => HttpResponse.json(currentCompany)),
    http.get('/api/v1/admin/internship-requests', () =>
      HttpResponse.json({
        items: [],
        page: { page: 0, size: 4, totalElements: 0, totalPages: 0, sort: 'createdAt,desc' },
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

describe('InternshipManagementPage production behavior', () => {
  it('uses server pagination, lists active companies, and enables request creation after selection', async () => {
    const user = userEvent.setup()
    const companyList = vi.fn()
    renderPage(companyList)

    expect(await screen.findByText('Acme Lanka')).toBeInTheDocument()
    expect(
      screen.getByText('https://acme.example · HR representative: Nimali Perera'),
    ).toBeInTheDocument()
    expect(companyList).toHaveBeenCalledWith(
      expect.stringContaining('page=0&size=3&sort=name%2Casc&active=true'),
    )
    expect(screen.getByRole('button', { name: 'Create Internship Request' })).toBeDisabled()

    await user.click(screen.getByText('Acme Lanka'))
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Create Internship Request' })).toBeEnabled(),
    )
    expect(screen.getByRole('navigation', { name: 'Company list pagination' })).toHaveTextContent(
      '1–1 of 1',
    )
  })

  it('uses the wireframe company fields and the contract-backed internal notes field', async () => {
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
    await user.click(screen.getByRole('button', { name: 'Create Company' }))
    const dialog = screen.getByRole('dialog', { name: 'Create Company' })

    await user.click(within(dialog).getByRole('button', { name: 'Create Company' }))
    expect(await within(dialog).findByText('Company name is required.')).toBeInTheDocument()
    expect(within(dialog).getByText('Corporate website is required.')).toBeInTheDocument()
    await user.type(within(dialog).getByLabelText('Company Name'), 'Acme Lanka')
    await user.type(within(dialog).getByLabelText('Website'), 'https://acme.example')
    await user.type(within(dialog).getByLabelText('HR Representative'), 'Nimali Perera')
    await user.type(within(dialog).getByLabelText('HR Email Address'), 'nimali@acme.example')
    await user.type(within(dialog).getByLabelText('Phone Number'), '+94 11 234 5678')
    await user.type(within(dialog).getByLabelText('Internal Notes (Optional)'), 'Preferred partner')
    await user.click(within(dialog).getByRole('button', { name: 'Create Company' }))

    await waitFor(() =>
      expect(create).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Acme Lanka', notes: 'Preferred partner' }),
      ),
    )
  })

  it('uses the default modal width for Create Company', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('Acme Lanka')
    await user.click(screen.getByRole('button', { name: 'Create Company' }))
    expect(screen.getByRole('dialog', { name: 'Create Company' })).toHaveClass('modal-card-default')
  })

  it('deletes through an explicit destructive confirmation and version precondition', async () => {
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
    expect(screen.queryByRole('button', { name: 'Active Company' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Reactivate|Deactivate/ })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Delete Company' }))
    const dialog = await screen.findByRole('dialog', { name: 'Delete Company' })
    expect(
      within(dialog).getByText(/internship requests will also be deleted/i),
    ).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Delete Company' }))
    await waitFor(() => expect(remove).toHaveBeenCalledWith('"4"'))
  })
})
