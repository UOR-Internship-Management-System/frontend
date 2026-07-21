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
      'Select an active placement request, apply runtime official GPA and declared-skill criteria, and manually review candidates.',
    ),
  ).toBeVisible()

  await expect(
    page.getByRole('link', {
      name: 'Candidate Filtering',
    }),
  ).toHaveAttribute('aria-current', 'page')

  await expect(page.getByText('No filtering run selected')).toBeVisible()

  await expect(
    page.getByText(
      'Select an active internship request, adjust runtime criteria, and run filtering. Results remain factual and require explicit manual selection.',
    ),
  ).toBeVisible()

  await expect(
    page.getByRole('heading', {
      name: 'Not Found',
    }),
  ).toHaveCount(0)
})
