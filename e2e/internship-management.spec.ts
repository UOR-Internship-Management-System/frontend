import { expect, test, type Page } from '@playwright/test'

const companyId = '11111111-1111-4111-8111-111111111111'
const createdCompanyId = '22222222-2222-4222-8222-222222222222'
const requestId = '33333333-3333-4333-8333-333333333333'
const clusterId = '44444444-4444-4444-8444-444444444444'
const categoryId = '55555555-5555-4555-8555-555555555555'
const skillId = '66666666-6666-4666-8666-666666666666'
const now = '2026-07-21T09:30:00Z'

async function authenticateAdmin(page: Page) {
  await page.addInitScript(() => {
    window.sessionStorage.setItem('cv-management.foundation-token', 'sprint-7-admin-token')
  })
  await page.route('**/api/v1/auth/me', (route) =>
    route.fulfill({
      json: {
        userId: 'admin-sprint-7-e2e',
        accountId: 'admin-sprint-7-account',
        email: 'admin@dcs.ruh.ac.lk',
        displayName: 'Sprint 7 Admin',
        roles: ['ADMIN'],
        primaryRole: 'ADMIN',
      },
    }),
  )
}

async function gotoApp(page: Page, path: string) {
  try {
    await page.goto(path, { waitUntil: 'domcontentloaded' })
  } catch (error) {
    if (!String(error).includes('ERR_ABORTED')) throw error
    await page.goto(path, { waitUntil: 'domcontentloaded' })
  }
}

function paged(items: unknown[], sort = 'name,asc', size = 20) {
  return {
    items,
    page: {
      page: 0,
      size,
      totalElements: items.length,
      totalPages: items.length ? 1 : 0,
      sort,
    },
  }
}

async function mockInternshipManagement(page: Page) {
  const baseCompany = {
    companyId,
    name: 'Example Technologies',
    websiteUrl: 'https://example.test',
    contactPerson: 'Nimali Perera',
    contactEmail: 'nimali@example.test',
    contactPhone: null,
    notes: null,
    active: true,
    version: 1,
    createdAt: now,
    updatedAt: now,
  }
  const companies = [baseCompany]
  const requests: Record<string, unknown>[] = []

  await page.route('**/api/v1/admin/companies**', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const requestedId = url.pathname.split('/').at(-1)
    if (request.method() === 'POST') {
      const body = request.postDataJSON()
      const created = {
        companyId: createdCompanyId,
        ...body,
        websiteUrl: body.websiteUrl ?? null,
        contactPerson: body.contactPerson ?? null,
        contactEmail: body.contactEmail ?? null,
        contactPhone: body.contactPhone ?? null,
        notes: body.notes ?? null,
        active: true,
        version: 0,
        createdAt: now,
        updatedAt: now,
      }
      companies.unshift(created)
      return route.fulfill({ status: 201, json: created })
    }
    if (requestedId && requestedId !== 'companies') {
      const company = companies.find((item) => item.companyId === requestedId)
      return company ? route.fulfill({ json: company }) : route.fulfill({ status: 404 })
    }
    return route.fulfill({ json: paged(companies) })
  })

  await page.route('**/api/v1/admin/internship-requests**', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const requestedId = url.pathname.split('/').at(-1)
    if (request.method() === 'POST') {
      const body = request.postDataJSON()
      const created = {
        requestId,
        company: baseCompany,
        title: body.title,
        description: body.description ?? null,
        location: body.location ?? null,
        workMode: body.workMode ?? null,
        status: body.status,
        shortlistGuidanceValue: body.shortlistGuidanceValue ?? null,
        notes: body.notes ?? null,
        requiredSkills: body.requiredSkills.map(
          (skill: { skillId: string; requiredCompetencyLevel?: string | null }) => ({
            requiredSkillId: '77777777-7777-4777-8777-777777777777',
            skillId: skill.skillId,
            skillName: 'TypeScript',
            requiredCompetencyLevel: skill.requiredCompetencyLevel ?? null,
          }),
        ),
        version: 0,
        createdAt: now,
        updatedAt: now,
      }
      requests.unshift(created)
      return route.fulfill({ status: 201, json: created })
    }
    if (requestedId && requestedId !== 'internship-requests') {
      const item = requests.find((candidate) => candidate.requestId === requestedId)
      return item ? route.fulfill({ json: item }) : route.fulfill({ status: 404 })
    }
    return route.fulfill({ json: paged(requests, 'createdAt,desc') })
  })

  await page.route('**/api/v1/skill-taxonomy/clusters**', (route) =>
    route.fulfill({
      json: paged([{ clusterId, name: 'Software Engineering', description: null }]),
    }),
  )
  await page.route('**/api/v1/skill-taxonomy/categories**', (route) =>
    route.fulfill({
      json: paged([{ categoryId, name: 'Web Development', description: null }]),
    }),
  )
  await page.route('**/api/v1/skill-taxonomy/skills**', (route) =>
    route.fulfill({
      json: paged([{ skillId, name: 'TypeScript', description: 'Typed application development' }]),
    }),
  )
}

test('Admin creates company metadata and a taxonomy-backed internship request', async ({
  page,
}) => {
  await authenticateAdmin(page)
  await mockInternshipManagement(page)
  await gotoApp(page, '/admin/internships')

  await expect(page.getByText('Example Technologies', { exact: true })).toBeVisible()
  await expect(page.getByText('0 companies')).toHaveCount(0)

  await page.getByRole('button', { name: /Create a company/i }).click()
  await page.getByLabel('Company Legal Name').fill('Browser Verified Company')
  await page.getByLabel('Corporate Website URL').fill('https://browser.example.test')
  await page.getByLabel('HR Representative Name').fill('Browser Tester')
  await page.getByLabel('Office / HR Email Address').fill('tester@browser.example.test')
  await page.getByRole('dialog').getByRole('button', { name: 'Add company', exact: true }).click()
  await expect(page.getByRole('dialog').getByText('Browser Verified Company')).toBeVisible()
  await page.keyboard.press('Escape')

  await page.getByRole('button', { name: 'Select company' }).last().click()
  await page.getByRole('button', { name: /Create internship request/i }).click()
  await page.getByLabel('Internship Role Title').fill('Software Engineering Intern')
  await page.getByLabel('Maximum Shortlist Limit').fill('2')
  await page.getByRole('option', { name: /TypeScript.*Add/i }).click()
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Create request', exact: true })
    .click()

  await expect(page.getByRole('dialog').getByText('Software Engineering Intern')).toBeVisible()
  await expect(page.getByRole('dialog').getByText('TypeScript', { exact: true })).toBeVisible()
  await expect(page.getByText(/GPA/i)).toHaveCount(0)
})
