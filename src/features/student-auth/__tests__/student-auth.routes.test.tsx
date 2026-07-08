import { screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App from '../../../App'
import { routePaths } from '../../../app/config/routePaths'
import { RequireAdmin, RequireStudent } from '../../../app/router/routeGuards'
import { Button } from '../../../shared/components/ui/Button'
import { removedScopeTerms } from '../../../shared/constants/removedScope'
import { renderWithProviders } from '../../../test/renderWithProviders'

describe('Sprint 1 frontend foundation', () => {
  it('renders the app shell', async () => {
    renderWithProviders(<App />)

    expect(
      await screen.findByRole('heading', { name: /cv management frontend/i }),
    ).toBeInTheDocument()
  })

  it('redirects anonymous students to the student login shell', () => {
    renderWithProviders(
      <MemoryRouter initialEntries={[routePaths.studentDashboard]}>
        <Routes>
          <Route
            element={
              <RequireStudent>
                <div>Protected student content</div>
              </RequireStudent>
            }
            path={routePaths.studentDashboard}
          />
          <Route element={<div>Student login target</div>} path={routePaths.studentLogin} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Student login target')).toBeInTheDocument()
  })

  it('redirects anonymous admins to the admin login shell', () => {
    renderWithProviders(
      <MemoryRouter initialEntries={[routePaths.adminDashboard]}>
        <Routes>
          <Route
            element={
              <RequireAdmin>
                <div>Protected admin content</div>
              </RequireAdmin>
            }
            path={routePaths.adminDashboard}
          />
          <Route element={<div>Admin login target</div>} path={routePaths.adminLogin} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Admin login target')).toBeInTheDocument()
  })

  it('renders a shared UI primitive accessibly', () => {
    renderWithProviders(<Button>Continue</Button>)

    expect(screen.getByRole('button', { name: /continue/i })).toBeEnabled()
  })

  it('keeps removed-scope constants available for guardrails', () => {
    expect(removedScopeTerms.length).toBeGreaterThan(0)
  })
})
