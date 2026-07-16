import { waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { delay, http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { skillIds } from '../../../mocks/fixtures/skills.fixture'
import {
  getStudentProjectsFixture,
  setStudentProjectsFixture,
} from '../../../mocks/fixtures/studentProjects.fixture'
import { server } from '../../../mocks/server'
import { renderWithProviders } from '../../../test/renderWithProviders'
import type { StudentProject } from '../types/studentProjectTypes'
import { StudentProjectsPage } from '../pages/StudentProjectsPage'

describe('StudentProjectsPage', () => {
  it('renders an accessible loading state and then the persisted repository', async () => {
    server.use(
      http.get('/api/v1/me/projects', async () => {
        await delay(60)
        return HttpResponse.json({
          items: getStudentProjectsFixture(),
          page: {
            page: 0,
            size: 5,
            totalElements: getStudentProjectsFixture().length,
            totalPages: 1,
            sort: 'updatedAt,desc',
          },
        })
      }),
    )
    const view = renderWithProviders(<StudentProjectsPage />)

    expect(view.getByRole('heading', { level: 1, name: 'Projects' })).toBeInTheDocument()
    expect(view.getByRole('status', { name: 'Loading projects' })).toBeInTheDocument()
    expect(await view.findByRole('row', { name: /Accessible Internship Portal/ })).toBeVisible()
  })

  it('creates, views, and edits Student-owned portfolio projects', async () => {
    const user = userEvent.setup()
    const view = renderWithProviders(<StudentProjectsPage />)
    await view.findByRole('row', { name: /Accessible Internship Portal/ })

    await user.click(view.getByRole('button', { name: 'Add project' }))
    await user.type(view.getByLabelText('Project title'), 'Deterministic Portfolio')
    const taxonomy = await view.findByLabelText('Taxonomy skill')
    await user.selectOptions(taxonomy, skillIds.typescript)
    await user.click(view.getByRole('button', { name: 'Add skill' }))
    await user.click(view.getByRole('button', { name: 'Create project' }))
    expect(await view.findByText('Project created')).toBeInTheDocument()
    expect(await view.findByRole('row', { name: /Deterministic Portfolio/ })).toBeVisible()

    const accessibleRow = view.getByRole('row', { name: /Accessible Internship Portal/ })
    await user.click(within(accessibleRow).getByRole('button', { name: /View details/ }))
    expect(
      await view.findByRole('dialog', { name: 'Accessible Internship Portal' }),
    ).toBeInTheDocument()
    await user.click(view.getByRole('button', { name: 'Edit project' }))
    await user.clear(view.getByLabelText('Description'))
    await user.type(view.getByLabelText('Description'), 'Revised accessible portfolio evidence.')
    await user.click(view.getByLabelText('Include this project in my generated CV'))
    await user.click(view.getByRole('button', { name: 'Save project' }))
    expect(await view.findByText('Project updated')).toBeInTheDocument()
    expect(
      await view.findByRole('row', { name: /Revised accessible portfolio evidence/ }),
    ).toBeVisible()
  })

  it('deletes a Student-owned portfolio project from its latest details', async () => {
    const user = userEvent.setup()
    const view = renderWithProviders(<StudentProjectsPage />)
    const academicRow = await view.findByRole('row', { name: /Academic Record Visualizer/ })
    await user.click(within(academicRow).getByRole('button', { name: /View details/ }))
    await view.findByRole('dialog', { name: 'Academic Record Visualizer' })
    await user.click(view.getByRole('button', { name: 'Delete project' }))
    const deleteDialog = view.getByRole('dialog', { name: 'Delete Academic Record Visualizer?' })
    await user.click(within(deleteDialog).getByRole('button', { name: 'Delete project' }))
    expect(await view.findByText('Project deleted')).toBeInTheDocument()
    await waitFor(() =>
      expect(
        view.queryByRole('row', { name: /Academic Record Visualizer/ }),
      ).not.toBeInTheDocument(),
    )
  })

  it('keeps server search separate from a recoverable list error', async () => {
    const user = userEvent.setup()
    const view = renderWithProviders(<StudentProjectsPage />)
    await view.findByRole('row', { name: /Accessible Internship Portal/ })

    await user.type(view.getByRole('searchbox', { name: 'Search projects' }), 'missing')
    expect(await view.findByText('No matching projects')).toBeInTheDocument()

    server.use(
      http.get('/api/v1/me/projects', () =>
        HttpResponse.json(
          {
            type: 'about:blank',
            title: 'Unavailable',
            status: 503,
            code: 'SERVICE_UNAVAILABLE',
            message: 'Unavailable.',
            correlationId: 'projects-page-503',
          },
          { status: 503 },
        ),
      ),
    )
    await user.selectOptions(view.getByLabelText('Sort projects'), 'title,desc')
    expect(
      await view.findByRole('heading', { name: 'Projects unavailable' }, { timeout: 3_000 }),
    ).toBeInTheDocument()
    expect(view.getByText('Reference: projects-page-503')).toBeInTheDocument()
  })

  it('refreshes a stale version without losing the intended edit draft', async () => {
    const user = userEvent.setup()
    server.use(
      http.patch('/api/v1/me/projects/:projectId', () =>
        HttpResponse.json(
          {
            type: 'about:blank',
            title: 'Precondition failed',
            status: 412,
            code: 'STALE_VERSION',
            message: 'Changed.',
            correlationId: 'projects-page-412',
          },
          { status: 412 },
        ),
      ),
    )
    const view = renderWithProviders(<StudentProjectsPage />)
    const row = await view.findByRole('row', { name: /Accessible Internship Portal/ })
    await user.click(within(row).getByRole('button', { name: /View details/ }))
    await view.findByRole('dialog', { name: 'Accessible Internship Portal' })
    await user.click(view.getByRole('button', { name: 'Edit project' }))
    await user.clear(view.getByLabelText('Description'))
    await user.type(view.getByLabelText('Description'), 'Keep this exact intended draft.')
    await user.click(view.getByRole('button', { name: 'Save project' }))

    expect(await view.findByText('Review the latest project')).toBeInTheDocument()
    expect(view.getByLabelText('Description')).toHaveValue('Keep this exact intended draft.')
    expect(view.getByRole('dialog', { name: 'Edit project' })).toBeInTheDocument()
    expect(view.getByRole('button', { name: 'Save project' })).toBeEnabled()
  })

  it('clamps to the previous page when deleting the only final-page project', async () => {
    const user = userEvent.setup()
    const template = getStudentProjectsFixture()[0]!
    const projects: StudentProject[] = Array.from({ length: 6 }, (_, index) => ({
      ...structuredClone(template),
      projectId: `660e8400-e29b-41d4-a716-${String(index + 100).padStart(12, '0')}`,
      title: `Portfolio Project ${index + 1}`,
      updatedAt: `2026-07-${String(16 - index).padStart(2, '0')}T09:45:00Z`,
    }))
    setStudentProjectsFixture(projects)
    const view = renderWithProviders(<StudentProjectsPage />)
    await view.findByRole('row', { name: /Portfolio Project 1/ })

    await user.click(view.getByRole('button', { name: 'Next' }))
    const finalRow = await view.findByRole('row', { name: /Portfolio Project 6/ })
    await user.click(within(finalRow).getByRole('button', { name: /View details/ }))
    await view.findByRole('dialog', { name: 'Portfolio Project 6' })
    await user.click(view.getByRole('button', { name: 'Delete project' }))
    await user.click(
      within(view.getByRole('dialog', { name: 'Delete Portfolio Project 6?' })).getByRole(
        'button',
        { name: 'Delete project' },
      ),
    )

    expect(await view.findByText('Project deleted')).toBeInTheDocument()
    expect(await view.findByRole('row', { name: /Portfolio Project 1/ })).toBeVisible()
    expect(view.getByText(/Page 1 of 1/)).toBeInTheDocument()
  })
})
