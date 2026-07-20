import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { createQueryClient } from '../../../app/config/queryClient'
import { routePaths } from '../../../app/config/routePaths'
import { NotificationProvider } from '../../../app/providers/NotificationProvider'
import { server } from '../../../mocks/server'
import type { Company } from '../types/internshipManagementTypes'
import { InternshipManagementPage } from '../pages/InternshipManagementPage'

const activeCompany: Company = {
  companyId: '11111111-1111-4111-8111-111111111111',
  name: 'Acme Lanka',
  websiteUrl: 'https://acme.example',
  contactPerson: 'Nimali Perera',
  contactEmail: 'nimali@acme.example',
  contactPhone: '+94 11 234 5678',
  notes: 'Preferred contact by email.',
  active: true,
  version: 4,
  createdAt: '2026-07-01T08:00:00+05:30',
  updatedAt: '2026-07-18T09:30:00+05:30',
}

const inactiveCompany: Company = {
  ...activeCompany,
  companyId: '22222222-2222-4222-8222-222222222222',
  name: 'Legacy Systems',
  active: false,
  version: 7,
}

function page(items: Company[]) {
  return {
    items,
    page: {
      page: 0,
      size: 20,
      totalElements: items.length,
      totalPages: items.length ? 1 : 0,
      sort: 'name,asc',
    },
  }
}

function LocationProbe() {
  return <output data-testid="location">{useLocation().search}</output>
}

function renderPage(initialEntry: string = routePaths.adminInternships) {
  server.use(
    http.get('/api/v1/admin/companies', () =>
      HttpResponse.json(page([activeCompany, inactiveCompany])),
    ),
    http.get('/api/v1/admin/companies/:companyId', ({ params }) => {
      const company =
        params.companyId === inactiveCompany.companyId ? inactiveCompany : activeCompany
      return HttpResponse.json(company)
    }),
  )
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <NotificationProvider>
        <MemoryRouter initialEntries={[initialEntry]}>
          <Routes>
            <Route
              path={routePaths.adminInternships}
              element={
                <>
                  <InternshipManagementPage />
                  <LocationProbe />
                </>
              }
            />
          </Routes>
        </MemoryRouter>
      </NotificationProvider>
    </QueryClientProvider>,
  )
}

describe('InternshipManagementPage company workspace', () => {
  it('renders active and inactive companies and stores filters in the URL', async () => {
    const user = userEvent.setup()
    renderPage()
    expect(await screen.findByText('Acme Lanka')).toBeInTheDocument()
    const inactiveRow = screen.getByText('Legacy Systems').closest('tr')
    expect(inactiveRow).toHaveClass('company-row-inactive')
    expect(within(inactiveRow as HTMLTableRowElement).getByText('Inactive')).toBeInTheDocument()

    await user.selectOptions(screen.getByLabelText('Company status'), 'inactive')
    expect(screen.getByTestId('location')).toHaveTextContent('companyActive=false')
    await user.type(screen.getByLabelText('Search companies'), 'Legacy')
    await waitFor(
      () => expect(screen.getByTestId('location')).toHaveTextContent('companySearch=Legacy'),
      { timeout: 2_000 },
    )
  })

  it('validates company creation and normalizes blank nullable fields', async () => {
    const user = userEvent.setup()
    let submittedBody: unknown
    server.use(
      http.post('/api/v1/admin/companies', async ({ request }) => {
        submittedBody = await request.json()
        return HttpResponse.json(
          { ...activeCompany, name: 'New Partner', version: 0 },
          { status: 201 },
        )
      }),
    )
    renderPage()
    await screen.findByText('Acme Lanka')
    await user.click(screen.getByRole('button', { name: 'Add company' }))
    const dialog = screen.getByRole('dialog', { name: 'Add company' })
    await user.click(within(dialog).getByRole('button', { name: 'Add company' }))
    expect(await within(dialog).findByText('Company name is required.')).toBeInTheDocument()

    await user.type(within(dialog).getByLabelText('Company name'), '  New Partner  ')
    await user.click(within(dialog).getByRole('button', { name: 'Add company' }))
    await waitFor(() => expect(submittedBody).toBeDefined())
    expect(submittedBody).toEqual({
      name: 'New Partner',
      websiteUrl: null,
      contactPerson: null,
      contactEmail: null,
      contactPhone: null,
      notes: null,
    })
  })

  it('reactivates an inactive company only through the edit flow', async () => {
    const user = userEvent.setup()
    const patch = vi.fn()
    server.use(
      http.patch('/api/v1/admin/companies/:companyId', async ({ request }) => {
        patch(request.headers.get('If-Match'), await request.json())
        return HttpResponse.json({ ...inactiveCompany, active: true, version: 8 })
      }),
    )
    renderPage(`${routePaths.adminInternships}?companyId=${inactiveCompany.companyId}`)
    await screen.findByText(/unavailable for new internship requests/i)
    const details = screen.getByRole('dialog', { name: 'Company details' })
    await user.click(within(details).getByRole('button', { name: 'Edit and reactivate' }))
    const edit = await screen.findByRole('dialog', { name: 'Edit company' })
    await user.click(within(edit).getByRole('checkbox', { name: /Reactivate this company/i }))
    await user.click(within(edit).getByRole('button', { name: 'Save changes' }))
    await waitFor(() => expect(patch).toHaveBeenCalled())
    expect(patch).toHaveBeenCalledWith('"7"', expect.objectContaining({ active: true }))
  })

  it('describes deactivation safely and preserves the dialog on a linked-request conflict', async () => {
    const user = userEvent.setup()
    const remove = vi.fn()
    server.use(
      http.delete('/api/v1/admin/companies/:companyId', ({ request }) => {
        remove(request.headers.get('If-Match'))
        return HttpResponse.json({ title: 'Conflict', status: 409 }, { status: 409 })
      }),
    )
    renderPage(`${routePaths.adminInternships}?companyId=${activeCompany.companyId}`)
    const deactivateButton = await screen.findByRole('button', { name: 'Deactivate company' })
    await user.click(deactivateButton)
    const confirmation = await screen.findByRole('dialog', { name: 'Deactivate company' })
    expect(
      within(confirmation).getByText(/metadata and existing links are preserved/i),
    ).toBeInTheDocument()
    await user.click(within(confirmation).getByRole('button', { name: 'Deactivate company' }))
    expect(await within(confirmation).findByRole('alert')).toHaveTextContent(
      'linked to an active internship request',
    )
    expect(remove).toHaveBeenCalledWith('"4"')
  })
})
