import { expect } from '@playwright/test'
import { PASSWORD } from '../fixtures.js'

// Login formasi orqali kiradi va rolning bosh sahifasiga tushganini kutadi.
export async function login(page, account) {
  await page.goto('/login')
  await page.locator('#email').fill(account.email)
  await page.locator('#password').fill(PASSWORD)
  await page.locator('form button[type="submit"]').click()
  await expect(page).toHaveURL(new RegExp(`${account.home}(\\?|$)`))
}
