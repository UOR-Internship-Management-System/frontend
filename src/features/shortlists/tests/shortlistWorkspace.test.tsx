import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { createQueryClient } from '../../../app/config/queryClient'
import { NotificationProvider } from '../../../app/providers/NotificationProvider'
import { server } from '../../../mocks/server'
import { ShortlistsPage } from '../pages/ShortlistsPage'

const shortlistId = '11111111-1111-4111-8111-111111111111'
const requestId = '22222222-2222-4222-8222-222222222222'
const companyId = '33333333-3333-4333-8333-333333333333'
const studentId = '44444444-4444-4444-8444-444444444444'
const now = '2026-07-21T09:30:00Z'

const company = {
  companyId,
  name: 'Example Technologies',
  websiteUrl: null,
  contactPerson: 'Nimali Perera',
  contactEmail: 'nimali@example.test',
  contactPhone: null,
  notes: null,
  active: true,
  version: 2,
  createdAt: now,
  updatedAt: now,
}

const draftShortlist = {
  shortlistId,
  request: {
    requestId,
    companyId,
    companyName: company.name,
    title: 'Software Engineering Intern',
    status: 'ACTIVE' as const,
    shortlistGuidanceValue: 10,
  },
  filterRunId: null,
  name: null,
  status: 'DRAFT' as const,
  guidanceValue: 10,
  selectedCandidateCount: 1,
  guidanceExceeded: false,
  guidanceWarning: null,
  version: 7,
  createdAt: now,
  updatedAt: now,
  finalizedAt: null,
}

const candidate = {
  studentId,
  indexNumber: 'SC/2022/12345',
  fullName: 'Ayesha Perera',
  officialGpa: 3.42,
  gpaAvailabilityStatus: 'AVAILABLE' as const,
  hasLatestSavedCv: true,
  hasExistingActiveShortlist: true,
  existingActiveShortlistCount: 1,
  selectedAt: now,
  selectionNote: null,
}

function paged<T>(items: T[], sort: string, size = 20) {
  return {
    items,
    page: {
      page: 0,
      size,
      totalElements: items.length,
      totalPages: items.length ? 1 : 0,
      sort,
    },
  }
}

function LocationProbe() {
  return <output data-testid="location">{useLocation().search}</output>
}

function installHandlers({
  finalized = false,
  removed = false,
}: {
  finalized?: boolean
  removed?: boolean
} = {}) {
  let candidateRemoved = removed

  server.use(
    http.get('/api/v1/admin/companies', () => HttpResponse.json(paged([company], 'name,asc', 100))),
    http.get('/api/v1/admin/shortlists', () => {
      const shortlist = finalized
        ? {
            ...draftShortlist,
            status: 'FINALIZED' as const,
            finalizedAt: now,
          }
        : draftShortlist
      return HttpResponse.json(paged([shortlist], 'updatedAt,desc'))
    }),
    http.get('/api/v1/admin/shortlists/:shortlistId', () => {
      const shortlist = finalized
        ? {
            ...draftShortlist,
            status: 'FINALIZED' as const,
            finalizedAt: now,
          }
        : candidateRemoved
          ? {
              ...draftShortlist,
              selectedCandidateCount: 0,
              version: 8,
            }
          : draftShortlist

      return HttpResponse.json({
        shortlist,
        candidates: paged(candidateRemoved ? [] : [candidate], 'officialGpa,desc'),
      })
    }),
    http.delete('/api/v1/admin/shortlists/:shortlistId/candidates/:studentId', ({ request }) => {
      candidateRemoved = true
      return HttpResponse.json(
        {
          shortlistId,
          addedCount: 0,
          alreadyPresentCount: 0,
          removedCount: 1,
          selectedCandidateCount: 0,
          guidanceExceeded: false,
          version: 8,
        },
        {
          headers: {
            'x-observed-if-match': request.headers.get('If-Match') ?? '',
          },
        },
      )
    }),
  )
}

function renderPage(initialEntry = `/admin/shortlists?shortlistId=${shortlistId}`) {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <NotificationProvider>
        <MemoryRouter initialEntries={[initialEntry]}>
          <ShortlistsPage />
          <LocationProbe />
        </MemoryRouter>
      </NotificationProvider>
    </QueryClientProvider>,
  )
}

