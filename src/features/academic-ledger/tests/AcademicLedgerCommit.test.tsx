import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { createQueryClient } from '../../../app/config/queryClient'
import { routePaths } from '../../../app/config/routePaths'
import { ledgerUploadId } from '../../../mocks/fixtures/academicLedger.fixture'
import { server } from '../../../mocks/server'
import { AcademicLedgerPage } from '../pages/AcademicLedgerPage'

function renderCommitPage() {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <MemoryRouter
        initialEntries={[`${routePaths.adminAcademicLedger}?uploadId=${ledgerUploadId}`]}
      >
        <AcademicLedgerPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('Academic Ledger transactional commit', () => {
  it('requires explicit confirmation, sends confirm true, and reports the result', async () => {
    const user = userEvent.setup()
    let body: unknown
    server.use(
      http.post(
        '/api/v1/admin/academic-ledger/uploads/:uploadId/commit',
        async ({ request, params }) => {
          body = await request.json()
          return HttpResponse.json({
            uploadId: String(params.uploadId),
            status: 'COMMITTED',
            committedRecords: 4,
            affectedStudents: 3,
            recalculatedGpaCount: 3,
            committedAt: '2026-07-18T09:00:00+05:30',
          })
        },
      ),
    )
    renderCommitPage()
    const open = await screen.findByRole('button', { name: 'Commit official records' })
    await waitFor(() => expect(open).toBeEnabled())
    await user.click(open)
    expect(
      screen.getByRole('dialog', { name: 'Commit official academic records' }),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Confirm commit' }))
    expect(await screen.findByText('Academic records committed successfully.')).toBeInTheDocument()
    expect(body).toEqual({ confirm: true })
  })

  it('keeps the confirmation open and maps conflicts to a recoverable message', async () => {
    const user = userEvent.setup()
    const conflict = vi.fn()
    server.use(
      http.post('/api/v1/admin/academic-ledger/uploads/:uploadId/commit', () => {
        conflict()
        return HttpResponse.json(
          { title: 'Commit conflict', status: 409, correlationId: 'ledger-409' },
          { status: 409 },
        )
      }),
    )
    renderCommitPage()
    const open = await screen.findByRole('button', { name: 'Commit official records' })
    await waitFor(() => expect(open).toBeEnabled())
    await user.click(open)
    await user.click(screen.getByRole('button', { name: 'Confirm commit' }))
    expect(await screen.findByText(/conflicts with existing information/i)).toBeInTheDocument()
    expect(screen.getByText('Reference: ledger-409')).toBeInTheDocument()
    expect(conflict).toHaveBeenCalledOnce()
  })
})
