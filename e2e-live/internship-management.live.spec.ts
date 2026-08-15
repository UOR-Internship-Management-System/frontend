import { randomUUID } from 'node:crypto'
import { expect, test, type APIRequestContext, type Page, type Response } from '@playwright/test'

const tokenStorageKey = 'cv-management.foundation-token'
const backendOrigin =
  process.env.CV_E2E_BACKEND_ORIGIN?.trim().replace(/\/$/, '') || 'http://127.0.0.1:8080'
const apiBaseUrl = `${backendOrigin}/api/v1`

function requiredEnvironment(name: 'CV_E2E_ADMIN_EMAIL' | 'CV_E2E_ADMIN_PASSWORD') {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(
      `${name} is required for the live Company/Internship E2E suite. ` +
        'Copy .env.e2e-live.example to .env.e2e-live.local and provide local test credentials.',
    )
  }
  return value
}

const adminEmail = requiredEnvironment('CV_E2E_ADMIN_EMAIL')
const adminPassword = requiredEnvironment('CV_E2E_ADMIN_PASSWORD')

function quotedVersion(version: number) {
  return `"${version}"`
}

function isApiResponse(response: Response, method: string, path: string) {
  return response.request().method() === method && new URL(response.url()).pathname === path
}

async function loginAsAdmin(page: Page) {
  await page.goto('/admin/login', { waitUntil: 'domcontentloaded' })
  await page.getByLabel('Admin Email Address').fill(adminEmail)
  await page.getByLabel('Security Password').fill(adminPassword)
  await page.getByRole('button', { name: 'Log In' }).click()

  await expect(page).toHaveURL(/\/admin\/dashboard$/)
  const token = await page.evaluate((key) => window.sessionStorage.getItem(key), tokenStorageKey)
  if (!token) throw new Error('Admin login completed without storing an access token.')
  return token
}

