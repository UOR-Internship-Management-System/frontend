import { expect, test } from '@playwright/test'

test('student public shells load and protected route redirects anonymous users', async ({
  page,
}) => {
  await page.goto('/student/login')
  await expect(page.getByRole('heading', { name: 'Student Login' })).toBeVisible()

  await page.goto('/student/dashboard')
  await expect(page).toHaveURL(/\/student\/login$/)
})
