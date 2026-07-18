import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { createQueryClient } from '../../../app/config/queryClient'
import { routePaths } from '../../../app/config/routePaths'
import { server } from '../../../mocks/server'
import { RegisteredStudentsPage } from '../pages/RegisteredStudentsPage'

function LocationProbe() {
  return <output data-testid="location">{useLocation().search}</output>
}

function renderPage(initialEntry: string = routePaths.adminStudents) {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route
            path={routePaths.adminStudents}
            element={
              <>
                <RegisteredStudentsPage />
                <LocationProbe />
              </>
            }
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('RegisteredStudentsPage', () => {
  it('renders the server roster, count, null GPA, and deep-dive route', async () => {
    renderPage()
    expect(await screen.findByRole('heading', { name: 'Registered Students' })).toBeInTheDocument()
    expect(screen.getByText('6 registered Students')).toBeInTheDocument()
    expect(screen.getByText('Not available')).toBeInTheDocument()
    const kavindiRow = screen.getByText('Kavindi Silva').closest('tr')
    expect(kavindiRow).not.toBeNull()
    expect(
      within(kavindiRow as HTMLTableRowElement).getByRole('link', { name: 'View Deep-Dive' }),
    ).toHaveAttribute('href', '/admin/students/11111111-1111-4111-8111-111111111111')
    expect(screen.getByRole('table')).toHaveAccessibleName('Registered Student roster')
  })

  it('debounces search into URL state and supports mutually exclusive level filters', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('Kavindi Silva')

    await user.type(screen.getByLabelText('Search registered Students'), 'Lahiru')
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('search=Lahiru'), {
      timeout: 2_000,
    })
    expect(await screen.findByText('Lahiru Gunasekara')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Level 4' }))
    expect(screen.getByRole('button', { name: 'Level 4' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByTestId('location')).toHaveTextContent('level=4')
    await user.click(screen.getByRole('button', { name: 'Level 3' }))
    expect(screen.getByRole('button', { name: 'Level 3' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Level 4' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('distinguishes no-results and service error states with recovery actions', async () => {
    const user = userEvent.setup()
    renderPage(`${routePaths.adminStudents}?search=missing`)
    expect(await screen.findByText('No matching Students')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Clear search and filters' })).toBeInTheDocument()

    server.use(
      http.get('/api/v1/admin/students', () =>
        HttpResponse.json(
          { title: 'Unavailable', status: 503, correlationId: 'students-503' },
          { status: 503 },
        ),
      ),
    )
    await user.click(screen.getByRole('button', { name: 'Clear search and filters' }))
    expect(await screen.findByRole('alert', {}, { timeout: 4_000 })).toHaveTextContent(
      'temporarily unavailable',
    )
  })
})
