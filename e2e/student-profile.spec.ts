import { expect, test } from '@playwright/test'

test('student profile protected shell redirects anonymous users', async ({ page }) => {
  await page.goto('/student/profile', { waitUntil: 'domcontentloaded' })
  await expect(page).toHaveURL(/\/student\/login$/)
})
