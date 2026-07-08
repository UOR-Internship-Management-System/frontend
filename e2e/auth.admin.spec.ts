import { expect, test } from '@playwright/test'

test('admin public shell loads and protected route redirects anonymous users', async ({ page }) => {
  await page.goto('/admin/login')
  await expect(page.getByRole('heading', { name: 'Admin Login' })).toBeVisible()

  await page.goto('/admin/dashboard')
  await expect(page).toHaveURL(/\/admin\/login$/)
})

test('admin resets password and logs in with mocked Sprint 2 APIs', async ({ page }) => {
  await page.route('**/api/v1/password-resets', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        resetId: 'admin-reset-e2e',
        message: 'If the account can be recovered, an OTP has been sent.',
      }),
    })
  })
  await page.route('**/api/v1/password-resets/admin-reset-e2e/otp/verify', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'OTP verified.' }),
    })
  })
  await page.route('**/api/v1/password-resets/admin-reset-e2e/password', async (route) => {
    await route.fulfill({ status: 204 })
  })
  await page.route('**/api/v1/auth/admin/login', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        accessToken: 'admin-e2e-token',
        user: {
          userId: 'admin-user-e2e',
          accountId: 'admin-account-e2e',
          email: 'admin@dcs.ruh.ac.lk',
          displayName: 'E2E Admin',
          roles: ['ADMIN'],
          primaryRole: 'ADMIN',
        },
      }),
    })
  })

  await page.goto('/admin/forgot-password')
  await page.getByLabel('Admin Email Address').fill('admin@dcs.ruh.ac.lk')
  await page.getByRole('button', { name: 'Send OTP' }).click()

  await expect(page).toHaveURL(/\/admin\/verify-reset-otp$/)
  await page.getByLabel('Six-digit OTP').fill('123456')
  await page.getByRole('button', { name: 'Verify OTP' }).click()

  await expect(page).toHaveURL(/\/admin\/create-password$/)
  await page.getByLabel('New Password', { exact: true }).fill('Password@123')
  await page.getByLabel('Confirm New Password', { exact: true }).fill('Password@123')
  await page.getByRole('button', { name: 'Create Password' }).click()

  await expect(page).toHaveURL(/\/admin\/login$/)
  await page.getByLabel('Admin Email Address').fill('admin@dcs.ruh.ac.lk')
  await page.getByLabel('Security Password').fill('Password@123')
  await page.getByRole('button', { name: 'Log In' }).click()

  await expect(page).toHaveURL(/\/admin\/dashboard$/)
  await expect(page.getByRole('heading', { name: 'Admin Dashboard' })).toBeVisible()
})
