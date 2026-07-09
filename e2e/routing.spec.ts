import { expect, test } from '@playwright/test'

test('unauthorized route shell renders safely', async ({ page }) => {
  const response = await page.goto('/unauthorized', { waitUntil: 'domcontentloaded' })
  expect(response?.status()).toBe(200)

  // Checking for basic shell contents or heading
  await expect(page.locator('body')).toBeVisible()

  // It shouldn't crash, checking for some basic content
  // Not asserting specific text deeply to avoid flakiness, but checking visibility
  const rootElement = page.locator('#root')
  await expect(rootElement).toBeVisible()
})

test('not-found route shell renders safely', async ({ page }) => {
  const response = await page.goto('/some-random-not-found-route-12345', {
    waitUntil: 'domcontentloaded',
  })
  expect(response?.status()).toBe(200) // SPA routing returns 200 for index.html

  await expect(page.locator('body')).toBeVisible()
  const rootElement = page.locator('#root')
  await expect(rootElement).toBeVisible()
})
