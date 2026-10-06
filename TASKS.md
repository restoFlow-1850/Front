# RestoFlow — Vazifalar (3-oktabr 2026, 17-to'plam: 🔓 MERGE HAFTASI — branch'dan `main` ga)

> **Kod bo'yicha tekshirilgan, notaga emas.**
> frontend `origin/main` = `ef637f6` · backend `origin/main` = `79799f0` (3-okt, 15:20 holati).
> PR, CI, push tarixi GitHub'dan (`gh`), prod holati `curl` bilan o'qildi.
> **Nazorat: 6-okt (seshanba, dars) · 8-okt (2-hafta qabuli) · 13-okt (demo repetitsiyasi, prod'da) · 🎯 15-okt — MVP DEMO.**

Bu to'plam 16-to'plamning o'rnini egallaydi. **Modullar o'zgarmadi** — yangi katta vazifa yo'q.
Bu hafta bitta ish: yozilgan kodni `main` ga va prod'ga olib kirish.

---

## 🔥 Hozirgi holat

| Nima | Holat |
|---|---|
| Prod backend | 🟢 `79799f0` = `main`. `/api/health` endi commit'ni ko'rsatadi (Abdurahmon, #27) |
| Backend `main` | 🟡 29-sentdan beri 2 merge — ikkalasi Abdurahmon, o'zi merge qilgan |
| Front `main` | 🔴 **26-sentdan beri 0 merge (7 kun)** |
| Ochiq PR | 🔴 **13 ta** (Back 6, Front 7) — 29-sentda 9 ta edi |
| Review | 🔴 29-sentdan beri **0 ta** |
| PR'siz branch | 🔴 Abdugani +1784 · Ziyodilla +1973 · Fayoz +276 · Abdurahmon (refresh cookie backend) |
| «✅ Hisobotlar» | 🔴 29-sentdan beri 2 kishi yozgan, 30-sentdan beri — hech kim |

### 1-okt qabuli — natija

| Kim | Mezon | Natija |
|---|---|---|
| Abdurahmon | #32 yashil · health SHA · checklist `main` da | 🟡 1/3 — health SHA prod'da; #32 qizil; checklist #36 da ochiq |
| Zulfiqor | PR 1-2 `main` da | 🔴 kod 29-sentda branch'da edi, PR 3-okt ochildi |
| Madina | 5 ta PR `main` da | 🔴 0/5 — #24 da 4 test yiqilgan, #26 qizil, #33 konflikt |
| Ziyodilla | #27 va i18n `main` da | 🔴 #27 tuzatildi (2-okt), review menda; i18n PR yo'q |
| Abdugani | PR 1-4 ochiq, 2 tasi `main` da | 🔴 0 PR |
| Fayoz | PR 1-2 ochiq | 🔴 0 PR, 26-sentdan beri 0 push |
| Izzat | 30-sent 20:00 gacha PR 1 | 🔴 0 commit |
| Javodbek | 9 PR yopilgan · prod = `main` · protection | 🔴 26-sentdan beri 0 merge, 0 review |

### Demo zanjiri — 12 kun qoldi, hozir qayerda

| Qadam | Kim | Holat |
|---|---|---|
| Ro'yxatdan o'tish `/start` | Abdugani | 🔴 branch'da, PR yo'q. **Backend'da `POST /auth/register-restaurant` umuman yo'q** |
| Sehrgar + QR PDF | Abdugani | 🔴 branch'da, PR yo'q |
| Mehmon QR → buyurtma → jonli holat | Ziyodilla | 🔴 branch'da, PR yo'q (backend tayyor) |
| Oshxona → kassa → Z-hisobot | — | ✅ `main` + prod |
| Ombor kamayadi | Madina | 🔴 Back #26 CI qizil |
| Telegram — restoranning o'z chatiga | Zulfiqor | 🟡 Back #30, review'da 3 ta izoh (pastda) |
| Obuna holati | Zulfiqor | 🟡 Back #30; front'da ekran ham, 402 ni ushlaydigan joy ham yo'q |

**Zanjirning 7 qadamidan 1 tasi prod'da.** Kod bor — `main` da yo'q.

---

## 🔑 Yangi tartib: review va merge — Behruz

Merge navbatini o'zim oldim (`behhruz05`).

- PR tayyor bo'lsa — «✅ Hisobotlar» ga havola + «review» so'zi. Shu yetarli.
- Men qaraydigan narsa: **CI yashil · konflikt yo'q · ≤ 400 qator** (ko'p bo'lsa sababi yozilgan) · tavsifda «nima / qanday tekshirdim / skrinshot».
- CI qizil yoki konfliktli PR'ni ko'rmayman — navbatga ham kirmaydi.
- **O'z PR'ingni o'zing merge qilmaysan** — Backend'da ham. U yerda GitHub himoyasi yo'q, qoida — odamda.

### Merge navbati (tartibi muhim)

| # | PR | Holat | Nima kerak |
|---|---|---|---|
| 1 | Back #22 checkRole — Madina | ✅ yashil, 11 qator | merge qilaman |
| 2 | Back #28 rate limit — Abdurahmon | ✅ yashil | merge qilaman |
| 3 | Back — refresh cookie — Abdurahmon | ❌ **PR ochilmagan** | Abdurahmon: PR och (#28 ustiga qurilgan) |
| 4 | Front #27 xarita — Ziyodilla | ✅ yashil | qayta review qilaman |
| 5 | Front #32 e2e full-flow — Abdurahmon | ❌ e2e qizil | qayta ishga tushir (Back #29 dan oldingi run) |
| 6 | Front #36 config + cookie — Abdurahmon | ✅ yashil | ⛔ **faqat 3-qator prod'ga chiqqandan keyin** |
| 7 | Back #30 billing + Telegram — Zulfiqor | ✅ yashil | 3 ta izoh tuzatilgach |
| 8 | Back #24 → #25 → #26 — Madina | ❌ qizil / konflikt | testlar, rebase |
| 9 | Front #34, #33 — Madina | #34 yashil, #33 konflikt | Back #26 dan keyin |

Front #30 va #35 (15- va 16-to'plam) yopildi — o'rnini shu to'plam oldi.

---

## 📏 Qoidalar (16-to'plamdagilar kuchda, ustiga)

1. **Kod branch'da = kod yo'q.** Push → 24 soat ichida PR.
2. **Hisobot = PR havolasi.** «PR'ga bo'ldim», «tayyor» degan gap havolasiz qabul qilinmaydi.
3. **Har kuni 20:00 — «✅ Hisobotlar»:** `Ism | PR havolasi | nima qilindi | bloklovchi`.
4. **Hamma PR'i `main` ga kirmaguncha yangi funksiya boshlanmaydi.**
5. **`TASKS.md` ga tegmang.**

---

## 0️⃣ JAVODBEK — PM: DEPLOY VA KUNDALIK NAZORAT

26-sentdan beri GitHub'da 0 amal, guruhda 24-sentdan beri yo'qsan. Merge navbatini men oldim — senda deploy va nazorat qoladi.

- **BUGUN:** guruhga yoz — haftada necha soat bera olasan.
- Railway: `main` dan **auto-deploy** yoqilganini tekshir (skrinshot). Netlify front ham.
- Har merge'dan keyin `npm run smoke` (prod commit = `origin/main`) → natija «✅ Hisobotlar» ga.
- `docs/RELEASE.md` — release tartibi + rollback (Railway'da oldingi deploy'ga qaytish), 1 PR.
- Har kuni 21:00 — hisobot bermaganlar ro'yxati.

✅ **Qabul:** 6-okt — guruhda javob, auto-deploy tasdiqlangan. 8-okt — `RELEASE.md` `main` da.

---

## 1️⃣ ZULFIQOR — BILLING + TELEGRAM: #30 NI XAVFSIZ QILIB KIRITAMIZ

Back #30 — CI yashil, 9 ta billing testi, Telegram testlari bor. Yaxshi ish. Lekin shu holida merge qilsak **prod to'xtaydi**:

**a) Mavjud restoranlar 402 oladi.** `Client.isSubscriptionActive()` — `trialEndsAt` `null` bo'lsa `false` qaytaradi. `pre('save')` faqat `isNew` uchun ishlaydi. Prod'dagi restoranlarda `subscription` yo'q → deploy bo'lishi bilan **har bir buyurtma va to'lov 402**. `migrate-subscription.js` ni kimdir qo'lda ishga tushirishi kerak — unutilsa kassa ishlamaydi.
→ Tuzat: migratsiya server startida avtomatik (idempotent) **yoki** `trialEndsAt` yo'q restoran = trial deb hisoblansin.
→ Test: `subscription` maydoni yo'q restoran `POST /orders` → 201.

**b) Telegram yana umumiy chatga tushadi.** `chatId` yo'q restoran → `process.env.TELEGRAM_CHAT_ID` (`telegram.service.js:575`, `:587`). Ya'ni sozlamagan har bir restoranning xabari bitta chatga — vazifa aynan shuni yo'qotish edi.
→ `chatId` yo'q bo'lsa — yuborilmaydi. Test: sozlanmagan restoran → 0 xabar.

**c) Mehmon buyurtmasi guard'dan tashqarida.** `/public/*` ochiq yo'l → obunasi tugagan restoranga QR orqali buyurtma tushaveradi, lekin xodim uni yopa olmaydi (402).
→ Qaror qil (bloklaymizmi), `docs/billing.md` ga yoz, test qo'sh.

