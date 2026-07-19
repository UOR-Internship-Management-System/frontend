import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { delay, http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '../../../mocks/server'
import {
  ledgerUploadDetailFixture,
  ledgerUploadsFixture,
} from '../../../mocks/fixtures/academicLedger.fixture'
import { registeredStudentsFixture } from '../../../mocks/fixtures/registeredStudents.fixture'
import { createQueryClient } from '../../../app/config/queryClient'
import { routePaths } from '../../../app/config/routePaths'
import { AcademicLedgerPage } from '../pages/AcademicLedgerPage'

function LocationProbe() {
  return <output data-testid="location">{useLocation().search}</output>
}

function renderPage(initialEntry: string = routePaths.adminAcademicLedger) {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route
            path={routePaths.adminAcademicLedger}
            element={
              <>
                <AcademicLedgerPage />
                <LocationProbe />
              </>
            }
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('AcademicLedgerPage upload workflow', () => {
  it('renders recent batches and restores selected upload from the URL', async () => {
    renderPage(`${routePaths.adminAcademicLedger}?uploadId=9acbe15c-1412-49c7-a728-a923480da95a`)
    expect(await screen.findByRole('heading', { name: 'Academic Ledger' })).toBeInTheDocument()
    expect(
      await screen.findByRole('table', { name: 'Recent academic ledger upload batches' }),
    ).toBeInTheDocument()
    expect(
      await screen.findByText('All staged rows passed validation and are ready to commit.'),
    ).toBeInTheDocument()
    expect(screen.getAllByText('Ready to commit').length).toBeGreaterThan(0)
  })

  it('rejects non-CSV files before upload and accepts a valid CSV', async () => {
    const user = userEvent.setup({ applyAccept: false })
    renderPage()
    const input = await screen.findByLabelText('Ledger CSV')
    await user.upload(input, new File(['not csv'], 'results.txt', { type: 'text/plain' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Choose a .csv file')
    expect(screen.getByRole('button', { name: 'Upload and validate' })).toBeDisabled()

    await user.upload(
      input,
      new File(['student,course\n1,CS4010'], 'results.csv', { type: 'text/csv' }),
    )
    await user.click(screen.getByRole('button', { name: 'Upload and validate' }))
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('uploadId='))
    expect(
      await screen.findByText('The file was accepted and processing has started.'),
    ).toBeInTheDocument()
  })
  it('does not duplicate the page heading or upload panel while selected and list requests are pending', async () => {
    const uploadId = '9acbe15c-1412-49c7-a728-a923480da95a'
    server.use(
      http.get('/api/v1/admin/academic-ledger/uploads', async () => {
        await delay(120)
        return HttpResponse.json({
          items: ledgerUploadsFixture,
          page: {
            page: 0,
            size: 20,
            totalElements: ledgerUploadsFixture.length,
            totalPages: 1,
            sort: 'uploadedAt,desc',
          },
        })
      }),
      http.get('/api/v1/admin/academic-ledger/uploads/:uploadId', async ({ params }) => {
        await delay(120)
        return HttpResponse.json({
          ...ledgerUploadDetailFixture,
          uploadId: String(params.uploadId),
        })
      }),
      http.get('/api/v1/admin/students', async () => {
        await delay(120)
        return HttpResponse.json({
          items: registeredStudentsFixture,
          page: {
            page: 0,
            size: 20,
            totalElements: registeredStudentsFixture.length,
            totalPages: 1,
            sort: 'fullName,asc',
          },
        })
      }),
    )

    const view = renderPage(`${routePaths.adminAcademicLedger}?uploadId=${uploadId}`)
    expect(view.getAllByRole('heading', { level: 1, name: 'Academic Ledger' })).toHaveLength(1)
    expect(view.getAllByLabelText('Ledger CSV')).toHaveLength(1)
    expect(view.getByRole('status', { name: 'Loading selected ledger batch' })).toBeInTheDocument()
    expect(view.getByRole('status', { name: 'Loading recent ledger uploads' })).toBeInTheDocument()

    expect(
      await view.findByRole('table', { name: 'Recent academic ledger upload batches' }),
    ).toBeInTheDocument()
    expect(view.getAllByRole('heading', { level: 1, name: 'Academic Ledger' })).toHaveLength(1)
    expect(view.getAllByLabelText('Ledger CSV')).toHaveLength(1)
  })
})
