import { expect, test, type Page, type Route } from '@playwright/test'
import {
  academicRecordsFixture,
  availableGpaFixture,
} from '../src/mocks/fixtures/academicRecords.fixture'
import { adminDashboardMetricsFixture } from '../src/mocks/fixtures/adminDashboard.fixture'
import { getStudentDashboardFixture } from '../src/mocks/fixtures/studentDashboard.fixture'
import { studentProfileFixture } from '../src/mocks/fixtures/studentProfile.fixture'
import { getStudentProjectsFixture } from '../src/mocks/fixtures/studentProjects.fixture'
import {
  categoryClusterIds,
  categorySkillIds,
  getDeclaredSkillsFixture,
  individualSkillsFixture,
  skillCategoriesFixture,
  skillClustersFixture,
} from '../src/mocks/fixtures/skills.fixture'
import { ledgerUploadsFixture } from '../src/mocks/fixtures/academicLedger.fixture'
import { registeredStudentsFixture } from '../src/mocks/fixtures/registeredStudents.fixture'

const studentUser = {
  userId: 'visual-student-user',
  accountId: 'visual-student-account',
  email: 'student@dcs.ruh.ac.lk',
  displayName: 'Visual Student',
  roles: ['STUDENT'],
  primaryRole: 'STUDENT',
}

const adminUser = {
  userId: 'visual-admin-user',
  accountId: 'visual-admin-account',
  email: 'admin@dcs.ruh.ac.lk',
  displayName: 'Visual Admin',
  roles: ['ADMIN'],
  primaryRole: 'ADMIN',
}

const profileUploadPolicy = {
  profilePhoto: {
    allowedMimeTypes: ['image/jpeg', 'image/png'],
    allowedExtensions: ['.jpg', '.jpeg', '.png'],
    maxSizeBytes: 2_000_000,
  },
  certificateEvidence: {
    allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'],
    maxSizeBytes: 5_000_000,
  },
}

const scenarios = [
  {
    name: 'student-dashboard',
    path: '/student/dashboard',
    heading: 'Student Dashboard',
    role: 'student',
    loading: 'Loading student dashboard',
  },
  {
    name: 'student-profile',
    path: '/student/profile',
    heading: 'Profile',
    role: 'student',
    loading: 'Loading form content',
  },
  {
    name: 'student-skills',
    path: '/student/skills',
    heading: 'Declared Skills',
    role: 'student',
    loading: 'Loading available skills',
  },
  {
    name: 'student-projects',
    path: '/student/projects',
    heading: 'Projects',
    role: 'student',
    loading: 'Loading projects',
  },
  {
    name: 'cv-builder',
    path: '/student/cv-builder',
    heading: 'CV Builder',
    role: 'student',
    loading: 'Loading CV Builder',
  },
  {
    name: 'academic-records',
    path: '/student/academic-records',
    heading: 'Academic Records',
    role: 'student',
    loading: 'Loading official GPA',
  },
  {
    name: 'admin-dashboard',
    path: '/admin/dashboard',
    heading: 'Admin Dashboard',
    role: 'admin',
    loading: 'Loading admin dashboard',
  },
  {
    name: 'academic-ledger',
    path: '/admin/academic-ledger',
    heading: 'Academic Ledger',
    role: 'admin',
    loading: 'Loading recent ledger uploads',
    additionalLoading: ['Loading Student records'],
  },
  {
    name: 'registered-students',
    path: '/admin/students',
    heading: 'Registered Students',
    role: 'admin',
    loading: 'Loading registered Students',
  },
] as const

function paged<T>(items: T[], size = 20, sort = 'updatedAt,desc') {
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

function taxonomyTree() {
  return {
    clusters: skillClustersFixture.map((cluster) => ({
      ...cluster,
      categories: skillCategoriesFixture
        .filter((category) => categoryClusterIds[category.categoryId] === cluster.clusterId)
        .map((category) => ({
          ...category,
          skills: individualSkillsFixture.filter((skill) =>
            categorySkillIds[category.categoryId]?.includes(skill.skillId),
          ),
        })),
    })),
  }
}

async function fulfillJson(route: Route, body: unknown, status = 200) {
  await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) })
}

