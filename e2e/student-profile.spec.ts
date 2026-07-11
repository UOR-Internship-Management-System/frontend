import { expect, test } from '@playwright/test'

test('student profile route is not registered in Sprint 2', async ({ page }) => {
  await page.goto('/student/profile', { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('heading', { name: 'Not Found' })).toBeVisible()
})
