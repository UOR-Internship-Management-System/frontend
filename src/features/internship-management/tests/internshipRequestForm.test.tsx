import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { createQueryClient } from '../../../app/config/queryClient'
import { server } from '../../../mocks/server'
import { InternshipRequestForm } from '../components/InternshipRequestForm'

const companyId = '11111111-1111-4111-8111-111111111111'
const clusterId = '22222222-2222-4222-8222-222222222222'
const categoryId = '33333333-3333-4333-8333-333333333333'
const skillId = '44444444-4444-4444-8444-444444444444'
const company = {
  companyId,
  name: 'Example Technologies',
  websiteUrl: null,
  contactPerson: null,
  contactEmail: null,
  contactPhone: null,
  notes: null,
  active: true,
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
    http.get('/api/v1/skill-taxonomy/clusters', () =>
      HttpResponse.json(paged([{ clusterId, name: 'Core Engineering', description: null }])),
    ),
    http.get('/api/v1/skill-taxonomy/categories', () =>
      HttpResponse.json(paged([{ categoryId, name: 'Web Development', description: null }])),
    ),
    http.get('/api/v1/skill-taxonomy/skills', () =>
      HttpResponse.json(paged([{ skillId, name: 'TypeScript', description: null }])),
    ),
  )
  render(
    <QueryClientProvider client={createQueryClient()}>
      <InternshipRequestForm
        currentCompany={company}
        lockCompany
        mode="create"
        onCancel={() => undefined}
        onSubmit={onSubmit}
      />
    </QueryClientProvider>,
  )
  return onSubmit
}

describe('InternshipRequestForm wireframe behavior', () => {
  it('requires the role, maximum shortlist limit and at least one taxonomy skill', async () => {
    const user = userEvent.setup()
    renderForm()
    const dialog = screen.getByRole('dialog', { name: 'Create Candidate Selection Criteria' })
    await user.click(within(dialog).getByRole('button', { name: 'Add' }))
    expect(await within(dialog).findByText('Role title is required.')).toBeInTheDocument()
    expect(within(dialog).getByText('Maximum shortlist limit is required.')).toBeInTheDocument()
    expect(within(dialog).getByText('Select at least one required skill.')).toBeInTheDocument()
  })

  it('submits only wireframe-entered criteria with safe API defaults', async () => {
    const user = userEvent.setup()
    const submit = renderForm()
    const dialog = screen.getByRole('dialog', { name: 'Create Candidate Selection Criteria' })
    await user.type(within(dialog).getByLabelText('Internship Role Title'), 'Platform Intern')
    await user.type(within(dialog).getByLabelText('Maximum Shortlist Limit'), '8')
    await user.click(await within(dialog).findByLabelText('Select TypeScript'))
    await user.click(within(dialog).getByRole('button', { name: 'Add selected skills' }))
    await user.click(within(dialog).getByRole('button', { name: 'Add' }))
    await waitFor(() =>
      expect(submit).toHaveBeenCalledWith({
        companyId,
        title: 'Platform Intern',
        description: null,
        location: null,
        workMode: null,
        status: 'DRAFT',
        shortlistGuidanceValue: 8,
        notes: null,
        requiredSkills: [{ skillId, requiredCompetencyLevel: null }],
      }),
    )
  })
})
