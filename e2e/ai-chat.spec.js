import { test, expect } from '@playwright/test'
import { ACCOUNTS } from './fixtures.js'
import { login } from './helpers/auth.js'

// AI yordamchi oynasi. Backend AI javobi soxta — test faqat frontendni
// tekshiradi: savol yuboriladi, javob va ishlatilgan tool belgilari chiqadi.
const AI_ANSWER = "Bugungi savdo 1 250 000 so'm, omborda 3 ta mahsulot kam qoldi."
const DASHBOARD_QUESTION = 'Bugun tushum qancha?'

async function mockAi(page) {
  const requests = []

  await page.route('**/ai/chat', async (route) => {
    try {
      requests.push(route.request().postDataJSON())
    } catch {
      requests.push(null)
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          answer: AI_ANSWER,
          toolCalls: [{ name: 'daily_sales' }, { name: 'inventory' }],
        },
      }),
    })
  })

  return requests
}

async function mockAiError(page, { status, message }) {
  await page.route('**/ai/chat', async (route) => {
    await route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify({ success: false, ...(message ? { message } : {}) }),
    })
  })
}

async function openChat(page) {
  const requests = await mockAi(page)

  await login(page, ACCOUNTS.admin)
  await page.goto('/ai-chat')
  await expect(page.getByPlaceholder('Savolingizni yozing...')).toBeVisible()

  return requests
}

async function sendQuestion(page, text) {
  await page.getByPlaceholder('Savolingizni yozing...').fill(text)
  await page.getByRole('button', { name: 'Yuborish' }).click()
}

test.describe('AI chat', () => {
  test('savol yozilganda javob va tool belgilari chiqadi', async ({ page }) => {
    await openChat(page)

    await page.getByPlaceholder('Savolingizni yozing...').fill('Bugungi savdo qanday?')
    await page.getByRole('button', { name: 'Yuborish' }).click()

    await expect(page.getByText(AI_ANSWER)).toBeVisible()

    const tools = page.getByTestId('ai-tool-calls')
    await expect(tools).toBeVisible()
    await expect(tools.getByText('Kunlik savdo')).toBeVisible()
    await expect(tools.getByText('Ombor')).toBeVisible()
  })

  test('?q= orqali savol avtomatik yuboriladi', async ({ page }) => {
    const requests = await mockAi(page)

    await login(page, ACCOUNTS.admin)
    await page.goto(`/ai-chat?q=${encodeURIComponent(DASHBOARD_QUESTION)}`)

    await expect(page.getByText(DASHBOARD_QUESTION)).toBeVisible()
    await expect(page.getByText(AI_ANSWER)).toBeVisible()
    await expect(page).not.toHaveURL(/[?&]q=/)
    expect(requests[0]).toMatchObject({ question: DASHBOARD_QUESTION })
  })

  test('dashboarddan tayyor savol chatni ochib avtomatik yuboradi', async ({ page }) => {
    const requests = await mockAi(page)

    await login(page, ACCOUNTS.admin)
    await page.goto('/dashboard')

    await page.getByTestId('ai-ask-revenue').click()

    await expect(page).toHaveURL(/\/ai-chat/)
    await expect(page.getByText(DASHBOARD_QUESTION)).toBeVisible()
    await expect(page.getByText(AI_ANSWER)).toBeVisible()
    await expect(page.getByTestId('ai-tool-calls')).toBeVisible()
    await expect.poll(() => requests.map((body) => body?.question)).toContain(DASHBOARD_QUESTION)
  })

  test('suhbat yangilanganda saqlanadi, «Yangi suhbat» tozalaydi', async ({ page }) => {
    await openChat(page)

    await page.getByPlaceholder('Savolingizni yozing...').fill('Ombordagi zaxira qanday?')
    await page.getByRole('button', { name: 'Yuborish' }).click()
    await expect(page.getByText(AI_ANSWER)).toBeVisible()

    // sessionStorage tufayli F5 dan keyin ham tarix joyida qoladi
    await page.reload()
    await expect(page.getByText(AI_ANSWER)).toBeVisible()
    await expect(page.getByTestId('ai-tool-calls')).toBeVisible()

    page.once('dialog', (dialog) => dialog.accept())
    await page.getByRole('button', { name: 'Yangi suhbat' }).click()

    await expect(page.getByText(AI_ANSWER)).toHaveCount(0)
    await expect(page.getByPlaceholder('Savolingizni yozing...')).toBeVisible()
  })

  test('403 da backend sababi ko‘rsatiladi, toast chiqmaydi', async ({ page }) => {
    const message = 'AI yordamchi faqat restoranga biriktirilgan xodimlar uchun'
    await mockAiError(page, { status: 403, message })

    await login(page, ACCOUNTS.admin)
    await page.goto('/ai-chat')
    await sendQuestion(page, 'Bugungi savdo qanday?')

    await expect(page.getByText(message)).toBeVisible()
    await expect(page.getByText('Faqat admin/menejer uchun')).toHaveCount(0)
    await expect(page.locator('.Toastify__toast--error')).toHaveCount(0)
  })

  test('403 da backend sababi bo‘lmasa umumiy matn chiqadi', async ({ page }) => {
    await mockAiError(page, { status: 403 })

    await login(page, ACCOUNTS.admin)
    await page.goto('/ai-chat')
    await sendQuestion(page, 'Bugungi savdo qanday?')

    await expect(page.getByText('Faqat admin/menejer uchun')).toBeVisible()
    await expect(page.locator('.Toastify__toast--error')).toHaveCount(0)
  })

  test('uch marta «Qayta urinish» toast qo‘shmaydi', async ({ page }) => {
    const message = 'AI yordamchi faqat restoranga biriktirilgan xodimlar uchun'
    await mockAiError(page, { status: 403, message })

    await login(page, ACCOUNTS.admin)
    await page.goto('/ai-chat')
    await sendQuestion(page, 'Bugungi savdo qanday?')

    for (let attempt = 0; attempt < 3; attempt += 1) {
      await page.getByTestId('ai-retry').click()
      await expect(page.getByText(message)).toHaveCount(1)
    }

    await expect(page.locator('.Toastify__toast--error')).toHaveCount(0)
  })

  test('«To‘xtatish» tugmasi so‘rovni bekor qiladi', async ({ page }) => {
    await page.route('**/ai/chat', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 3000))
      try {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: { answer: AI_ANSWER } }),
        })
      } catch {
        // So'rov allaqachon bekor qilingan — javob yuborish shart emas.
      }
    })

    await login(page, ACCOUNTS.admin)
    await page.goto('/ai-chat')
    await sendQuestion(page, 'Bugungi savdo qanday?')

    const stop = page.getByTestId('ai-stop')
    await expect(stop).toBeVisible()
    await stop.click()

    await expect(stop).toHaveCount(0)
    await expect(page.getByText('Xatolik')).toHaveCount(0)
    await expect(page.getByText(AI_ANSWER)).toHaveCount(0)
  })
})

test.describe('AI chat mobil (360px)', () => {
  test.use({ viewport: { width: 360, height: 780 } })

  test('360px ekranda savol-javob va nusxalash ishlaydi', async ({ page }) => {
    await openChat(page)
    await sendQuestion(page, 'Bugungi savdo qanday?')

    await expect(page.getByText(AI_ANSWER)).toBeVisible()
    await expect(page.getByTestId('ai-copy').first()).toBeVisible()
    await expect(page.getByPlaceholder('Savolingizni yozing...')).toBeVisible()

    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    )
    expect(overflows).toBe(false)
  })
})
