import { expect, test } from '@playwright/test'

test('candidate filtering route is not registered in Sprint 2', async ({ page }) => {
  await page.goto('/admin/candidate-filtering', { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('heading', { name: 'Not Found' })).toBeVisible()
})
