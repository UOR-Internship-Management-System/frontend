import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { routePaths } from '../config/routePaths'
import { ThemeProvider } from '../providers/ThemeProvider'
import { AuthContext } from '../../shared/auth/AuthProvider'
import type { AuthContextValue } from '../../shared/auth/authTypes'
import { AdminLayout } from './AdminLayout'

function installMatchMedia(matches: boolean) {
  const mediaQuery = {
    matches,
    media: '(max-width: 899px)',
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  } as MediaQueryList
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => mediaQuery),
  )
}

function renderAdminLayout(initialPath: string = routePaths.adminDashboard) {
  const logout = vi.fn().mockResolvedValue(undefined)
  const auth: AuthContextValue = {
    status: 'authenticated',
    currentUser: {
      userId: 'admin-user-1',
      accountId: 'admin-account-1',
      email: 'admin@dcs.ruh.ac.lk',
      displayName: 'Department Admin',
      roles: ['ADMIN'],
      primaryRole: 'ADMIN',
    },
    isAuthenticated: true,
    roles: ['ADMIN'],
    primaryRole: 'ADMIN',
    role: 'ADMIN',
    userId: 'admin-user-1',
    signInWithToken: vi.fn(),
    refreshCurrentUser: vi.fn(),
    logout,
  }

  return {
    logout,
    ...render(
      <ThemeProvider>
        <AuthContext.Provider value={auth}>
          <MemoryRouter initialEntries={[initialPath]}>
            <Routes>
              <Route element={<AdminLayout />}>
                <Route path={routePaths.adminDashboard} element={<h1>Admin Dashboard</h1>} />
                <Route path={routePaths.adminAcademicLedger} element={<h1>Academic Ledger</h1>} />
                <Route path={routePaths.adminStudents} element={<h1>Registered Students</h1>} />
                <Route
                  path={routePaths.adminInternships}
                  element={<h1>Internship Management</h1>}
                />
                <Route
                  path={routePaths.adminCandidateFiltering}
                  element={<h1>Candidate Filtering</h1>}
                />
                <Route path={routePaths.adminShortlists} element={<h1>Shortlists</h1>} />
              </Route>
            </Routes>
          </MemoryRouter>
        </AuthContext.Provider>
      </ThemeProvider>,
    ),
  }
}

describe('AdminLayout', () => {
  afterEach(() => {
    document.body.classList.remove('admin-mobile-drawer-open')
    vi.unstubAllGlobals()
  })

  it('shows the approved Admin destinations with active-route state', () => {
    installMatchMedia(false)
    renderAdminLayout(routePaths.adminAcademicLedger)
    const navigation = screen.getByRole('navigation', { name: 'Admin navigation' })

    expect(within(navigation).getAllByRole('link')).toHaveLength(6)
    expect(screen.getByRole('link', { name: 'Academic Ledger' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByRole('link', { name: 'Registered Students' })).toHaveAttribute(
      'href',
      routePaths.adminStudents,
    )
    expect(screen.getByRole('link', { name: 'Internship Management' })).toHaveAttribute(
      'href',
      routePaths.adminInternships,
    )
    expect(screen.getByRole('link', { name: 'Candidate Filtering' })).toHaveAttribute(
      'href',
      routePaths.adminCandidateFiltering,
    )
    expect(screen.getByRole('link', { name: 'Shortlists' })).toHaveAttribute(
      'href',
      routePaths.adminShortlists,
    )
  })

  it('provides one theme control, identity, route focus target, and logout', async () => {
    installMatchMedia(false)
    const user = userEvent.setup()
    const { logout } = renderAdminLayout()

    expect(screen.queryByRole('link', { name: 'Skip to admin content' })).not.toBeInTheDocument()
    expect(document.querySelector('#admin-content')).toHaveAttribute('tabindex', '-1')
    expect(screen.getAllByText('Department Admin')).toHaveLength(2)
    expect(screen.getAllByRole('button', { name: /switch to dark mode/i })).toHaveLength(1)

    await user.click(screen.getByRole('button', { name: 'Log Out' }))
    expect(logout).toHaveBeenCalledOnce()
  })

  it('preserves the desktop collapsed state while Admin navigation remains usable', async () => {
    installMatchMedia(false)
    const user = userEvent.setup()
    const { container } = renderAdminLayout()

    await user.click(screen.getByRole('button', { name: 'Collapse admin sidebar' }))
    expect(container.querySelector('.admin-shell')).toHaveClass('student-shell-collapsed')

    await user.click(screen.getByRole('link', { name: 'Academic Ledger' }))
    expect(await screen.findByRole('heading', { name: 'Academic Ledger' })).toBeInTheDocument()
    expect(container.querySelector('.admin-shell')).toHaveClass('student-shell-collapsed')
    expect(screen.getByRole('button', { name: 'Expand admin sidebar' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Academic Ledger' })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  it('traps focus in the mobile drawer and restores the menu trigger', async () => {
    installMatchMedia(true)
    const user = userEvent.setup()
    renderAdminLayout()
    const menu = screen.getByRole('button', { name: 'Open admin navigation' })

    await user.click(menu)
    expect(screen.getByRole('dialog', { name: 'Admin workspace' })).toHaveAttribute(
      'aria-modal',
      'true',
    )
    expect(document.body).toHaveClass('admin-mobile-drawer-open')
    await waitFor(() => expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveFocus())

    await user.keyboard('{Escape}')
    await waitFor(() => expect(menu).toHaveFocus())
    expect(document.body).not.toHaveClass('admin-mobile-drawer-open')
  })
})
