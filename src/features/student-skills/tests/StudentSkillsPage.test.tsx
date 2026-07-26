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
  it('renders independent loading states and the persisted declared-skill list', async () => {
    server.use(
      http.get('/api/v1/skill-taxonomy/skills', async () => {
        await delay(60)
        return HttpResponse.json({
          items: [],
          page: { page: 0, size: 9, totalElements: 0, totalPages: 0, sort: 'name,asc' },
        })
      }),
    )
    const { getByRole, findByRole } = renderWithProviders(<StudentSkillsPage />)

    expect(getByRole('heading', { level: 1, name: 'Skills' })).toBeInTheDocument()
    expect(getByRole('status', { name: 'Loading available skills' })).toBeInTheDocument()
    expect(getByRole('status', { name: 'Loading declared skills' })).toBeInTheDocument()
    expect(await findByRole('row', { name: /React/ })).toBeInTheDocument()
  })

  it('adds, updates, and removes a canonical declared skill', async () => {
    const user = userEvent.setup()
    const view = renderWithProviders(<StudentSkillsPage />)

    const typeScript = await view.findByRole('button', { name: /TypeScript/ })
    await user.click(typeScript)
    await user.selectOptions(view.getByLabelText('Competency Level'), 'ADVANCED')
    await user.click(view.getByRole('button', { name: 'Add Skill' }))

    const typeScriptRow = await view.findByRole('row', { name: /TypeScript/ })
    expect(typeScriptRow).toHaveTextContent('TypeScript')
    expect(typeScriptRow).toHaveTextContent('Software Engineering')
    expect(typeScriptRow).toHaveTextContent('Frontend Development, Backend Development')
    expect(await view.findByText('Skill added')).toBeInTheDocument()

    const reactRow = view.getByRole('row', { name: /React/ })
    await user.selectOptions(within(reactRow).getByLabelText('Competency for React'), 'ADVANCED')
    await user.click(within(reactRow).getByRole('button', { name: 'Update competency for React' }))
    expect(await view.findByText('Competency updated')).toBeInTheDocument()

    await user.click(within(reactRow).getByRole('button', { name: 'Remove React' }))
    const dialog = view.getByRole('dialog', { name: 'Remove Skill' })
    await user.click(within(dialog).getByRole('button', { name: 'Remove' }))
    expect(await view.findByText('Skill removed')).toBeInTheDocument()
  })

  it('matches the wireframe section and table structure with a keyboard-safe cascade', async () => {
    const user = userEvent.setup()
    const view = renderWithProviders(<StudentSkillsPage />)

    expect(await view.findByRole('heading', { name: 'Add Skill Entry' })).toBeVisible()
    expect(view.getByRole('heading', { name: 'Available System Skills' })).toBeVisible()
    expect(view.getByRole('heading', { name: 'Declared Skills' })).toBeVisible()

    const table = await view.findByRole('table')
    for (const column of ['Core Cluster', 'Skill Category', 'Skill', 'Competency', 'Action']) {
      expect(within(table).getByRole('columnheader', { name: column })).toBeVisible()
    }
    expect(
      within(table).queryByRole('columnheader', { name: 'Last updated' }),
    ).not.toBeInTheDocument()

    await user.selectOptions(
      view.getByLabelText('Add Skill Core Cluster'),
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    )
    await user.selectOptions(
      view.getByLabelText('Add Skill Category'),
      'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
    )
    await user.selectOptions(
      view.getByLabelText('Add Skill Individual Skill'),
      '22222222-2222-4222-8222-222222222222',
    )
    await user.selectOptions(view.getByLabelText('Competency Level'), 'ADVANCED')
    await user.click(view.getByRole('button', { name: 'Add Skill' }))

    expect(await view.findByRole('row', { name: /TypeScript/ })).toBeVisible()
  })

  it('uses the Add Skill search to filter the available taxonomy list', async () => {
    const user = userEvent.setup()
    const view = renderWithProviders(<StudentSkillsPage />)
    const addSection = await view.findByRole('region', { name: 'Add Skill Entry' })
    const availableSkills = view.getByRole('region', { name: 'Available System Skills' })

    await user.type(
      await within(addSection).findByRole('searchbox', { name: 'Search available system skills' }),
      'TypeScript',
    )

    expect(await within(availableSkills).findByRole('button', { name: /TypeScript/ })).toBeVisible()
    await waitFor(() => {
      expect(within(availableSkills).queryByRole('button', { name: /JavaScript/ })).toBeNull()
    })
  })

  it('disables every canonical skill returned by the complete declaration query', async () => {
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
    const view = renderWithProviders(<StudentSkillsPage />)

    const availableSkills = await view.findByRole('region', { name: 'Available System Skills' })
    for (const skill of individualSkillsFixture) {
      expect(
        await within(availableSkills).findByRole('button', {
          name: new RegExp(`^${skill.name}\\.`),
        }),
      ).toBeDisabled()
    }
    expect(await within(availableSkills).findByText('1–6 of 6', { exact: false })).toBeVisible()
  })

  it('keeps available-taxonomy and declared-list errors independent', async () => {
    server.use(
      http.get('/api/v1/skill-taxonomy/skills', () =>
        HttpResponse.json(
          {
            type: 'about:blank',
            title: 'Unavailable',
            status: 503,
            code: 'SERVICE_UNAVAILABLE',
            message: 'Taxonomy unavailable.',
            correlationId: 'skills-503',
          },
          { status: 503 },
        ),
      ),
    )
    const view = renderWithProviders(<StudentSkillsPage />)

    expect(
      await view.findByRole('heading', { name: 'Skill taxonomy unavailable' }, { timeout: 3_000 }),
    ).toBeInTheDocument()
    expect(await view.findByRole('row', { name: /React/ })).toBeInTheDocument()
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
    const reactRow = await view.findByRole('row', { name: /React/ }, { timeout: 5_000 })
    const competency = within(reactRow).getByLabelText('Competency for React')
    await user.selectOptions(competency, 'ADVANCED')
    await user.click(within(reactRow).getByRole('button', { name: 'Update competency for React' }))

    expect(await view.findByText('Review the latest record')).toBeInTheDocument()
    expect(competency).toHaveValue('ADVANCED')
    expect(
      within(reactRow).getByRole('button', { name: 'Update competency for React' }),
    ).toBeEnabled()
  }, 15_000)

  it('shows a no-results state for declared-skill search without changing taxonomy state', async () => {
    const user = userEvent.setup()
    const view = renderWithProviders(<StudentSkillsPage />)
    await view.findByRole('row', { name: /React/ })

    await user.type(
      await view.findByRole('searchbox', { name: 'Search declared skills' }),
      'missing',
    )
    expect(await view.findByText('No matching declared skills')).toBeInTheDocument()
    expect(view.getByRole('button', { name: /React/ })).toBeDisabled()
  })
})
