import { expect, test } from '@playwright/test'

test('cv builder route is not registered in Sprint 2', async ({ page }) => {
  await page.goto('/student/cv-builder', { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('heading', { name: 'Not Found' })).toBeVisible()
})