async function installApiGate(page: Page, role: 'student' | 'admin') {
  let release!: () => void
  const gate = new Promise<void>((resolve) => {
    release = resolve
  })

  await page.route('https://fonts.googleapis.com/**', (route) => route.abort())
  await page.route('https://fonts.gstatic.com/**', (route) => route.abort())

  await page.addInitScript(
    ({ dark, token }) => {
      window.sessionStorage.setItem('cv-management.foundation-token', token)
      if (dark) window.localStorage.setItem('cv-management.theme', 'dark')
      ;(window as Window & { __cls?: number; __clsEntries?: unknown[] }).__cls = 0
      ;(window as Window & { __clsEntries?: unknown[] }).__clsEntries = []
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const shift = entry as PerformanceEntry & { value?: number; hadRecentInput?: boolean }
          if (!shift.hadRecentInput) {
            const target = window as Window & { __cls?: number; __clsEntries?: unknown[] }
            target.__cls = (target.__cls ?? 0) + (shift.value ?? 0)
            target.__clsEntries?.push({
              value: shift.value ?? 0,
              sources: (
                (
                  shift as PerformanceEntry & {
                    sources?: Array<{
                      node?: Node
                      previousRect?: DOMRectReadOnly
                      currentRect?: DOMRectReadOnly
                    }>
                  }
                ).sources ?? []
              ).map((source) => ({
                node:
                  source.node instanceof Element
                    ? `${source.node.tagName.toLowerCase()}.${source.node.className}`
                    : String(source.node),
                previousRect: source.previousRect,
                currentRect: source.currentRect,
              })),
            })
          }
        }
      }).observe({ type: 'layout-shift', buffered: true })
    },
    {
      dark: test.info().project.name.includes('dark'),
      token: `${role}-visual-token`,
    },
  )

  await page.route('**/api/v1/**', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const path = url.pathname.replace('/api/v1', '')

    if (path === '/auth/me') {
      await fulfillJson(route, role === 'student' ? studentUser : adminUser)
      return
    }

    await gate

    if (path === '/me/dashboard/metrics') return fulfillJson(route, getStudentDashboardFixture())
    if (path === '/me/profile') return fulfillJson(route, studentProfileFixture)
    if (path === '/me/profile/upload-policy') return fulfillJson(route, profileUploadPolicy)
    if (/^\/me\/profile\/(contact-links|certificates|awards|activities|experience)$/.test(path)) {
      return fulfillJson(route, paged([], 5))
    }
    if (path === '/skill-taxonomy') return fulfillJson(route, taxonomyTree())
    if (path === '/skill-taxonomy/clusters')
      return fulfillJson(route, paged(skillClustersFixture, 100, 'name,asc'))
    if (path === '/skill-taxonomy/categories')
      return fulfillJson(route, paged(skillCategoriesFixture, 100, 'name,asc'))
    if (path === '/skill-taxonomy/skills')
      return fulfillJson(route, paged(individualSkillsFixture, 6, 'name,asc'))
    if (path === '/me/declared-skills')
      return fulfillJson(
        route,
        paged(
          getDeclaredSkillsFixture(),
          url.searchParams.get('size') === '100' ? 100 : 5,
          'skillName,asc',
        ),
      )
    if (path === '/me/projects')
      return fulfillJson(
        route,
        paged(
          getStudentProjectsFixture(),
          Number(url.searchParams.get('size') ?? 5),
          url.searchParams.get('sort') ?? 'updatedAt,desc',
        ),
      )
    if (path === '/me/academic-records/gpa') return fulfillJson(route, availableGpaFixture)
    if (path === '/me/academic-records')
      return fulfillJson(route, paged(academicRecordsFixture.slice(0, 10), 10, 'academicYear,desc'))
    if (path === '/me/cv/source-freshness') {
      return fulfillJson(route, {
        status: 'NOT_SAVED',
        changedAreas: [],
        cvId: null,
        savedAt: null,
        evaluatedAt: '2026-07-21T08:00:00Z',
        message: 'No saved CV exists yet.',
      })
    }
    if (path === '/admin/dashboard/metrics') return fulfillJson(route, adminDashboardMetricsFixture)
    if (path === '/admin/students')
      return fulfillJson(route, paged(registeredStudentsFixture, 20, 'fullName,asc'))
    if (path === '/admin/academic-ledger/uploads')
      return fulfillJson(route, paged(ledgerUploadsFixture, 20, 'uploadedAt,desc'))

    await fulfillJson(
      route,
      {
        type: 'about:blank',
        title: 'Unhandled visual test request',
        status: 404,
        code: 'NOT_FOUND',
        message: `No visual response configured for ${path}`,
      },
      404,
    )
  })

  return release
}

for (const scenario of scenarios) {
  test(`${scenario.name} skeleton aligns with final content`, async ({ page }) => {
    if (test.info().project.name.includes('reduced-motion')) {
      await page.emulateMedia({ reducedMotion: 'reduce' })
    }

    const release = await installApiGate(page, scenario.role)
    await page.goto(scenario.path, { waitUntil: 'domcontentloaded' })

    await expect(page.getByRole('status', { name: scenario.loading }).first()).toBeVisible()
    if ('additionalLoading' in scenario) {
      for (const label of scenario.additionalLoading) {
        await expect(page.getByRole('status', { name: label }).first()).toBeVisible()
      }
    }
    await page.waitForTimeout(300)

    await expect(page).toHaveScreenshot(`${scenario.name}-skeleton.png`, { fullPage: true })

    await page.evaluate(() => {
      ;(window as Window & { __cls?: number }).__cls = 0
    })
    release()

    await expect(page.getByRole('heading', { level: 1, name: scenario.heading })).toBeVisible()
    await expect(page.getByRole('heading', { level: 1, name: scenario.heading })).toHaveCount(1)
    await expect(page).toHaveScreenshot(`${scenario.name}-content.png`, { fullPage: true })

    const overflowSafe = await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1,
    )
    expect(overflowSafe).toBeTruthy()

    const { cls, entries } = await page.evaluate(() => ({
      cls: (window as Window & { __cls?: number }).__cls ?? 0,
      entries: (window as Window & { __clsEntries?: unknown[] }).__clsEntries ?? [],
    }))
    if (cls >= 0.02) console.log(JSON.stringify(entries, null, 2))
    expect(cls).toBeLessThan(0.02)
  })
}
