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

// retries: 0 — qayta urinish butun guruhni boshidan yuritadi va admin taomni
// ikkinchi marta qo'shib yuboradi (ikki xil «E2E Lag'mon» → strict mode xatosi).
// timeout: kassir qadami 4 ta sahifa amalini bajaradi — 30s kamlik qiladi.
test.describe.configure({ mode: 'serial', retries: 0, timeout: 90_000 })

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
      // Stollar va menyu API'dan yuklanishini kutamiz — aks holda bosish bo'sh joyga tushadi
      const table = page.getByRole('button', { name: tableButton }).first()
      await expect(table).toBeVisible()
      await table.click()
      const dish = page.getByRole('button', { name: new RegExp(NEW_DISH.name) }).first()
      await expect(dish).toBeEnabled()
      await dish.click()
      const submit = page.getByRole('button', { name: 'Buyurtmani yuborish' })
      await expect(submit).toBeEnabled()
      await submit.click()

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
      await page.getByRole('button', { name: 'Smenani ochish' }).first().click()
      await expect(page.getByText("Boshlang'ich balans (so'm)")).toBeVisible()
      await page.getByRole('button', { name: 'Smenani ochish' }).last().click()
      await expect(page.getByText('Smena ochiq').first()).toBeVisible()

      // To'lanmagan buyurtmani tanlash → to'liq summa naqd
      const order = page.getByRole('button', { name: dishPrice }).first()
      await expect(order).toBeVisible()
      await order.click()
      const payButton = page.getByRole('button', { name: /To'lovni qabul qilish/ })
      await expect(payButton).toBeEnabled()
      await expect(payButton).toContainText(dishPrice)
      await payButton.click()
      // Muvaffaqiyat: tugma «To'liq to'langan» ga o'tadi yoki buyurtma ro'yxatdan chiqadi
      await expect(payButton).toBeHidden()

      // Z-hisobot: haqiqiy tushum = qabul qilingan to'lov
      await page.getByRole('button', { name: 'Z-Report' }).click()
      const totalRow = page.locator('tr', { hasText: "Jami To'langan Summa" })
      await expect(totalRow).toContainText(dishPrice)
    })
  })
})
