import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { createQueryClient } from '../../../app/config/queryClient'
import { server } from '../../../mocks/server'
import {
  allowedRequestStatuses,
  emptyInternshipRequestForm,
  InternshipRequestForm,
} from '../components/InternshipRequestForm'

const companyId = '11111111-1111-4111-8111-111111111111'
const clusterId = '22222222-2222-4222-8222-222222222222'
const categoryId = '33333333-3333-4333-8333-333333333333'
const skillId = '44444444-4444-4444-8444-444444444444'
const now = '2026-07-20T09:30:00Z'
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
  createdAt: now,
  updatedAt: now,
}

function paged<Item>(items: Item[], sort = 'name,asc') {
  return {
    items,
    page: {
      page: 0,
      size: 20,
      totalElements: items.length,
      totalPages: items.length ? 1 : 0,
      sort,
    },
  }
}

function installHandlers(onCompanyQuery?: (url: URL) => void) {
  server.use(
    http.get('/api/v1/admin/companies', ({ request }) => {
      onCompanyQuery?.(new URL(request.url))
      return HttpResponse.json(paged([company]))
    }),
    http.get('/api/v1/skill-taxonomy/clusters', () =>
      HttpResponse.json(paged([{ clusterId, name: 'Software Engineering', description: null }])),
    ),
    http.get('/api/v1/skill-taxonomy/categories', () =>
      HttpResponse.json(paged([{ categoryId, name: 'Web Development', description: null }])),
    ),
    http.get('/api/v1/skill-taxonomy/skills', () =>
      HttpResponse.json(
        paged([{ skillId, name: 'TypeScript', description: 'Typed application development' }]),
      ),
    ),
  )
}

function renderForm(onSubmit = vi.fn().mockResolvedValue(undefined)) {
  render(
    <QueryClientProvider client={createQueryClient()}>
      <InternshipRequestForm mode="create" onCancel={() => undefined} onSubmit={onSubmit} />
    </QueryClientProvider>,
  )
  return onSubmit
}

describe('InternshipRequestForm', () => {
  it('queries only active companies and reports required company, title, and skill fields', async () => {
    const user = userEvent.setup()
    const companyQuery = vi.fn()
    installHandlers(companyQuery)
    renderForm()
    const dialog = screen.getByRole('dialog', { name: 'Create Candidate Selection Criteria' })
    await screen.findByRole('option', { name: 'Example Technologies' })
    await user.click(within(dialog).getByRole('button', { name: 'Add request' }))
    expect(await within(dialog).findByText('Select an active company.')).toBeInTheDocument()
    expect(within(dialog).getByText('Role title is required.')).toBeInTheDocument()
    expect(within(dialog).getByText('Select at least one required skill.')).toBeInTheDocument()
    expect(companyQuery).toHaveBeenCalled()
    expect(companyQuery.mock.calls[0]?.[0].searchParams.get('active')).toBe('true')
  })

  it('stages canonical skills, sets competency, and submits complete normalized metadata', async () => {
    const user = userEvent.setup()
    installHandlers()
    const onSubmit = renderForm()
    const dialog = screen.getByRole('dialog', { name: 'Create Candidate Selection Criteria' })
    await screen.findByRole('option', { name: 'Example Technologies' })
    await user.selectOptions(within(dialog).getByLabelText('Active company'), companyId)
    await user.type(within(dialog).getByLabelText(/Internship role title/i), '  Platform Intern  ')
    await user.type(within(dialog).getByLabelText(/Role description/i), 'Build platform features.')
    await user.type(within(dialog).getByLabelText(/^Location$/i), 'Colombo')
    await user.selectOptions(within(dialog).getByLabelText(/Work mode/i), 'HYBRID')
    await user.selectOptions(within(dialog).getByLabelText(/Lifecycle status/i), 'ACTIVE')
    await user.type(within(dialog).getByLabelText(/Shortlist guidance value/i), '8')
    await user.type(within(dialog).getByLabelText(/Administrative notes/i), 'Internal note.')

    await user.click(await within(dialog).findByLabelText('Select TypeScript'))
    await user.click(within(dialog).getByRole('button', { name: 'Add selected skills' }))
    await user.selectOptions(
      within(dialog).getByLabelText('Required competency for TypeScript'),
      'ADVANCED',
    )
    await user.click(within(dialog).getByRole('button', { name: 'Add request' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit).toHaveBeenCalledWith({
      companyId,
      title: 'Platform Intern',
      description: 'Build platform features.',
      location: 'Colombo',
      workMode: 'HYBRID',
      status: 'ACTIVE',
      shortlistGuidanceValue: 8,
      notes: 'Internal note.',
      requiredSkills: [{ skillId, requiredCompetencyLevel: 'ADVANCED' }],
    })
  })

  it('offers only supported lifecycle transitions', () => {
    expect(allowedRequestStatuses('create', 'DRAFT')).toEqual(['DRAFT', 'ACTIVE'])
    expect(allowedRequestStatuses('edit', 'DRAFT')).toEqual(['DRAFT', 'ACTIVE'])
    expect(allowedRequestStatuses('edit', 'ACTIVE')).toEqual(['ACTIVE', 'CLOSED'])
    expect(allowedRequestStatuses('edit', 'CLOSED')).toEqual(['CLOSED'])
    expect(allowedRequestStatuses('edit', 'CANCELLED')).toEqual(['CANCELLED'])
    expect(emptyInternshipRequestForm.requiredSkills).toEqual([])
  })
})