**d)** +1087 qator bitta PR — bu safar o'tadi. Keyingilari ≤ 400.

**Keyin (Front repo):**
- PR — obuna holati: sozlamalarda «Trial, N kun qoldi» (`GET /billing/status`) + 402 kelsa butun ilovada banner «Obuna tugagan» (axios interceptor). Hozir front 402 ni hech qayerda ushlamaydi.
- PR — Telegram sozlamalari: chat ID kiritish + «Test xabar yuborish» tugmasi.
- Payme sandbox — **demo'dan keyin.** Demo uchun root paneldan qo'lda uzaytirish yetadi.

✅ **Qabul:** 6-okt — a, b, c tuzatilgan, #30 `main` da. 8-okt — obuna banner va Telegram sozlamalari `main` da; 2 restoran → 2 xil chat prod'da.

---

## 2️⃣ MADINA — 5 TA PR, BITTADAN, TARTIB BILAN

Eng ko'p kod sendan — 4 kundan beri hammasi ochiq turibdi. **Yangi funksiya yo'q**, faqat topshirish.

1. **Back #22** — yashil, merge qilaman.
2. **Back #24** — `authorization` tuzaldi ✅ (3-okt). `test/report.test.js` da hali **4 test yiqilgan:**
   - `GET /api/reports/{method} returns 400 for unsupported methods`
   - `GET /reports/payments returns method breakdown from API data` (`:89`)
   - `GET /reports/by-method returns exact per-method breakdown` (200 kutilgan)
   - `reports are scoped to the authenticated restaurant (tenant filter)`

   `npx vitest run test/report.test.js` lokalda yashil bo'lmaguncha push qilma. Branch `main` dan 4 commit orqada → `git rebase origin/main`.
