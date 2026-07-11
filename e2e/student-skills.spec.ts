import { expect, test } from '@playwright/test'

test('student skills route is not registered in Sprint 2', async ({ page }) => {
  await page.goto('/student/skills', { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('heading', { name: 'Not Found' })).toBeVisible()
})
