import { expect, test, type Page } from '@playwright/test'

const shortlistId = '11111111-1111-4111-8111-111111111111'
const requestId = '22222222-2222-4222-8222-222222222222'
const companyId = '33333333-3333-4333-8333-333333333333'
const studentId = '44444444-4444-4444-8444-444444444444'
const now = '2026-07-21T09:30:00Z'

async function authenticateAdmin(page: Page) {
  await page.addInitScript(() => {
    window.sessionStorage.setItem('cv-management.foundation-token', 'sprint-8-admin-token')
  })

  await page.route('**/api/v1/auth/me', (route) =>
    route.fulfill({
      json: {
        userId: 'admin-sprint-8-e2e',
        accountId: 'admin-sprint-8-account',
        email: 'admin@dcs.ruh.ac.lk',
        displayName: 'Sprint 8 Admin',
        roles: ['ADMIN'],
        primaryRole: 'ADMIN',
      },
    }),
  )
}

async function mockFinalizedShortlist(page: Page) {
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
      status: 'ACTIVE',
      shortlistGuidanceValue: 10,
    },
    filterRunId: null,
    name: null,
    status: 'FINALIZED',
    guidanceValue: 10,
    selectedCandidateCount: 1,
    guidanceExceeded: false,
    guidanceWarning: null,
    version: 8,
    createdAt: now,
    updatedAt: now,
    finalizedAt: now,
  }
  const pageData = (items: unknown[], sort: string, size = 20) => ({
    items,
    page: {
      page: 0,
      size,
      totalElements: items.length,
      totalPages: items.length ? 1 : 0,
      sort,
    },
  })

  await page.route('**/api/v1/admin/companies**', (route) =>
    route.fulfill({ json: pageData([company], 'name,asc', 100) }),
  )
  await page.route('**/api/v1/admin/shortlists?**', (route) =>
    route.fulfill({ json: pageData([shortlist], 'updatedAt,desc') }),
  )
  await page.route(`**/api/v1/admin/shortlists/${shortlistId}**`, (route) =>
    route.fulfill({
      json: {
        shortlist,
        candidates: pageData(
          [
            {
              studentId,
              indexNumber: 'SC/2022/12345',
              fullName: 'Ayesha Perera',
              officialGpa: 3.42,
              gpaAvailabilityStatus: 'AVAILABLE',
              hasLatestSavedCv: true,
              hasExistingActiveShortlist: false,
              existingActiveShortlistCount: 0,
              selectedAt: now,
              selectionNote: null,
            },
          ],
          'officialGpa,desc',
        ),
      },
    }),
  )
}

