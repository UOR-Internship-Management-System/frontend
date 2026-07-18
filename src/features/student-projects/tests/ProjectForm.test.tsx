import { useState } from 'react'
import { fireEvent, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { skillIds } from '../../../mocks/fixtures/skills.fixture'
import { getStudentProjectsFixture } from '../../../mocks/fixtures/studentProjects.fixture'
import { server } from '../../../mocks/server'
import { renderWithProviders } from '../../../test/renderWithProviders'
import { mapStudentProjectToForm } from '../mappers/studentProjectMapper'
import { ProjectDeleteDialog } from '../components/ProjectDeleteDialog'
import { ProjectDetailsModal } from '../components/ProjectDetailsModal'
import { ProjectForm } from '../components/ProjectForm'

describe('ProjectForm and project dialogs', () => {
  it('validates title, safe web URLs, and date order before submission', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    const view = renderWithProviders(
      <ProjectForm mode="create" onCancel={vi.fn()} onSubmit={onSubmit} />,
    )

    await user.type(view.getByLabelText('Repository URL'), 'javascript:alert(1)')
    fireEvent.change(view.getByLabelText('Start date'), { target: { value: '2026-05-16' } })
    fireEvent.change(view.getByLabelText('End date'), { target: { value: '2026-05-15' } })
    await user.click(view.getByRole('button', { name: 'Create project' }))

    expect(await view.findByText('Enter a project title.')).toBeInTheDocument()
    expect(view.getByText('Use an http or https web address.')).toBeInTheDocument()
    expect(view.getByText('End date cannot be before start date.')).toBeInTheDocument()
    await waitFor(() => expect(view.getByLabelText('Project title')).toHaveFocus())
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('adds unique taxonomy skills, removes chips, and submits controlled values', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const view = renderWithProviders(
      <ProjectForm mode="create" onCancel={vi.fn()} onSubmit={onSubmit} />,
    )
    const taxonomy = await view.findByLabelText('Taxonomy skill')

    await user.type(view.getByLabelText('Project title'), 'Portfolio API')
    await user.selectOptions(taxonomy, skillIds.typescript)
    await user.click(view.getByRole('button', { name: 'Add skill' }))
    expect(
      within(view.getByRole('list', { name: 'Project skills' })).getByText('TypeScript'),
    ).toBeVisible()
    expect(within(taxonomy).getByRole('option', { name: 'TypeScript' })).toBeDisabled()

    await user.selectOptions(taxonomy, skillIds.react)
    await user.click(view.getByRole('button', { name: 'Add skill' }))
    await user.click(view.getByRole('button', { name: 'Remove React' }))
    await user.click(view.getByRole('button', { name: 'Create project' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Portfolio API', skillIds: [skillIds.typescript] }),
    )
  })

  it('clears and disables the end date while a project is ongoing', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const view = renderWithProviders(
      <ProjectForm mode="create" onCancel={vi.fn()} onSubmit={onSubmit} />,
    )

    await user.type(view.getByLabelText('Project title'), 'Ongoing research tool')
    fireEvent.change(view.getByLabelText('Start date'), { target: { value: '2026-06-01' } })
    fireEvent.change(view.getByLabelText('End date'), { target: { value: '2026-07-01' } })
    await user.click(view.getByLabelText('This project is ongoing'))

    expect(view.getByLabelText('End date')).toBeDisabled()
    expect(view.getByLabelText('End date')).toHaveValue('')
    await user.click(view.getByRole('button', { name: 'Create project' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce())
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ endDate: '' }))
  })

  it('searches and paginates the server taxonomy while preserving selected skills', async () => {
    const user = userEvent.setup()
    const lateSkill = {
      skillId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0010',
      name: 'Web Performance',
      description: 'Browser performance engineering.',
    }
    const firstPageSkills = Array.from({ length: 10 }, (_, index) => ({
      skillId: `aaaaaaaa-aaaa-4aaa-8aaa-${String(index).padStart(12, '0')}`,
      name: `Skill ${String(index + 1).padStart(2, '0')}`,
      description: null,
    }))
    server.use(
      http.get('/api/v1/skill-taxonomy/skills', ({ request }) => {
        const url = new URL(request.url)
        const page = Number(url.searchParams.get('page') ?? 0)
        const search = url.searchParams.get('search') ?? ''
        const items =
          search === 'performance' ? [lateSkill] : page === 0 ? firstPageSkills : [lateSkill]
        return HttpResponse.json({
          items,
          page: {
            page,
            size: 10,
            totalElements: search ? 1 : 11,
            totalPages: search ? 1 : 2,
            sort: 'name,asc',
          },
        })
      }),
    )
    const view = renderWithProviders(
      <ProjectForm mode="create" onCancel={vi.fn()} onSubmit={vi.fn()} />,
    )

    const pagination = await view.findByRole('navigation', {
      name: 'Project taxonomy skills pagination',
    })
    await user.click(within(pagination).getByRole('button', { name: 'Next' }))
    const taxonomy = view.getByLabelText('Taxonomy skill')
    await waitFor(() =>
      expect(within(taxonomy).getByRole('option', { name: lateSkill.name })).toBeVisible(),
    )
    await user.selectOptions(taxonomy, lateSkill.skillId)
    await user.click(view.getByRole('button', { name: 'Add skill' }))

    expect(view.getByRole('list', { name: 'Project skills' })).toHaveTextContent(lateSkill.name)
    await user.type(
      view.getByRole('searchbox', { name: 'Search project taxonomy skills' }),
      'performance',
    )
    await waitFor(() =>
      expect(
        view.queryByRole('navigation', { name: 'Project taxonomy skills pagination' }),
      ).toBeNull(),
    )
    expect(view.getByRole('list', { name: 'Project skills' })).toHaveTextContent(lateSkill.name)
  })

  it('merges refreshed server fields into a stale draft without replacing dirty fields', async () => {
    const user = userEvent.setup()
    const original = getStudentProjectsFixture()[0]!
    const refreshed = {
      ...original,
      title: 'Server-renamed portfolio',
      version: original.version + 1,
    }
    const onSubmit = vi.fn().mockResolvedValue(undefined)

    function Harness() {
      const [project, setProject] = useState(original)
      return (
        <>
          <button onClick={() => setProject(refreshed)} type="button">
            Refresh server project
          </button>
          <ProjectForm
            initialSkills={project.skills}
            initialValues={mapStudentProjectToForm(project)}
            mode="edit"
            onCancel={vi.fn()}
            onSubmit={onSubmit}
          />
        </>
      )
    }

    const view = renderWithProviders(<Harness />)
    await user.clear(view.getByLabelText('Description'))
    await user.type(view.getByLabelText('Description'), 'Student-owned draft change')
    await user.click(view.getByRole('button', { name: 'Refresh server project' }))

    await waitFor(() =>
      expect(view.getByLabelText('Project title')).toHaveValue('Server-renamed portfolio'),
    )
    expect(view.getByLabelText('Description')).toHaveValue('Student-owned draft change')
    await user.click(view.getByRole('button', { name: 'Save project' }))
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Server-renamed portfolio',
        description: 'Student-owned draft change',
      }),
    )
  })

  it('keeps nullable clears and the complete edit draft after a stale response', async () => {
    const user = userEvent.setup()
    const project = getStudentProjectsFixture()[0]!
    const onSubmit = vi.fn().mockRejectedValue({
      type: 'about:blank',
      title: 'Precondition failed',
      status: 412,
      code: 'STALE_VERSION',
      message: 'Changed.',
      correlationId: 'project-form-412',
    })
    const view = renderWithProviders(
      <ProjectForm
        initialSkills={project.skills}
        initialValues={mapStudentProjectToForm(project)}
        mode="edit"
        onCancel={vi.fn()}
        onSubmit={onSubmit}
      />,
    )

    await user.clear(view.getByLabelText('Description'))
    await user.clear(view.getByLabelText('Repository URL'))
    await user.type(view.getByLabelText('Description'), 'Intended replacement')
    await user.click(view.getByRole('button', { name: 'Save project' }))

    expect(await view.findByText(/entered values are preserved/i)).toBeInTheDocument()
    expect(view.getByLabelText('Description')).toHaveValue('Intended replacement')
    expect(view.getByLabelText('Repository URL')).toHaveValue('')
    expect(view.getByRole('button', { name: 'Save project' })).toBeEnabled()
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ description: 'Intended replacement', repositoryUrl: '' }),
    )
  })

  it('keeps saved skill chips visible when the taxonomy request fails', async () => {
    server.use(
      http.get('/api/v1/skill-taxonomy/skills', () =>
        HttpResponse.json(
          {
            type: 'about:blank',
            title: 'Unavailable',
            status: 503,
            code: 'SERVICE_UNAVAILABLE',
            message: 'Unavailable.',
            correlationId: 'project-taxonomy-503',
          },
          { status: 503 },
        ),
      ),
    )
    const project = getStudentProjectsFixture()[0]!
    const view = renderWithProviders(
      <ProjectForm
        initialSkills={project.skills}
        initialValues={mapStudentProjectToForm(project)}
        mode="edit"
        onCancel={vi.fn()}
        onSubmit={vi.fn()}
      />,
    )

    expect(await view.findByRole('alert', {}, { timeout: 3_000 })).toHaveTextContent(
      'Skill taxonomy is unavailable',
    )
    expect(view.getByRole('list', { name: 'Project skills' })).toHaveTextContent('React')
    expect(view.getByRole('list', { name: 'Project skills' })).toHaveTextContent('TypeScript')
  })

  it('closes with Escape and restores focus to the launcher', async () => {
    const user = userEvent.setup()

    function Harness() {
      const [open, setOpen] = useState(false)
      return (
        <>
          <button onClick={() => setOpen(true)} type="button">
            Launch project form
          </button>
          {open ? (
            <ProjectForm mode="create" onCancel={() => setOpen(false)} onSubmit={vi.fn()} />
          ) : null}
        </>
      )
    }

    const view = renderWithProviders(<Harness />)
    const launcher = view.getByRole('button', { name: 'Launch project form' })
    await user.click(launcher)
    expect(view.getByRole('dialog', { name: 'Add project' })).toBeInTheDocument()
    await user.keyboard('{Escape}')
    await waitFor(() => expect(view.queryByRole('dialog')).not.toBeInTheDocument())
    await waitFor(() => expect(launcher).toHaveFocus())
  })

  it('renders read-only details with safe external-link attributes and action entry points', async () => {
    const user = userEvent.setup()
    const project = getStudentProjectsFixture()[0]!
    const onEdit = vi.fn()
    const onDelete = vi.fn()
    const view = renderWithProviders(
      <ProjectDetailsModal
        onClose={vi.fn()}
        onDelete={onDelete}
        onEdit={onEdit}
        project={project}
      />,
    )

    const repository = view.getByRole('link', { name: 'Open repository' })
    expect(repository).toHaveAttribute('href', project.repositoryUrl)
    expect(repository).toHaveAttribute('target', '_blank')
    expect(repository).toHaveAttribute('rel', expect.stringContaining('noopener'))
    await user.click(view.getByRole('button', { name: 'Edit project' }))
    await user.click(view.getByRole('button', { name: 'Delete project' }))
    expect(onEdit).toHaveBeenCalledOnce()
    expect(onDelete).toHaveBeenCalledOnce()
  })

  it('keeps delete confirmation open and retryable after failure', async () => {
    const user = userEvent.setup()
    const project = getStudentProjectsFixture()[0]!
    const onConfirm = vi.fn().mockRejectedValue({
      title: 'Precondition failed',
      status: 412,
      code: 'STALE_VERSION',
      message: 'Changed.',
    })
    const view = renderWithProviders(
      <ProjectDeleteDialog onClose={vi.fn()} onConfirm={onConfirm} project={project} />,
    )

    await user.click(view.getByRole('button', { name: 'Delete project' }))
    expect(await view.findByRole('alert')).toHaveTextContent(/changed since it was loaded/i)
    expect(view.getByRole('dialog', { name: `Delete ${project.title}?` })).toBeInTheDocument()
    expect(view.getByRole('button', { name: 'Delete project' })).toBeEnabled()
  })
})
