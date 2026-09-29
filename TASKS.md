# RestoFlow — Vazifalar (29-sentabr 2026, 16-to'plam: 🚀 MEGA — PRODGA CHIQARAMIZ)

> **Kod bo'yicha tekshirilgan, notaga emas.**
> frontend `origin/main` = `ef637f6` · backend `origin/main` = `8b0650c` (29-sent, 15:20 holati).
> PR, CI va prod holati GitHub'dan (`gh`) va `curl` bilan o'qildi.
> **Nazorat: 1-okt (1-hafta) · 8-okt (2-hafta) · 🎯 15-okt — MVP DEMO PROD'DA.**

Bu to'plam 15-to'plamning o'rnini **to'liq egallaydi**. 15-to'plamdagi qabul mezonlari
kuchda qoladi, ustiga har kimga katta modul qo'shildi.

**Loyiha boshqaruvchisi: Javodbek** (`Javodbekabdusalimov`, TG `@Javodbe411`).

---

## 🔥 Hozirgi holat — nega MEGA

| Nima | Holat |
|---|---|
| Prod front `restoflow.uz` (Netlify) | 🟢 ishlayapti |
| Prod backend (Railway) | 🟡 ishlayapti, lekin **uptime 6,9 kun — 22-sentdan beri deploy YO'Q** |
| Backend #23 (xavfsizlik teshiklari, 24-sent) | 🔴 `main` da bor, **prod'da YO'Q** |
| Backend `main` | 🔴 24-sentdan beri merge yo'q (5 kun) |
| Front `main` | 🔴 26-sentdan beri merge yo'q |
| Ochiq PR'lar | 🔴 **9 ta, birortasida review yo'q** |
| Deploy eskirganini kim sezadi? | ⚠️ hech kim — `/api/health` qaysi commit ishlayotganini aytmaydi |
| Billing (Zulfiqor) | 🔴 0 commit |
| Izzat · Behruz H. | 🔴 26-sent ultimatumi — 0 PR, 0 Issue → modullari boshqaga o'tdi. Izzatga oxirgi imkoniyat — i18n (7️⃣) |

**Kod branch'da = kod yo'q. Kod `main` da, lekin deploy qilinmagan = kod yo'q.**
Mijoz faqat **prod'dagi** narsani ko'radi.

### Ochiq PR'lar — kim nima qiladi (BUGUN)

| PR | Holat | Kim |
|---|---|---|
| Back #22 checkRole (#7) | ✅ yashil, 11 qator | **Javodbek — merge** |
| Front #30 15-to'plam | ✅ yashil | **Javodbek — yop** (16-to'plam o'rnini oldi) |
| Back #26 ombor | 🟡 lock fayl tuzatildi (`7460daa`), 4 test yiqilgan | Madina |
| Back #24 hisobot API | ❌ 5 test yiqilgan | Madina |
| Back #25 eksport | CI ishlamagan | Madina |
| Front #34 ombor ekrani | ✅ yashil | Back #26 dan keyin — Javodbek |
| Front #33 hisobot + landing | ⚠️ konflikt | Madina — rebase |
| Front #27 xarita | CHANGES_REQUESTED (22-sentdan) | Ziyodilla |
| Front #32 e2e full-flow | ❌ Z-hisobot qadami yiqilgan | Abdurahmon |

---

## 📏 Qoidalar (qat'iy, 15-to'plamdagidan tashqari)

1. **Merge SLA — 24 soat.** CI yashil + 1 approve = merge. 24 soatda review bo'lmasa — Javodbek o'zi review qiladi.
2. **Har `main` merge → prod'ga deploy.** Deploy qilinmagan merge — tugallanmagan ish.
3. **Har kuni kamida 1 push, push → 24 soatda PR.** Yangi PR ≤ 400 qator (test/lock hisobga kirmaydi).
4. **O'z PR'ingni o'zing merge qilmaysan.**
5. **20:00 — «✅ Hisobotlar»:** `Ism | PR havolasi | nima qilindi | bloklovchi`. Faqat GitHub'da BOR narsa.
6. **Bloklangan odam 2 soatdan ortiq jim turmaydi** — guruhga yoz, Javodbekni belgila.
7. **`TASKS.md` ga tegmang.**

---

## 0️⃣ JAVODBEK — RELEASE KAPITANI (merge navbati + prod)

Sen endi faqat PM emas — **prod sening qo'lingda.**

**BUGUN (29-sent):**
- Back #22 merge · Front #30 yop · har ochiq PR'ga reviewer tayinla (jadval yuqorida)
- Railway: backend `main` ni **qo'lda qayta deploy** qil → `curl https://backend-production-109c0.up.railway.app/api/health` da `uptime` kichik bo'lishi kerak. Natijani guruhga yoz

