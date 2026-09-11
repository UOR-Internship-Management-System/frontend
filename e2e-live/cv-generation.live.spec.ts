import {
  expect,
  request as playwrightRequest,
  test,
  type APIRequestContext,
  type Page,
} from '@playwright/test'

const backendUrl = process.env.CV_LIVE_BACKEND_URL ?? 'http://127.0.0.1:8080'
const studentEmail = process.env.CV_LIVE_STUDENT_EMAIL
const studentPassword = process.env.CV_LIVE_STUDENT_PASSWORD
const adminEmail = process.env.CV_LIVE_ADMIN_EMAIL
const adminPassword = process.env.CV_LIVE_ADMIN_PASSWORD

type LoginResponse = { accessToken: string }
type StudentProfile = { studentId: string; summary: string | null; version: number }
type SavedCv = { revision: number }

let api: APIRequestContext
let studentToken: string
let adminToken: string
let studentId: string
let originalSummary: string | null
let profileVersion: number

function requireCredentials() {
  const missing = [
    ['CV_LIVE_STUDENT_EMAIL', studentEmail],
    ['CV_LIVE_STUDENT_PASSWORD', studentPassword],
    ['CV_LIVE_ADMIN_EMAIL', adminEmail],
    ['CV_LIVE_ADMIN_PASSWORD', adminPassword],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name)

  if (missing.length) {
    throw new Error(`Missing live CV acceptance variables: ${missing.join(', ')}`)
  }
}

async function loginApi(role: 'student' | 'admin', email: string, password: string) {
  const response = await api.post(`/api/v1/auth/${role}/login`, { data: { email, password } })
  expect(
    response.ok(),
    `${role} API login failed: ${response.status()} ${await response.text()}`,
  ).toBeTruthy()
  return ((await response.json()) as LoginResponse).accessToken
}

async function loginUi(page: Page, role: 'student' | 'admin', email: string, password: string) {
  await page.goto(`/${role}/login`, { waitUntil: 'domcontentloaded' })
  await page.getByLabel(role === 'student' ? 'University Email' : 'Admin Email Address').fill(email)
  await page.getByLabel(role === 'student' ? 'Password' : 'Security Password').fill(password)
  await page.getByRole('button', { name: 'Log In' }).click()
  await expect(page).toHaveURL(new RegExp(`/${role}/dashboard$`))
}

