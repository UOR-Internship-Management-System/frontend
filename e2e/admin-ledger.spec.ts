import { expect, test } from '@playwright/test'

test('academic ledger route is not registered in Sprint 2', async ({ page }) => {
  await page.goto('/admin/academic-ledger', { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('heading', { name: 'Not Found' })).toBeVisible()
})
