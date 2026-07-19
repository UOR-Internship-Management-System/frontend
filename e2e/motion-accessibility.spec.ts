import { expect, test, type Locator, type Page, type TestInfo } from '@playwright/test'

const forbiddenLayoutProperties = [
  'width',
  'max-width',
  'height',
  'margin',
  'margin-inline-start',
  'gap',
  'top',
  'left',
  'right',
]

const studentUser = {
  userId: 'student-motion-e2e',
  accountId: 'student-motion-account-e2e',
  email: 'student@dcs.ruh.ac.lk',
  displayName: 'Motion Student',
  roles: ['STUDENT'],
  primaryRole: 'STUDENT',
}

const studentProfile = {
  studentId: '71db2fb3-52d8-40fb-ae23-a4574e89a275',
  fullName: 'Motion Student',
  indexNumber: 'SC/2022/12345',
  universityEmail: 'student@dcs.ruh.ac.lk',
  summary: 'Motion accessibility verification.',
  phone: '+94 71 234 5678',
}

const workspaceProject = {
  projectId: '660e8400-e29b-41d4-a716-446655440001',
  title: 'Motion-safe Portfolio',
  description: 'Animation and overflow verification project.',
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

async function readMotionStyle(locator: Locator) {
  return locator.evaluate((element) => {
    const style = getComputedStyle(element)
    return {
      animationName: style.animationName,
      animationDuration: style.animationDuration,
      transitionProperty: style.transitionProperty,
      transitionDuration: style.transitionDuration,
      transform: style.transform,
    }
  })
}

function transitionProperties(value: string) {
  return value
    .split(',')
    .map((property) => property.trim())
    .filter(Boolean)
}

function expectNoLayoutTransition(properties: string) {
  const normalized = transitionProperties(properties)
  for (const property of forbiddenLayoutProperties) {
    expect(normalized, `transition-property must not include ${property}`).not.toContain(property)
  }
}

async function capturePageScreenshot(page: Page, testInfo: TestInfo, name: string) {
  if (testInfo.project.name === 'chromium') {
    await expect(page).toHaveScreenshot(name, {
      animations: 'disabled',
      fullPage: true,
    })
    return
  }

  await page.screenshot({
    animations: 'disabled',
    fullPage: true,
    path: testInfo.outputPath(name),
  })
}

async function captureLocatorScreenshot(locator: Locator, testInfo: TestInfo, name: string) {
  if (testInfo.project.name === 'chromium') {
    await expect(locator).toHaveScreenshot(name, { animations: 'disabled' })
    return
  }

  await locator.screenshot({
    animations: 'disabled',
    path: testInfo.outputPath(name),
  })
}

async function mockStudentWorkspace(page: Page) {
  await page.addInitScript(() => {
    window.sessionStorage.setItem('cv-management.foundation-token', 'student-motion-token')
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
        projectCount: 1,
        shortlistedInternshipCount: 0,
        declaredSkillCount: 4,
        officialCumulativeGpa: 3.42,
        lastUpdatedAt: '2026-07-18T04:30:00Z',
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
  await page.route('**/api/v1/me/profile/upload-policy', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
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
      }),
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

async function expectNoHorizontalOverflow(page: Page) {
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
  ).toBeTruthy()
}

test.beforeEach(async ({ page }) => {
  await page.route('https://images.unsplash.com/**', (route) => route.abort())
  await page.route('https://fonts.googleapis.com/**', (route) =>
    route.fulfill({ status: 200, contentType: 'text/css', body: '' }),
  )
  await page.route('https://fonts.gstatic.com/**', (route) => route.abort())
})

test('gateway and page entrances use centralized motion and fully stop for reduced motion', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/', { waitUntil: 'domcontentloaded' })

  const gatewayMotion = await readMotionStyle(page.locator('.gateway-hero-content'))
  expect(gatewayMotion.animationName).toBe('gatewayIntroRise')
  expect(gatewayMotion.animationDuration).toBe('0.32s')

  const gatewayCardMotion = await readMotionStyle(page.locator('.gateway-card').first())
  expect(transitionProperties(gatewayCardMotion.transitionProperty)).toContain('transform')
  expect(gatewayCardMotion.transitionDuration.split(',').map((value) => value.trim())).toContain(
    '0.22s',
  )

  await page.goto('/student/login', { waitUntil: 'domcontentloaded' })
  const pageMotion = await readMotionStyle(page.locator('.page-transition'))
  expect(pageMotion.animationName).toBe('pageTransitionIn')
  expect(pageMotion.animationDuration).toBe('0.22s')

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  const reducedGateway = await readMotionStyle(page.locator('.gateway-hero-content'))
  const reducedCard = await readMotionStyle(page.locator('.gateway-card').first())

  expect(reducedGateway.animationName).toBe('none')
  expect(reducedCard.transitionDuration.split(',').every((value) => value.trim() === '0s')).toBe(
    true,
  )
})

test('desktop sidebar excludes layout interpolation and remains overflow-safe in both states', async ({
  page,
}, testInfo) => {
  await mockStudentWorkspace(page)
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/student/dashboard', { waitUntil: 'domcontentloaded' })

  const mainMotion = await readMotionStyle(page.locator('.student-shell-main'))
  const sidebarMotion = await readMotionStyle(page.locator('.student-sidebar'))
  const itemMotion = await readMotionStyle(page.locator('.student-sidebar-item').first())
  const labelMotion = await readMotionStyle(
    page.locator('.student-sidebar-collapsible-label').first(),
  )

  expect(mainMotion.transitionDuration).toBe('0s')
  expectNoLayoutTransition(sidebarMotion.transitionProperty)
  expectNoLayoutTransition(itemMotion.transitionProperty)
  expectNoLayoutTransition(labelMotion.transitionProperty)

  await page.getByRole('button', { name: 'Collapse student sidebar' }).click()
  await expect(page.locator('.student-shell')).toHaveClass(/student-shell-collapsed/)
  await expectNoHorizontalOverflow(page)

  await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'light' })
  await capturePageScreenshot(page, testInfo, 'student-workspace-collapsed-light.png')

  await page.getByRole('button', { name: 'Expand student sidebar' }).click()
  await expect(page.locator('.student-shell')).not.toHaveClass(/student-shell-collapsed/)
  await expectNoHorizontalOverflow(page)
})

