import { expect, test } from '@playwright/test'

const forbiddenVisibleText = [
  ['temporary', 'password'].join(' '),
  ['company', 'login'].join(' '),
  ['company', 'portal'].join(' '),
  ['AI', 'scoring'].join(' '),
  ['AI', 'ranking'].join(' '),
  ['match', 'percentage'].join(' '),
]

test('active app shell does not expose removed-scope visible text', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' })

  for (const text of forbiddenVisibleText) {
    await expect(page.getByText(text, { exact: false })).toHaveCount(0)
  }
})