3. **Back #25** — bazasi `feature/madina-reports-api`, konflikt bor, CI ishlamagan. #24 kirgach bazani `main` ga o'zgartir, rebase.
4. **Back #26** — 29-sentdan beri push yo'q, CI qizil, `main` dan 4 commit orqada. Rebase + 16-to'plamdagi 4 test (`authorization` matritsasi, `product.test.js`, `/reports/profit`, `/ingredients/export`).
5. **Front #33** — 29-sentdan konflikt: `git rebase origin/main`. **Front #34** — yashil, Back #26 kirishi bilan merge.

Zulfiqor #30 kirgach: kam zaxira xabari restoranning **o'z** chatiga ketishini birga tekshiring.

✅ **Qabul:** 6-okt — #22, #24, #25 `main` da, #26 yashil. 8-okt — beshtasi `main` + prod; prod'da kirim → sotuv → qoldiq kamaydi.

---

## 3️⃣ ABDURAHMON — XAVFSIZLIK VA E2E: NAVBATNI TO'G'RILA

1-haftaning eng yaxshi natijasi: health SHA + prod monitor ishlayapti, e2e orqali **Z-hisobot 0 ko'rsatayotganini topding va tuzatding** (#29). Shu — e2e'ning butun ma'nosi.

**a) Refresh cookie — backend PR OCH (bugun).** `feature/abdurahmon-refresh-cookie` da commit bor (`8ddfbee`), PR yo'q. Front #37 ni esa #36 ichiga qo'shib yuborgansan → #36 endi backend'siz merge bo'lsa, access token tugashi bilan **hamma tizimdan chiqib ketadi** (front refresh token'ni saqlamaydi, backend `main` cookie bermaydi).
Tartib: Back #28 → cookie PR → prod deploy → faqat keyin Front #36.

