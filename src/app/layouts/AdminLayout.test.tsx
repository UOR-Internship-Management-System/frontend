import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { routePaths } from '../config/routePaths'
import { ThemeProvider } from '../providers/ThemeProvider'
import { AuthContext } from '../../shared/auth/AuthProvider'
import type { AuthContextValue } from '../../shared/auth/authTypes'
import { AdminLayout } from './AdminLayout'
import { adminNavigation } from './admin/adminNavigation'

function setViewport(width: number) {
  Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: width })
  window.dispatchEvent(new Event('resize'))
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
  beforeEach(() => {
    setViewport(1440)
  })

  afterEach(() => {
    document.body.classList.remove('admin-mobile-drawer-open')
    vi.unstubAllGlobals()
  })

  it('shows the approved Admin destinations with active-route state', () => {
    setViewport(1440)
    renderAdminLayout(routePaths.adminAcademicLedger)
    const navigation = screen.getByRole('navigation', { name: 'Admin navigation' })

    expect(within(navigation).getAllByRole('link')).toHaveLength(adminNavigation.length)
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

  it('provides a theme control, route focus target, and logout', async () => {
    setViewport(1440)
    const user = userEvent.setup()
    const { logout } = renderAdminLayout()

    expect(document.querySelector('#admin-content')).toHaveAttribute('tabindex', '-1')
    expect(screen.getAllByRole('button', { name: /switch to dark mode/i })).toHaveLength(1)

    await user.click(screen.getByRole('button', { name: 'Log Out' }))
    const logoutDialog = await screen.findByRole('dialog', { name: 'Log Out' })
    expect(logout).not.toHaveBeenCalled()
    await user.click(within(logoutDialog).getByRole('button', { name: 'Log Out' }))
    expect(logout).toHaveBeenCalledOnce()
  })

  it('preserves the desktop collapsed state while Admin navigation remains usable', async () => {
    setViewport(1440)
    const user = userEvent.setup()
    const { container } = renderAdminLayout()

    await user.click(screen.getByRole('button', { name: 'Collapse navigation' }))
    expect(container.querySelector('.m3-app-shell')).toHaveAttribute('data-drawer-expanded', 'false')

    await user.click(screen.getByRole('link', { name: 'Academic Ledger' }))
    expect(await screen.findByRole('heading', { name: 'Academic Ledger' })).toBeInTheDocument()
    expect(container.querySelector('.m3-app-shell')).toHaveAttribute('data-drawer-expanded', 'false')
    expect(screen.getByRole('button', { name: 'Expand navigation' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Academic Ledger' })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  it('shows modal drawer and locks scroll when menu is opened on mobile', async () => {
    setViewport(400)
    const user = userEvent.setup()
    renderAdminLayout()

    const menu = screen.getByRole('button', { name: 'Open navigation' })
    await user.click(menu)

    expect(screen.getByRole('dialog', { name: 'Admin navigation' })).toHaveAttribute(
      'aria-modal',
      'true',
    )
    expect(document.body).toHaveClass('admin-mobile-drawer-open')
    // Note: focus management via requestAnimationFrame is unreliable in JSDOM

    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Admin navigation' })).not.toBeInTheDocument())
    expect(document.body).not.toHaveClass('admin-mobile-drawer-open')
  })
})
