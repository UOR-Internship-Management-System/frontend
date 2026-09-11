import { expect, test, type Page, type Response } from '@playwright/test'

const tokenStorageKey = 'cv-management.foundation-token'

function requiredEnvironment(
  name:
    | 'CV_E2E_ADMIN_EMAIL'
    | 'CV_E2E_ADMIN_PASSWORD'
    | 'CV_E2E_FILTER_REQUEST_ID'
    | 'CV_E2E_FILTER_SEARCH',
) {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(
      `${name} is required for live Candidate Filtering acceptance. ` +
        'Copy .env.e2e-live.example to .env.e2e-live.local and provide local fixture data.',
    )
  }
  return value
}

const adminEmail = requiredEnvironment('CV_E2E_ADMIN_EMAIL')
const adminPassword = requiredEnvironment('CV_E2E_ADMIN_PASSWORD')
const requestId = requiredEnvironment('CV_E2E_FILTER_REQUEST_ID')
const candidateSearch = requiredEnvironment('CV_E2E_FILTER_SEARCH')

async function login(page: Page) {
  await page.goto('/admin/login', { waitUntil: 'domcontentloaded' })
  await page.getByLabel('Admin Email Address').fill(adminEmail)
  await page.getByLabel('Security Password').fill(adminPassword)
  await page.getByRole('button', { name: 'Log In' }).click()
  await expect(page).toHaveURL(/\/admin\/dashboard$/)
  await expect
    .poll(() => page.evaluate((key) => sessionStorage.getItem(key), tokenStorageKey))
    .not.toBeNull()
}

function isCandidatePage(response: Response) {
  const url = new URL(response.url())
  return (
    response.request().method() === 'GET' &&
    /\/api\/v1\/admin\/candidate-filtering\/runs\/[0-9a-f-]+\/candidates$/.test(url.pathname)
  )
}

async function openFilteringWorkspace(page: Page) {
  const created = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      new URL(response.url()).pathname === '/api/v1/admin/candidate-filtering/runs',
  )
  const candidates = page.waitForResponse(isCandidatePage)
  await page.goto(`/admin/candidate-filtering?requestId=${encodeURIComponent(requestId)}`, {
    waitUntil: 'domcontentloaded',
  })
  expect((await created).status()).toBe(201)
  const candidateResponse = await candidates
  expect(candidateResponse.status()).toBe(200)
  await expect(page).toHaveURL(/runId=[0-9a-f-]{36}/)
  await expect(page.getByRole('heading', { level: 2, name: 'Matching Students' })).toBeVisible()
  return candidateResponse
}

test.describe.serial('BMD-010 real-backend Candidate Filtering', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('creates a run and renders authoritative candidate enrichment', async ({ page }) => {
    const response = await openFilteringWorkspace(page)
    const body = (await response.json()) as {
      items: Array<{
        hasLatestSavedCv: boolean
        hasExistingActiveShortlist: boolean
        existingActiveShortlistCount: number
      }>
    }

    expect(body.items.length).toBeGreaterThan(0)
    for (const candidate of body.items) {
      expect(typeof candidate.hasLatestSavedCv).toBe('boolean')
      expect(typeof candidate.hasExistingActiveShortlist).toBe('boolean')
      expect(candidate.existingActiveShortlistCount).toBeGreaterThanOrEqual(0)
      expect(candidate.hasExistingActiveShortlist).toBe(candidate.existingActiveShortlistCount > 0)
    }
    await expect(page.locator('tbody tr').first()).toBeVisible()
    await expect(page.getByText(/rank|score|match percentage/i)).toHaveCount(0)
  })

  test('changing GPA creates a new immutable filtering run', async ({ page }) => {
    await openFilteringWorkspace(page)
    const originalRunId = new URL(page.url()).searchParams.get('runId')
    const created = page.waitForResponse(
      (response) =>
        response.request().method() === 'POST' &&
        new URL(response.url()).pathname === '/api/v1/admin/candidate-filtering/runs',
    )
    await page.getByLabel('Min Bound').fill('3.00')
    expect((await created).status()).toBe(201)
    await expect.poll(() => new URL(page.url()).searchParams.get('runId')).not.toBe(originalRunId)
    expect(new URL(page.url()).searchParams.get('minGpa')).toBe('3')
  })

  test('search and sort are sent to the server', async ({ page }) => {
    await openFilteringWorkspace(page)
    const searched = page.waitForResponse(
      (response) => isCandidatePage(response) && new URL(response.url()).searchParams.has('search'),
    )
    await page.getByLabel('Search candidates by name or index number').fill(candidateSearch)
    expect((await searched).status()).toBe(200)
    expect(new URL(page.url()).searchParams.get('candidateSearch')).toBe(candidateSearch)

    const sorted = page.waitForResponse(
      (response) =>
        isCandidatePage(response) &&
        new URL(response.url()).searchParams.get('sort') === 'fullName,asc',
    )
    await page.getByLabel('Sort candidate results').selectOption('fullName,asc')
    expect((await sorted).status()).toBe(200)
    expect(new URL(page.url()).searchParams.get('candidateSort')).toBe('fullName,asc')
  })
})
