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
