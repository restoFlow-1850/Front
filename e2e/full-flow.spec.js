import { test, expect } from '@playwright/test'
import { ACCOUNTS, MENU, TABLE, NEW_DISH } from './fixtures.js'
import { login } from './helpers/auth.js'
import { somPattern } from './helpers/money.js'

// 15-to'plam, E2E — PR2: to'liq ish kuni, 4 ta rol, bitta buyurtma.
//
//   admin    → menyuga yangi taom qo'shadi
//   waiter   → shu taomdan buyurtma beradi
//   cook     → oshxonada «boshlash» → «tayyor»
//   cashier  → smena ochadi → to'lov → Z-hisobot «Jami to'langan» = to'lov summasi
//
// Har rol alohida brauzer kontekstida (alohida token/sessiya), qadamlar
// ketma-ket va bitta holatga tayanadi — shuning uchun serial.

test.describe.configure({ mode: 'serial' })

const dishPrice = somPattern(NEW_DISH.price)
const tableButton = new RegExp(`^\\s*${TABLE.number}(?!\\d)`)

test.describe('full flow: menu → order → kitchen → shift → payment → Z-report', () => {
  let browser

  test.beforeAll(async ({ browser: b }) => {
    browser = b
  })

  async function asRole(account, fn) {
    const context = await browser.newContext()
    const page = await context.newPage()
    try {
      await login(page, account)
      await fn(page)
    } finally {
      await context.close()
    }
  }

  test('admin adds a new dish to the menu', async () => {
    await asRole(ACCOUNTS.admin, async (page) => {
      await page.goto('/menu')
      await page.getByRole('button', { name: /Taom qo.shish/ }).first().click()

      const form = page.locator('form').filter({ has: page.locator('select') })
      await expect(form).toBeVisible()
      await form.getByPlaceholder("Masalan: Tandir go'shti").fill(NEW_DISH.name)
      await form.locator('select').selectOption({ label: MENU.category })
      await form.getByPlaceholder('Masalan: 45000').fill(String(NEW_DISH.price))
      await form.locator('button[type="submit"]').click()

      await expect(form).toBeHidden()
      await expect(page.getByText(NEW_DISH.name).first()).toBeVisible()
    })
  })

  test('waiter places an order with the new dish', async () => {
    await asRole(ACCOUNTS.waiter, async (page) => {
      await page.getByRole('button', { name: tableButton }).first().click()
      await page.getByRole('button', { name: new RegExp(NEW_DISH.name) }).click()
      await page.getByRole('button', { name: 'Buyurtmani yuborish' }).click()

      // Faol buyurtmalar ro'yxatida paydo bo'ladi, holati «Yangi»
      await expect(page.getByText('Yangi', { exact: true }).first()).toBeVisible()
      await expect(page.getByText(dishPrice).first()).toBeVisible()
    })
  })

  test('cook starts preparing and marks the order ready', async () => {
    await asRole(ACCOUNTS.cook, async (page) => {
      await expect(page.getByText(`Stol ${TABLE.number}`).first()).toBeVisible()

      await page.getByRole('button', { name: 'Tayyorlashni boshlash' }).first().click()
      await page.getByRole('button', { name: 'Tayyor deb belgilash' }).first().click()

      await expect(page.getByRole('button', { name: 'Tayyor deb belgilash' })).toHaveCount(0)
    })
  })

  test('cashier opens a shift, takes payment, Z-report total equals the payment', async () => {
    await asRole(ACCOUNTS.cashier, async (page) => {
      // Smena: 1-bosish formani ochadi, 2-bosish smenani ochadi (boshlang'ich balans 0)
      await page.getByRole('button', { name: 'Smenani ochish' }).click()
      await page.getByRole('button', { name: 'Smenani ochish' }).click()
      await expect(page.getByText('Smena ochiq')).toBeVisible()

      // To'lanmagan buyurtmani tanlash → to'liq summa naqd
      await page.getByRole('button', { name: dishPrice }).first().click()
      const payButton = page.getByRole('button', { name: /To'lovni qabul qilish/ })
      await expect(payButton).toContainText(dishPrice)
      await payButton.click()
      await expect(page.getByText("To'lov muvaffaqiyatli qabul qilindi!")).toBeVisible()

      // Z-hisobot: haqiqiy tushum = qabul qilingan to'lov
      await page.getByRole('button', { name: 'Z-Report' }).click()
      const totalRow = page.getByRole('row', { name: /Jami To'langan Summa/ })
      await expect(totalRow).toContainText(dishPrice)
    })
  })
})
