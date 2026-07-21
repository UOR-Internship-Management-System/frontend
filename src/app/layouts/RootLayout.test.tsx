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
      <Link to={routePaths.studentCvBuilder}>CV Builder</Link>
      <Link to={routePaths.studentAcademicRecords}>Academic Records</Link>
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
              <Route path={routePaths.studentCvBuilder} element={<h1>CV Builder page</h1>} />
              <Route
                path={routePaths.studentAcademicRecords}
                element={<h1>Academic Records page</h1>}
              />
            </Route>

            <Route path={routePaths.adminDashboard} element={<h1>Admin page</h1>} />
            <Route path={routePaths.adminStudentDetail} element={<h1>Admin Student page</h1>} />
            <Route path={routePaths.adminInternships} element={<h1>Internship Management page</h1>} />
            <Route path={routePaths.adminCandidateFiltering} element={<h1>Candidate Filtering page</h1>} />
            <Route path={routePaths.adminShortlists} element={<h1>Shortlists page</h1>} />
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

  it('keeps both Sprint 5 pages inside the same persistent Student workspace shell', async () => {
    const user = userEvent.setup()
    const onStudentShellMount = vi.fn()
    const { container } = renderRoot(routePaths.studentCvBuilder, onStudentShellMount)

    expect(screen.getByRole('heading', { name: 'CV Builder page' })).toBeInTheDocument()
    expect(container.querySelector('.app-main')).toHaveClass('app-main-student-workspace')

    await user.click(screen.getByRole('link', { name: 'Academic Records' }))

    expect(
      await screen.findByRole('heading', { name: 'Academic Records page' }),
    ).toBeInTheDocument()
    expect(onStudentShellMount).toHaveBeenCalledOnce()
    expect(container.querySelector('.app-header')).not.toBeInTheDocument()
  })

  it('renders the Admin workspace without duplicate global chrome', () => {
    const { container } = renderRoot(routePaths.adminDashboard)

    expect(container.querySelector('.app-header')).not.toBeInTheDocument()
    expect(container.querySelector('.app-main')).toHaveClass('app-main-workspace')
    expect(container.querySelector('.app-main')).toHaveClass('app-main-admin-workspace')
    expect(container.querySelector('.app-main > .page-transition')).not.toBeInTheDocument()
    expect(container.querySelector('.app-footer')).not.toBeInTheDocument()
  })

  it('keeps parameterized Admin Student details inside the workspace shell', () => {
    const { container } = renderRoot('/admin/students/student-123')

    expect(screen.getByRole('heading', { name: 'Admin Student page' })).toBeInTheDocument()
    expect(container.querySelector('.app-header')).not.toBeInTheDocument()
    expect(container.querySelector('.app-main')).toHaveClass('app-main-admin-workspace')
    expect(container.querySelector('.app-main > .page-transition')).not.toBeInTheDocument()
  })

  it('keeps standalone authentication routes isolated from workspace chrome', () => {
    const { container } = renderRoot(routePaths.studentLogin)

    expect(container.querySelector('.app-header')).not.toBeInTheDocument()
    expect(container.querySelector('.app-footer')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /switch to dark mode/i })).toBeInTheDocument()
  })

  it.each([
    [
      routePaths.adminInternships,
      'Internship Management page',
    ],
    [
      routePaths.adminCandidateFiltering,
      'Candidate Filtering page',
    ],
    [
      routePaths.adminShortlists,
      'Shortlists page',
    ],
  ])(
    'keeps %s inside the Admin workspace without duplicate theme controls',
    (path, heading) => {
      const { container } = renderRoot(path)

      expect(
        screen.getByRole('heading', {
          name: heading,
        }),
      ).toBeInTheDocument()

      expect(
        container.querySelector('.app-header'),
      ).not.toBeInTheDocument()

      expect(
        container.querySelector('.app-main'),
      ).toHaveClass('app-main-admin-workspace')

      expect(
        container.querySelector(
          '.app-main > .page-transition',
        ),
      ).not.toBeInTheDocument()

      expect(
        screen.queryByRole('button', {
          name: /switch to (dark|light) mode/i,
        }),
      ).not.toBeInTheDocument()
    },
  )
})
