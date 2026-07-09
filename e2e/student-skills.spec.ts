import { expect, test } from '@playwright/test'

test('student skills protected shell redirects anonymous users', async ({ page }) => {
  await page.goto('/student/skills', { waitUntil: 'domcontentloaded' })
  await expect(page).toHaveURL(/\/student\/login$/)
})