async function mockDraftShortlistLifecycle(page: Page) {
  let version = 5
  let status: 'DRAFT' | 'FINALIZED' = 'DRAFT'
  let candidates = [
    {
      studentId,
      indexNumber: 'SC/2022/12345',
      fullName: 'Ayesha Perera',
      officialGpa: 3.42,
      gpaAvailabilityStatus: 'AVAILABLE',
      hasLatestSavedCv: true,
      hasExistingActiveShortlist: true,
      existingActiveShortlistCount: 1,
      selectedAt: now,
      selectionNote: null,
    },
    {
      studentId: '55555555-5555-4555-8555-555555555555',
      indexNumber: 'SC/2022/12346',
      fullName: 'Kasun Jayasinghe',
      officialGpa: 3.35,
      gpaAvailabilityStatus: 'AVAILABLE',
      hasLatestSavedCv: true,
      hasExistingActiveShortlist: true,
      existingActiveShortlistCount: 1,
      selectedAt: now,
      selectionNote: null,
    },
  ]
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
  const paged = (items: unknown[], sort: string, size = 20) => ({
    items,
    page: {
      page: 0,
      size,
      totalElements: items.length,
      totalPages: items.length ? 1 : 0,
      sort,
    },
  })
  const shortlist = () => ({
    shortlistId,
    request: {
      requestId,
      companyId,
      companyName: company.name,
      title: 'Software Engineering Intern',
      status: 'ACTIVE',
      shortlistGuidanceValue: 2,
    },
    filterRunId: null,
    name: 'Example Engineering Candidates',
    status,
    guidanceValue: 2,
    selectedCandidateCount: candidates.length,
    guidanceExceeded: false,
    guidanceWarning: null,
    version,
    createdAt: now,
    updatedAt: now,
    finalizedAt: status === 'FINALIZED' ? now : null,
  })

  await page.route('**/api/v1/admin/companies**', (route) =>
    route.fulfill({ json: paged([company], 'name,asc', 100) }),
  )
  await page.route('**/api/v1/admin/shortlists?**', (route) =>
    route.fulfill({ json: paged([shortlist()], 'updatedAt,desc') }),
  )
  await page.route(`**/api/v1/admin/shortlists/${shortlistId}/candidates/${studentId}`, (route) => {
    candidates = candidates.filter((candidate) => candidate.studentId !== studentId)
    version += 1
    return route.fulfill({
      json: {
        shortlistId,
        addedCount: 0,
        alreadyPresentCount: 0,
        removedCount: 1,
        selectedCandidateCount: candidates.length,
        guidanceExceeded: false,
        version,
      },
    })
  })
  await page.route(`**/api/v1/admin/shortlists/${shortlistId}/finalize`, (route) => {
    status = 'FINALIZED'
    version += 1
    return route.fulfill({
      json: {
        shortlistId,
        status,
        selectedCandidateCount: candidates.length,
        guidanceValue: 2,
        guidanceExceeded: false,
        guidanceAcknowledged: true,
        version,
        finalizedAt: now,
      },
    })
  })
  await page.route(`**/api/v1/admin/shortlists/${shortlistId}**`, (route) => {
    if (route.request().method() !== 'GET') return route.fallback()
    return route.fulfill({
      json: {
        shortlist: shortlist(),
        candidates: paged(candidates, 'officialGpa,desc'),
      },
    })
  })
}

test('anonymous Shortlists access redirects to Admin login', async ({ page }) => {
  await page.goto('/admin/shortlists', { waitUntil: 'domcontentloaded' })

  await expect(page).toHaveURL(/\/admin\/login$/)
  await expect(page.getByRole('heading', { name: 'Admin Login' })).toBeVisible()
})

test('Admin opens finalized shortlist review and export controls', async ({ page }) => {
  await authenticateAdmin(page)
  await mockFinalizedShortlist(page)

  await page.goto(`/admin/shortlists?shortlistId=${shortlistId}`, {
    waitUntil: 'domcontentloaded',
  })

  await expect(page.getByRole('heading', { level: 1, name: 'Shortlists' })).toBeVisible()
  await expect(
    page.getByRole('heading', { level: 2, name: 'Software Engineering Intern' }),
  ).toBeVisible()
  await expect(page.getByRole('link', { name: 'Shortlists' })).toHaveAttribute(
    'aria-current',
    'page',
  )
  await expect(page.getByRole('button', { name: 'Generate CSV' })).toBeEnabled()
  await expect(page.getByRole('button', { name: 'Generate ZIP' })).toBeEnabled()
  await expect(page.getByText(/Candidate membership is read-only/)).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Not Found' })).toHaveCount(0)
})

test('Admin removes a draft candidate and finalizes the shortlist', async ({ page }) => {
  await authenticateAdmin(page)
  await mockDraftShortlistLifecycle(page)
  await page.goto(`/admin/shortlists?shortlistId=${shortlistId}`, {
    waitUntil: 'domcontentloaded',
  })

  await expect(page.getByText('Ayesha Perera', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Remove Ayesha Perera' }).click()
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Remove candidate', exact: true })
    .click()
  await expect(page.getByText('Ayesha Perera', { exact: true })).toHaveCount(0)
  await expect(page.getByText('1 selected', { exact: true })).toBeVisible()

  await page.getByRole('button', { name: 'Finalize shortlist' }).click()
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Finalize shortlist', exact: true })
    .click()
  await expect(page.getByRole('button', { name: 'Finalize shortlist' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: /Remove / })).toHaveCount(0)
  await expect(page.getByText(/Candidate membership is read-only/)).toBeVisible()
})