async function openInternshipManagement(page: Page) {
  await page.goto('/admin/internships', { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('heading', { name: 'Internship Requests Management' })).toBeVisible()
}

async function dismissVisibleToasts(page: Page) {
  const dismissButtons = page.getByRole('button', { name: 'Dismiss', exact: true })
  while ((await dismissButtons.count()) > 0) {
    await dismissButtons.first().click()
  }
}

async function readCompanyEtagFromBrowser(page: Page, token: string, companyId: string) {
  return page.evaluate(
    async ({ apiBaseUrl: browserApiBaseUrl, companyId: browserCompanyId, token: browserToken }) => {
      const response = await fetch(`${browserApiBaseUrl}/admin/companies/${browserCompanyId}`, {
        headers: { Authorization: `Bearer ${browserToken}` },
      })
      return {
        status: response.status,
        etag: response.headers.get('ETag'),
      }
    },
    { apiBaseUrl, companyId, token },
  )
}

async function createCompanyThroughUi(page: Page, companyName: string) {
  const suffix = companyName.split(' ').at(-1) ?? randomUUID().slice(0, 8)
  const createResponsePromise = page.waitForResponse((response) =>
    isApiResponse(response, 'POST', '/api/v1/admin/companies'),
  )

  await page.getByRole('button', { name: 'Create Company', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: 'Create Company' })
  await dialog.getByLabel('Company Name').fill(companyName)
  await dialog.getByLabel('Website').fill(`https://e2e-${suffix}.example.test`)
  await dialog.getByLabel('HR Representative').fill('Live E2E Administrator')
  await dialog.getByLabel('HR Email Address').fill(`e2e-${suffix}@example.test`)
  await dialog.getByLabel('Phone Number').fill('+94 11 234 5678')
  await dialog.getByRole('button', { name: 'Create Company', exact: true }).click()

  const response = await createResponsePromise
  expect(response.status()).toBe(201)
  const body = (await response.json()) as {
    companyId: string
    name: string
    version: number
    active?: unknown
  }
  expect(body.name).toBe(companyName)
  expect(body.active).toBeUndefined()
  expect(response.headers()['etag']).toBe(quotedVersion(body.version))
  expect(response.headers()['location']).toContain(`/api/v1/admin/companies/${body.companyId}`)

  await page.getByRole('searchbox', { name: 'Search companies and HR contacts' }).fill(companyName)

  await expect(
    page
      .getByLabel('Company metadata directory')
      .getByRole('listitem')
      .filter({ hasText: companyName }),
  ).toBeVisible()

  return body
}

async function createRequestThroughUi(page: Page, requestTitle: string) {
  const createResponsePromise = page.waitForResponse((response) =>
    isApiResponse(response, 'POST', '/api/v1/admin/internship-requests'),
  )

  await page.getByRole('button', { name: 'Create Internship Request' }).click()
  const dialog = page.getByRole('dialog', { name: 'Create Internship Request' })
  await dialog.getByLabel('Internship Role Title').fill(requestTitle)
  await dialog.getByLabel('Shortlist Guidance Value (Optional)').fill('5')
  await dialog
    .getByLabel('Role Description')
    .fill('Live browser-to-backend integration verification.')

  const firstSkill = dialog.getByRole('checkbox').first()
  await expect(firstSkill).toBeVisible()
  await expect(firstSkill).toBeEnabled()
  await firstSkill.check()
  await dialog.getByRole('button', { name: 'Add Selected Skills' }).click()

  await expect(dialog.getByLabel(/GPA/i)).toHaveCount(0)
  await dialog.getByRole('button', { name: 'Create Request' }).click()

  const response = await createResponsePromise
  expect(response.status()).toBe(201)
  const body = (await response.json()) as {
    requestId: string
    title: string
    version: number
    requiredSkills: Array<{ skillId: string; skillName: string }>
    status?: unknown
    minimumGpa?: unknown
  }
  expect(body.title).toBe(requestTitle)
  expect(body.status).toBeUndefined()
  expect(body.minimumGpa).toBeUndefined()
  expect(body.requiredSkills.length).toBeGreaterThan(0)
  expect(response.headers()['etag']).toBe(quotedVersion(body.version))
  expect(response.headers()['location']).toContain(
    `/api/v1/admin/internship-requests/${body.requestId}`,
  )

  await expect(
    page
      .getByLabel('Internship request directory')
      .getByRole('listitem')
      .filter({ hasText: requestTitle }),
  ).toBeVisible()

  return body
}

async function cleanupCompany(
  request: APIRequestContext,
  token: string | undefined,
  companyId: string | undefined,
) {
  if (!token || !companyId) return

  const current = await request.get(`${apiBaseUrl}/admin/companies/${companyId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (current.status() === 404) return
  if (!current.ok()) {
    throw new Error(`Unable to load E2E cleanup Company ${companyId}: HTTP ${current.status()}`)
  }

  const body = (await current.json()) as { version: number }
  const removed = await request.delete(`${apiBaseUrl}/admin/companies/${companyId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'If-Match': quotedVersion(body.version),
    },
  })
  if (removed.status() !== 204 && removed.status() !== 404) {
    throw new Error(`Unable to clean up E2E Company ${companyId}: HTTP ${removed.status()}`)
  }
}

