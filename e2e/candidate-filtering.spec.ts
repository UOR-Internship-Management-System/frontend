import { expect, test } from '@playwright/test'

test('candidate filtering protected shell redirects anonymous users', async ({ page }) => {
  await page.goto('/admin/candidate-filtering', { waitUntil: 'domcontentloaded' })
  await expect(page).toHaveURL(/\/admin\/login$/)
})
