import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { createQueryClient } from '../../../app/config/queryClient'
import { NotificationProvider } from '../../../app/providers/NotificationProvider'
import { server } from '../../../mocks/server'
import { ShortlistsPage } from '../pages/ShortlistsPage'

const shortlistId = '11111111-1111-4111-8111-111111111111'
const requestId = '22222222-2222-4222-8222-222222222222'
const companyId = '33333333-3333-4333-8333-333333333333'
const studentId = '44444444-4444-4444-8444-444444444444'
const exportJobId = '55555555-5555-4555-8555-555555555555'
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

const shortlist = {
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
  status: 'FINALIZED' as const,
  guidanceValue: 10,
  selectedCandidateCount: 1,
  guidanceExceeded: false,
  guidanceWarning: null,
  version: 8,
  createdAt: now,
  updatedAt: now,
  finalizedAt: now,
}

const candidate = {
  studentId,
  indexNumber: 'SC/2022/12345',
  fullName: 'Ayesha Perera',
  officialGpa: 3.42,
  gpaAvailabilityStatus: 'AVAILABLE' as const,
  hasLatestSavedCv: true,
  hasExistingActiveShortlist: false,
  existingActiveShortlistCount: 0,
  selectedAt: now,
  selectionNote: null,
}

function paged<T>(items: T[], sort: string, size = 5) {
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

function installHandlers(onList = vi.fn(), onDetail = vi.fn()) {
  server.use(
    http.get('/api/v1/admin/companies', () => HttpResponse.json(paged([company], 'name,asc', 100))),
    http.get('/api/v1/admin/shortlists', ({ request }) => {
      onList(new URL(request.url))
      return HttpResponse.json(paged([shortlist], 'updatedAt,desc'))
    }),
    http.get('/api/v1/admin/shortlists/:shortlistId', ({ request }) => {
      onDetail(new URL(request.url))
      return HttpResponse.json({
        shortlist,
        candidates: paged([candidate], 'officialGpa,desc', 100),
      })
    }),
  )
}

function renderPage(initialEntry = '/admin/shortlists') {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <NotificationProvider>
        <MemoryRouter initialEntries={[initialEntry]}>
          <ShortlistsPage />
        </MemoryRouter>
      </NotificationProvider>
    </QueryClientProvider>,
  )
}

