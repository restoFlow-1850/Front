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

async function openChat(page) {
  const requests = await mockAi(page)

  await login(page, ACCOUNTS.admin)
  await page.goto('/ai-chat')
  await expect(page.getByPlaceholder('Savolingizni yozing...')).toBeVisible()

  return requests
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
})
