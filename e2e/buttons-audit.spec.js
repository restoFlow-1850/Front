import { test, expect } from '@playwright/test'

// Har bir sahifadagi har bir tugma bosiladi; konsol xatosi, 4xx/5xx va qulashlar yig'iladi.
// XAVFSIZ rejim: o'chirish / tozalash / chiqish / yuborish / to'lov tugmalari BOSILMAYDI (haqiqiy bazada ishlaydi).
const EMAIL = process.env.E2E_EMAIL || 'admin@restoflow.uz'
const PASSWORD = process.env.E2E_PASSWORD || '12345678'
const DANGEROUS = /o.chir|tozala|chiqish|bekor qil|delete|remove|logout|yubor|to.la(sh|ndi)|tasdiqla|saqlash|qo.shish$|arxivla|clear|send|pay/i

// Faqat bizning API xatolari (3-tomon: analytics, fonts va h.k. hisobga olinmaydi)
const isApi = (u) => /\/api\//.test(u)


const ROUTES = ['/dashboard','/ai-chat','/orders','/map','/waiter','/kitchen','/cashier','/menu','/tables','/reservations','/employees','/reports','/inventory','/settings','/notifications','/feedback','/profile']

for (const route of ROUTES) {
  test(`${route}: har bir tugma ishlaydi`, async ({ page }) => {
    test.setTimeout(150_000)
    const problems = []
    let where = route
    page.on('pageerror', (e) => problems.push({ where, type: 'pageerror', msg: e.message.slice(0, 200) }))
    page.on('console', (m) => {
      if (m.type() === 'error' && !/favicon|status of 4(01|04)|ERR_BLOCKED|googleapis|gstatic/.test(m.text()))
        problems.push({ where, type: 'console', msg: m.text().slice(0, 200) })
    })
    page.on('response', (r) => {
      if (isApi(r.url()) && r.status() >= 400 && r.status() !== 401)
        problems.push({ where, type: `http ${r.status()}`, msg: `${r.request().method()} ${r.url().replace(/^https?:\/\/[^/]+/, '')}` })
    })

    await page.goto('/login')
    await page.getByRole('textbox', { name: 'Email' }).fill(EMAIL)
    await page.getByRole('textbox', { name: 'Parol' }).fill(PASSWORD)
    await page.getByRole('button', { name: 'Kirish' }).click()
    await expect(page).toHaveURL(/dashboard/)

    await page.goto(route, { waitUntil: 'networkidle' }).catch(() => {})
    await page.waitForTimeout(800)
    expect(page.url(), 'sahifa login/404 ga tashlab yubordi').toContain(route)
    const total = await page.getByRole('button').count()
    let clicked = 0, skipped = 0
    for (let i = 0; i < Math.min(total, 50); i++) {
      if (!page.url().includes(route)) await page.goto(route, { waitUntil: 'networkidle' }).catch(() => {})
      const btn = page.getByRole('button').nth(i)
      if (!(await btn.isVisible().catch(() => false)) || (await btn.isDisabled().catch(() => true))) continue
      const label = ((await btn.innerText({ timeout: 1000 }).catch(() => '')) || (await btn.getAttribute('aria-label').catch(() => '')) || `#${i}`).trim().replace(/\s+/g, ' ')
      if (DANGEROUS.test(label)) { skipped++; continue }
      where = `«${label.slice(0, 40)}»`
      const before = problems.length
      try { await btn.click({ timeout: 3000 }); await page.waitForTimeout(400); clicked++ }
      catch (e) { problems.push({ where, type: 'click-fail', msg: e.message.split('\n')[0].slice(0, 160) }) }
      await page.keyboard.press('Escape').catch(() => {})
      if (problems.length > before) await page.screenshot({ path: `test-results/btn-${route.slice(1)}-${i}.png` }).catch(() => {})
    }
    console.log(`${route}: ${total} tugma, ${clicked} bosildi, ${skipped} xavfli o'tkazildi, muammo: ${problems.length}`)
    for (const p of problems) console.log(`   - [${p.type}] ${p.where}: ${p.msg}`)
    expect(problems).toEqual([])
  })
}