describe('ShortlistsPage wireframe', () => {
  it('renders the finalized active request matrix and its exact filters', async () => {
    const onList = vi.fn()
    installHandlers(onList)
    renderPage()

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Shortlisted Candidates' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Active Request Matrix' })).toBeVisible()
    expect(screen.getByLabelText('Search Company')).toHaveAttribute(
      'placeholder',
      'Search by company name...',
    )
    expect(
      await screen.findByText(
        (_, element) =>
          element?.tagName === 'P' &&
          Boolean(element.textContent?.includes('Company: Example Technologies')),
      ),
    ).toHaveTextContent('1 Candidates Shortlisted')
    expect(screen.getByRole('button', { name: 'Details' })).toBeEnabled()
    expect(screen.getByText('Showing 1 to 1 of 1 active records')).toBeVisible()

    const listUrl = onList.mock.calls[0]?.[0] as URL
    expect(listUrl.searchParams.get('status')).toBe('FINALIZED')
    expect(listUrl.searchParams.get('size')).toBe('5')
  })

  it('opens the wireframe detail modal with candidate search, GPA sorting, and downloads', async () => {
    installHandlers()
    const user = userEvent.setup()
    renderPage()

    await user.click(await screen.findByRole('button', { name: 'Details' }))
    const dialog = await screen.findByRole('dialog', { name: 'Example Technologies' })

    expect(within(dialog).getByText('Software Engineering Intern')).toBeVisible()
    expect(within(dialog).getByLabelText('Search Candidates')).toBeVisible()
    expect(within(dialog).getByLabelText('Sort Rules')).toHaveValue('officialGpa,desc')
    expect(within(dialog).getByText('Ayesha Perera')).toBeVisible()
    expect(within(dialog).getByText(/SC[/]2022[/]12345/)).toHaveTextContent('GPA: 3.42')
    expect(within(dialog).getByRole('button', { name: 'CV' })).toBeEnabled()
    expect(within(dialog).getByRole('button', { name: 'Download All CVs' })).toBeEnabled()
    expect(within(dialog).getByRole('button', { name: 'Download Final Shortlist' })).toBeEnabled()
    expect(
      within(dialog).queryByRole('button', { name: /Finalize shortlist/i }),
    ).not.toBeInTheDocument()
    expect(within(dialog).queryByRole('button', { name: /Remove /i })).not.toBeInTheDocument()
  })

  it('sends candidate search and GPA sort through the shortlist detail contract', async () => {
    const onDetail = vi.fn()
    installHandlers(vi.fn(), onDetail)
    const user = userEvent.setup()
    renderPage()

    await user.click(await screen.findByRole('button', { name: 'Details' }))
    const dialog = await screen.findByRole('dialog', { name: 'Example Technologies' })
    await user.type(within(dialog).getByLabelText('Search Candidates'), 'Ayesha')
    await user.selectOptions(within(dialog).getByLabelText('Sort Rules'), 'officialGpa,asc')

    await waitFor(() => {
      const urls = onDetail.mock.calls.map(([url]) => url as URL)
      expect(urls.some((url) => url.searchParams.get('candidateSearch') === 'Ayesha')).toBe(true)
      expect(urls.some((url) => url.searchParams.get('sort') === 'officialGpa,asc')).toBe(true)
    })
  })

  it('starts the wireframe bulk and final shortlist export actions', async () => {
    const bulkCall = vi.fn()
    const summaryCall = vi.fn()
    installHandlers()
    server.use(
      http.post('/api/v1/admin/exports/shortlists/:shortlistId/bulk-cvs', () => {
        bulkCall()
        return HttpResponse.json(
          {
            exportJobId,
            shortlistId,
            exportType: 'BULK_LATEST_CV_ZIP',
            format: 'ZIP',
            status: 'QUEUED',
            totalCandidateCount: 1,
            includedFileCount: 0,
            missingCvCount: 0,
            missingCvStudents: [],
            warnings: [],
            downloadReady: false,
            downloadUrl: null,
            failureCode: null,
            failureMessage: null,
            createdAt: now,
            startedAt: null,
            completedAt: null,
            expiresAt: null,
          },
          { status: 202 },
        )
      }),
      http.post('/api/v1/admin/exports/shortlists/:shortlistId', () => {
        summaryCall()
        return HttpResponse.json(
          {
            exportJobId,
            shortlistId,
            exportType: 'SHORTLIST_SUMMARY_CSV',
            format: 'CSV',
            status: 'QUEUED',
            totalCandidateCount: 1,
            includedFileCount: 0,
            missingCvCount: 0,
            missingCvStudents: [],
            warnings: [],
            downloadReady: false,
            downloadUrl: null,
            failureCode: null,
            failureMessage: null,
            createdAt: now,
            startedAt: null,
            completedAt: null,
            expiresAt: null,
          },
          { status: 202 },
        )
      }),
      http.get('/api/v1/admin/exports/:exportJobId', () =>
        HttpResponse.json({
          exportJobId,
          shortlistId,
          exportType: 'SHORTLIST_SUMMARY_CSV',
          format: 'CSV',
          status: 'QUEUED',
          totalCandidateCount: 1,
          includedFileCount: 0,
          missingCvCount: 0,
          missingCvStudents: [],
          warnings: [],
          downloadReady: false,
          downloadUrl: null,
          failureCode: null,
          failureMessage: null,
          createdAt: now,
          startedAt: null,
          completedAt: null,
          expiresAt: null,
        }),
      ),
    )

    const user = userEvent.setup()
    const bulkView = renderPage()
    await user.click(await screen.findByRole('button', { name: 'Details' }))
    const dialog = await screen.findByRole('dialog', { name: 'Example Technologies' })

    await user.click(within(dialog).getByRole('button', { name: 'Download All CVs' }))
    expect(await screen.findByRole('alertdialog', { name: 'Compiling Pipeline' })).toBeVisible()
    expect(bulkCall).toHaveBeenCalledOnce()
    await user.click(screen.getByRole('button', { name: 'Acknowledge' }))
    bulkView.unmount()

    renderPage()
    await user.click(await screen.findByRole('button', { name: 'Details' }))
    const summaryDialog = await screen.findByRole('dialog', { name: 'Example Technologies' })
    await user.click(
      within(summaryDialog).getByRole('button', { name: 'Download Final Shortlist' }),
    )
    expect(await screen.findByRole('alertdialog', { name: 'Compiling Pipeline' })).toBeVisible()
    expect(summaryCall).toHaveBeenCalledOnce()
  })
})