describe('ShortlistsPage', () => {
  it('renders the selected shortlist and factual candidate data', async () => {
    installHandlers()
    renderPage()

    expect(
      await screen.findByRole('heading', {
        level: 2,
        name: 'Software Engineering Intern',
      }),
    ).toBeInTheDocument()

    expect(screen.getAllByText('Example Technologies').length).toBeGreaterThan(0)
    expect(screen.getByText('3.42')).toBeInTheDocument()
    expect(screen.getByText('Available')).toBeInTheDocument()
    expect(screen.getByText('1 existing')).toBeInTheDocument()

    expect(
      screen.getByRole('link', {
        name: 'Ayesha Perera',
      }),
    ).toHaveAttribute('href', `/admin/students/${studentId}`)

    expect(
      screen.getByRole('button', {
        name: 'Remove Ayesha Perera',
      }),
    ).toBeInTheDocument()

    expect(screen.getByTestId('location')).toHaveTextContent(`shortlistId=${shortlistId}`)
  })

  it('removes a draft candidate with the current quoted version', async () => {
    const removeCall = vi.fn()
    installHandlers()

    server.use(
      http.delete('/api/v1/admin/shortlists/:shortlistId/candidates/:studentId', ({ request }) => {
        removeCall(request.headers.get('If-Match'))
        return HttpResponse.json({
          shortlistId,
          addedCount: 0,
          alreadyPresentCount: 0,
          removedCount: 1,
          selectedCandidateCount: 0,
          guidanceExceeded: false,
          version: 8,
        })
      }),
      http.get('/api/v1/admin/shortlists/:shortlistId', () =>
        HttpResponse.json({
          shortlist: {
            ...draftShortlist,
            selectedCandidateCount: removeCall.mock.calls.length ? 0 : 1,
            version: removeCall.mock.calls.length ? 8 : 7,
          },
          candidates: paged(removeCall.mock.calls.length ? [] : [candidate], 'officialGpa,desc'),
        }),
      ),
    )

    const user = userEvent.setup()
    renderPage()

    await user.click(
      await screen.findByRole('button', {
        name: 'Remove Ayesha Perera',
      }),
    )

    const dialog = await screen.findByRole('dialog', {
      name: 'Remove candidate from draft',
    })

    await user.click(
      within(dialog).getByRole('button', {
        name: 'Remove candidate',
      }),
    )

    await waitFor(() => expect(removeCall).toHaveBeenCalledWith('"7"'))

    expect(
      await screen.findByText('This draft shortlist does not contain any candidates yet.'),
    ).toBeInTheDocument()

    expect(await screen.findByText('Candidate removed')).toBeInTheDocument()
  })

  it('keeps finalized shortlist membership read-only', async () => {
    installHandlers({ finalized: true })
    renderPage()

    expect(await screen.findByText(/Candidate membership is read-only/)).toBeInTheDocument()

    expect(
      screen.queryByRole('button', {
        name: 'Remove Ayesha Perera',
      }),
    ).not.toBeInTheDocument()

    expect(screen.getAllByText('Finalized').length).toBeGreaterThan(0)
  })
  it('finalizes a shortlist within guidance without acknowledgement', async () => {
    const finalizeCall = vi.fn()
    let finalized = false

    installHandlers()

    server.use(
      http.get('/api/v1/admin/shortlists', () =>
        HttpResponse.json(
          paged(
            [
              finalized
                ? {
                    ...draftShortlist,
                    status: 'FINALIZED' as const,
                    version: 8,
                    finalizedAt: now,
                  }
                : draftShortlist,
            ],
            'updatedAt,desc',
          ),
        ),
      ),
      http.get('/api/v1/admin/shortlists/:shortlistId', () =>
        HttpResponse.json({
          shortlist: finalized
            ? {
                ...draftShortlist,
                status: 'FINALIZED' as const,
                version: 8,
                finalizedAt: now,
              }
            : draftShortlist,
          candidates: paged([candidate], 'officialGpa,desc'),
        }),
      ),
      http.post('/api/v1/admin/shortlists/:shortlistId/finalize', async ({ request }) => {
        finalizeCall(request.headers.get('If-Match'), await request.json())
        finalized = true

        return HttpResponse.json({
          shortlistId,
          status: 'FINALIZED',
          selectedCandidateCount: 1,
          guidanceValue: 10,
          guidanceExceeded: false,
          guidanceAcknowledged: false,
          version: 8,
          finalizedAt: now,
        })
      }),
    )

    const user = userEvent.setup()
    renderPage()

    await user.click(
      await screen.findByRole('button', {
        name: 'Finalize shortlist',
      }),
    )

    const dialog = await screen.findByRole('dialog', {
      name: 'Finalize shortlist',
    })

    expect(within(dialog).queryByRole('checkbox')).not.toBeInTheDocument()

    await user.type(
      within(dialog).getByLabelText('Finalization note (optional)'),
      'Confirmed after manual review.',
    )

    await user.click(
      within(dialog).getByRole('button', {
        name: 'Finalize shortlist',
      }),
    )

    await waitFor(() =>
      expect(finalizeCall).toHaveBeenCalledWith('"7"', {
        acknowledgeGuidanceWarning: false,
        finalizationNote: 'Confirmed after manual review.',
      }),
    )

    expect(await screen.findByText(/Candidate membership is read-only/)).toBeInTheDocument()
    expect(await screen.findByText('Shortlist finalized')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', {
        name: 'Finalize shortlist',
      }),
    ).not.toBeInTheDocument()
  })

  it('requires explicit acknowledgement when advisory guidance is exceeded', async () => {
    const finalizeCall = vi.fn()
    const exceededShortlist = {
      ...draftShortlist,
      guidanceValue: 1,
      selectedCandidateCount: 2,
      guidanceExceeded: true,
      guidanceWarning:
        'The selected count exceeds the request guidance value. Review and acknowledge before finalizing.',
    }

    installHandlers()

    server.use(
      http.get('/api/v1/admin/shortlists', () =>
        HttpResponse.json(paged([exceededShortlist], 'updatedAt,desc')),
      ),
      http.get('/api/v1/admin/shortlists/:shortlistId', () =>
        HttpResponse.json({
          shortlist: exceededShortlist,
          candidates: paged([candidate], 'officialGpa,desc'),
        }),
      ),
      http.post('/api/v1/admin/shortlists/:shortlistId/finalize', async ({ request }) => {
        finalizeCall(request.headers.get('If-Match'), await request.json())

        return HttpResponse.json({
          shortlistId,
          status: 'FINALIZED',
          selectedCandidateCount: 2,
          guidanceValue: 1,
          guidanceExceeded: true,
          guidanceAcknowledged: true,
          version: 8,
          finalizedAt: now,
        })
      }),
    )

    const user = userEvent.setup()
    renderPage()

    expect(await screen.findByText('Guidance exceeded')).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', {
        name: 'Finalize shortlist',
      }),
    )

    const dialog = await screen.findByRole('dialog', {
      name: 'Finalize shortlist',
    })

    const submit = within(dialog).getByRole('button', {
      name: 'Finalize shortlist',
    })

    expect(submit).toBeDisabled()

    const acknowledgement = within(dialog).getByRole('checkbox', {
      name: /I acknowledge that the selected count exceeds the advisory guidance value/i,
    })

    await user.click(acknowledgement)
    expect(submit).toBeEnabled()

    await user.click(submit)

    await waitFor(() =>
      expect(finalizeCall).toHaveBeenCalledWith('"7"', {
        acknowledgeGuidanceWarning: true,
        finalizationNote: null,
      }),
    )
  })

  it('refetches and renders the current immutable state after concurrent finalization', async () => {
    let finalizeAttempted = false

    installHandlers()

    server.use(
      http.get('/api/v1/admin/shortlists/:shortlistId', () =>
        HttpResponse.json({
          shortlist: finalizeAttempted
            ? {
                ...draftShortlist,
                status: 'FINALIZED' as const,
                version: 8,
                finalizedAt: now,
              }
            : draftShortlist,
          candidates: paged([candidate], 'officialGpa,desc'),
        }),
      ),
      http.post('/api/v1/admin/shortlists/:shortlistId/finalize', () => {
        finalizeAttempted = true

        return HttpResponse.json(
          {
            type: 'https://uor-cv-system/errors/shortlist-state-conflict',
            title: 'Shortlist state conflict',
            status: 409,
            code: 'SHORTLIST_STATE_CONFLICT',
            message: 'The shortlist was already finalized.',
            correlationId: 'req-concurrent-finalization',
          },
          { status: 409 },
        )
      }),
    )

    const user = userEvent.setup()
    renderPage()

    await user.click(
      await screen.findByRole('button', {
        name: 'Finalize shortlist',
      }),
    )

    const dialog = await screen.findByRole('dialog', {
      name: 'Finalize shortlist',
    })

    await user.click(
      within(dialog).getByRole('button', {
        name: 'Finalize shortlist',
      }),
    )

    expect(await screen.findByText(/Candidate membership is read-only/)).toBeInTheDocument()
    expect(
      screen.queryByRole('dialog', {
        name: 'Finalize shortlist',
      }),
    ).not.toBeInTheDocument()
    expect(screen.queryByText('Shortlist finalized')).not.toBeInTheDocument()
  })
})
