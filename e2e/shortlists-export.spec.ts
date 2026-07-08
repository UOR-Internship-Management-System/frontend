import { expect, test } from '@playwright/test'

test('shortlists protected shell redirects anonymous users', async ({ page }) => {
  await page.goto('/admin/shortlists')
  await expect(page).toHaveURL(/\/admin\/login$/)
})
