import { expect, test, type Page } from '@playwright/test'

const studentUser = {
  userId: 'student-skills-e2e',
  accountId: 'student-skills-account-e2e',
  email: 'student@dcs.ruh.ac.lk',
  displayName: 'Skills Student',
  roles: ['STUDENT'],
  primaryRole: 'STUDENT',
}

const clusters = [
  {
    clusterId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    name: 'Software Engineering',
    description: null,
  },
]
const categories = [
  {
    categoryId: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
    name: 'Frontend Development',
    description: null,
  },
]
const skills = [
  {
    skillId: '33333333-3333-4333-8333-333333333333',
    name: 'React',
    description: 'Component-based UI library.',
  },
  {
    skillId: '22222222-2222-4222-8222-222222222222',
    name: 'TypeScript',
    description: 'Typed JavaScript.',
  },
]

type DeclaredSkill = {
  declaredSkillId: string
  skillId: string
  skillName: string
  competencyLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  version: number
  createdAt: string
  updatedAt: string
}

const initialDeclaration: DeclaredSkill = {
  declaredSkillId: '77777777-7777-4777-8777-777777777777',
  skillId: skills[0]!.skillId,
  skillName: 'React',
  competencyLevel: 'INTERMEDIATE',
  version: 1,
  createdAt: '2026-07-16T08:30:00Z',
  updatedAt: '2026-07-16T08:30:00Z',
}

async function authenticateStudent(page: Page) {
  await page.addInitScript(() => {
    window.sessionStorage.setItem('cv-management.foundation-token', 'student-skills-token')
  })
  await page.route('**/api/v1/auth/me', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(studentUser),
    }),
  )
}

function paged<T>(items: T[], url: string, fallbackSort: string) {
  const parsed = new URL(url)
  const page = Number(parsed.searchParams.get('page') ?? 0)
  const size = Number(parsed.searchParams.get('size') ?? 20)
  const search = (parsed.searchParams.get('search') ?? '').toLowerCase()
  const filtered = search
    ? items.filter((item) => JSON.stringify(item).toLowerCase().includes(search))
    : items
  return {
    items: filtered.slice(page * size, page * size + size),
    page: {
      page,
      size,
      totalElements: filtered.length,
      totalPages: Math.ceil(filtered.length / size),
      sort: parsed.searchParams.get('sort') ?? fallbackSort,
    },
  }
}

async function mockSkillsApi(
  page: Page,
  options: { duplicateCreate?: boolean; staleUpdate?: boolean; unavailableTaxonomy?: boolean } = {},
) {
  let declarations = [{ ...initialDeclaration }]

  await page.route('**/api/v1/skill-taxonomy/clusters**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(paged(clusters, route.request().url(), 'name,asc')),
    }),
  )
  await page.route('**/api/v1/skill-taxonomy/categories**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(paged(categories, route.request().url(), 'name,asc')),
    }),
  )
  await page.route('**/api/v1/skill-taxonomy/skills**', (route) => {
    if (options.unavailableTaxonomy) {
      return route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({
          type: 'about:blank',
          title: 'Unavailable',
          status: 503,
          code: 'SERVICE_UNAVAILABLE',
          message: 'Taxonomy unavailable.',
          correlationId: 'e2e-503',
        }),
      })
    }
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(paged(skills, route.request().url(), 'name,asc')),
    })
  })
  await page.route('**/api/v1/me/declared-skills**', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const id = url.pathname.split('/').at(-1)

    if (request.method() === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(paged(declarations, request.url(), 'skillName,asc')),
      })
    }
    if (request.method() === 'POST') {
      if (options.duplicateCreate) {
        return route.fulfill({
          status: 409,
          contentType: 'application/json',
          body: JSON.stringify({
            type: 'about:blank',
            title: 'Conflict',
            status: 409,
            code: 'DUPLICATE_DECLARED_SKILL',
            message: 'Already declared.',
            correlationId: 'e2e-409',
          }),
        })
      }
      const body = request.postDataJSON() as {
        skillId: string
        competencyLevel: DeclaredSkill['competencyLevel']
      }
      const taxonomySkill = skills.find((skill) => skill.skillId === body.skillId)!
      const created: DeclaredSkill = {
        declaredSkillId: '88888888-8888-4888-8888-888888888888',
        skillId: taxonomySkill.skillId,
        skillName: taxonomySkill.name,
        competencyLevel: body.competencyLevel,
        version: 0,
        createdAt: '2026-07-16T09:00:00Z',
        updatedAt: '2026-07-16T09:00:00Z',
      }
      declarations = [...declarations, created]
      return route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(created),
      })
    }

    const index = declarations.findIndex((item) => item.declaredSkillId === id)
    const current = declarations[index]!
    expect(request.headers()['if-match']).toBe(`"${current.version}"`)
    if (request.method() === 'PATCH') {
      const body = request.postDataJSON() as Record<string, unknown>
      expect(Object.keys(body)).toEqual(['competencyLevel'])
      if (options.staleUpdate) {
        return route.fulfill({
          status: 412,
          contentType: 'application/json',
          body: JSON.stringify({
            type: 'about:blank',
            title: 'Precondition failed',
            status: 412,
            code: 'STALE_VERSION',
            message: 'Changed.',
            correlationId: 'e2e-412',
          }),
        })
      }
      const updated = {
        ...current,
        competencyLevel: body.competencyLevel as DeclaredSkill['competencyLevel'],
        version: current.version + 1,
        updatedAt: '2026-07-16T10:00:00Z',
      }
      declarations[index] = updated
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(updated),
      })
    }
    declarations = declarations.filter((item) => item.declaredSkillId !== id)
    return route.fulfill({ status: 204 })
  })
}

