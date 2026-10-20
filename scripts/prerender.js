import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.resolve(__dirname, '../dist')
const templatePath = path.join(distDir, 'index.html')

if (!fs.existsSync(templatePath)) {
  console.error('[prerender] dist/index.html topilmadi. Avval "vite build" qiling.')
  process.exit(1)
}

const template = fs.readFileSync(templatePath, 'utf8')

const DOMAIN = 'https://restoflow.uz'

/**
 * Public sahifalar uchun metadata va statik pre-rendered HTML
 */
const ROUTES = [
  {
    path: '',
    outputPath: 'index.html',
    title: 'RestoFlow — Restoran Boshqaruv Tizimi | Bulutli POS, KDS va QR Menyu',
    description:
      "O'zbekistondagi restoranlar, kafelar va choyxonalar uchun zamonaviy bulutli boshqaruv platformasi. Qulay POS kassa, ofitsiant paneli, oshxona KDS, QR menyu, ombor kalkulyatsiyasi va tahliliy hisobotlar.",
    keywords:
      'restoran boshqaruv tizimi, restaurant pos uzbekistan, kafe kassa dasturi, qr menyu, kds oshxona, ombor hisobi restoran, restoflow, pos uzbekistan',
    heading: "Restoran Boshqaruv Tizimi — Bitta Qulay Ilovada",
    content: `
      <section style="padding: 2rem 1rem; max-width: 1100px; margin: 0 auto; color: #E6DCDC;">
        <header style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #4a1616; padding-bottom: 1rem;">
          <h1 style="font-size: 1.75rem; color: #D9A968; margin: 0;">RestoFlow — Restoran Boshqaruv Tizimi</h1>
          <nav>
            <a href="/start" style="color: #D9A968; margin-right: 1rem; font-weight: bold; text-decoration: none;">Boshlash</a>
            <a href="/clients" style="color: #cbbcbc; margin-right: 1rem; text-decoration: none;">Mijozlar</a>
            <a href="/guest" style="color: #cbbcbc; margin-right: 1rem; text-decoration: none;">QR Menyu</a>
            <a href="/login" style="color: #cbbcbc; text-decoration: none;">Kirish</a>
          </nav>
        </header>
        <main style="padding: 2rem 0;">
          <h2 style="font-size: 2.25rem; color: #ffffff;">Restoran, Kafe va Choyxonalarni Avtomatlashtirish</h2>
          <p style="font-size: 1.125rem; color: #9a8080; line-height: 1.6;">
            RestoFlow — ofitsiantlar, oshxona KDS, kassa POS va ombor hisobini yagona tizimga birlashtiruvchi bulutli dastur.
          </p>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin-top: 2rem;">
            <div style="background: #1c0a0b; border: 1px solid #4a1616; border-radius: 1rem; padding: 1.5rem;">
              <h3 style="color: #D9A968; margin-top: 0;">POS Kassa va Savdo</h3>
              <p style="color: #9a8080;">Naqd, karta (Humo/Uzcard), Click, Payme to'lovlari, Z-hisobot va chek chop etish.</p>
            </div>
            <div style="background: #1c0a0b; border: 1px solid #4a1616; border-radius: 1rem; padding: 1.5rem;">
              <h3 style="color: #D9A968; margin-top: 0;">Oshxona Ekrani (KDS)</h3>
              <p style="color: #9a8080;">Buyurtmalarni tezkor qabul qilish, tayyorlanish vaqti taymeri va kechikish ogohlantirishlari.</p>
            </div>
            <div style="background: #1c0a0b; border: 1px solid #4a1616; border-radius: 1rem; padding: 1.5rem;">
              <h3 style="color: #D9A968; margin-top: 0;">QR Raqamli Menyu</h3>
              <p style="color: #9a8080;">Stoldagi QR-kod orqali kontaktsiz buyurtma berish, ofitsiant chaqirish va ko'p tilli menyu.</p>
            </div>
            <div style="background: #1c0a0b; border: 1px solid #4a1616; border-radius: 1rem; padding: 1.5rem;">
              <h3 style="color: #D9A968; margin-top: 0;">Ombor va Kalkulyatsiya</h3>
              <p style="color: #9a8080;">Xomashyo kirim-chiqimi, taom retseptlari (texkarta) va avtomatik hisobdan chiqarish.</p>
            </div>
          </div>
          <div style="margin-top: 2.5rem; text-align: center;">
            <a href="/start" style="display: inline-block; background: #D9A968; color: #2a0e10; padding: 0.85rem 2rem; font-weight: bold; border-radius: 0.75rem; text-decoration: none;">14 Kun Bepul Sinab Ko'ring</a>
          </div>
        </main>
      </section>
    `,
  },
  {
    path: '/start',
    outputPath: 'start/index.html',
    title: "Restoranni Boshlash va Ro'yxatdan O'tkazish — RestoFlow",
    description:
      "RestoFlow bilan restoraningizni 10 daqiqada avtomatlashtiring. Restoran egasi va admin hisobini bitta qadamda oching. 14 kun bepul sinov.",
    keywords: 'restoran ochish, restoran dasturi, restoran onboarding, restoflow start',
    heading: "Restoranni 10 Daqiqada Ishga Tushiring",
    content: `
      <section style="padding: 2rem 1rem; max-width: 700px; margin: 0 auto; color: #E6DCDC; text-align: center;">
        <h1 style="font-size: 2rem; color: #D9A968;">Restoranni 10 Daqiqada Ishga Tushiring</h1>
        <p style="color: #9a8080;">Restoran egasi va admin akkaunti — bitta qadamda ro'yxatdan o'tkazish.</p>
        <p style="color: #cbbcbc; margin-top: 2rem;">Yuklanmoqda...</p>
      </section>
    `,
  },
  {
    path: '/clients',
    outputPath: 'clients/index.html',
    title: "Mijozlarimiz — RestoFlow Bilan Ishlayotgan Restoranlar",
    description:
      "O'zbekistondagi yetakchi restoran, kafe va choyxonalar RestoFlow orqali buyurtmalarni qabul qilmoqda va xizmat ko'rsatish sifatini oshirmoqda.",
    keywords: 'restoflow mijozlar, restoranlar ro\'yxati, kafe avtomatlashtirish namunalari',
    heading: "RestoFlow Bilan Ishlayotgan Restoranlar",
    content: `
      <section style="padding: 2rem 1rem; max-width: 1000px; margin: 0 auto; color: #E6DCDC;">
        <h1 style="font-size: 2rem; color: #D9A968;">Mijozlarimiz va Hamkor Restoranlar</h1>
        <p style="color: #9a8080;">O'zbekiston bo'ylab yuzlab restoran va kafelar RestoFlow platformasidan muvaffaqiyatli foydalanmoqda.</p>
        <p style="color: #cbbcbc; margin-top: 2rem;">Restoranlar ro'yxati yuklanmoqda...</p>
      </section>
    `,
  },
  {
    path: '/guest',
    outputPath: 'guest/index.html',
    title: "QR Raqamli Menyu — RestoFlow Onlayn Buyurtma",
    description:
      "RestoFlow kontaktsiz QR menyusi orqali stolingizdan turib taomlarni tanlang, tarkibini ko'ring va ofitsiantni kutmasdan darhol buyurtma bering.",
    keywords: 'qr menyu, raqamli menyu, contactless menu, stol buyurtma, restoflow qr',
    heading: "RestoFlow QR Raqamli Menyu",
    content: `
      <section style="padding: 2rem 1rem; max-width: 800px; margin: 0 auto; color: #E6DCDC; text-align: center;">
        <h1 style="font-size: 2rem; color: #F97316;">RestoFlow QR Raqamli Menyu</h1>
        <p style="color: #9a8080;">Taomlarni tanlang va ofitsiantni kutmasdan to'g'ridan-to'g'ri stolga buyurtma bering.</p>
        <p style="color: #cbbcbc; margin-top: 2rem;">Menyu yuklanmoqda...</p>
      </section>
    `,
  },
  {
    path: '/login',
    outputPath: 'login/index.html',
    title: "Tizimga Kirish — RestoFlow Boshqaruv Paneli",
    description:
      "RestoFlow boshqaruv paneliga xavfsiz kirish. Restoran administratori, menejeri, kassiri va ofitsiantlari uchun kirish oynasi.",
    keywords: 'restoflow login, restoran tizimiga kirish, pos kassa kirish',
    heading: "RestoFlow Tizimiga Kirish",
    content: `
      <section style="padding: 2rem 1rem; max-width: 600px; margin: 0 auto; color: #E6DCDC; text-align: center;">
        <h1 style="font-size: 2rem; color: #D9A968;">RestoFlow Boshqaruv Paneliga Kirish</h1>
        <p style="color: #9a8080;">Administrator, kassir, ofitsiant va oshpazlar uchun kirish oynasi.</p>
        <p style="color: #cbbcbc; margin-top: 2rem;">Kirish oynasi yuklanmoqda...</p>
      </section>
    `,
  },
  {
    path: '/register',
    outputPath: 'register/index.html',
    title: "Ro'yxatdan O'tish — RestoFlow Hisob Yaratish",
    description:
      "RestoFlow restoran boshqaruv tizimida yangi hisob yarating. 14 kunlik bepul sinov davri va to'liq avtomatlashtirish imkoniyatlari.",
    keywords: 'restoflow ro\'yxatdan o\'tish, restoran dasturi akkaunt, pos tizimi ro\'yxatdan o\'tish',
    heading: "RestoFlow Ro'yxatdan O'tish",
    content: `
      <section style="padding: 2rem 1rem; max-width: 600px; margin: 0 auto; color: #E6DCDC; text-align: center;">
        <h1 style="font-size: 2rem; color: #F97316;">RestoFlow Ro'yxatdan O'tish</h1>
        <p style="color: #9a8080;">Yangi hisob oching va restoraningizni avtomatlashtirishni boshlang.</p>
        <p style="color: #cbbcbc; margin-top: 2rem;">Yuklanmoqda...</p>
      </section>
    `,
  },
]

