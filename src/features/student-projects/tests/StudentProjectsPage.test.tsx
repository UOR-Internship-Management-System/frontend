import { waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { delay, http, HttpResponse } from 'msw'
import { afterEach, describe, expect, it } from 'vitest'
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
  afterEach(() => server.resetHandlers())

  it('renders an accessible loading state and then the persisted repository', async () => {
    server.use(
      http.get('/api/v1/me/projects', async () => {
        await delay(60)
        return HttpResponse.json({
          items: getStudentProjectsFixture(),
          page: {
            page: 0,
            size: 4,
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
    expect(
      await view.findByRole('listitem', { name: 'Project Accessible Internship Portal' }),
    ).toBeVisible()
  })

  it('creates, views, and edits Student-owned portfolio projects', async () => {
    const user = userEvent.setup()
    const view = renderWithProviders(<StudentProjectsPage />)
    console.log('Test 2: Before findByRole listitem')
    await view.findByRole('listitem', { name: 'Project Accessible Internship Portal' })
    console.log('Test 2: Found listitem')

    await user.click(view.getByRole('button', { name: 'Add project' }))
    console.log('Test 2: Clicked Add project')
    expect(view.getByRole('dialog', { name: 'Create New Project' })).toBeInTheDocument()
    await user.type(view.getByLabelText('Title'), 'Deterministic Portfolio')
    console.log('Test 2: Typed Title')
    const taxonomy = await view.findByLabelText('Taxonomy skill')
    console.log('Test 2: Found taxonomy')
    await user.selectOptions(taxonomy, skillIds.typescript)
    console.log('Test 2: Selected option')
    await user.click(view.getByRole('button', { name: 'Add Skill' }))
    console.log('Test 2: Clicked Add Skill')
    await user.click(view.getByRole('button', { name: 'Save' }))
    console.log('Test 2: Clicked Save')
    expect(await view.findByText('Project created')).toBeInTheDocument()
    console.log('Test 2: Found Project created')
    expect(
      await view.findByRole('listitem', { name: 'Project Deterministic Portfolio' }),
    ).toBeVisible()

    const accessibleProject = view.getByRole('listitem', {
      name: 'Project Accessible Internship Portal',
    })
    await user.click(
      within(accessibleProject).getByRole('button', {
        name: 'Details for Accessible Internship Portal',
      }),
    )
    const details = await view.findByRole('dialog', { name: 'Project Details' })
    expect(within(details).getByText('Accessible Internship Portal')).toBeVisible()
    await user.click(within(details).getByRole('button', { name: 'Edit' }))
    await user.clear(view.getByLabelText('Project Abstract / High-Level Description'))
    await user.type(
      view.getByLabelText('Project Abstract / High-Level Description'),
      'Revised accessible portfolio evidence.',
    )
    await user.click(view.getByLabelText('Include this project in the CV'))
    await user.click(view.getByRole('button', { name: 'Save Changes' }))
    expect(await view.findByText('Project updated')).toBeInTheDocument()
    expect(
      await view.findByRole('listitem', { name: 'Project Accessible Internship Portal' }),
    ).toHaveTextContent('Revised accessible portfolio evidence.')
  }, 10_000)

  it('deletes a Student-owned portfolio project from its latest details', async () => {
    const user = userEvent.setup()
    const view = renderWithProviders(<StudentProjectsPage />)
    const academicProject = await view.findByRole('listitem', {
      name: 'Project Academic Record Visualizer',
    })
    await user.click(
      within(academicProject).getByRole('button', {
        name: 'Details for Academic Record Visualizer',
      }),
    )
    const details = await view.findByRole('dialog', { name: 'Project Details' })
    await user.click(within(details).getByRole('button', { name: 'Remove Project' }))
    const deleteDialog = view.getByRole('dialog', { name: 'Remove Project' })
    await user.click(within(deleteDialog).getByRole('button', { name: 'Remove' }))
    expect(await view.findByText('Project deleted')).toBeInTheDocument()
    await waitFor(() =>
      expect(
        view.queryByRole('listitem', { name: 'Project Academic Record Visualizer' }),
      ).not.toBeInTheDocument(),
    )
  })

  it('keeps server search separate from a recoverable list error', async () => {
    const user = userEvent.setup()
    const view = renderWithProviders(<StudentProjectsPage />)
    await view.findByRole('listitem', { name: 'Project Accessible Internship Portal' })

    const search = view.getByRole('searchbox', { name: 'Search saved projects' })
    await user.type(search, 'missing')
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
    const newSearch = view.getByRole('searchbox', { name: 'Search saved projects' })
    await user.clear(newSearch)
    await user.type(newSearch, 'retry')
    expect(
      await view.findByRole('heading', { name: 'Projects unavailable' }, { timeout: 3_000 }),
    ).toBeInTheDocument()
    expect(view.getByText('Reference: projects-page-503')).toBeInTheDocument()
  })

  it('keeps repository controls available in a single empty state', async () => {
    setStudentProjectsFixture([])
    const view = renderWithProviders(<StudentProjectsPage />)

    expect(await view.findByText('No projects yet')).toBeVisible()
    expect(view.getByRole('searchbox', { name: 'Search saved projects' })).toBeVisible()
    expect(view.getByText('0 projects')).toBeVisible()
    expect(view.queryByRole('table')).not.toBeInTheDocument()
    expect(view.queryByRole('navigation', { name: 'Projects pagination' })).not.toBeInTheDocument()
  })

  it('retries a stale edit without overwriting a concurrent server field change', async () => {
    const user = userEvent.setup()
    const patchBodies: unknown[] = []
    let patchAttempt = 0
    server.use(
      http.patch('/api/v1/me/projects/:projectId', async ({ request }) => {
        const body = (await request.json()) as Partial<StudentProject>
        patchBodies.push(body)
        const projects = getStudentProjectsFixture()
        const current = projects[0]!
        patchAttempt += 1

        if (patchAttempt === 1) {
          setStudentProjectsFixture([
            {
              ...current,
              title: 'Server-renamed accessible portfolio',
              version: current.version + 1,
              updatedAt: '2026-07-16T10:30:00Z',
            },
            ...projects.slice(1),
          ])
          return HttpResponse.json(
            {
              type: 'about:blank',
              title: 'Precondition failed',
              status: 412,
              code: 'STALE_VERSION',
              message: 'Changed.',
              correlationId: 'projects-page-412',
            },
            { status: 412 },
          )
        }

        const latestProjects = getStudentProjectsFixture()
        const latest = latestProjects[0]!
        const updated = {
          ...latest,
          ...body,
          version: latest.version + 1,
          updatedAt: '2026-07-16T10:45:00Z',
        }
        setStudentProjectsFixture([updated, ...latestProjects.slice(1)])
        return HttpResponse.json(updated)
      }),
    )
    const view = renderWithProviders(<StudentProjectsPage />)
    const project = await view.findByRole('listitem', {
      name: 'Project Accessible Internship Portal',
    })
    await user.click(
      within(project).getByRole('button', { name: 'Details for Accessible Internship Portal' }),
    )
    const details = await view.findByRole('dialog', { name: 'Project Details' })
    await user.click(within(details).getByRole('button', { name: 'Edit' }))
    const description = view.getByLabelText('Project Abstract / High-Level Description')
    await user.clear(description)
    await user.type(description, 'Keep this exact intended draft.')
    await user.click(view.getByRole('button', { name: 'Save Changes' }))

    expect(await view.findByText('Review the latest project')).toBeInTheDocument()
    expect(view.getByLabelText('Project Abstract / High-Level Description')).toHaveValue(
      'Keep this exact intended draft.',
    )
    await waitFor(() =>
      expect(view.getByLabelText('Title')).toHaveValue('Server-renamed accessible portfolio'),
    )
    expect(view.getByRole('dialog', { name: 'Edit Project' })).toBeInTheDocument()
    expect(view.getByRole('button', { name: 'Save Changes' })).toBeEnabled()
    await user.click(view.getByRole('button', { name: 'Save Changes' }))

    expect(await view.findByText('Project updated')).toBeInTheDocument()
    expect(patchBodies).toEqual([
      { description: 'Keep this exact intended draft.' },
      { description: 'Keep this exact intended draft.' },
    ])
    expect(
      await view.findByRole('listitem', { name: 'Project Server-renamed accessible portfolio' }),
    ).toHaveTextContent('Keep this exact intended draft.')
  })

  it('clamps to the previous page when deleting the only final-page project', async () => {
    const user = userEvent.setup()
    const template = getStudentProjectsFixture()[0]!
    const projects: StudentProject[] = Array.from({ length: 5 }, (_, index) => ({
      ...structuredClone(template),
      projectId: `660e8400-e29b-41d4-a716-${String(index + 100).padStart(12, '0')}`,
      title: `Portfolio Project ${index + 1}`,
      updatedAt: `2026-07-${String(16 - index).padStart(2, '0')}T09:45:00Z`,
    }))
    setStudentProjectsFixture(projects)
    const view = renderWithProviders(<StudentProjectsPage />)
    await view.findByRole('listitem', { name: 'Project Portfolio Project 1' })

    await user.click(view.getByRole('button', { name: 'Next' }))
    const finalProject = await view.findByRole('listitem', {
      name: 'Project Portfolio Project 5',
    })
    await user.click(
      within(finalProject).getByRole('button', { name: 'Details for Portfolio Project 5' }),
    )
    const details = await view.findByRole('dialog', { name: 'Project Details' })
    await user.click(within(details).getByRole('button', { name: 'Remove Project' }))
    await user.click(
      within(view.getByRole('dialog', { name: 'Remove Project' })).getByRole('button', {
        name: 'Remove',
      }),
    )

    expect(await view.findByText('Project deleted')).toBeInTheDocument()
    expect(await view.findByRole('listitem', { name: 'Project Portfolio Project 1' })).toBeVisible()
    expect(view.getByText(/Page 1 of 1/)).toBeInTheDocument()
  })
})
