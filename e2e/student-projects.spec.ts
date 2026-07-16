import { expect, test, type Page } from '@playwright/test'

const studentUser = {
  userId: 'student-projects-e2e',
  accountId: 'student-projects-account-e2e',
  email: 'student@dcs.ruh.ac.lk',
  displayName: 'Projects Student',
  roles: ['STUDENT'],
  primaryRole: 'STUDENT',
}

const taxonomySkills = [
  {
    skillId: '22222222-2222-4222-8222-222222222222',
    name: 'TypeScript',
    description: 'Typed JavaScript.',
  },
  {
    skillId: '33333333-3333-4333-8333-333333333333',
    name: 'React',
    description: 'Component-based UI library.',
  },
]

type Project = {
  projectId: string
  title: string
  description: string | null
  repositoryUrl: string | null
  demoUrl: string | null
  startDate: string | null
  endDate: string | null
  skills: typeof taxonomySkills
  includeInCv: boolean
  version: number
  createdAt: string
  updatedAt: string
}

const initialProject: Project = {
  projectId: '660e8400-e29b-41d4-a716-446655440001',
  title: 'Accessible Internship Portal',
  description: 'Structured portfolio evidence.',
  repositoryUrl: 'https://github.com/example/accessible-internship-portal',
  demoUrl: null,
  startDate: '2026-01-10',
  endDate: '2026-05-15',
  skills: [taxonomySkills[1]!],
  includeInCv: true,
  version: 2,
  createdAt: '2026-07-16T08:00:00Z',
  updatedAt: '2026-07-16T09:45:00Z',
}

async function authenticateStudent(page: Page) {
  await page.addInitScript(() => {
    window.sessionStorage.setItem('cv-management.foundation-token', 'student-projects-token')
  })
  await page.route('**/api/v1/auth/me', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(studentUser),
    }),
  )
}

function paged(projects: Project[], requestUrl: string) {
  const url = new URL(requestUrl)
  const page = Number(url.searchParams.get('page') ?? 0)
  const size = Number(url.searchParams.get('size') ?? 5)
  const search = (url.searchParams.get('search') ?? '').trim().toLowerCase()
  const sort = url.searchParams.get('sort') ?? 'updatedAt,desc'
  const filtered = projects.filter((project) => {
    const text = [project.title, project.description, ...project.skills.map((skill) => skill.name)]
      .join(' ')
      .toLowerCase()
    return !search || text.includes(search)
  })
  return {
    items: filtered.slice(page * size, page * size + size),
    page: {
      page,
      size,
      totalElements: filtered.length,
      totalPages: Math.ceil(filtered.length / size),
      sort,
    },
  }
}

async function mockProjectsApi(
  page: Page,
  options: { staleUpdate?: boolean; unavailableList?: boolean } = {},
) {
  let projects = [{ ...initialProject, skills: [...initialProject.skills] }]

  await page.route('**/api/v1/skill-taxonomy/skills**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: taxonomySkills,
        page: {
          page: 0,
          size: 100,
          totalElements: taxonomySkills.length,
          totalPages: 1,
          sort: 'name,asc',
        },
      }),
    }),
  )

  await page.route('**/api/v1/me/projects**', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const isCollection = url.pathname.endsWith('/me/projects')

    if (request.method() === 'GET' && isCollection) {
      if (options.unavailableList) {
        return route.fulfill({
          status: 503,
          contentType: 'application/json',
          body: JSON.stringify({
            type: 'about:blank',
            title: 'Unavailable',
            status: 503,
            code: 'SERVICE_UNAVAILABLE',
            message: 'Projects unavailable.',
            correlationId: 'projects-e2e-503',
          }),
        })
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(paged(projects, request.url())),
      })
    }

    if (request.method() === 'POST') {
      const body = request.postDataJSON() as {
        title: string
        description: string | null
        repositoryUrl: string | null
        demoUrl: string | null
        startDate: string | null
        endDate: string | null
        skillIds: string[]
        includeInCv: boolean
      }
      expect(body).toEqual({
        title: 'Browser Portfolio',
        description: 'Created through the protected Projects route.',
        repositoryUrl: 'https://github.com/example/browser-portfolio',
        demoUrl: null,
        startDate: '2026-02-01',
        endDate: null,
        skillIds: [taxonomySkills[0]!.skillId],
        includeInCv: true,
      })
      const now = '2026-07-16T10:00:00Z'
      const created: Project = {
        projectId: '660e8400-e29b-41d4-a716-446655440099',
        title: body.title,
        description: body.description,
        repositoryUrl: body.repositoryUrl,
        demoUrl: body.demoUrl,
        startDate: body.startDate,
        endDate: body.endDate,
        skills: taxonomySkills.filter((skill) => body.skillIds.includes(skill.skillId)),
        includeInCv: body.includeInCv,
        version: 0,
        createdAt: now,
        updatedAt: now,
      }
      projects = [created, ...projects]
      return route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(created),
      })
    }

    const projectId = url.pathname.split('/').at(-1)
    const index = projects.findIndex((project) => project.projectId === projectId)
    const current = projects[index]!

    if (request.method() === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(current),
      })
    }

    expect(request.headers()['if-match']).toBe(`"${current.version}"`)
    if (request.method() === 'PATCH') {
      const body = request.postDataJSON() as Partial<{
        title: string
        description: string | null
        repositoryUrl: string | null
        demoUrl: string | null
        startDate: string | null
        endDate: string | null
        skillIds: string[]
        includeInCv: boolean
      }>
      expect(body).toEqual(
        options.staleUpdate
          ? { description: 'Draft that survives a stale response.' }
          : { includeInCv: false },
      )
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
            correlationId: 'projects-e2e-412',
          }),
        })
      }
      const { skillIds, ...fields } = body
      const updated: Project = {
        ...current,
        ...fields,
        skills:
          skillIds === undefined
            ? current.skills
            : taxonomySkills.filter((skill) => skillIds.includes(skill.skillId)),
        version: current.version + 1,
        updatedAt: '2026-07-16T10:30:00Z',
      }
      projects[index] = updated
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(updated),
      })
    }

    projects = projects.filter((project) => project.projectId !== current.projectId)
    return route.fulfill({ status: 204 })
  })
}

