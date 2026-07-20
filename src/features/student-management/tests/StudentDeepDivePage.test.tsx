import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createQueryClient } from '../../../app/config/queryClient'
import { buildAdminStudentDetailPath, routePaths } from '../../../app/config/routePaths'
import { studentManagementApi } from '../api/studentManagementApi'
import { StudentDeepDivePage } from '../pages/StudentDeepDivePage'
import {
  deepDiveAcademicsFixture,
  deepDiveDetailFixture,
  deepDiveLatestCvFixture,
  deepDiveProjectsFixture,
  deepDiveSkillsFixture,
  deepDiveStudentId,
} from './studentDeepDiveTestFixtures'

describe('StudentDeepDivePage', () => {
  afterEach(() => vi.restoreAllMocks())

  it('renders the approved stacked read-only inspection with safe external links', async () => {
    mockSuccessfulDeepDive()
    renderPage(buildAdminStudentDetailPath(deepDiveStudentId))

    expect(await screen.findByRole('heading', { level: 1, name: 'Asha Silva' })).toBeInTheDocument()
    expect(screen.getByText('Official Computer Science GPA')).toBeInTheDocument()
    expect(screen.getAllByText('Not available').length).toBeGreaterThan(0)

    for (const heading of [
      'Profile summary',
      'Declared skills',
      'Project portfolio',
      'Academic results',
      'Work experience',
      'Credentials and certifications',
      'Awards and achievements',
      'Extracurricular activities',
    ]) {
      expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument()
    }

    expect(screen.getByText('TypeScript', { selector: 'strong' })).toBeInTheDocument()
    expect(screen.getByText('CSC3202')).toBeInTheDocument()
    expect(screen.getByText('Engineering Intern')).toBeInTheDocument()
    expect(screen.getByText('Faculty Project Award')).toBeInTheDocument()
    expect(screen.getByText('Latest saved CV')).toBeInTheDocument()

    expect(screen.getByRole('link', { name: /Repository/ })).toHaveAttribute(
      'rel',
      expect.stringContaining('noopener'),
    )
    expect(screen.getByRole('link', { name: /Repository/ })).toHaveAttribute('target', '_blank')
    expect(
      screen.queryByRole('button', { name: /edit|approve|verify|review|reject|save/i }),
    ).not.toBeInTheDocument()
  })

  it('keeps subsection failures isolated and provides a local retry action', async () => {
    mockSuccessfulDeepDive()
    vi.spyOn(studentManagementApi, 'listProjects').mockRejectedValue({
      status: 503,
      title: 'Projects unavailable',
      correlationId: 'projects-503',
    })
    renderPage(buildAdminStudentDetailPath(deepDiveStudentId))

    expect(await screen.findByRole('heading', { name: 'Profile summary' })).toBeInTheDocument()
    expect(await screen.findByText('Unable to load this section')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument()
    expect(screen.getByText('TypeScript', { selector: 'strong' })).toBeInTheDocument()
    expect(screen.getByText('CSC3202')).toBeInTheDocument()
  })

  it('treats invalid IDs and detail 404 responses as route-level not found', async () => {
    const detail = vi.spyOn(studentManagementApi, 'getStudentDetail')
    const invalid = renderPage('/admin/students/not-a-uuid')
    expect(await screen.findByRole('heading', { name: 'Student not found' })).toBeInTheDocument()
    expect(detail).not.toHaveBeenCalled()
    invalid.unmount()

    mockSuccessfulDeepDive()
    vi.spyOn(studentManagementApi, 'getStudentDetail').mockRejectedValueOnce({
      status: 404,
      title: 'Registered Student not found',
    })
    renderPage(buildAdminStudentDetailPath(deepDiveStudentId))
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Student not found' })).toBeInTheDocument(),
    )
  })
})

function mockSuccessfulDeepDive() {
  vi.spyOn(studentManagementApi, 'getStudentDetail').mockResolvedValue(deepDiveDetailFixture)
  vi.spyOn(studentManagementApi, 'listDeclaredSkills').mockResolvedValue(deepDiveSkillsFixture)
  vi.spyOn(studentManagementApi, 'listProjects').mockResolvedValue(deepDiveProjectsFixture)
  vi.spyOn(studentManagementApi, 'listAcademicRecords').mockResolvedValue(deepDiveAcademicsFixture)
  vi.spyOn(studentManagementApi, 'getLatestCv').mockResolvedValue(deepDiveLatestCvFixture)
}

function renderPage(initialEntry: string) {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path={routePaths.adminStudentDetail} element={<StudentDeepDivePage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}