test('Student completes the declared-skill workflow through protected navigation', async ({
  page,
}) => {
  await authenticateStudent(page)
  await mockSkillsApi(page)
  await page.goto('/student/skills', { waitUntil: 'domcontentloaded' })

  await expect(page.getByRole('heading', { level: 1, name: 'Declared Skills' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Skills' })).toHaveAttribute('aria-current', 'page')
  const taxonomy = page.getByRole('list', { name: 'Available taxonomy skills' })
  await expect(taxonomy.getByRole('button', { name: /React/ })).toBeDisabled()

  await taxonomy.getByRole('button', { name: /TypeScript/ }).click()
  await page.getByLabel('Competency Level').selectOption('ADVANCED')
  await page.getByRole('button', { name: 'Add declared skill' }).click()
  await expect(page.getByText('Skill added')).toBeVisible()
  await expect(page.getByRole('row', { name: /TypeScript/ })).toBeVisible()

  const reactRow = page.getByRole('row', { name: /React/ })
  await reactRow.getByLabel('Competency for React').selectOption('ADVANCED')
  await reactRow.getByRole('button', { name: 'Update' }).click()
  await expect(page.getByText('Competency updated')).toBeVisible()

  await reactRow.getByRole('button', { name: 'Remove React' }).click()
  await page
    .getByRole('dialog', { name: 'Remove React?' })
    .getByRole('button', { name: 'Remove skill' })
    .click()
  await expect(page.getByText('Skill removed')).toBeVisible()
})

test('Student reviews duplicate and stale conflicts without losing intended input', async ({
  page,
}) => {
  await authenticateStudent(page)
  await mockSkillsApi(page, { duplicateCreate: true, staleUpdate: true })
  await page.goto('/student/skills', { waitUntil: 'domcontentloaded' })

  await page.getByRole('button', { name: /TypeScript/ }).click()
  await page.getByLabel('Competency Level').selectOption('ADVANCED')
  await page.getByRole('button', { name: 'Add declared skill' }).click()
  await expect(page.getByText(/conflicts with existing information/i)).toBeVisible()
  await expect(page.getByLabel('Competency Level')).toHaveValue('ADVANCED')

  const reactRow = page.getByRole('row', { name: /React/ })
  await reactRow.getByLabel('Competency for React').selectOption('ADVANCED')
  await reactRow.getByRole('button', { name: 'Update' }).click()
  await expect(page.getByText('Review the latest record')).toBeVisible()
  await expect(reactRow.getByLabel('Competency for React')).toHaveValue('ADVANCED')
})

test('Skills keeps declared records usable when taxonomy is unavailable', async ({ page }) => {
  await authenticateStudent(page)
  await mockSkillsApi(page, { unavailableTaxonomy: true })
  await page.goto('/student/skills', { waitUntil: 'domcontentloaded' })

  await expect(page.getByRole('heading', { name: 'Skill taxonomy unavailable' })).toBeVisible()
  await expect(page.getByRole('row', { name: /React/ })).toBeVisible()
})

test('anonymous Skills access redirects to Student login', async ({ page }) => {
  await page.goto('/student/skills', { waitUntil: 'domcontentloaded' })
  await expect(page).toHaveURL(/\/student\/login$/)
})

test('Skills mobile cards remain dark-mode and overflow safe at 320px', async ({ page }) => {
  await authenticateStudent(page)
  await mockSkillsApi(page)
  await page.setViewportSize({ width: 320, height: 700 })
  await page.goto('/student/skills', { waitUntil: 'domcontentloaded' })

  await page.getByRole('button', { name: /switch to dark mode/i }).click()

  await expect(page.locator('html')).toHaveClass(/dark/)
  await expect(page.locator('.s4-skills-mobile-list')).toBeVisible()
  await expect(page.locator('.s4-skills-table-wrap')).toBeHidden()
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
  ).toBeTruthy()
})