test('Student completes the protected project portfolio workflow', async ({ page }) => {
  await authenticateStudent(page)
  await mockProjectsApi(page)
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/student/projects', { waitUntil: 'domcontentloaded' })

  await expect(page.getByRole('heading', { level: 1, name: 'Projects' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Projects' })).toHaveAttribute('aria-current', 'page')
  await page.getByRole('button', { name: 'Add project' }).click()
  await page.getByLabel('Project title').fill('Browser Portfolio')
  await page.getByLabel('Description').fill('Created through the protected Projects route.')
  await page.getByLabel('Repository URL').fill('https://github.com/example/browser-portfolio')
  await page.getByLabel('Start date').fill('2026-02-01')
  await page.getByLabel('Taxonomy skill').selectOption(taxonomySkills[0]!.skillId)
  await page.getByRole('button', { name: 'Add skill' }).click()
  await page.getByRole('button', { name: 'Create project' }).click()
  await expect(page.getByText('Project created')).toBeVisible()

  const row = page.getByRole('row', { name: /Browser Portfolio/ })
  await expect(row).toBeVisible()
  await row.getByRole('button', { name: /View details/ }).click()
  const details = page.getByRole('dialog', { name: 'Browser Portfolio' })
  await expect(details.getByRole('link', { name: 'Open repository' })).toHaveAttribute(
    'href',
    'https://github.com/example/browser-portfolio',
  )
  await details.getByRole('button', { name: 'Edit project' }).click()
  await page.getByLabel('Include this project in my generated CV').uncheck()
  await page.getByRole('button', { name: 'Save project' }).click()
  await expect(page.getByText('Project updated')).toBeVisible()
  await expect(row).toContainText('Excluded')

  await row.getByRole('button', { name: /View details/ }).click()
  await page
    .getByRole('dialog', { name: 'Browser Portfolio' })
    .getByRole('button', {
      name: 'Delete project',
    })
    .click()
  await page
    .getByRole('dialog', { name: 'Delete Browser Portfolio?' })
    .getByRole('button', { name: 'Delete project' })
    .click()
  await expect(page.getByText('Project deleted')).toBeVisible()
  await expect(row).toHaveCount(0)
})

test('Project edit preserves the draft after a stale response', async ({ page }) => {
  await authenticateStudent(page)
  await mockProjectsApi(page, { staleUpdate: true })
  await page.goto('/student/projects', { waitUntil: 'domcontentloaded' })

  const row = page.getByRole('row', { name: /Accessible Internship Portal/ })
  await row.getByRole('button', { name: /View details/ }).click()
  await page
    .getByRole('dialog', { name: 'Accessible Internship Portal' })
    .getByRole('button', { name: 'Edit project' })
    .click()
  await page.getByLabel('Description').fill('Draft that survives a stale response.')
  await page.getByRole('button', { name: 'Save project' }).click()

  await expect(page.getByText('Review the latest project')).toBeVisible()
  await expect(page.getByLabel('Description')).toHaveValue('Draft that survives a stale response.')
  await expect(page.getByRole('dialog', { name: 'Edit project' })).toBeVisible()
})

test('Projects reports a recoverable service failure', async ({ page }) => {
  await authenticateStudent(page)
  await mockProjectsApi(page, { unavailableList: true })
  await page.goto('/student/projects', { waitUntil: 'domcontentloaded' })

  await expect(page.getByRole('heading', { name: 'Projects unavailable' })).toBeVisible({
    timeout: 5_000,
  })
  await expect(page.getByText('Reference: projects-e2e-503')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible()
})

test('anonymous Projects access redirects to Student login', async ({ page }) => {
  await page.goto('/student/projects', { waitUntil: 'domcontentloaded' })
  await expect(page).toHaveURL(/\/student\/login$/)
})
