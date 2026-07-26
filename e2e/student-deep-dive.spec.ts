import { expect, test, type Page } from '@playwright/test'

const studentId = '11111111-1111-4111-8111-111111111111'
const recordId = '22222222-2222-4222-8222-222222222222'
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

function paged(items: unknown[], sort: string) {
  return {
    items,
    page: {
      page: 0,
      size: 20,
      totalElements: items.length,
      totalPages: items.length ? 1 : 0,
      sort,
    },
  }
}

async function mockStudentDeepDive(page: Page) {
  const latestCv = {
    availability: 'AVAILABLE',
    cvId: '44444444-4444-4444-8444-444444444444',
    revision: 3,
    generatedAt: now,
    savedAt: now,
    freshnessStatus: 'CURRENT',
    fileName: 'Asha_Silva_CV.pdf',
    fileSizeBytes: 184320,
    downloadUrl: `/admin/students/${studentId}/latest-cv/download`,
  }
  await page.route(`**/api/v1/admin/students/${studentId}`, (route) =>
    route.fulfill({
      json: {
        student: {
          studentId,
          indexNumber: 'SC/2022/12345',
          fullName: 'Asha Silva',
          universityEmail: 'asha@dcs.ruh.ac.lk',
          degreeProgram: 'B.Sc. in Computer Science',
          academicBatch: '2022',
          currentLevel: 3,
          officialGpa: 3.78,
        },
        profile: {
          studentId,
          fullName: 'Asha Silva',
          indexNumber: 'SC/2022/12345',
          universityEmail: 'asha@dcs.ruh.ac.lk',
          degreeProgramme: 'B.Sc. in Computer Science',
          studentLevel: 3,
          cohortYear: 2022,
          personalEmail: 'asha.silva@example.test',
          headline: 'Software engineering undergraduate',
          summary: 'Interested in dependable full-stack systems.',
          phone: '+94 77 123 4567',
          location: 'Matara',
          profilePhoto: null,
          version: 2,
          updatedAt: now,
          cvSourceUpdatedAt: now,
        },
        cvSupportingData: {
          experiences: [],
          certificates: [],
          awards: [],
          activities: [],
        },
        latestCv,
      },
    }),
  )
  await page.route(`**/api/v1/admin/students/${studentId}/declared-skills**`, (route) =>
    route.fulfill({
      json: paged(
        [
          {
            declaredSkillId: recordId,
            skillId: '33333333-3333-4333-8333-333333333333',
            skillName: 'TypeScript',
            competencyLevel: 'ADVANCED',
            version: 1,
            createdAt: now,
            updatedAt: now,
          },
        ],
        'createdAt,desc',
      ),
    }),
  )
  await page.route(`**/api/v1/admin/students/${studentId}/projects**`, (route) =>
    route.fulfill({ json: paged([], 'createdAt,desc') }),
  )
  await page.route(`**/api/v1/admin/students/${studentId}/academic-records**`, (route) =>
    route.fulfill({ json: paged([], 'academicYear,desc') }),
  )
  await page.route(`**/api/v1/admin/students/${studentId}/latest-cv`, (route) =>
    route.fulfill({ json: latestCv }),
  )
  await page.route(`**/api/v1/admin/students/${studentId}/latest-cv/download`, (route) =>
    route.fulfill({
      body: 'mock-pdf-content',
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="Asha_Silva_CV.pdf"',
      },
    }),
  )
}

test('Admin inspects a Student read-only and downloads the latest saved CV', async ({ page }) => {
  await authenticateAdmin(page)
  await mockStudentDeepDive(page)
  await page.goto(`/admin/students/${studentId}`, { waitUntil: 'domcontentloaded' })

  await expect(page.getByRole('heading', { level: 1, name: 'Asha Silva' })).toBeVisible()
  await expect(page.getByText('TypeScript', { exact: true })).toBeVisible()
  await expect(page.getByText('Unable to load this page')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Download latest CV' })).toBeEnabled()

  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Download latest CV' }).click()
  await expect((await download).suggestedFilename()).toBe('Asha_Silva_CV.pdf')

  await expect(page.getByRole('button', { name: /edit|approve|verify|reject/i })).toHaveCount(0)
})