**b) Front #32** — yiqilgan qadam: `full-flow.spec.js:128`, Z-hisobot «Jami To'langan Summa». Bu run Back #29 dan **oldin** ishlagan. Qayta ishga tushir — yashil bo'lishi kerak. Bo'lmasa sababini PR'ga yoz.

**c) #27 va #29 ni o'zing 1 daqiqada merge qilding.** Tushunaman — kutadigan odam yo'q edi. Endi bor.

**d) Yangi — tenant sizishi:** `table.controller.js:102` — `getIO().emit('table:waiter_called', …)` **hamma restoranga** ketadi. A restoran mehmoni ofitsiant chaqirsa, B restoran ofitsianti ham ko'radi. `rest:{id}:{role}` xonalari bor (`socket/index.js:21`) — shunga cheklash. Test: 2 restoran → faqat o'ziniki oladi.

**e)** `e2e/guest.spec.js` — Ziyodillaning PR'i kirgach. `docs/mvp-checklist.md` `main` ga kirgach — prod'da telefonda birinchi marta o'tkaz, natijani hisobotga.

✅ **Qabul:** 6-okt — #28, cookie PR, #32, #36 `main` da. 8-okt — Issue #18 yopilgan, `waiter_called` tenant bo'yicha, checklist prod'da 1 marta o'tkazilgan.

---

## 4️⃣ ABDUGANI — ONBOARDING: PR VA BACKEND

29-sent 18:08 da guruhga «4 ta PR'ga bo'lindi» deb yozding. GitHub'da sening ochiq PR'laring soni: **0.** Commit ichidagi hujjat — PR emas.

**BUGUN — `feature/abdugani-guest-qr-flow` (+1784) dan PR'lar:**
1. `wizardParsers.js` + `wizardParsers.test.js`
2. `Step4QrPackage.jsx` (QR PDF)
3. `QuickSetupPage.jsx` + `Step1` + `Step3` + `quickSetupPersistence.test.js`
4. `Step2ExcelMenu.jsx` + `Step5StaffAccounts.jsx` + `Step6Success.jsx`
5. `StartPage.jsx` + `router.jsx` + `auth/api.js` + landing havolasi

`package-lock.json` +58/−38 — qaysi paket qo'shilganini PR tavsifida yoz.

**⛔ Bloker — Backend:** `StartPage.jsx:67` `POST /auth/register-restaurant` ni chaqiradi. Backend `main` da bunday yo'l **yo'q** (faqat `/auth/register` va `/clients/register`). Prod'da `/start` 404 beradi.
- Backend PR — `POST /auth/register-restaurant`: `Client` + `admin` **bitta tranzaksiyada**. Test: bir xil telefon → 409; user yaratish yiqilsa → `Client` ham yo'q.
- Backend PR — «Demo ma'lumot»: yangi restoranga 3 kategoriya, 12 taom, 10 stol bir bosishda.

Backend PR'siz butun onboarding ishlamaydi — **birinchi shu.**

✅ **Qabul:** 6-okt — 5 front PR ochiq (2 tasi `main` da) + `register-restaurant` backend PR ochiq. 8-okt — `restoflow.uz/start` → OTP → sehrgar → QR PDF prod'da.

---

## 5️⃣ ZIYODILLA — MEHMON OQIMI: BRANCH'DAN PR'GA

2-okt: #27 dan `axios.js`/`time.js` chiqarilgan, CI yashil ✅ — qayta review qilaman.
Backend senga tayyor: `POST /public/orders`, `GET /public/orders/:id`, `call-waiter` — hammasi `main` da.

