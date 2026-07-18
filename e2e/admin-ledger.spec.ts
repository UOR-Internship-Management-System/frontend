import { expect, test, type Page } from '@playwright/test'
import {
  ledgerStagedRowsFixture,
  ledgerUploadDetailFixture,
  ledgerUploadsFixture,
  ledgerValidationFixture,
} from '../src/mocks/fixtures/academicLedger.fixture'
import { academicRecordsFixture } from '../src/mocks/fixtures/academicRecords.fixture'
import { registeredStudentsFixture } from '../src/mocks/fixtures/registeredStudents.fixture'

async function authenticateAdmin(page: Page) {
  await page.addInitScript(() => {
    window.sessionStorage.setItem('cv-management.foundation-token', 'sprint-6-admin-token')
  })
  await page.route('**/api/v1/auth/me', (route) =>
    route.fulfill({
      json: {
        userId: 'admin-sprint-6-e2e',
        accountId: 'admin-sprint-6-account',
        email: 'admin@dcs.ruh.ac.lk',
        displayName: 'Sprint 6 Admin',
        roles: ['ADMIN'],
        primaryRole: 'ADMIN',
      },
    }),
  )
}

async function mockAdminSprint6Api(page: Page) {
  await page.route('**/api/v1/admin/**', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const path = url.pathname
    const method = request.method()
    const uploadMatch = path.match(/\/admin\/academic-ledger\/uploads\/([^/]+)$/)

    if (path.endsWith('/admin/academic-ledger/uploads') && method === 'POST') {
      return route.fulfill({
        status: 202,
        headers: {
          Location: `/api/v1/admin/academic-ledger/uploads/${ledgerUploadDetailFixture.uploadId}`,
          'Retry-After': '1',
        },
        json: {
          ...ledgerUploadDetailFixture,
          originalFilename: 'browser-upload.csv',
          uploadStatus: 'PROCESSING',
          validationStatus: 'NOT_STARTED',
          totalRows: 0,
          validRows: 0,
          statusMessage: 'The file was accepted and processing has started.',
          nextPollAfterSeconds: 1,
        },
      })
    }
    if (path.endsWith('/admin/academic-ledger/uploads') && method === 'GET') {
      return route.fulfill({
        json: {
          items: ledgerUploadsFixture,
          page: {
            page: 0,
            size: 20,
            totalElements: ledgerUploadsFixture.length,
            totalPages: 1,
            sort: 'uploadedAt,desc',
          },
        },
      })
    }
    if (path.endsWith('/staged-rows')) {
      return route.fulfill({
        json: {
          items: ledgerStagedRowsFixture,
          page: {
            page: 0,
            size: 20,
            totalElements: ledgerStagedRowsFixture.length,
            totalPages: 1,
            sort: 'rowNumber,asc',
          },
        },
      })
    }
    if (path.endsWith('/validation-results')) {
      return route.fulfill({ json: ledgerValidationFixture })
    }
    if (path.endsWith('/commit') && method === 'POST') {
      expect(request.postDataJSON()).toEqual({ confirm: true })
      return route.fulfill({
        json: {
          uploadId: ledgerUploadDetailFixture.uploadId,
          status: 'COMMITTED',
          committedRecords: 4,
          affectedStudents: 4,
          recalculatedGpaCount: 4,
          committedAt: '2026-07-18T09:00:00+05:30',
        },
      })
    }
    if (uploadMatch && method === 'GET') {
      return route.fulfill({
        json: { ...ledgerUploadDetailFixture, uploadId: decodeURIComponent(uploadMatch[1]) },
      })
    }
    if (/\/admin\/students\/[^/]+\/academic-records$/.test(path)) {
      return route.fulfill({
        json: {
          items: academicRecordsFixture,
          page: {
            page: 0,
            size: 20,
            totalElements: academicRecordsFixture.length,
            totalPages: 1,
            sort: 'academicYear,desc',
          },
        },
      })
    }
    if (path.endsWith('/admin/students')) {
      return route.fulfill({
        json: {
          items: registeredStudentsFixture,
          page: {
            page: 0,
            size: 20,
            totalElements: registeredStudentsFixture.length,
            totalPages: 1,
            sort: 'fullName,asc',
          },
        },
      })
    }
    return route.fulfill({ status: 404, json: { title: 'Not found', status: 404 } })
  })
}

test('anonymous Academic Ledger access redirects to Admin login', async ({ page }) => {
  await page.goto('/admin/academic-ledger', { waitUntil: 'domcontentloaded' })
  await expect(page).toHaveURL(/\/admin\/login$/)
})

test('Admin uploads, reviews, and transactionally commits an academic ledger', async ({ page }) => {
  await authenticateAdmin(page)
  await mockAdminSprint6Api(page)
  await page.goto('/admin/academic-ledger', { waitUntil: 'domcontentloaded' })

  await expect(page.getByRole('heading', { level: 1, name: 'Academic Ledger' })).toBeVisible()
  await page.locator('input[type="file"][accept*="csv"]').setInputFiles({
    name: 'browser-upload.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from('studentIndexNumber,courseCode\n2021CS001,CS4010'),
  })
  await page.getByRole('button', { name: 'Upload and validate' }).click()
  await expect(page).toHaveURL(/uploadId=/)
  await expect(
    page.getByText('All staged rows passed validation and are ready to commit.'),
  ).toBeVisible({
    timeout: 8_000,
  })
  await expect(page.getByRole('table', { name: 'Staged academic ledger rows' })).toBeVisible()
  await expect(page.getByText('Confirm the moderated grade.')).toBeVisible()

  const commit = page.getByRole('button', { name: 'Commit official records' })
  await expect(commit).toBeEnabled()
  await commit.click()
  const dialog = page.getByRole('dialog', { name: 'Commit official academic records' })
  await expect(dialog).toBeVisible()
  await dialog.getByRole('button', { name: 'Confirm commit' }).click()
  await expect(page.getByText('Academic records committed successfully.')).toBeVisible()
})

test('Admin inspects official Student records without edit controls on a narrow screen', async ({
  page,
}) => {
  await authenticateAdmin(page)
  await mockAdminSprint6Api(page)
  await page.setViewportSize({ width: 320, height: 700 })
  await page.goto('/admin/academic-ledger', { waitUntil: 'domcontentloaded' })
  const inspection = page.getByRole('table', {
    name: 'Students available for official academic record inspection',
  })
  await expect(inspection).toBeVisible()
  const inspectButton = inspection.getByRole('button', { name: 'View academic records' }).first()
  await inspectButton.focus()
  await expect(inspectButton).toBeFocused()
  await page.keyboard.press('Enter')
  const dialog = page.getByRole('dialog', { name: /academic records/i })
  await expect(dialog.getByRole('table', { name: /Official academic records/i })).toBeVisible()
  await expect(dialog.getByRole('button', { name: /edit|save|delete/i })).toHaveCount(0)
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
  ).toBeTruthy()
})
