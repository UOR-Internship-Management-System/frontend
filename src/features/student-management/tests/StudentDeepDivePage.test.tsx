import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createQueryClient } from '../../../app/config/queryClient'
import { buildAdminStudentDetailPath, routePaths } from '../../../app/config/routePaths'
import { studentManagementApi } from '../api/studentManagementApi'
import * as downloadBlob from '../../../shared/utils/downloadBlob'
import { StudentDeepDivePage } from '../pages/StudentDeepDivePage'
import {
  deepDiveAcademicsFixture,
  deepDiveAvailableCvFixture,
  deepDiveDetailFixture,
  deepDiveLatestCvFixture,
  deepDiveProjectsFixture,
  deepDiveSkillsFixture,
  deepDiveStudentId,
} from './studentDeepDiveTestFixtures'

describe('StudentDeepDivePage', () => {
  afterEach(() => vi.restoreAllMocks())

  it('renders the wireframe-aligned read-only inspection with contract-backed content', async () => {
    mockSuccessfulDeepDive()
    renderPage(buildAdminStudentDetailPath(deepDiveStudentId))

    expect(await screen.findByRole('heading', { level: 1, name: 'Asha Silva' })).toBeInTheDocument()
    expect(
      screen.getByText('Index Number: SC/2022/12345 | Last Synchronized: Current Session'),
    ).toBeInTheDocument()
    expect(screen.getByText('Official Ledger CGPA')).toBeInTheDocument()
    expect(screen.getAllByText('Not available').length).toBeGreaterThan(0)
    expect(screen.getByText('asha@dcs.ruh.ac.lk')).toBeInTheDocument()

    for (const heading of [
      'Profile summary',
      'Declared Skills',
      'Submitted Project Portfolio',
      'Academic Results',
      'Work Experience',
      'Credentials & Certifications',
      'Awards & Achievements',
      'Extracurricular Activities',
    ]) {
      expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument()
    }

    expect(screen.getByText('TypeScript', { selector: 'strong' })).toBeInTheDocument()
    expect(screen.getByText('CSC3202')).toBeInTheDocument()
    expect(screen.getByText('Engineering Intern')).toBeInTheDocument()
    expect(screen.getByText('Faculty Project Award')).toBeInTheDocument()
    expect(screen.getByText('Latest saved CV')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Return to Student Roster' })).toHaveAttribute(
      'href',
      routePaths.adminStudents,
    )

    const academicSection = screen.getByRole('heading', { name: 'Academic Results' }).closest('section')
    expect(academicSection).not.toBeNull()
    const academicTable = within(academicSection as HTMLElement)
    for (const column of [
      'Subject Code',
      'Subject Name',
      'Credits',
      'Grade Earned',
      'Calculated Grade Point',
    ]) {
      expect(academicTable.getByRole('columnheader', { name: column })).toBeInTheDocument()
    }
    expect(academicTable.queryByRole('columnheader', { name: 'Period' })).not.toBeInTheDocument()
    expect(academicTable.getByLabelText('Rows per page')).toHaveValue('5')

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

  it('offers one authenticated PDF action only for an available latest saved CV', async () => {
    const user = userEvent.setup()
    mockSuccessfulDeepDive()
    vi.spyOn(studentManagementApi, 'getLatestCv').mockResolvedValue(deepDiveAvailableCvFixture)
    const file = {
      blob: new Blob(['pdf'], { type: 'application/pdf' }),
      filename: 'Asha_Silva_CV.pdf',
      contentType: 'application/pdf' as const,
      contentLength: 3,
    }
    let resolveDownload!: (value: typeof file) => void
    const download = vi
      .spyOn(studentManagementApi, 'downloadLatestCv')
      .mockReturnValue(new Promise((resolve) => (resolveDownload = resolve)))
    const save = vi.spyOn(downloadBlob, 'saveBlobAsFile').mockImplementation(() => undefined)
    renderPage(buildAdminStudentDetailPath(deepDiveStudentId))

    const button = await screen.findByRole('button', { name: 'Download latest CV' })
    await user.click(button)
    expect(button).toBeDisabled()
    await user.click(button)
    expect(download).toHaveBeenCalledTimes(1)

    resolveDownload(file)
    await waitFor(() => expect(save).toHaveBeenCalledWith(file.blob, file.filename))
    expect(await screen.findByText(`Download started: ${file.filename}`)).toBeInTheDocument()
  })

  it('shows metadata failure separately from a neutral no-saved-CV state', async () => {
    mockSuccessfulDeepDive()
    vi.spyOn(studentManagementApi, 'getLatestCv').mockRejectedValue({
      status: 503,
      title: 'CV metadata unavailable',
      correlationId: 'cv-metadata-503',
    })
    renderPage(buildAdminStudentDetailPath(deepDiveStudentId))

    expect(
      await screen.findByRole('heading', { name: 'CV metadata unavailable' }, { timeout: 4_000 }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Retry CV metadata' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Download latest CV' })).not.toBeInTheDocument()
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

  it.each([
    {
      status: 403,
      title: 'Forbidden',
      expected: 'You do not have permission to access this information.',
    },
    {
      status: 401,
      title: 'Unauthorized',
      expected: 'Your session has expired. Please sign in again.',
    },
  ])('shows a controlled protected-page message for HTTP $status', async (problem) => {
    mockSuccessfulDeepDive()
    vi.spyOn(studentManagementApi, 'getStudentDetail').mockRejectedValue(problem)
    renderPage(buildAdminStudentDetailPath(deepDiveStudentId))

    expect(await screen.findByRole('alert')).toHaveTextContent(problem.expected)
    expect(screen.queryByRole('heading', { name: 'Profile summary' })).not.toBeInTheDocument()
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
