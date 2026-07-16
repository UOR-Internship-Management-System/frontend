import { useEffect } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Link, MemoryRouter, Outlet, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { routePaths } from '../config/routePaths'
import { ThemeProvider } from '../providers/ThemeProvider'
import { RootLayout } from './RootLayout'

function PersistentStudentShell({ onMount }: { onMount: () => void }) {
  useEffect(() => {
    onMount()
  }, [onMount])

  return (
    <section aria-label="Persistent student shell">
      <Link to={routePaths.studentDashboard}>Dashboard</Link>
      <Link to={routePaths.studentProfile}>Profile</Link>
      <Link to={routePaths.studentSkills}>Skills</Link>
      <Link to={routePaths.studentProjects}>Projects</Link>
      <Outlet />
    </section>
  )
}

function renderRoot(initialPath: string, onStudentShellMount = vi.fn()) {
  return render(
    <ThemeProvider>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route element={<RootLayout />}>
            <Route element={<PersistentStudentShell onMount={onStudentShellMount} />}>
              <Route path={routePaths.studentDashboard} element={<h1>Dashboard page</h1>} />
              <Route path={routePaths.studentProfile} element={<h1>Profile page</h1>} />
              <Route path={routePaths.studentSkills} element={<h1>Skills page</h1>} />
              <Route path={routePaths.studentProjects} element={<h1>Projects page</h1>} />
            </Route>

            <Route path={routePaths.adminDashboard} element={<h1>Admin page</h1>} />
            <Route path={routePaths.studentLogin} element={<h1>Student login page</h1>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </ThemeProvider>,
  )
}

describe('RootLayout', () => {
  it('keeps the protected student shell mounted across nested route transitions', async () => {
    const user = userEvent.setup()
    const onStudentShellMount = vi.fn()
    const { container } = renderRoot(routePaths.studentProfile, onStudentShellMount)

    expect(container.querySelector('.app-header')).not.toBeInTheDocument()
    expect(container.querySelector('.app-footer')).not.toBeInTheDocument()
    expect(onStudentShellMount).toHaveBeenCalledOnce()

    await user.click(screen.getByRole('link', { name: 'Dashboard' }))

    expect(await screen.findByRole('heading', { name: 'Dashboard page' })).toBeInTheDocument()
    expect(onStudentShellMount).toHaveBeenCalledOnce()
  })

  it('keeps Skills and Projects inside the persistent Student workspace shell', async () => {
    const user = userEvent.setup()
    const onStudentShellMount = vi.fn()
    const { container } = renderRoot(routePaths.studentSkills, onStudentShellMount)

    expect(container.querySelector('.app-header')).not.toBeInTheDocument()
    expect(container.querySelector('.app-main')).toHaveClass('app-main-student-workspace')
    expect(screen.getByRole('heading', { name: 'Skills page' })).toBeInTheDocument()
    expect(onStudentShellMount).toHaveBeenCalledOnce()

    await user.click(screen.getByRole('link', { name: 'Projects' }))

    expect(await screen.findByRole('heading', { name: 'Projects page' })).toBeInTheDocument()
    expect(container.querySelector('.app-header')).not.toBeInTheDocument()
    expect(container.querySelector('.app-main')).toHaveClass('app-main-student-workspace')
    expect(onStudentShellMount).toHaveBeenCalledOnce()
  })

  it('preserves the existing global header for the Admin workspace without a footer', () => {
    const { container } = renderRoot(routePaths.adminDashboard)

    expect(container.querySelector('.app-header')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'CV Management' })).toBeInTheDocument()
    expect(container.querySelector('.app-footer')).not.toBeInTheDocument()
  })

  it('keeps standalone authentication routes isolated from workspace chrome', () => {
    const { container } = renderRoot(routePaths.studentLogin)

    expect(container.querySelector('.app-header')).not.toBeInTheDocument()
    expect(container.querySelector('.app-footer')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /switch to dark mode/i })).toBeInTheDocument()
  })
})
