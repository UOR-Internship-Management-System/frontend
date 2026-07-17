import { expect, test, type Page } from '@playwright/test'

const studentUser = {
  userId: 'student-workspace-e2e',
  accountId: 'student-workspace-account-e2e',
  email: 'student@dcs.ruh.ac.lk',
  displayName: 'Workspace Student',
  roles: ['STUDENT'],
  primaryRole: 'STUDENT',
}

const studentProfile = {
  studentId: '71db2fb3-52d8-40fb-ae23-a4574e89a275',
  fullName: 'Workspace Student',
  indexNumber: 'SC/2022/12345',
  universityEmail: 'student@dcs.ruh.ac.lk',
  summary: 'Student workspace layout verification.',
  phone: '+94 71 234 5678',
}

const workspaceProject = {
  projectId: '660e8400-e29b-41d4-a716-446655440001',
  title: 'Responsive Portfolio',
  description: 'Workspace overflow verification project.',
  repositoryUrl: null,
  demoUrl: null,
  startDate: '2026-01-10',
  endDate: null,
  skills: [],
  includeInCv: true,
  version: 0,
  createdAt: '2026-07-16T08:00:00Z',
  updatedAt: '2026-07-16T08:00:00Z',
}

async function authenticateStudent(page: Page) {
  await page.addInitScript(() => {
    window.sessionStorage.setItem('cv-management.foundation-token', 'student-workspace-token')
  })
  await page.route('**/api/v1/auth/me', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(studentUser),
    }),
  )
  await page.route('**/api/v1/me/dashboard/metrics', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        projectCount: 3,
        shortlistedInternshipCount: 1,
        declaredSkillCount: 8,
        officialCumulativeGpa: 3.42,
        lastUpdatedAt: '2026-07-15T04:30:00Z',
      }),
    }),
  )
  await page.route('**/api/v1/me/profile', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(studentProfile),
    }),
  )
  await page.route('**/api/v1/me/projects**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: [workspaceProject],
        page: {
          page: 0,
          size: 5,
          totalElements: 1,
          totalPages: 1,
          sort: 'updatedAt,desc',
        },
      }),
    }),
  )
}

test('desktop student rail remains fixed and collapsed across nested routes', async ({ page }) => {
  await authenticateStudent(page)
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/student/dashboard', { waitUntil: 'domcontentloaded' })

  const sidebar = page.locator('.student-sidebar')
  const shell = page.locator('.student-shell')
  await expect(sidebar).toHaveCSS('position', 'fixed')
  await expect(page.locator('.app-header')).toHaveCount(0)
  await expect(page.locator('.app-footer')).toHaveCount(0)
  await expect(
    page.getByRole('navigation', { name: 'Student navigation' }).getByRole('link'),
  ).toHaveCount(6)

  const expandedWidth = await sidebar.evaluate((element) => element.getBoundingClientRect().width)
  expect(expandedWidth).toBeGreaterThan(250)

  await page.getByRole('button', { name: 'Collapse student sidebar' }).click()
  await expect(shell).toHaveClass(/student-shell-collapsed/)
  await expect(page.getByRole('button', { name: 'Expand student sidebar' })).toBeVisible()

  await page.getByRole('link', { name: 'Profile' }).click()
  await expect(page).toHaveURL(/\/student\/profile$/)
  await expect(page.getByRole('heading', { level: 1, name: 'Profile' })).toBeVisible()
  await expect(shell).toHaveClass(/student-shell-collapsed/)
  await expect(page.getByRole('link', { name: 'Profile' })).toHaveAttribute('aria-current', 'page')

  await page.getByRole('button', { name: /switch to dark mode/i }).click()
  await expect(page.locator('html')).toHaveClass(/dark/)
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
  ).toBeTruthy()
})

const responsiveViewports = [
  { width: 1440, height: 900, mobile: false },
  { width: 900, height: 800, mobile: false },
  { width: 768, height: 900, mobile: true },
  { width: 390, height: 844, mobile: true },
  { width: 320, height: 700, mobile: true },
] as const

for (const viewport of responsiveViewports) {
  test(`student workspace is overflow-safe at ${viewport.width}px`, async ({ page }) => {
    await authenticateStudent(page)
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    await page.goto('/student/projects', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('heading', { level: 1, name: 'Projects' })).toBeVisible()

    const menuButton = page.getByRole('button', { name: 'Open student navigation' })
    const collapseButton = page.getByRole('button', { name: 'Collapse student sidebar' })

    if (viewport.mobile) {
      await expect(menuButton).toBeVisible()
      await expect(collapseButton).toBeHidden()
      await menuButton.click()
      await expect(page.getByRole('dialog', { name: 'Student workspace' })).toBeVisible()
      await expect(page.getByRole('link', { name: 'Dashboard' })).toBeFocused()
      await expect(
        page.getByRole('navigation', { name: 'Student navigation' }).getByRole('link'),
      ).toHaveCount(6)
      await expect(page.getByRole('link', { name: 'Projects' })).toHaveAttribute(
        'aria-current',
        'page',
      )
      await expect(page.locator('body')).toHaveClass(/student-mobile-drawer-open/)

      await page
        .getByTestId('student-sidebar-backdrop')
        .click({ position: { x: viewport.width - 2, y: 2 } })
      await expect(menuButton).toBeFocused()

      await menuButton.click()
      await page.keyboard.press('Escape')
      await expect(menuButton).toBeFocused()
      await expect(page.locator('body')).not.toHaveClass(/student-mobile-drawer-open/)
    } else {
      await expect(menuButton).toBeHidden()
      await expect(collapseButton).toBeVisible()
      await expect(page.getByRole('link', { name: 'Projects' })).toHaveAttribute(
        'aria-current',
        'page',
      )
    }

    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBeTruthy()
  })
}

test('Admin workspace retains its existing shell without Student navigation', async ({ page }) => {
  await page.addInitScript(() => {
    window.sessionStorage.setItem('cv-management.foundation-token', 'admin-workspace-token')
  })
  await page.route('**/api/v1/auth/me', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        userId: 'admin-workspace-e2e',
        accountId: 'admin-workspace-account-e2e',
        email: 'admin@dcs.ruh.ac.lk',
        displayName: 'Workspace Admin',
        roles: ['ADMIN'],
        primaryRole: 'ADMIN',
      }),
    }),
  )

  await page.goto('/admin/dashboard', { waitUntil: 'domcontentloaded' })

  await expect(page.locator('.app-header')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Admin Dashboard' })).toBeVisible()
  await expect(page.locator('.student-sidebar')).toHaveCount(0)
  await expect(page.locator('.app-footer')).toHaveCount(0)
})
