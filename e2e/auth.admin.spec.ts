import { expect, test } from '@playwright/test'

test('admin public shell loads and protected route redirects anonymous users', async ({ page }) => {
  await page.goto('/admin/login')
  await expect(page.getByRole('heading', { name: 'Admin Login' })).toBeVisible()

  await page.goto('/admin/dashboard')
  await expect(page).toHaveURL(/\/admin\/login$/)
})
