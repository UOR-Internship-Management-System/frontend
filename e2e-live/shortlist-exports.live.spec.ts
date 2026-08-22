import { expect, test, type Page } from '@playwright/test'

const tokenStorageKey = 'cv-management.foundation-token'

function requiredEnvironment(
  name: 'CV_E2E_ADMIN_EMAIL' | 'CV_E2E_ADMIN_PASSWORD' | 'CV_E2E_FINALIZED_SHORTLIST_ID',
) {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(
      `${name} is required for live Shortlist acceptance. ` +
        'Copy .env.e2e-live.example to .env.e2e-live.local and provide local fixture data.',
    )
  }
  return value
}

const adminEmail = requiredEnvironment('CV_E2E_ADMIN_EMAIL')
const adminPassword = requiredEnvironment('CV_E2E_ADMIN_PASSWORD')
const shortlistId = requiredEnvironment('CV_E2E_FINALIZED_SHORTLIST_ID')

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

async function openFixture(page: Page) {
  await page.goto(`/admin/shortlists?shortlistId=${encodeURIComponent(shortlistId)}`, {
    waitUntil: 'domcontentloaded',
  })
  await expect(
    page.getByRole('heading', { level: 1, name: 'Shortlisted Candidates' }),
  ).toBeVisible()
  const dialog = page.getByRole('dialog').first()
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('button', { name: 'Download Final Shortlist' })).toBeEnabled()
  await expect(dialog.getByRole('button', { name: 'Download All CVs' })).toBeEnabled()
  return dialog
}

async function acknowledgeCompilation(page: Page) {
  const compiling = page.getByRole('alertdialog', { name: 'Compiling Pipeline' })
  await expect(compiling).toBeVisible()
  await compiling.getByRole('button', { name: 'Acknowledge' }).click()
}

test.describe.serial('BMD-011 real-backend shortlist exports', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('loads the configured finalized shortlist and its real candidate data', async ({ page }) => {
    const dialog = await openFixture(page)
    await expect(dialog.getByText(/GPA:/).first()).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'CV', exact: true }).first()).toBeVisible()
  })

  test('creates, polls, and downloads the shortlist CSV', async ({ page }) => {
    const dialog = await openFixture(page)
    const created = page.waitForResponse(
      (response) =>
        response.request().method() === 'POST' &&
        new URL(response.url()).pathname === `/api/v1/admin/exports/shortlists/${shortlistId}`,
    )
    const download = page.waitForEvent('download')

    await dialog.getByRole('button', { name: 'Download Final Shortlist' }).click()
    expect((await created).status()).toBe(202)
    await acknowledgeCompilation(page)

    const artifact = await download
    expect(artifact.suggestedFilename()).toMatch(/\.csv$/)
    expect((await artifact.createReadStream())?.readable).toBe(true)
  })

  test('creates, polls, and downloads the bulk latest-CV ZIP', async ({ page }) => {
    const dialog = await openFixture(page)
    const created = page.waitForResponse(
      (response) =>
        response.request().method() === 'POST' &&
        new URL(response.url()).pathname ===
          `/api/v1/admin/exports/shortlists/${shortlistId}/bulk-cvs`,
    )
    const download = page.waitForEvent('download')

    await dialog.getByRole('button', { name: 'Download All CVs' }).click()
    expect((await created).status()).toBe(202)
    await acknowledgeCompilation(page)

    const artifact = await download
    expect(artifact.suggestedFilename()).toMatch(/\.zip$/)
    expect((await artifact.createReadStream())?.readable).toBe(true)
  })
})
