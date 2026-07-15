import { expect, test, type Page } from '@playwright/test'

const studentUser = {
  userId: 'student-user-e2e',
  accountId: 'student-account-e2e',
  email: 'student@dcs.ruh.ac.lk',
  displayName: 'E2E Student',
  roles: ['STUDENT'],
  primaryRole: 'STUDENT',
}

const initialProfile = {
  studentId: '67d92a8b-f3f7-4759-9c44-2a043458e4fd',
  fullName: 'E2E Student',
  indexNumber: 'SC/2022/12345',
  universityEmail: 'student@dcs.ruh.ac.lk',
  degreeProgramme: 'BSc Honours in Computer Science',
  studentLevel: 4,
  cohortYear: 2022,
  personalEmail: 'student@example.com',
  headline: 'Computer Science undergraduate',
  summary: 'Computer Science undergraduate building reliable software.',
  phone: '+94 71 234 5678',
  location: 'Matara, Sri Lanka',
  profilePhoto: null,
  version: 1,
  updatedAt: '2026-07-01T08:00:00Z',
  cvSourceUpdatedAt: '2026-07-01T08:00:00Z',
}

async function authenticateStudent(page: Page) {
  await page.addInitScript(() => {
    window.sessionStorage.setItem('cv-management.foundation-token', 'student-e2e-token')
  })
  await page.route('**/api/v1/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(studentUser),
    })
  })
}

async function mockProfileSupportingEndpoints(page: Page) {
  await page.route('**/api/v1/me/profile/upload-policy', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        profilePhoto: {
          allowedMimeTypes: ['image/png'],
          allowedExtensions: ['.png'],
          maxSizeBytes: 2_000_000,
        },
        certificateEvidence: {
          allowedMimeTypes: ['application/pdf'],
          allowedExtensions: ['.pdf'],
          maxSizeBytes: 5_000_000,
        },
      }),
    }),
  )
  await page.route(
    /\/api\/v1\/me\/profile\/(contact-links|certificates|awards|activities|experience)(\?.*)?$/,
    (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: [],
          page: { page: 0, size: 5, totalElements: 0, totalPages: 0, sort: 'updatedAt,desc' },
        }),
      }),
  )
}

test('student updates only editable core Profile fields and retains server-confirmed data', async ({
  page,
}) => {
  await authenticateStudent(page)
  await mockProfileSupportingEndpoints(page)
  let savedProfile = { ...initialProfile }
  let submittedBody: Record<string, unknown> | null = null

  await page.route('**/api/v1/me/profile', async (route) => {
    if (route.request().method() === 'PATCH') {
      expect(route.request().headers()['if-match']).toBe(`"${savedProfile.version}"`)
      submittedBody = route.request().postDataJSON() as Record<string, unknown>
      savedProfile = { ...savedProfile, ...submittedBody, version: savedProfile.version + 1 }
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(savedProfile),
    })
  })

  await page.goto('/student/profile', { waitUntil: 'domcontentloaded' })

  await expect(page.getByRole('heading', { level: 1, name: 'Profile' })).toBeVisible()
  await expect(page.getByText(initialProfile.indexNumber)).toBeVisible()
  await expect(page.getByText(initialProfile.universityEmail)).toBeVisible()
  await expect(page.getByRole('textbox', { name: 'Index Number' })).toHaveCount(0)
  await expect(page.getByRole('textbox', { name: 'University Email' })).toHaveCount(0)

  await page.getByLabel('Full Name').fill('Committed E2E Student')
  await page.getByLabel('Professional Summary').fill('Updated server-confirmed summary.')
  await page.getByLabel('Phone').fill('+94 77 123 4567')
  await page.getByRole('button', { name: 'Save Profile' }).click()

  await expect(page.getByText('Profile saved')).toBeVisible()
  expect(submittedBody).toEqual({
    fullName: 'Committed E2E Student',
    summary: 'Updated server-confirmed summary.',
    phone: '+94 77 123 4567',
  })

  await page.reload({ waitUntil: 'domcontentloaded' })
  await expect(page.getByLabel('Full Name')).toHaveValue('Committed E2E Student')
  await expect(page.getByLabel('Phone')).toHaveValue('+94 77 123 4567')
})

test('student Profile navigation remains keyboard-safe at a mobile viewport', async ({ page }) => {
  await authenticateStudent(page)
  await mockProfileSupportingEndpoints(page)
  await page.route('**/api/v1/me/profile', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(initialProfile),
    })
  })
  await page.setViewportSize({ width: 390, height: 844 })

  await page.goto('/student/profile', { waitUntil: 'domcontentloaded' })
  const menuButton = page.getByRole('button', { name: 'Open student navigation' })
  await menuButton.click()

  await expect(page.getByRole('link', { name: 'Dashboard' })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(menuButton).toBeFocused()
  await expect(menuButton).toHaveAttribute('aria-expanded', 'false')
})
