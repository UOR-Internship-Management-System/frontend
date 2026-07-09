import { expect, test } from '@playwright/test'

test('cv builder protected shell redirects anonymous users', async ({ page }) => {
  await page.goto('/student/cv-builder', { waitUntil: 'domcontentloaded' })
  await expect(page).toHaveURL(/\/student\/login$/)
})
