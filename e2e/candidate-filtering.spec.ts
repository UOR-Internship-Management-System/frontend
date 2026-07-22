import { expect, test, type Page } from '@playwright/test'

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

async function mockCandidateFilteringBootstrap(page: Page) {
  await page.route('**/api/v1/admin/internship-requests**', (route) =>
    route.fulfill({
      json: {
        items: [],
        page: {
          page: 0,
          size: 100,
          totalElements: 0,
          totalPages: 0,
          sort: 'companyName,asc',
        },
      },
    }),
  )
  await page.route('**/api/v1/skill-taxonomy', (route) => route.fulfill({ json: { clusters: [] } }))
}

async function mockCandidateFilteringWorkflow(page: Page) {
  const companyId = '33333333-3333-4333-8333-333333333333'
  const requestId = '22222222-2222-4222-8222-222222222222'
  const filterRunId = '55555555-5555-4555-8555-555555555555'
  const now = '2026-07-21T09:30:00Z'
  const company = {
    companyId,
    name: 'Example Technologies',
    websiteUrl: 'https://example.test',
    contactPerson: 'Nimali Perera',
    contactEmail: 'nimali@example.test',
    contactPhone: null,
    notes: null,
    active: true,
    version: 2,
    createdAt: now,
    updatedAt: now,
  }
  const request = {
    requestId,
    company,
    title: 'Software Engineering Intern',
    description: 'Build accessible administrative interfaces.',
    location: 'Matara',
    workMode: 'HYBRID',
    status: 'ACTIVE',
    shortlistGuidanceValue: 2,
    notes: null,
    requiredSkills: [],
    version: 3,
    createdAt: now,
    updatedAt: now,
  }
  const run = {
    filterRunId,
    request: {
      requestId,
      companyId,
      companyName: company.name,
      title: request.title,
      status: request.status,
      shortlistGuidanceValue: request.shortlistGuidanceValue,
    },
    criteria: {
      requestId,
      runtimeGpaLowerBound: null,
      runtimeGpaUpperBound: null,
      requestSkillIds: [],
      additionalSkillIds: [],
      skillMatchMode: 'AND',
    },
    candidateCount: 1,
    createdAt: now,
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

  await page.route('**/api/v1/admin/companies**', (route) =>
    route.fulfill({ json: paged([company], 'name,asc', 100) }),
  )
  await page.route('**/api/v1/admin/internship-requests**', (route) => {
    const url = new URL(route.request().url())
    if (url.pathname.endsWith(`/${requestId}`)) return route.fulfill({ json: request })
    return route.fulfill({ json: paged([request], 'companyName,asc', 100) })
  })
  await page.route('**/api/v1/admin/candidate-filtering/runs', (route) =>
    route.fulfill({
      status: 201,
      json: run,
    }),
  )
  await page.route(`**/api/v1/admin/candidate-filtering/runs/${filterRunId}`, (route) =>
    route.fulfill({ json: run }),
  )
  await page.route(
    `**/api/v1/admin/candidate-filtering/runs/${filterRunId}/candidates**`,
    (route) =>
      route.fulfill({
        json: paged(
          [
            {
              studentId: '44444444-4444-4444-8444-444444444444',
              indexNumber: 'SC/2022/12345',
              fullName: 'Ayesha Perera',
              officialGpa: 3.82,
              gpaAvailabilityStatus: 'AVAILABLE',
              matchingDeclaredSkills: [],
              declaredSkillCount: 2,
              hasLatestSavedCv: true,
              hasExistingActiveShortlist: false,
              existingActiveShortlistCount: 0,
            },
          ],
          'officialGpa,desc',
          5,
        ),
      }),
  )
  await page.route('**/api/v1/skill-taxonomy', (route) => route.fulfill({ json: { clusters: [] } }))
}

test('anonymous Candidate Filtering access redirects to Admin login', async ({ page }) => {
  await page.goto('/admin/candidate-filtering', {
    waitUntil: 'domcontentloaded',
  })

  await expect(page).toHaveURL(/\/admin\/login$/)

  await expect(
    page.getByRole('heading', {
      name: 'Admin Login',
    }),
  ).toBeVisible()
})

test('Admin opens the protected Candidate Filtering workspace', async ({ page }) => {
  await authenticateAdmin(page)
  await mockCandidateFilteringBootstrap(page)

  await page.goto('/admin/candidate-filtering', {
    waitUntil: 'domcontentloaded',
  })

  await expect(page).toHaveURL(/\/admin\/candidate-filtering$/)

  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'Interactive Candidate Filtering Dashboard',
    }),
  ).toBeVisible()

  await expect(
    page.getByText(
      'Recruitment decision-support workspace. Select an active internship request, adjust deterministic runtime filters, review matching students, and manually lock the final shortlist.',
    ),
  ).toBeVisible()

  await expect(
    page.getByRole('link', {
      name: 'Candidate Filtering',
    }),
  ).toHaveAttribute('aria-current', 'page')

  await expect(page.getByText('No internship request selected')).toBeVisible()

  await expect(
    page.getByText(
      'Select an active internship request to load the latest committed student data. Adjusting runtime criteria refreshes the deterministic results automatically.',
    ),
  ).toBeVisible()

  await expect(
    page.getByRole('heading', {
      name: 'Not Found',
    }),
  ).toHaveCount(0)
})

test('Admin selects a request and runs deterministic candidate filtering', async ({ page }) => {
  await authenticateAdmin(page)
  await mockCandidateFilteringWorkflow(page)
  await page.goto('/admin/candidate-filtering', { waitUntil: 'domcontentloaded' })

  await page.getByRole('button', { name: /Select internship request/i }).click()
  await page.getByLabel('Select company').selectOption({ label: 'Example Technologies' })
  await page
    .getByLabel('Select internship request for candidate filtering')
    .selectOption({ label: 'Software Engineering Intern' })
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Select request', exact: true })
    .press('Enter')

  await expect(page.getByText('Example Technologies', { exact: true })).toBeVisible()
  await expect(page.getByText('Selected request unavailable')).toHaveCount(0)

  await expect(page).toHaveURL(/runId=55555555-5555-4555-8555-555555555555/)
  await expect(page.getByText('Ayesha Perera', { exact: true })).toBeVisible()
  await expect(page.getByText(/rank|score/i)).toHaveCount(0)
  await expect(page.getByText(new RegExp(['match', 'percentage'].join(' '), 'i'))).toHaveCount(0)
})
