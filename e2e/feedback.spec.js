import { test, expect } from '@playwright/test'
import { ACCOUNTS, MENU, TABLE } from './fixtures.js'
import { login } from './helpers/auth.js'

const COMMENT = 'E2E: QR menyudan yuborilgan fikr'
const REPLY = 'E2E: fikringiz uchun rahmat!'

test.describe.configure({ mode: 'serial', retries: 0, timeout: 90_000 })

test('mehmon QR menyudan fikr qoldiradi, admin /feedback da ko‘radi va javob yozadi', async ({ browser }) => {
  const adminContext = await browser.newContext()
  const guestContext = await browser.newContext()
  const admin = await adminContext.newPage()
  const guest = await guestContext.newPage()

  try {
    await login(admin, ACCOUNTS.admin)

    const user = await admin.evaluate(() => JSON.parse(localStorage.getItem('user') || '{}'))
    const restaurantId =
      (typeof user.restaurant === 'object'
        ? user.restaurant?._id ?? user.restaurant?.id
        : user.restaurant) ?? user.restaurantId
    expect(restaurantId, 'admin foydalanuvchisi restoran ID ga ega bo‘lishi kerak').toBeTruthy()

    await guest.goto(`/guest?restaurant=${restaurantId}`)

    const table = guest.getByRole('button', { name: new RegExp(`^\\s*${TABLE.number}(?!\\d)`) }).first()
    await expect(table).toBeVisible()
    await table.click()
    await guest.getByRole('button', { name: 'Davom etish' }).click()

    await expect(guest.getByText(MENU.product.name).first()).toBeVisible()
    await guest.getByRole('button', { name: /Qo'shish/ }).first().click()
    await guest.getByRole('button', { name: 'Davom etish' }).click()

    await guest.getByPlaceholder('Ism Familiya').fill('E2E Mehmon')
    await guest.getByPlaceholder('+998 90 123 45 67').fill('+998901112233')
    await guest.getByRole('button', { name: 'Bronni tasdiqlash' }).click()

    await expect(guest.getByRole('button', { name: 'Fikr bildirish' })).toBeVisible()
    await guest.getByRole('button', { name: 'Fikr bildirish' }).click()
    await guest.getByPlaceholder('Fikr va takliflaringizni yozib qoldiring...').fill(COMMENT)
    await guest.getByRole('button', { name: /Yuborish/ }).click()
    await expect(guest.getByText('Tashakkur!')).toBeVisible()

    await admin.goto('/feedback')
    await expect(admin.getByText(COMMENT)).toBeVisible()
    await admin.getByRole('button', { name: 'Javob yozish' }).first().click()
    await admin.getByPlaceholder('Mijozga javob yozing...').fill(REPLY)
    await admin.getByRole('button', { name: /Javobni yuborish/ }).click()
    await expect(admin.getByText(REPLY)).toBeVisible()
  } finally {
    await guestContext.close().catch(() => {})
    await adminContext.close().catch(() => {})
  }
})
