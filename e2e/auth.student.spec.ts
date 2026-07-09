import { expect, test } from '@playwright/test'

test('student public shells load and protected route redirects anonymous users', async ({
  page,
}) => {
  await page.goto('/student/login')
  await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible()

  await page.goto('/student/dashboard')
  await expect(page).toHaveURL(/\/student\/login$/)
})

test('student completes onboarding and logs in with mocked Sprint 2 APIs', async ({ page }) => {
  await page.route('**/api/v1/student-verifications', async (route) => {
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        verificationId: 'verification-e2e',
        email: 'student@dcs.ruh.ac.lk',
      }),
    })
  })
  await page.route('**/api/v1/student-verifications/verification-e2e/otp/verify', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'OTP verified.' }),
    })
  })
  await page.route('**/api/v1/student-verifications/verification-e2e/password', async (route) => {
    await route.fulfill({ status: 204 })
  })
  await page.route('**/api/v1/auth/student/login', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        accessToken: 'student-e2e-token',
        user: {
          userId: 'student-user-e2e',
          accountId: 'student-account-e2e',
          email: 'student@dcs.ruh.ac.lk',
          displayName: 'E2E Student',
          roles: ['STUDENT'],
          primaryRole: 'STUDENT',
        },
      }),
    })
  })

  await page.goto('/student/sign-up')
  await page.getByLabel('Full Name').fill('E2E Student')
  await page.getByLabel('Index Number').fill('SC/2020/001')
  await page.getByLabel('University Email').fill('student@dcs.ruh.ac.lk')
  await page.getByRole('button', { name: 'Send Request' }).click()

  await expect(page).toHaveURL(/\/student\/verify-otp$/)
  await page.getByLabel('Six-digit OTP').pressSequentially('123456')
  await page.getByRole('button', { name: 'Verify Code' }).click()

  await expect(page).toHaveURL(/\/student\/create-password$/)
  await page.getByLabel('New Password', { exact: true }).fill('Password@123')
  await page.getByLabel('Confirm New Password', { exact: true }).fill('Password@123')
  await page.getByRole('button', { name: 'Create Password' }).click()

  await expect(page).toHaveURL(/\/student\/login$/)
  await page.getByLabel('University Email').fill('student@dcs.ruh.ac.lk')
  await page.getByLabel('Password').fill('Password@123')
  await page.getByRole('button', { name: 'Log In' }).click()

  await expect(page).toHaveURL(/\/student\/dashboard$/)
  await expect(page.getByRole('heading', { name: 'Student Dashboard' })).toBeVisible()
})
