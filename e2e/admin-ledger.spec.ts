import { expect, test } from '@playwright/test'

test('academic ledger protected shell redirects anonymous users', async ({ page }) => {
  await page.goto('/admin/academic-ledger', { waitUntil: 'domcontentloaded' })
  await expect(page).toHaveURL(/\/admin\/login$/)
})