test('mobile drawer uses transform, traps focus, restores focus, and avoids overflow', async ({
  page,
}) => {
  await mockStudentWorkspace(page)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/student/projects', { waitUntil: 'domcontentloaded' })

  const menuButton = page.getByRole('button', { name: 'Open student navigation' })
  await menuButton.click()

  const drawer = page.getByRole('dialog', { name: 'Student workspace' })
  await expect(drawer).toBeVisible()
  await expect(page.getByRole('link', { name: 'Dashboard' })).toBeFocused()

  const drawerMotion = await readMotionStyle(page.locator('.student-sidebar'))
  expect(transitionProperties(drawerMotion.transitionProperty)).toContain('transform')
  expectNoLayoutTransition(drawerMotion.transitionProperty)
  await expectNoHorizontalOverflow(page)

  await page.keyboard.press('Escape')
  await expect(menuButton).toBeFocused()
  await expect(page.locator('body')).not.toHaveClass(/student-mobile-drawer-open/)
  await expectNoHorizontalOverflow(page)
})

test('shared verification modal is reduced-motion safe, restorable, and screenshot stable', async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'dark' })
  await page.route('**/api/v1/student-verifications', (route) =>
    route.fulfill({
      status: 422,
      contentType: 'application/problem+json',
      body: JSON.stringify({
        type: 'about:blank',
        title: 'Verification failed',
        status: 422,
        code: 'STUDENT_RECORD_NOT_FOUND',
        message: 'The supplied student record did not match.',
        correlationId: 'motion-modal-422',
      }),
    }),
  )

  await page.goto('/student/sign-up', { waitUntil: 'domcontentloaded' })
  await page.getByLabel('Full Name').fill('Motion Student')
  await page.getByLabel('Index Number').fill('SC-2020-001')
  await page.getByLabel('University Email').fill('student@dcs.ruh.ac.lk')
  const trigger = page.getByRole('button', { name: 'Send Request' })
  await trigger.click()

  const dialog = page.getByRole('dialog', { name: 'Verification issue' })
  await expect(dialog).toBeVisible()
  expect((await readMotionStyle(dialog)).animationName).toBe('none')
  await expect(page.locator('#root')).toHaveAttribute('aria-hidden', 'true')
  await captureLocatorScreenshot(dialog, testInfo, 'verification-modal-dark-reduced-motion.png')

  await dialog.getByRole('button', { name: 'Check Details' }).click()
  await expect(dialog).toHaveCount(0)
  await expect(trigger).toBeFocused()
  await expect(page.locator('#root')).not.toHaveAttribute('aria-hidden')
})

test('gateway remains overflow-safe in light and dark mode with stable reduced-motion snapshots', async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'light' })
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await expectNoHorizontalOverflow(page)
  await capturePageScreenshot(page, testInfo, 'gateway-light-reduced-motion.png')

  await page.getByRole('button', { name: /switch to dark mode/i }).click()
  await expect(page.locator('html')).toHaveClass(/dark/)
  await expectNoHorizontalOverflow(page)
  await capturePageScreenshot(page, testInfo, 'gateway-dark-reduced-motion.png')
})
