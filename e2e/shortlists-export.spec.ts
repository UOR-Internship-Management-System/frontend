import { expect, test } from '@playwright/test'

test('shortlists route is not registered in Sprint 2', async ({ page }) => {
  await page.goto('/admin/shortlists', { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('heading', { name: 'Not Found' })).toBeVisible()
})