test('real backend supports Company and Internship Request CRUD with matching ETags', async ({
  page,
  request,
}) => {
  const suffix = randomUUID().slice(0, 8)
  const companyName = `Live E2E Company ${suffix}`
  const updatedCompanyName = `${companyName} Updated`
  const requestTitle = `Live E2E Intern ${suffix}`
  const updatedRequestTitle = `${requestTitle} Updated`
  let token: string | undefined
  let companyId: string | undefined

  try {
    token = await loginAsAdmin(page)
    await openInternshipManagement(page)

    const company = await createCompanyThroughUi(page, companyName)
    companyId = company.companyId

    const browserCompanyResponse = await readCompanyEtagFromBrowser(page, token, company.companyId)
    expect(browserCompanyResponse.status).toBe(200)
    expect(browserCompanyResponse.etag).toBe(quotedVersion(company.version))

    const companyRow = page
      .getByLabel('Company metadata directory')
      .getByRole('listitem')
      .filter({ hasText: companyName })
    await companyRow.getByRole('button', { name: 'View Details' }).click()
    await page
      .getByRole('dialog', { name: 'Company Details' })
      .getByRole('button', { name: 'Edit' })
      .click()

    const companyPatchPromise = page.waitForResponse((response) =>
      isApiResponse(response, 'PATCH', `/api/v1/admin/companies/${company.companyId}`),
    )
    const editCompany = page.getByRole('dialog', { name: 'Edit Company' })
    await editCompany.getByLabel('Company Name').fill(updatedCompanyName)
    await editCompany.getByRole('button', { name: 'Save Changes' }).click()

    const companyPatch = await companyPatchPromise
    expect(companyPatch.status()).toBe(200)
    const updatedCompany = (await companyPatch.json()) as { version: number; name: string }
    expect(updatedCompany.name).toBe(updatedCompanyName)
    expect(companyPatch.headers()['etag']).toBe(quotedVersion(updatedCompany.version))
    expect(updatedCompany.version).toBeGreaterThan(company.version)

    await page
      .getByRole('dialog', { name: 'Company Details' })
      .getByRole('button', { name: 'Close', exact: true })
      .click()

    const internship = await createRequestThroughUi(page, requestTitle)

    const requestRow = page
      .getByLabel('Internship request directory')
      .getByRole('listitem')
      .filter({ hasText: requestTitle })
    await requestRow.getByRole('button', { name: 'View Details' }).click()
    await page
      .getByRole('dialog', { name: 'Internship Request Details' })
      .getByRole('button', { name: 'Edit' })
      .click()

    const requestPatchPromise = page.waitForResponse((response) =>
      isApiResponse(
        response,
        'PATCH',
        `/api/v1/admin/internship-requests/${internship.requestId}`,
      ),
    )
    const editRequest = page.getByRole('dialog', { name: 'Edit Internship Request' })
    await editRequest.getByLabel('Internship Role Title').fill(updatedRequestTitle)
    await editRequest.getByRole('button', { name: 'Save Changes' }).click()

    const requestPatch = await requestPatchPromise
    expect(requestPatch.status()).toBe(200)
    const updatedRequest = (await requestPatch.json()) as { version: number; title: string }
    expect(updatedRequest.title).toBe(updatedRequestTitle)
    expect(requestPatch.headers()['etag']).toBe(quotedVersion(updatedRequest.version))
    expect(updatedRequest.version).toBeGreaterThan(internship.version)

    await page
      .getByRole('dialog', { name: 'Internship Request Details' })
      .getByRole('button', { name: 'Close', exact: true })
      .click()

    await dismissVisibleToasts(page)

    const updatedRequestRow = page
      .getByLabel('Internship request directory')
      .getByRole('listitem')
      .filter({ hasText: updatedRequestTitle })
    await updatedRequestRow.getByRole('button', { name: 'Delete Internship Request' }).click()
    const deleteRequestPromise = page.waitForResponse((response) =>
      isApiResponse(
        response,
        'DELETE',
        `/api/v1/admin/internship-requests/${internship.requestId}`,
      ),
    )
    await page
      .getByRole('dialog', { name: 'Delete Internship Request' })
      .getByRole('button', { name: 'Delete Internship Request', exact: true })
      .click()
    expect((await deleteRequestPromise).status()).toBe(204)
    await expect(updatedRequestRow).toHaveCount(0)

    const updatedCompanyRow = page
      .getByLabel('Company metadata directory')
      .getByRole('listitem')
      .filter({ hasText: updatedCompanyName })
    await updatedCompanyRow.getByRole('button', { name: 'Delete Company' }).click()
    const deleteCompanyPromise = page.waitForResponse((response) =>
      isApiResponse(response, 'DELETE', `/api/v1/admin/companies/${company.companyId}`),
    )
    await page
      .getByRole('dialog', { name: 'Delete Company' })
      .getByRole('button', { name: 'Delete Company', exact: true })
      .click()
    expect((await deleteCompanyPromise).status()).toBe(204)
    await expect(updatedCompanyRow).toHaveCount(0)
    companyId = undefined
  } finally {
    await cleanupCompany(request, token, companyId)
  }
})

