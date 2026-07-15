import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '../../../mocks/server'
import { renderWithProviders } from '../../../test/renderWithProviders'
import { StudentDashboardPage } from '../pages/StudentDashboardPage'

const dashboardApiPath = '/api/v1/me/dashboard/metrics'

function metricCard(label: string) {
  const labelElement = screen.getByText(label)
  const card = labelElement.closest('article')

  if (!card) {
    throw new Error(`Metric card was not found for ${label}.`)
  }

  return within(card)
}

async function metricCardAsync(label: string, value: string) {
  await screen.findByText(label)
  return metricCard(label).findByText(value)
}

describe('StudentDashboardPage', () => {
  it('renders persisted Student summary metrics from the API', async () => {
    renderWithProviders(<StudentDashboardPage />)

    expect(
      screen.getByRole('status', {
        name: 'Loading student dashboard',
      }),
    ).toBeInTheDocument()

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Student Dashboard',
      }),
    ).toBeInTheDocument()

    expect(metricCard('Portfolio projects').getByText('3')).toBeInTheDocument()

    expect(metricCard('Declared skills').getByText('8')).toBeInTheDocument()

    expect(metricCard('Shortlisted internships').getByText('1')).toBeInTheDocument()

    expect(metricCard('Official cumulative GPA').getByText('3.42')).toBeInTheDocument()

    expect(screen.getByText(/last updated/i).querySelector('time')).toHaveAttribute(
      'datetime',
      '2026-07-15T04:30:00Z',
    )
  })

  it('shows an explicit unavailable state when no committed GPA exists', async () => {
    server.use(
      http.get(dashboardApiPath, () =>
        HttpResponse.json({
          projectCount: 0,
          shortlistedInternshipCount: 0,
          declaredSkillCount: 0,
          officialCumulativeGpa: null,
          lastUpdatedAt: '2026-07-15T04:30:00Z',
        }),
      ),
    )

    renderWithProviders(<StudentDashboardPage />)

    expect(await metricCardAsync('Official cumulative GPA', 'Not available')).toBeInTheDocument()

    expect(metricCard('Portfolio projects').getByText('0')).toBeInTheDocument()
  })

  it('renders a safe API error and can recover through the retry action', async () => {
    const user = userEvent.setup()

    server.use(
      http.get(dashboardApiPath, () =>
        HttpResponse.json(
          {
            type: 'https://uor-cv-system/errors/dashboard-not-found',
            title: 'Dashboard not found',
            status: 404,
            code: 'DASHBOARD_NOT_FOUND',
            message: 'Dashboard summary was not found.',
            correlationId: 'dashboard-test-404',
          },
          { status: 404 },
        ),
      ),
    )

    renderWithProviders(<StudentDashboardPage />)

    expect(
      await screen.findByRole('heading', {
        level: 2,
        name: 'Dashboard unavailable',
      }),
    ).toBeInTheDocument()

    expect(screen.getByText('The requested information could not be found.')).toBeInTheDocument()

    expect(screen.getByText('Reference: dashboard-test-404')).toBeInTheDocument()

    server.use(
      http.get(dashboardApiPath, () =>
        HttpResponse.json({
          projectCount: 2,
          shortlistedInternshipCount: 0,
          declaredSkillCount: 5,
          officialCumulativeGpa: 3.5,
          lastUpdatedAt: '2026-07-16T04:30:00Z',
        }),
      ),
    )

    await user.click(screen.getByRole('button', { name: 'Try again' }))

    expect(await metricCardAsync('Portfolio projects', '2')).toBeInTheDocument()

    expect(metricCard('Official cumulative GPA').getByText('3.50')).toBeInTheDocument()
  })
})
