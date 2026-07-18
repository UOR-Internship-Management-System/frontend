import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { delay, http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { createQueryClient } from '../../../app/config/queryClient'
import { server } from '../../../mocks/server'
import { AdminDashboardPage } from '../pages/AdminDashboardPage'

function renderPage() {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <AdminDashboardPage />
    </QueryClientProvider>,
  )
}

describe('AdminDashboardPage', () => {
  it('shows an accessible skeleton during the initial request', () => {
    server.use(
      http.get('/api/v1/admin/dashboard/metrics', async () => {
        await delay(200)
        return HttpResponse.json({
          totalStudents: 1,
          registeredStudents: 1,
          internshipRequestsCreated: 0,
          lastUpdatedAt: '2026-07-19T04:00:00Z',
        })
      }),
    )
    renderPage()
    expect(screen.getByRole('status', { name: 'Loading admin dashboard' })).toBeInTheDocument()
  })

  it('renders all live metrics and the backend-provided freshness time', async () => {
    renderPage()

    expect(await screen.findByRole('heading', { name: 'Admin Dashboard' })).toBeInTheDocument()
    expect(screen.getByText('248')).toBeInTheDocument()
    expect(screen.getByText('231')).toBeInTheDocument()
    expect(screen.getByText('37')).toBeInTheDocument()
    expect(screen.getByText(/last updated/i)).toBeInTheDocument()
    expect(screen.getAllByRole('article')).toHaveLength(3)
  })

  it('shows service-unavailable feedback and retries without clearing the page', async () => {
    const user = userEvent.setup()
    server.use(
      http.get('/api/v1/admin/dashboard/metrics', () =>
        HttpResponse.json(
          { title: 'Unavailable', status: 503, correlationId: 'dashboard-503' },
          { status: 503 },
        ),
      ),
    )
    renderPage()

    expect(await screen.findByRole('alert', {}, { timeout: 4_000 })).toHaveTextContent(
      'temporarily unavailable',
    )
    expect(screen.getByText(/dashboard-503/i)).toBeInTheDocument()

    server.use(
      http.get('/api/v1/admin/dashboard/metrics', () =>
        HttpResponse.json({
          totalStudents: 10,
          registeredStudents: 9,
          internshipRequestsCreated: 2,
          lastUpdatedAt: '2026-07-19T04:00:00Z',
        }),
      ),
    )
    await user.click(screen.getByRole('button', { name: 'Try again' }))
    await waitFor(() => expect(screen.getByText('10')).toBeInTheDocument())
  })
})
