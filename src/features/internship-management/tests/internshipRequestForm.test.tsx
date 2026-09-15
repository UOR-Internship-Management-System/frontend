import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { createQueryClient } from '../../../app/config/queryClient'
import { server } from '../../../mocks/server'
import { InternshipRequestForm } from '../components/InternshipRequestForm'

const companyId = '11111111-1111-4111-8111-111111111111'
const skillId = '44444444-4444-4444-8444-444444444444'
const company = {
  companyId,
  name: 'Example Technologies',
  websiteUrl: null,
  contactPerson: null,
  contactEmail: null,
  contactPhone: null,
  notes: null,
  version: 1,
  createdAt: '2026-07-20T09:30:00Z',
  updatedAt: '2026-07-20T09:30:00Z',
}
const paged = <Item,>(items: Item[]) => ({
  items,
  page: {
    page: 0,
    size: 20,
    totalElements: items.length,
    totalPages: items.length ? 1 : 0,
    sort: 'name,asc',
  },
})

function renderForm(onSubmit = vi.fn().mockResolvedValue(undefined)) {
  server.use(
    http.get('/api/v1/skill-taxonomy/skills', () =>
      HttpResponse.json(paged([{ skillId, name: 'TypeScript', description: null }])),
    ),
  )
  render(
    <QueryClientProvider client={createQueryClient()}>
      <InternshipRequestForm
        currentCompany={company}
        mode="create"
        onCancel={() => undefined}
        onSubmit={onSubmit}
      />
    </QueryClientProvider>,
  )
  return onSubmit
}

describe('InternshipRequestForm wireframe contract', () => {
  it('uses the wide adaptive dialog and omits redundant fields', () => {
    renderForm()
    const dialog = screen.getByRole('dialog', { name: 'Create Internship Request' })

    expect(dialog).toHaveClass('m3-dialog--large')
    expect(within(dialog).queryByLabelText('Company')).not.toBeInTheDocument()
    expect(within(dialog).queryByText(/Work arrangement and notes/i)).not.toBeInTheDocument()
    expect(within(dialog).queryByLabelText('Location')).not.toBeInTheDocument()
    expect(within(dialog).queryByLabelText('Work Mode')).not.toBeInTheDocument()
    expect(within(dialog).queryByLabelText('Administrative Notes')).not.toBeInTheDocument()
  })

  it('requires the role title while keeping guidance and skill requirements optional', async () => {
    const user = userEvent.setup()
    const submit = renderForm()
    const dialog = screen.getByRole('dialog', { name: 'Create Internship Request' })
    await user.click(within(dialog).getByRole('button', { name: 'Create Request' }))
    expect(await within(dialog).findByText('Role title is required.')).toBeInTheDocument()
    expect(within(dialog).queryByText(/guidance value is required/i)).not.toBeInTheDocument()
    expect(
      within(dialog).queryByText(/select at least one required skill/i),
    ).not.toBeInTheDocument()
    expect(within(dialog).queryByText(/GPA/i)).not.toBeInTheDocument()

    await user.type(within(dialog).getByLabelText('Internship Role Title'), 'General Intern')
    await user.click(within(dialog).getByRole('button', { name: 'Create Request' }))
    await waitFor(() =>
      expect(submit).toHaveBeenCalledWith(
        expect.objectContaining({
          companyId,
          title: 'General Intern',
          shortlistGuidanceValue: null,
          requiredSkills: [],
        }),
      ),
    )
  })

  it('submits only wireframe-managed request fields and taxonomy skill identifiers', async () => {
    const user = userEvent.setup()
    const submit = renderForm()
    const dialog = screen.getByRole('dialog', { name: 'Create Internship Request' })

    await user.type(within(dialog).getByLabelText('Internship Role Title'), 'Platform Intern')
    await user.type(within(dialog).getByLabelText('Shortlist Guidance Value (Optional)'), '8')
    await user.type(within(dialog).getByLabelText('Role Description'), 'Build platform features')
    const results = await within(dialog).findByRole('list', { name: 'Taxonomy skill results' })
    await user.click(within(results).getByRole('button', { name: 'TypeScript' }))

    expect(
      within(dialog).queryByLabelText('Required competency level for TypeScript'),
    ).not.toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Create Request' }))

    await waitFor(() =>
      expect(submit).toHaveBeenCalledWith({
        companyId,
        title: 'Platform Intern',
        description: 'Build platform features',
        shortlistGuidanceValue: 8,
        requiredSkills: [{ skillId }],
      }),
    )
  })
})