test('real backend Company delete cascades requests while preserving the canonical Skill', async ({
  page,
  request,
}) => {
  const suffix = randomUUID().slice(0, 8)
  const companyName = `Cascade E2E Company ${suffix}`
  const requestTitle = `Cascade E2E Intern ${suffix}`
  let token: string | undefined
  let companyId: string | undefined

  try {
    token = await loginAsAdmin(page)
    await openInternshipManagement(page)
    const company = await createCompanyThroughUi(page, companyName)
    companyId = company.companyId
    const internship = await createRequestThroughUi(page, requestTitle)
    const skillId = internship.requiredSkills[0]?.skillId
    expect(skillId).toBeTruthy()

    const companyRow = page
      .getByLabel('Company metadata directory')
      .getByRole('listitem')
      .filter({ hasText: companyName })
    await companyRow.getByRole('button', { name: 'Delete Company' }).click()
    const dialog = page.getByRole('dialog', { name: 'Delete Company' })
    await expect(dialog).toContainText('Its internship requests will also be deleted.')

    const deleteCompanyPromise = page.waitForResponse((response) =>
      isApiResponse(response, 'DELETE', `/api/v1/admin/companies/${company.companyId}`),
    )
    await dialog.getByRole('button', { name: 'Delete Company', exact: true }).click()
    expect((await deleteCompanyPromise).status()).toBe(204)
    companyId = undefined

    const deletedRequest = await request.get(
      `${apiBaseUrl}/admin/internship-requests/${internship.requestId}`,
      { headers: { Authorization: `Bearer ${token}` } },
    )
    expect(deletedRequest.status()).toBe(404)

    const taxonomy = await request.get(
      `${apiBaseUrl}/skill-taxonomy/skills?page=0&size=100&sort=name%2Casc`,
      { headers: { Authorization: `Bearer ${token}` } },
    )
    expect(taxonomy.ok()).toBeTruthy()
    const skillPage = (await taxonomy.json()) as { items: Array<{ skillId: string }> }
    expect(skillPage.items.some((skill) => skill.skillId === skillId)).toBeTruthy()
  } finally {
    await cleanupCompany(request, token, companyId)
  }
})

test('real backend stale Company edit surfaces the 412 recovery message without losing form data', async ({
  page,
  request,
}) => {
  const suffix = randomUUID().slice(0, 8)
  const companyName = `Concurrency E2E Company ${suffix}`
  const staleUiName = `${companyName} Stale UI Edit`
  let token: string | undefined
  let companyId: string | undefined

  try {
    token = await loginAsAdmin(page)
    await openInternshipManagement(page)
    const company = await createCompanyThroughUi(page, companyName)
    companyId = company.companyId

    const companyRow = page
      .getByLabel('Company metadata directory')
      .getByRole('listitem')
      .filter({ hasText: companyName })
    await companyRow.getByRole('button', { name: 'View Details' }).click()
    await page
      .getByRole('dialog', { name: 'Company Details' })
      .getByRole('button', { name: 'Edit' })
      .click()

    const externalUpdate = await request.patch(
      `${apiBaseUrl}/admin/companies/${company.companyId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'If-Match': quotedVersion(company.version),
        },
        data: { notes: 'Concurrent change created by the live E2E test.' },
      },
    )
    expect(externalUpdate.status()).toBe(200)

    const staleResponsePromise = page.waitForResponse((response) =>
      isApiResponse(response, 'PATCH', `/api/v1/admin/companies/${company.companyId}`),
    )
    const editDialog = page.getByRole('dialog', { name: 'Edit Company' })
    await editDialog.getByLabel('Company Name').fill(staleUiName)
    await editDialog.getByRole('button', { name: 'Save Changes' }).click()

    const staleResponse = await staleResponsePromise
    expect(staleResponse.status()).toBe(412)
    await expect(editDialog.getByRole('alert')).toContainText('changed since it was loaded')
    await expect(editDialog.getByLabel('Company Name')).toHaveValue(staleUiName)
  } finally {
    await cleanupCompany(request, token, companyId)
  }
})