async function openCvBuilder(page: Page) {
  await page.goto('/student/cv-builder', { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('heading', { level: 1, name: 'LaTeX CV Builder' })).toBeVisible()
  await expect(page.getByRole('button', { name: /Generate Preview|Update Preview/ })).toBeEnabled()
}

async function generateAndSave(page: Page) {
  const previewResponse = page.waitForResponse(
    (response) =>
      response.url().endsWith('/api/v1/me/cv/preview') && response.request().method() === 'POST',
  )
  await page.getByRole('button', { name: /Generate Preview|Update Preview/ }).click()
  expect((await previewResponse).status()).toBe(200)
  await expect(page.getByTitle('Generated CV visual preview')).toBeVisible()

  const saveResponse = page.waitForResponse(
    (response) => response.url().endsWith('/api/v1/me/cv') && response.request().method() === 'PUT',
  )
  await page.getByRole('button', { name: 'Save Current CV Version' }).click()
  const saved = await saveResponse
  expect([200, 201]).toContain(saved.status())
  await expect(page.getByText(/CV saved|CV updated/)).toBeVisible()
  return (await saved.json()) as SavedCv
}

async function patchSummary(summary: string | null, version: number) {
  const response = await api.patch('/api/v1/me/profile', {
    data: { summary },
    headers: {
      Authorization: `Bearer ${studentToken}`,
      'If-Match': `"${version}"`,
    },
  })
  expect(
    response.ok(),
    `Profile update failed: ${response.status()} ${await response.text()}`,
  ).toBeTruthy()
  return (await response.json()) as StudentProfile
}

test.describe.serial('BMD-007 live CV acceptance', () => {
  test.beforeAll(async () => {
    requireCredentials()
    api = await playwrightRequest.newContext({ baseURL: backendUrl })
    studentToken = await loginApi('student', studentEmail!, studentPassword!)
    adminToken = await loginApi('admin', adminEmail!, adminPassword!)

    const profileResponse = await api.get('/api/v1/me/profile', {
      headers: { Authorization: `Bearer ${studentToken}` },
    })
    expect(profileResponse.ok()).toBeTruthy()
    const profile = (await profileResponse.json()) as StudentProfile
    studentId = profile.studentId
    originalSummary = profile.summary
    profileVersion = profile.version
  })

  test.afterAll(async () => {
    await api?.dispose()
  })

  test('Student previews, saves, and downloads a real PDF', async ({ page }) => {
    await loginUi(page, 'student', studentEmail!, studentPassword!)
    await openCvBuilder(page)
    await generateAndSave(page)

    const downloadResponse = page.waitForResponse((response) =>
      response.url().endsWith('/api/v1/me/cv/download'),
    )
    await page.getByRole('button', { name: 'Download Current CV PDF' }).click()
    const response = await downloadResponse
    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toContain('application/pdf')
    expect((await response.body()).subarray(0, 5).toString()).toBe('%PDF-')
  })

  test('Profile mutation marks the CV OUTDATED and replacement restores CURRENT', async ({
    page,
  }) => {
    const probe = `BMD-007 live freshness probe ${Date.now()}`
    const mutated = await patchSummary(probe, profileVersion)
    profileVersion = mutated.version

    const outdatedResponse = await api.get('/api/v1/me/cv/source-freshness', {
      headers: { Authorization: `Bearer ${studentToken}` },
    })
    expect(outdatedResponse.ok()).toBeTruthy()
    expect(await outdatedResponse.json()).toMatchObject({ status: 'OUTDATED' })

    await loginUi(page, 'student', studentEmail!, studentPassword!)
    await openCvBuilder(page)
    await expect(page.getByRole('heading', { name: 'Your saved CV needs an update' })).toBeVisible()
    const replacement = await generateAndSave(page)
    expect(replacement.revision).toBeGreaterThan(1)

    const restored = await patchSummary(originalSummary, profileVersion)
    profileVersion = restored.version
    await page.reload({ waitUntil: 'domcontentloaded' })
    await expect(
      page.getByRole('button', { name: /Generate Preview|Update Preview/ }),
    ).toBeEnabled()
    await generateAndSave(page)

    const currentResponse = await api.get('/api/v1/me/cv/source-freshness', {
      headers: { Authorization: `Bearer ${studentToken}` },
    })
    expect(currentResponse.ok()).toBeTruthy()
    expect(await currentResponse.json()).toMatchObject({ status: 'CURRENT' })
  })

  test('Admin sees and downloads the Student latest saved CV', async ({ page }) => {
    await loginUi(page, 'admin', adminEmail!, adminPassword!)
    await page.goto(`/admin/students/${studentId}`, { waitUntil: 'domcontentloaded' })
    await expect(page.getByText('Latest saved CV', { exact: true })).toBeVisible()
    await expect(page.getByText('Current', { exact: true })).toBeVisible()

    const metadata = await api.get(`/api/v1/admin/students/${studentId}/latest-cv`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    })
    expect(metadata.ok()).toBeTruthy()
    expect(await metadata.json()).toMatchObject({
      availability: 'AVAILABLE',
      freshnessStatus: 'CURRENT',
    })

    const downloadResponse = page.waitForResponse((response) =>
      response.url().endsWith(`/api/v1/admin/students/${studentId}/latest-cv/download`),
    )
    await page.getByRole('button', { name: 'Download latest CV' }).click()
    const response = await downloadResponse
    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toContain('application/pdf')
    expect((await response.body()).subarray(0, 5).toString()).toBe('%PDF-')
  })
})
