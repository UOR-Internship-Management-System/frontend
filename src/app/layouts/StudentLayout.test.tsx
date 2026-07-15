import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { routePaths } from '../config/routePaths'
import { ThemeProvider } from '../providers/ThemeProvider'
import { AuthContext } from '../../shared/auth/AuthProvider'
import type { AuthContextValue } from '../../shared/auth/authTypes'
import { StudentLayout } from './StudentLayout'

function renderStudentLayout(initialPath = routePaths.studentProfile) {
  const logout = vi.fn().mockResolvedValue(undefined)
  const auth: AuthContextValue = {
    status: 'authenticated',
    currentUser: {
      userId: 'student-user-1',
      accountId: 'student-account-1',
      email: 'student@dcs.ruh.ac.lk',
      displayName: 'Test Student',
      roles: ['STUDENT'],
      primaryRole: 'STUDENT',
    },
    isAuthenticated: true,
    roles: ['STUDENT'],
    primaryRole: 'STUDENT',
    role: 'STUDENT',
    userId: 'student-user-1',
    signInWithToken: vi.fn(),
    refreshCurrentUser: vi.fn(),
    logout,
  }

  render(
    <ThemeProvider>
      <AuthContext.Provider value={auth}>
        <MemoryRouter initialEntries={[initialPath]}>
          <Routes>
            <Route element={<StudentLayout />}>
              <Route path={routePaths.studentDashboard} element={<h1>Dashboard</h1>} />
              <Route path={routePaths.studentProfile} element={<h1>Profile</h1>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    </ThemeProvider>,
  )

  return { logout }
}

describe('StudentLayout', () => {
  it('shows only Dashboard and Profile with the current route identified', () => {
    renderStudentLayout()

    expect(screen.getAllByText('Test Student')).toHaveLength(2)
    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Profile' })).toHaveAttribute('aria-current', 'page')
    expect(
      within(screen.getByRole('navigation', { name: 'Student navigation' })).getAllByRole('link'),
    ).toHaveLength(2)
    expect(
      screen.queryByRole('link', { name: /skills|projects|cv builder|academic/i }),
    ).not.toBeInTheDocument()
  })

  it('supports focus-safe mobile navigation and logout', async () => {
    const user = userEvent.setup()
    const { logout } = renderStudentLayout()
    const menuButton = screen.getByRole('button', { name: 'Open student navigation' })

    await user.click(menuButton)
    expect(menuButton).toHaveAccessibleName('Close student navigation')
    expect(menuButton).toHaveAttribute('aria-expanded', 'true')
    await waitFor(() => expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveFocus())

    await user.keyboard('{Escape}')
    await waitFor(() => expect(menuButton).toHaveFocus())
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')

    await user.click(screen.getByRole('button', { name: 'Log Out' }))
    expect(logout).toHaveBeenCalledOnce()
  })
})
