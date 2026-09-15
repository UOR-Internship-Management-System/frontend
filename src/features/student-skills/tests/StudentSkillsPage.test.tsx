import { waitFor, within } from '@testing-library/react'
import { http, HttpResponse, delay } from 'msw'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { server } from '../../../mocks/server'
import {
  individualSkillsFixture,
  setDeclaredSkillsFixture,
} from '../../../mocks/fixtures/skills.fixture'
import { renderWithProviders } from '../../../test/renderWithProviders'
import { StudentSkillsPage } from '../pages/StudentSkillsPage'

describe('StudentSkillsPage', () => {
  it('renders the declared-skills list and the persisted skill', async () => {
    const { getByRole, findByRole } = renderWithProviders(<StudentSkillsPage />)

    expect(getByRole('heading', { level: 1, name: 'Skills' })).toBeInTheDocument()
    expect(getByRole('status', { name: 'Loading declared skills' })).toBeInTheDocument()
    expect(await findByRole('listitem', { name: /React/ })).toBeInTheDocument()
  })

  it('adds, updates, and removes a canonical declared skill', async () => {
    const user = userEvent.setup()
    const view = renderWithProviders(<StudentSkillsPage />)

    await user.click(view.getByRole('button', { name: 'Add skill' }))
    const dialog = await view.findByRole('dialog', { name: 'Add skill' })

    const typeScript = await within(dialog).findByRole('button', { name: 'TypeScript' })
    await user.click(typeScript)
    await user.click(within(dialog).getByRole('button', { name: 'Advanced' }))
    await user.click(within(dialog).getByRole('button', { name: 'Add skill' }))

    await waitFor(() => expect(view.queryByRole('dialog', { name: 'Add skill' })).toBeNull())
    const typeScriptRow = await view.findByRole('listitem', { name: /TypeScript/ })
    expect(typeScriptRow).toHaveTextContent('TypeScript')
    expect(typeScriptRow).toHaveTextContent('Software Engineering')
    expect(typeScriptRow).toHaveTextContent('Advanced')
    expect(await view.findByText('Skill added')).toBeInTheDocument()

    const reactRow = view.getByRole('listitem', { name: /React/ })
    await user.click(within(reactRow).getByRole('button', { name: 'Actions for React' }))
    await user.click(view.getByRole('menuitem', { name: 'Edit competency' }))
    const editDialog = view.getByRole('dialog', { name: 'Edit competency for React' })
    await user.click(within(editDialog).getByRole('button', { name: 'Advanced' }))
    await user.click(within(editDialog).getByRole('button', { name: 'Save' }))
    expect(await view.findByText('Competency updated')).toBeInTheDocument()

    await user.click(within(reactRow).getByRole('button', { name: 'Actions for React' }))
    await user.click(view.getByRole('menuitem', { name: 'Remove' }))
    const removeDialog = view.getByRole('dialog', { name: 'Remove skill' })
    await user.click(within(removeDialog).getByRole('button', { name: 'Remove' }))
    expect(await view.findByText('Skill removed')).toBeInTheDocument()
  })

  it('uses the Add Skill search and cluster filter to narrow the taxonomy results', async () => {
    const user = userEvent.setup()
    const view = renderWithProviders(<StudentSkillsPage />)

    await user.click(view.getByRole('button', { name: 'Add skill' }))
    const dialog = await view.findByRole('dialog', { name: 'Add skill' })

    await user.type(
      await within(dialog).findByRole('searchbox', { name: 'Search system skills' }),
      'TypeScript',
    )
    expect(await within(dialog).findByRole('button', { name: 'TypeScript' })).toBeVisible()
    await waitFor(() => {
      expect(within(dialog).queryByRole('button', { name: 'JavaScript' })).toBeNull()
    })

    await user.clear(within(dialog).getByRole('searchbox', { name: 'Search system skills' }))
    await user.selectOptions(within(dialog).getByLabelText('Filter by core cluster'), 'Data and AI')
    expect(await within(dialog).findByRole('button', { name: 'Python' })).toBeVisible()
    await waitFor(() => {
      expect(within(dialog).queryByRole('button', { name: 'React' })).toBeNull()
    })
  })

  it('marks every already-declared skill as unavailable to select', async () => {
    setDeclaredSkillsFixture(
      individualSkillsFixture.map((skill, index) => ({
        declaredSkillId: `77777777-7777-4777-8777-${String(index + 100).padStart(12, '0')}`,
        skillId: skill.skillId,
        skillName: skill.name,
        competencyLevel: 'INTERMEDIATE' as const,
        version: 1,
        createdAt: '2026-07-16T08:30:00Z',
        updatedAt: '2026-07-16T08:30:00Z',
      })),
    )
    const user = userEvent.setup()
    const view = renderWithProviders(<StudentSkillsPage />)

    await user.click(view.getByRole('button', { name: 'Add skill' }))
    const dialog = await view.findByRole('dialog', { name: 'Add skill' })

    for (const skill of individualSkillsFixture) {
      expect(await within(dialog).findByRole('button', { name: skill.name })).toHaveAttribute(
        'aria-disabled',
        'true',
      )
    }
  })

  it('keeps taxonomy and declared-list errors independent', async () => {
    server.use(
      http.get('/api/v1/skill-taxonomy', async () => {
        await delay(20)
        return HttpResponse.json(
          {
            type: 'about:blank',
            title: 'Unavailable',
            status: 503,
            code: 'SERVICE_UNAVAILABLE',
            message: 'Taxonomy unavailable.',
            correlationId: 'skills-503',
          },
          { status: 503 },
        )
      }),
    )
    const user = userEvent.setup()
    const view = renderWithProviders(<StudentSkillsPage />)
    expect(await view.findByRole('listitem', { name: /React/ })).toBeInTheDocument()

    await user.click(view.getByRole('button', { name: 'Add skill' }))
    const dialog = await view.findByRole('dialog', { name: 'Add skill' })
    expect(
      await within(dialog).findByRole('heading', { name: 'Add Skill unavailable' }),
    ).toBeInTheDocument()
  })

  it('preserves the intended competency and requires explicit retry after a stale update', async () => {
    const user = userEvent.setup()
    server.use(
      http.patch('/api/v1/me/declared-skills/:id', () =>
        HttpResponse.json(
          {
            type: 'about:blank',
            title: 'Precondition failed',
            status: 412,
            code: 'STALE_VERSION',
            message: 'Changed.',
            correlationId: 'skills-412',
          },
          { status: 412 },
        ),
      ),
    )
    const view = renderWithProviders(<StudentSkillsPage />)
    const reactRow = await view.findByRole('listitem', { name: /React/ }, { timeout: 5_000 })
    await user.click(within(reactRow).getByRole('button', { name: 'Actions for React' }))
    await user.click(view.getByRole('menuitem', { name: 'Edit competency' }))
    const editDialog = view.getByRole('dialog', { name: 'Edit competency for React' })
    await user.click(within(editDialog).getByRole('button', { name: 'Advanced' }))
    await user.click(within(editDialog).getByRole('button', { name: 'Save' }))

    expect(await view.findByText('Review the latest record')).toBeInTheDocument()
  }, 15_000)

  it('shows a no-results state for declared-skill search', async () => {
    const user = userEvent.setup()
    const view = renderWithProviders(<StudentSkillsPage />)
    await view.findByRole('listitem', { name: /React/ })

    await user.type(
      await view.findByRole('searchbox', { name: 'Search declared skills' }),
      'missing',
    )
    expect(await view.findByText('No matching declared skills')).toBeInTheDocument()
  })
})
