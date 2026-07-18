import { expect, test, type Page } from '@playwright/test'

const studentUser = {
  userId: 'academic-records-e2e',
  accountId: 'academic-records-account-e2e',
  email: 'student@dcs.ruh.ac.lk',
  displayName: 'Academic Records Student',
  roles: ['STUDENT'],
  primaryRole: 'STUDENT',
}

const availableGpa = {
  studentId: '30000000-0000-4000-8000-000000000001',
  status: 'AVAILABLE',
  computerScienceGpa: 3.75,
  totalCredits: 96,
  calculatedAt: '2026-07-14T08:31:00Z',
  source: {
    sourceUploadId: '40000000-0000-4000-8000-000000000001',
    committedAt: '2026-07-14T08:30:00Z',
  },
}

const unavailableGpa = {
  ...availableGpa,
  status: 'NOT_AVAILABLE',
  computerScienceGpa: null,
  totalCredits: null,
  calculatedAt: null,
  source: null,
}

const records = Array.from({ length: 12 }, (_, index) => ({
  academicRecordId: `10000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`,
  subjectId: `20000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`,
  courseCode: `CS${String(1001 + index)}`,
  courseTitle: index === 11 ? 'Legacy Systems' : `Computer Science Course ${index + 1}`,
  credits: 3,
  letterGrade: index % 2 ? 'A-' : 'A',
  gradePoint: index % 2 ? 3.7 : 4,
  semester: index < 6 ? 'Semester 1' : 'Semester 2',
  academicYear: index < 6 ? '2025/26' : '2024/25',
  attemptNumber: 1,
  resultStatus: 'PASSED',
  committedAt: `2026-07-${String(14 - Math.min(index, 9)).padStart(2, '0')}T08:30:00Z`,
}))

async function authenticateStudent(page: Page) {
  await page.addInitScript(() => {
    window.sessionStorage.setItem('cv-management.foundation-token', 'academic-records-token')
  })
  await page.route('**/api/v1/auth/me', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(studentUser),
    }),
  )
}

function sortValue(record: (typeof records)[number], field: string): string | number {
  const value = record[field as keyof typeof record]
  return typeof value === 'number' ? value : String(value ?? '')
}

async function mockAcademicApi(
  page: Page,
  gpa: typeof availableGpa | typeof unavailableGpa = availableGpa,
) {
  await page.route('**/api/v1/me/academic-records/gpa', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(gpa) }),
  )
  await page.route('**/api/v1/me/academic-records?**', (route) => {
    const url = new URL(route.request().url())
    const pageNumber = Number(url.searchParams.get('page') ?? 0)
    const size = Number(url.searchParams.get('size') ?? 10)
    const sort = url.searchParams.get('sort') ?? 'academicYear,desc'
    const [field, direction = 'asc'] = sort.split(',')
    const search = (url.searchParams.get('search') ?? '').trim().toLowerCase()
    const multiplier = direction === 'desc' ? -1 : 1
    const filtered = records
      .filter((record) =>
        [record.courseCode, record.courseTitle, record.academicYear, record.semester]
          .join(' ')
          .toLowerCase()
          .includes(search),
      )
      .sort((left, right) => {
        const leftValue = sortValue(left, field)
        const rightValue = sortValue(right, field)
        const result =
          typeof leftValue === 'number' && typeof rightValue === 'number'
            ? leftValue - rightValue
            : String(leftValue).localeCompare(String(rightValue))
        return result * multiplier
      })
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: filtered.slice(pageNumber * size, pageNumber * size + size),
        page: {
          page: pageNumber,
          size,
          totalElements: filtered.length,
          totalPages: Math.ceil(filtered.length / size),
          sort,
        },
      }),
    })
  })
}

test('Academic Records remains protected by the Student route guard', async ({ page }) => {
  await page.goto('/student/academic-records', { waitUntil: 'domcontentloaded' })
  await expect(page).toHaveURL(/\/student\/login$/)
})

test('Student reviews official GPA and read-only records with search, sort, and pagination', async ({
  page,
}) => {
  await authenticateStudent(page)
  await mockAcademicApi(page)
  await page.goto('/student/academic-records', { waitUntil: 'domcontentloaded' })

  await expect(page.getByRole('heading', { level: 1, name: 'Academic Records' })).toBeVisible()
  await expect(page.getByText('3.75')).toBeVisible()
  await expect(page.getByText('Official', { exact: true })).toBeVisible()
  await expect(
    page.getByRole('navigation', { name: 'Student navigation' }).getByRole('link'),
  ).toHaveCount(6)
  await expect(page.getByText(/1.10 of 12/)).toBeVisible()

  await page.getByRole('button', { name: 'Next' }).click()
  await expect(page.getByText('Legacy Systems')).toBeVisible()
  await page.getByRole('button', { name: 'Previous' }).click()
  await page
    .getByRole('combobox', { name: 'Sort academic records' })
    .selectOption('courseCode,desc')
  await expect(page.getByRole('table').getByRole('row').nth(1)).toContainText('CS1012')

  await page.getByRole('searchbox', { name: 'Search academic records' }).fill('Legacy')
  await expect(page.getByText('Legacy Systems')).toBeVisible()
  await expect(page.getByText(/1.1 of 1/)).toBeVisible()

  await expect(page.getByRole('columnheader', { name: /actions/i })).toHaveCount(0)
  await expect(page.getByRole('button', { name: /edit|add|delete|save/i })).toHaveCount(0)
  await expect(page.getByText(/Estimated GPA/i)).toHaveCount(0)
})

test('NOT_AVAILABLE is successful and the records workspace stays mobile and dark-mode safe', async ({
  page,
}) => {
  await authenticateStudent(page)
  await mockAcademicApi(page, unavailableGpa)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/student/academic-records', { waitUntil: 'domcontentloaded' })

  await expect(
    page.getByRole('heading', { name: 'Official GPA is not available yet' }),
  ).toBeVisible()
  await page.getByRole('button', { name: /switch to dark mode/i }).click()
  await expect(page.locator('html')).toHaveClass(/dark/)
  await expect(page.locator('.s5-records-table-wrap')).toHaveCSS('overflow-x', 'auto')
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
  ).toBeTruthy()
})