**1-hafta:**
- **Railway auto-deploy `main` dan** yoqilganini tekshir (yoqilmagan bo'lsa — yoq). Netlify front ham `main` dan
- **Staging:** Railway'da 2-servis `staging` (alohida baza!) + Netlify deploy preview har PR uchun. PR tavsifida preview havolasi bo'lsin
- `docs/RELEASE.md` — release tartibi: `main` → staging smoke → prod → smoke → «✅ Hisobotlar» ga release notes
- **Branch protection** ikkala repoda: `main` ga to'g'ridan push yo'q, CI yashil + 1 approve majburiy

**2-hafta:**
- Har seshanba va juma — **release kuni**, tag `v0.x.0`, CHANGELOG
- Rollback rejasi: Railway'da oldingi deploy'ga qaytish — 1 marta mashq qil, vaqtini yoz

✅ **Qabul (1-okt):** 9 ta PR'dan har biri merge yoki aniq sabab bilan yopilgan; prod backend `main` bilan bir xil; branch protection yoqilgan.

---

## 1️⃣ ZULFIQOR — BIZNES BACKEND: BILLING + TELEGRAM (Izzat moduli senga o'tdi)

⚠️ 23-sentdan beri 0 commit. **30-sent 20:00 gacha PR 1 bo'lmasa — billing Abdurahmonga o'tadi.**

**A. Billing** (15-to'plamdagi 4 PR o'zgarmadi):
- PR 1 `Client.subscription { plan, status: trial|active|expired|blocked, trialEndsAt, paidUntil }` + migratsiya
- PR 2 `subscription.middleware.js`: tugagan → yozish 402, o'qish 200, `root` o'tadi + testlar
- PR 3 `GET /billing/status` + `PATCH /root/clients/:id/subscription` + AuditLog
- PR 4 **Payme sandbox** — `docs/billing.md` + callback (`CheckPerformTransaction`, `PerformTransaction`), 2-hafta

**B. Telegram — har restoranga o'z chati** (Izzatdan):
- `telegram.service.js:12` — `process.env.TELEGRAM_CHAT_ID` → **hamma restoranning xabari bitta chatga tushyapti**
- PR 5 `Client.telegram { chatId, enabled, events[], largeCancelThreshold }` + `isLargeCancellation()` sof funksiya + test
- PR 6 service restoranning o'z sozlamasidan o'qiydi. Test: 2 restoran → xabar faqat o'z chatiga
- PR 7 (2-hafta) sozlamalar sahifasi: chat ID ulash, «test xabar yuborish» tugmasi

✅ **Qabul:** 1-okt — PR 1-2 `main` da. 8-okt — obuna tugagan restoran buyurtma ocholmaydi; 2 restoranning xabari 2 xil chatga tushadi.

---

## 2️⃣ MADINA — HISOBOT + OMBOR: TOPSHIR VA TUGAT

Eng ko'p kod sendan. Endi uni **`main` ga va prod'ga** olib chiqamiz.

**BUGUN–ERTAGA:**
- **Back #24** — 5 test yiqilgan:
  - `authorization.test.js` — yangi `/reports/*` route'lar `test/authorization.matrix.js` da yo'q → qo'sh, rolni ongli tanla (admin/manager)
  - `report.test.js` — 4 ta yiqilgan test, lokalda `npx vitest run test/report.test.js`
- **Back #26** — lock faylni men tuzatdim (`7460daa`). Qolgan 4 test: `authorization` matritsasi, `product.test.js` (tannarx/foyda%), `report.test.js /reports/profit`, `stock.test.js` (`/ingredients/export`)
- **Back #25** — CI ishlamagan: `main` ga rebase qil, push → CI ishga tushadi
- **Front #33** — konflikt: `git rebase origin/main`

**2-hafta — OMBOR TO'LIQ:**
- Kam qolgan xomashyo → dashboard'da ogohlantirish + (Zulfiqor Telegram tayyor bo'lsa) Telegram
- Yetkazib beruvchi: `Supplier` + kirim hujjati (kimdan, qancha, narx) → xomashyo tannarxi o'rtacha narx bo'yicha yangilanadi
- Inventarizatsiya: haqiqiy qoldiq kiritiladi → farq `StockMovement` ga «inventarizatsiya» sababi bilan
- Hisobot: **taom tannarxi va foyda%** — Excel eksportda ham

✅ **Qabul:** 1-okt — Back #24, #25, #26 va Front #33, #34 `main` da + prod'da. 8-okt — kirim → sotuv → qoldiq kamaydi → inventarizatsiya farqi hisobotda.

---

## 3️⃣ ABDURAHMON — SIFAT VA XAVFSIZLIK SHTABI (Behruz H. moduli senga o'tdi)

