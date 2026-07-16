import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { routePaths } from '../config/routePaths'
import { ThemeProvider } from '../providers/ThemeProvider'
import { AuthContext } from '../../shared/auth/AuthProvider'
import type { AuthContextValue } from '../../shared/auth/authTypes'
import { StudentLayout } from './StudentLayout'

function installMatchMedia(matches: boolean) {
  const listeners = new Set<(event: MediaQueryListEvent) => void>()
  const mediaQuery = {
    matches,
    media: '(max-width: 899px)',
    onchange: null,
    addEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) =>
      listeners.add(listener),
    removeEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) =>
      listeners.delete(listener),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  } as MediaQueryList

  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => mediaQuery),
  )
}

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

  const result = render(
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

  return { logout, ...result }
}

describe('StudentLayout', () => {
  afterEach(() => {
    document.body.classList.remove('student-mobile-drawer-open')
    vi.unstubAllGlobals()
  })

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
    installMatchMedia(true)
    const user = userEvent.setup()
    const { logout } = renderStudentLayout()
    const menuButton = screen.getByRole('button', { name: 'Open student navigation' })

    await user.click(menuButton)
    expect(menuButton).toHaveAccessibleName('Close student navigation')
    expect(menuButton).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('dialog', { name: 'Student workspace' })).toHaveAttribute(
      'aria-modal',
      'true',
    )
    expect(document.body).toHaveClass('student-mobile-drawer-open')
    await waitFor(() => expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveFocus())

    const drawerCloseButton = within(
      screen.getByRole('dialog', { name: 'Student workspace' }),
    ).getByRole('button', { name: 'Close student navigation' })
    drawerCloseButton.focus()
    await user.keyboard('{Shift>}{Tab}{/Shift}')
    expect(screen.getByRole('button', { name: 'Log Out' })).toHaveFocus()
    await user.keyboard('{Tab}')
    expect(drawerCloseButton).toHaveFocus()

    await user.click(screen.getByRole('button', { name: 'Log Out' }))
    expect(logout).toHaveBeenCalledOnce()

    await user.keyboard('{Escape}')
    await waitFor(() => expect(menuButton).toHaveFocus())
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')
    expect(document.body).not.toHaveClass('student-mobile-drawer-open')
  })

  it('closes the mobile drawer from its backdrop and restores trigger focus', async () => {
    installMatchMedia(true)
    const user = userEvent.setup()
    renderStudentLayout()
    const menuButton = screen.getByRole('button', { name: 'Open student navigation' })

    await user.click(menuButton)
    await user.click(screen.getByTestId('student-sidebar-backdrop'))

    await waitFor(() => expect(menuButton).toHaveFocus())
    expect(screen.queryByTestId('student-sidebar-backdrop')).not.toBeInTheDocument()
  })

  it('preserves the desktop rail state while nested student routes change', async () => {
    installMatchMedia(false)
    const user = userEvent.setup()
    const { container } = renderStudentLayout()

    await user.click(screen.getByRole('button', { name: 'Collapse student sidebar' }))
    expect(container.querySelector('.student-shell')).toHaveClass('student-shell-collapsed')

    await user.click(screen.getByRole('link', { name: 'Dashboard' }))

    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
    expect(container.querySelector('.student-shell')).toHaveClass('student-shell-collapsed')
    expect(screen.getByRole('button', { name: 'Expand student sidebar' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('aria-current', 'page')
  })

  it('provides a student-local theme control and skip link', () => {
    installMatchMedia(false)
    renderStudentLayout()

    expect(screen.getByRole('button', { name: /switch to dark mode/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Skip to student content' })).toHaveAttribute(
      'href',
      '#student-content',
    )
    expect(document.querySelector('#student-content')).toHaveAttribute('tabindex', '-1')
  })
})
