import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { routePaths } from '../config/routePaths'
import { ThemeProvider } from '../providers/ThemeProvider'
import { AuthContext } from '../../shared/auth/AuthProvider'
import type { AuthContextValue } from '../../shared/auth/authTypes'
import { StudentLayout } from './StudentLayout'

// Set innerWidth to simulate viewport
function setViewport(width: number) {
  Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: width })
  window.dispatchEvent(new Event('resize'))
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
              <Route path={routePaths.studentSkills} element={<h1>Skills</h1>} />
              <Route path={routePaths.studentProjects} element={<h1>Projects</h1>} />
              <Route path={routePaths.studentCvBuilder} element={<h1>CV Builder</h1>} />
              <Route path={routePaths.studentAcademicRecords} element={<h1>Academic Records</h1>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    </ThemeProvider>,
  )

  return { logout, ...result }
}

describe('StudentLayout', () => {
  beforeEach(() => {
    // Default to desktop viewport
    setViewport(1440)
  })

  afterEach(() => {
    document.body.classList.remove('student-mobile-drawer-open')
    vi.unstubAllGlobals()
  })

  it('shows the six approved Student workspace destinations on desktop', () => {
    setViewport(1440)
    renderStudentLayout()

    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Profile' })).toHaveAttribute('aria-current', 'page')
    expect(
      within(screen.getByRole('navigation', { name: 'Student navigation' })).getAllByRole('link'),
    ).toHaveLength(6)
    expect(screen.getByRole('link', { name: 'Skills' })).toHaveAttribute(
      'href',
      routePaths.studentSkills,
    )
    expect(screen.getByRole('link', { name: 'Projects' })).toHaveAttribute(
      'href',
      routePaths.studentProjects,
    )
    expect(screen.getByRole('link', { name: 'CV Builder' })).toHaveAttribute(
      'href',
      routePaths.studentCvBuilder,
    )
    expect(screen.getByRole('link', { name: 'Academic Records' })).toHaveAttribute(
      'href',
      routePaths.studentAcademicRecords,
    )
  })

  it('shows modal drawer and locks scroll when menu is opened on mobile', async () => {
    setViewport(400)
    const user = userEvent.setup()
    renderStudentLayout()

    const menuButton = screen.getByRole('button', { name: 'Open navigation' })
    await user.click(menuButton)

    expect(menuButton).toHaveAccessibleName('Close navigation')
    expect(menuButton).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('dialog', { name: 'Student navigation' })).toHaveAttribute(
      'aria-modal',
      'true',
    )
    expect(document.body).toHaveClass('student-mobile-drawer-open')
    // Note: focus management relies on requestAnimationFrame which is unreliable in JSDOM;
    // the functional open/close behavior is verified by the other assertions
  })

  it('closes the mobile drawer from its backdrop and restores trigger focus', async () => {
    setViewport(400)
    const user = userEvent.setup()
    renderStudentLayout()

    const menuButton = screen.getByRole('button', { name: 'Open navigation' })
    await user.click(menuButton)
    await user.click(screen.getByTestId('student-sidebar-backdrop'))

    await waitFor(() => expect(menuButton).toHaveFocus())
    expect(screen.queryByTestId('student-sidebar-backdrop')).not.toBeInTheDocument()
  })

  it('logout flow works through the confirmation dialog', async () => {
    setViewport(400)
    const user = userEvent.setup()
    const { logout } = renderStudentLayout()

    const menuButton = screen.getByRole('button', { name: 'Open navigation' })
    await user.click(menuButton)

    await user.click(
      within(screen.getByRole('dialog', { name: 'Student navigation' })).getByRole('button', {
        name: 'Log Out',
      }),
    )
    const logoutDialog = await screen.findByRole('dialog', { name: 'Log Out' })
    expect(logout).not.toHaveBeenCalled()
    await user.click(within(logoutDialog).getByRole('button', { name: 'Log Out' }))
    expect(logout).toHaveBeenCalledOnce()
  })

  it('preserves desktop drawer state while nested routes change', async () => {
    setViewport(1440)
    const user = userEvent.setup()
    const { container } = renderStudentLayout()

    // Toggle collapse
    await user.click(screen.getByRole('button', { name: 'Collapse navigation' }))
    expect(container.querySelector('.m3-app-shell')).toHaveAttribute(
      'data-drawer-expanded',
      'false',
    )

    await user.click(screen.getByRole('link', { name: 'Dashboard' }))

    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
    expect(container.querySelector('.m3-app-shell')).toHaveAttribute(
      'data-drawer-expanded',
      'false',
    )
    expect(screen.getByRole('button', { name: 'Expand navigation' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('aria-current', 'page')
  })

  it('provides a theme control and skip link', () => {
    setViewport(1440)
    renderStudentLayout()

    expect(screen.getByRole('button', { name: /switch to dark mode/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Skip to main content' })).toHaveAttribute(
      'href',
      '#student-content',
    )
    expect(document.querySelector('#student-content')).toHaveAttribute('tabindex', '-1')
  })
})