function renderRoute(route) {
  const canonicalUrl = `${DOMAIN}${route.path}`
  let html = template

  // Title almashtirish
  html = html.replace(/<title>.*?<\/title>/i, `<title>${route.title}</title>`)

  // Meta description almashtirish
  html = html.replace(
    /<meta\s+name=["']description["']\s+content=["'].*?["']\s*\/?>/i,
    `<meta name="description" content="${route.description}" />`
  )

  // Canonical tagni almashtirish yoki kiritish
  if (html.includes('<link rel="canonical"')) {
    html = html.replace(
      /<link\s+rel=["']canonical["']\s+href=["'].*?["']\s*\/?>/i,
      `<link rel="canonical" href="${canonicalUrl}" />`
    )
  } else {
    html = html.replace('</head>', `  <link rel="canonical" href="${canonicalUrl}" />\n</head>`)
  }

  // Open Graph va Twitter teglari yangilash
  html = html.replace(
    /<meta\s+property=["']og:title["']\s+content=["'].*?["']\s*\/?>/i,
    `<meta property="og:title" content="${route.title}" />`
  )
  html = html.replace(
    /<meta\s+property=["']og:description["']\s+content=["'].*?["']\s*\/?>/i,
    `<meta property="og:description" content="${route.description}" />`
  )
  html = html.replace(
    /<meta\s+property=["']og:url["']\s+content=["'].*?["']\s*\/?>/i,
    `<meta property="og:url" content="${canonicalUrl}" />`
  )
  html = html.replace(
    /<meta\s+name=["']twitter:title["']\s+content=["'].*?["']\s*\/?>/i,
    `<meta name="twitter:title" content="${route.title}" />`
  )
  html = html.replace(
    /<meta\s+name=["']twitter:description["']\s+content=["'].*?["']\s*\/?>/i,
    `<meta name="twitter:description" content="${route.description}" />`
  )

  // <div id="root"> ichiga prerender qilingan semantik HTML kiritish
  // Botlar uchun boyitilgan, React hydrates qilinganda replace bo'ladi
  html = html.replace(
    '<div id="root"></div>',
    `<div id="root">${route.content}</div>`
  )

  const outFilePath = path.join(distDir, route.outputPath)
  fs.mkdirSync(path.dirname(outFilePath), { recursive: true })
  fs.writeFileSync(outFilePath, html, 'utf8')
  console.log(`[prerender] Yaratildi: ${route.outputPath} (${canonicalUrl})`)
}

console.log(`[prerender] ${ROUTES.length} ta public sahifa prerender qilinmoqda...`)
ROUTES.forEach(renderRoute)
console.log('[prerender] Barcha public sahifalar muvaffaqiyatli prerender qilindi! ✨')
