import { expect, test, type Page } from '@playwright/test'

const forbiddenVisibleText = [
  ['temporary', 'password'].join(' '),
  ['company', 'login'].join(' '),
  ['company', 'portal'].join(' '),
  ['AI', 'scoring'].join(' '),
  ['AI', 'ranking'].join(' '),
  ['match', 'percentage'].join(' '),
  ['verified', 'skill'].join(' '),
  ['project', 'approval'].join(' '),
  ['project', 'verification'].join(' '),
  ['Admin', 'Review'].join(' '),
  ['Estimated', 'GPA'].join(' '),
]

const studentUser = {
  userId: 'removed-scope-e2e',
  accountId: 'removed-scope-account-e2e',
  email: 'student@dcs.ruh.ac.lk',
  displayName: 'Scope Student',
  roles: ['STUDENT'],
  primaryRole: 'STUDENT',
}

function emptyPage(requestUrl: string, fallbackSort: string) {
  const url = new URL(requestUrl)
  const page = Number(url.searchParams.get('page') ?? 0)
  const size = Number(url.searchParams.get('size') ?? 20)
  return {
    items: [],
    page: {
      page,
      size,
      totalElements: 0,
      totalPages: 0,
      sort: url.searchParams.get('sort') ?? fallbackSort,
    },
  }
}

async function mockProtectedStudentScope(page: Page) {
  await page.addInitScript(() => {
    window.sessionStorage.setItem('cv-management.foundation-token', 'scope-guard-token')
  })
  await page.route('**/api/v1/auth/me', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(studentUser),
    }),
  )
  await page.route('**/api/v1/skill-taxonomy/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(emptyPage(route.request().url(), 'name,asc')),
    }),
  )
  await page.route('**/api/v1/me/declared-skills**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(emptyPage(route.request().url(), 'skillName,asc')),
    }),
  )
  await page.route('**/api/v1/me/projects**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(emptyPage(route.request().url(), 'updatedAt,desc')),
    }),
  )
  await page.route('**/api/v1/me/cv/source-freshness', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        status: 'NOT_SAVED',
        changedAreas: [],
        latestSavedCvVersionId: null,
        latestSavedAt: null,
        evaluatedAt: '2026-07-21T08:00:00Z',
        message: 'No saved CV exists.',
      }),
    }),
  )
  await page.route('**/api/v1/me/cv/versions**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(emptyPage(route.request().url(), 'savedAt,desc')),
    }),
  )
  await page.route('**/api/v1/me/academic-records/gpa', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        studentId: '30000000-0000-4000-8000-000000000001',
        status: 'NOT_AVAILABLE',
        computerScienceGpa: null,
        totalCredits: null,
        calculatedAt: null,
        source: null,
      }),
    }),
  )
  await page.route('**/api/v1/me/academic-records?**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(emptyPage(route.request().url(), 'academicYear,desc')),
    }),
  )
}

async function expectNoForbiddenVisibleText(page: Page) {
  for (const text of forbiddenVisibleText) {
    await expect(page.getByText(text, { exact: false })).toHaveCount(0)
  }
}

test('active app shell does not expose removed-scope visible text', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' })

  await expectNoForbiddenVisibleText(page)
})

test('Sprint 4 Student pages omit removed terminology and unsupported project fields', async ({
  page,
}) => {
  await mockProtectedStudentScope(page)

  await page.goto('/student/skills', { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('heading', { level: 1, name: 'Declared Skills' })).toBeVisible()
  await expectNoForbiddenVisibleText(page)

  await page.goto('/student/projects', { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('heading', { level: 1, name: 'Projects' })).toBeVisible()
  await page.getByRole('button', { name: 'Add project' }).first().click()

  const dialog = page.getByRole('dialog', { name: 'Add project' })
  await expect(dialog).toBeVisible()
  await expectNoForbiddenVisibleText(page)

  const unsupportedFieldLabels = [
    ['approval', 'status'].join(' '),
    ['verification', 'status'].join(' '),
    ['project', 'score'].join(' '),
    ['supervisor', 'name'].join(' '),
    ['estimated', 'GPA'].join(' '),
  ]
  for (const label of unsupportedFieldLabels) {
    await expect(dialog.getByLabel(label, { exact: false })).toHaveCount(0)
  }
})

test('Sprint 5 Student pages omit removed wording and unsupported academic actions', async ({
  page,
}) => {
  await mockProtectedStudentScope(page)

  await page.goto('/student/cv-builder', { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('heading', { level: 1, name: 'CV Builder' })).toBeVisible()
  await expectNoForbiddenVisibleText(page)

  await page.goto('/student/academic-records', { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('heading', { level: 1, name: 'Academic Records' })).toBeVisible()
  await expectNoForbiddenVisibleText(page)
  await expect(page.getByRole('button', { name: /edit|add|delete|save/i })).toHaveCount(0)
  await expect(page.getByRole('columnheader', { name: /actions/i })).toHaveCount(0)
})