**A. E2E — yashil bo'lsin:**
- **Front #32** — `full-flow.spec.js:89` Z-hisobot qadami yiqilgan (`browserContext.close: Target … closed`). Sababini top: beqarorlik bo'lsa `await expect(...).toBeVisible()` bilan kut, haqiqiy xato bo'lsa — Issue
- `e2e/guest.spec.js` — `/guest?table=` → buyurtma → oshxonada chiqadi

**B. Prod monitoring — deploy eskirsa darhol bilamiz:**
- `/api/health` ga `commit` (git SHA) va `startedAt` qo'sh (Railway `RAILWAY_GIT_COMMIT_SHA`). Front'da ham `VITE_COMMIT` → footer'da kichik versiya
- `npm run smoke`: prod `commit` ≠ `origin/main` bo'lsa — **FAIL «prod eskirgan»**
- GitHub Actions `schedule` — har 30 daqiqada prod smoke, yiqilsa → Telegram ogohlantirish
- Front'da backend URL 3 joyda hardcode (`backend-production-109c0.up.railway.app`) → hamma joyda `api.restoflow.uz`, bitta `src/shared/config.js` dan

**C. MVP tekshiruv ro'yxati (Behruz H. dan):**
- `docs/mvp-checklist.md`: ro'yxatdan o'tish → menyu → QR → mehmon buyurtmasi → oshxona → kassa → Z-hisobot → Telegram → obuna
- Har release'dan keyin prod'da, telefonda o'tkaz → «✅ Hisobotlar» ga natija

**D. Xavfsizlik:**
- **Front Issue #18** — access/refresh token `localStorage` da → refresh token `httpOnly` cookie'ga (backend + front, 2 PR)
- Rate limit: `/auth/login` va `/auth/otp` — 5 urinish / 15 daqiqa + test

✅ **Qabul:** 1-okt — #32 yashil, `/api/health` commit SHA qaytaradi, checklist `main` da. 8-okt — #18 yopilgan, prod monitoring ishlayapti.

---

## 4️⃣ ABDUGANI — ONBOARDING: «10 DAQIQADA YANGI RESTORAN»

`feature/abdugani-guest-qr-flow` da **+1752 qator, 0 PR.** 29-sentda `/start`, OTP, sehrgar yozilgan — endi PR qil.

**BUGUN:** branch'ni **4 PR** ga bo'l (har biri ≤ 400 qator):
1. Zal/stol parser + unit testlar
2. QR PDF generator
3. Sehrgar UI (5 qadam, holati saqlanadi)
4. `/start` sahifasi + OTP + avtologin

**Backend (Backend repo):**
- PR 5 `POST /auth/register-restaurant` — `Client` + `admin` **tranzaksiyada**. Test: bir xil telefon → 409; user yiqilsa → `Client` ham yo'q
- PR 6 **«Demo ma'lumot» tugmasi** — yangi restoranga 3 kategoriya, 12 taom, 10 stol bir bosishda (sotuvchi mijozga 1 daqiqada ko'rsata olsin)

**2-hafta:** landing'dagi «Bepul boshlash» → `/start`. Sehrgar oxirida «Telegram ulash» qadami (Zulfiqor PR 7 bilan).

✅ **Qabul:** 1-okt — PR 1-4 ochiq, 2 tasi `main` da. 8-okt — `restoflow.uz/start` → OTP → sehrgar → 10 stol + QR PDF — **prod'da**.

---

## 5️⃣ ZIYODILLA — MEHMON TOMONI: QR → BUYURTMA → JONLI KUZATISH

`origin/Ziyodilla` da +2501 qator (3 til, QR menyu sayqali) — **PR yo'q.**

**BUGUN:**
- **Front #27** — 22-sentdan CHANGES_REQUESTED. `axios.js`/`time.js` chiqarildi (29-sent) → review so'ra
- `Ziyodilla` branch'dan **2 PR:** (a) `/guest` i18n uz/ru/en · (b) QR menyu sayqali (tugagan taom, xato, valyuta)
- `git config user.name "Ziyodilla"` + `user.email` — hali ham sozlanmagan

**1–2-hafta:**
- PR — savat: son, izoh («piyozsiz»), `POST /public/orders` → buyurtma raqami
- PR — **jonli kuzatish**: «qabul qilindi → tayyorlanmoqda → tayyor» socket orqali, sahifa yangilanmasdan
- PR — «Ofitsiantni chaqirish» va «Hisobni so'rash» tugmalari → ofitsiant ekraniga socket xabari
- Lighthouse mobil: `/guest` ≥ 85 (Performance), skrinshot PR'da

✅ **Qabul:** 1-okt — #27 va i18n `main` da. 8-okt — telefonda QR → buyurtma → holat jonli → «hisob» tugmasi ishlaydi, prod'da.