**`feature/ziyodilla-guest-order` (+1973, PR yo'q) → 3 PR:**
1. **i18n:** `locales/{uz,ru,en}/common.json` + mavjud qadamlar (`ConfirmStep`, `HallStep`, `MenuStep`, `StepHeader`, `SuccessStep`, `TableQrModal`, `TableSeat`)
2. **Buyurtma:** `GuestOrderFlow` + `GuestOrderMenu` + `GuestBlockedView` + `lib/stock.js` + testi
3. **Jonli holat:** `GuestOrderStatus` + `WaiterRequestsBanner` + `WaiterPage`

- Eski `Ziyodilla` branch'ini PR'lar ochilgach o'chir — ikki nusxa chalkashtiradi.
- `git config`: 2-okt commit'lari yana `Ziyodilla Mehmon <ziyodilla@example.com>` — ikkinchi kompyuterda ham `git config --global user.name` va `user.email`.
- Lighthouse mobil `/guest` ≥ 85 — skrinshot PR'da.

✅ **Qabul:** 6-okt — #27 `main` da, 3 PR ochiq, 1 tasi `main` da. 8-okt — telefonda QR → buyurtma → holat jonli → «hisob» tugmasi, prod'da.

---

## 6️⃣ FAYOZ — MOBIL + PWA (muddat bilan)

26-sentdan beri 0 push, 0 PR. Ishing tayyor turibdi: `fayoz` branch (+276/−888 — 44px tap target'lar + `SettingsPage` Tailwind).

⚠️ **6-okt (seshanba) darsigacha PR 1 bo'lmasa — mobil/PWA moduli boshqaga o'tadi.**

- **PR 1 — bugun:** `fayoz` → PR. `main` dan orqada bo'lsa rebase. Oldin/keyin skrinshot 360px.
- **PR 2:** PWA — `main` dan **yangi** branch, faqat `vite-plugin-pwa` + manifest + ikonkalar. `fayoz-pwa` (+7246) yaroqsiz — undan nusxa ko'chirma.
- Keyin: ofitsiant uchun pastki navigatsiya; offline sahifa («Aloqa yo'q — qayta urinish»).

✅ **Qabul:** 6-okt — PR 1 ochiq. 8-okt — PR 1-2 `main` da; telefonda «Bosh ekranga qo'shish» ishlaydi.

---

## 7️⃣ IZZAT — I18N (yana bitta muddat)

30-sent 20:00 muddati o'tdi: 0 commit, 0 PR. Yana **bitta** imkoniyat:

⚠️ **6-okt (seshanba) darsigacha PR 1 bo'lmasa — o'rin bo'shaydi.**

**PR 1 — faqat bitta fayl:** `ZReportModal.jsx` — 38 ta hardcode matn → `t('zreport.*')`, uz/ru/en tarjima. Skrinshot 3 tilda.
Qiyin bo'lsa — **bugun** yoz, darsda birga boshlaymiz. Jim turish — javob emas.

✅ **Qabul:** 6-okt — PR 1 ochiq, CI yashil.

---

## ⛔ BEHRUZ H.

O'zgarishsiz. Qaytmoqchi bo'lsang — Behruzga yoz, avval bitta merge bo'lgan PR bilan.

---

## 📅 Nazorat nuqtalari

| Sana | Nima |
|---|---|
| **3-okt (bugun)** | Abdurahmon — cookie PR · Abdugani, Ziyodilla, Fayoz — branch'lar PR'ga · Javodbek — guruhda javob |
| **Har kuni 20:00** | «✅ Hisobotlar» — PR havolasi bilan |
| **6-okt, seshanba (dars)** | Fayoz PR 1 · Izzat PR 1 · Zulfiqor #30 `main` da · Madina #24, #25 `main` da · merge navbatining 1–7 qatori yopilgan |
| **8-okt, payshanba** | 2-hafta qabuli — yuqoridagi ✅ mezonlar. **Zanjirning 7 qadami `main` da** |
| **13-okt, seshanba** | Demo repetitsiyasi — butun zanjir prod'da, telefonda, `docs/mvp-checklist.md` bo'yicha |
| **15-okt, payshanba** | 🎯 **MVP DEMO:** ro'yxatdan o'tish → sehrgar → QR → mehmon buyurtmasi → oshxona → kassa → Z-hisobot → ombor kamaydi → Telegram xabari → obuna holati |
