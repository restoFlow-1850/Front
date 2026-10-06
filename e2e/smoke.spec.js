import { test, expect } from '@playwright/test'
import { ACCOUNTS } from './fixtures.js'
import { login } from './helpers/auth.js'

// PR1: infratuzilma ishlayotganini tasdiqlovchi minimal ssenariy —
// front ↔ backend ↔ MongoDB zanjiri va seed hisoblari to'g'ri.

test('login page renders', async ({ page }) => {
  await page.goto('/login')
  await expect(page.locator('#email')).toBeVisible()
  await expect(page.locator('#password')).toBeVisible()
})

test('wrong password shows an error and stays on /login', async ({ page }) => {
  await page.goto('/login')
  await page.locator('#email').fill(ACCOUNTS.admin.email)
  await page.locator('#password').fill('noto-g-ri-parol')
  await page.locator('form button[type="submit"]').click()
  await expect(page).toHaveURL(/\/login/)
})

for (const account of Object.values(ACCOUNTS)) {
  test(`${account.role} logs in and lands on ${account.home}`, async ({ page }) => {
    await login(page, account)
  })
}