---

## 6️⃣ FAYOZ — MOBIL + PWA (ofitsiant telefoni)

Ish bor (44px, PWA — 26-sent), lekin **PR yo'q.** `fayoz-pwa` diff'i +7246 qator — ichida keraksiz narsalar.

**BUGUN:**
- PR 1 — `fayoz` branch: 44px tap target'lar (menyu, stollar). Oldin/keyin skrinshot 360px
- PR 2 — PWA: **`main` dan yangi branch**, faqat `vite-plugin-pwa` + manifest + ikonkalar. Diff ≤ 400 qator (lock'dan tashqari)

**1–2-hafta:**
- 360px va 390px da har sahifa: ofitsiant, oshxona, kassa, menyu, stollar — gorizontal scroll yo'q
- **Offline sahifa**: internet uzilsa «Aloqa yo'q — qayta urinish» ekrani, oq ekran emas
- Ofitsiant uchun **pastki navigatsiya** (Stollar · Buyurtmalar · Profil) mobil'da
- `SettingsPage.module.css` → Tailwind (15-to'plamdan qolgan)

✅ **Qabul:** 1-okt — PR 1-2 ochiq, 1 tasi `main` da. 8-okt — ofitsiant telefonda «Bosh ekranga qo'shish» qiladi va 360px da butun smena ishlaydi.

---

## 7️⃣ IZZAT — I18N: BUTUN PANEL 3 TILDA (oxirgi imkoniyat)

26-sent ultimatumi bajarilmadi, Telegram moduli Zulfiqorga o'tdi. Senga **yangi, mustaqil modul** — lekin shart qat'iy:
⚠️ **30-sent 20:00 gacha PR 1 bo'lmasa — o'rin bo'shaydi, qayta taklif bo'lmaydi.**

Lokal fayllar to'liq (uz/ru/en — 499 kalit), lekin JSX'da **~146 ta hardcode matn** `t()` dan o'tmagan.
Eng ko'pi: `ZReportModal.jsx` (38) · `ReceiptPrintModal.jsx` (14) · `ReceiptModal.jsx` (14) · `RootPanel.jsx` (13) · `PaymentsHistory.jsx` (9) · `SettingsPage.jsx` (7) · `ExcelImportModal.jsx` (7) · `Register.jsx` (5).
(`/guest` — Ziyodillaniki, tegma.)

**PR 1 — BUGUN–ERTAGA:** `ZReportModal.jsx` → hamma matn `t('zreport.*')`, uz/ru/en tarjima. Skrinshot 3 tilda
**PR 2:** chek modallari (`ReceiptModal`, `ReceiptPrintModal`) + `PaymentsHistory` — summa formati tilga qarab (`Intl.NumberFormat`)
**PR 3:** `RootPanel`, `SettingsPage`, `ExcelImportModal`, `Register`
**PR 4 — himoya:** `scripts/check-i18n.js` — (a) 3 til fayllarida kalitlar bir xil, (b) JSX'da hardcode matn yo'q → CI'da ishlaydi, yangi hardcode kelsa CI yiqiladi
**PR 5 (2-hafta):** tanlangan til `localStorage` + foydalanuvchi profilida saqlanadi; sana/vaqt formati tilga qarab

✅ **Qabul:** 1-okt — PR 1-2 ochiq, 1 tasi `main` da. 8-okt — `check-i18n` CI'da yashil, hardcode matn 0 ta.

---

## ⛔ BEHRUZ H.

26-sent 20:00 ultimatumi bajarilmadi (0 Issue). Sifat nazorati → **Abdurahmon**.
Qaytmoqchi bo'lsang — Behruzga yoz, **avval bitta merge bo'lgan PR** bilan.

---

## 📅 Nazorat nuqtalari

| Sana | Nima |
|---|---|
| **29-sent (bugun)** | Back #22 merge · prod backend qayta deploy · har PR'ga reviewer |
| **30-sent 20:00** | Zulfiqor PR 1 · Izzat PR 1 · Abdugani, Ziyodilla, Fayoz — branch'lar PR'ga · Madina — CI yashil |
| **Har kuni 20:00** | «✅ Hisobotlar» · 21:00 — Javodbek hisobot bermaganlar ro'yxati |
| **1-okt** | 1-hafta qabuli — yuqoridagi ✅ mezonlar |
| **Seshanba/juma** | Release kuni (Javodbek) |
| **8-okt** | 2-hafta qabuli |
| **15-okt** | 🎯 **MVP DEMO — butun zanjir PROD'DA, bitta telefonda:** ro'yxatdan o'tish → sehrgar → QR → mehmon buyurtmasi → oshxona → kassa → Z-hisobot → ombor kamaydi → Telegram xabari → obuna holati |
