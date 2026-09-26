# RestoFlow — Vazifalar (26-sentabr 2026, 15-to'plam: KATTA VAZIFALAR)

> **Kod bo'yicha tekshirilgan, notaga emas.**
> frontend `origin/main` = `a30f04d` · backend `origin/main` = `8b0650c` (26-sent, 15:20 holati).
> PR va Issues holati GitHub'dan (`gh`) o'qildi.
> **Nazorat: 1-oktabr (1-hafta qabul). MVP demo: 15-oktabr.**

Jamoa: Zulfiqor, Izzat, Abdurahmon, Ziyodilla, Fayoz, Madina, Abdugani, Behruz H.
**Loyiha boshqaruvchisi: Javodbek** (`Javodbekabdusalimov`, Telegram `@Javodbe411`) — review, merge, deadline.

Bu to'plam 14-to'plamni (MVP, 24-sent) **bekor qilmaydi** — uni aniq, kattaroq va
tekshiriladigan bo'laklarga ajratadi.

---

## 🎯 Hozirgi holat — nega bu to'plam

- 🔴 **25-sentdan beri ikkala repoda atigi 1 ta commit** (Madinaning revert'i).
- 🔴 **~5 000 qator yozilgan kod PR'siz branch'da yotibdi:**
  | Branch | Muallif | Hajm | PR |
  |---|---|---|---|
  | Back `feature/madina-payment-role-guard` | Madina | 8 fayl, +3104 | ❌ |
  | Front `feature/madina-reports-and-landing` | Madina | 7 fayl, +1207 | ❌ |
  | Front `feature/abdugani-guest-qr-flow` | Abdugani | 13 fayl, +1351 | ❌ |
  | Front `Ziyodilla` | Ziyodilla | 21 fayl, +2060 | ❌ |
  | Front `feature/branches-map` | Ziyodilla | 5 fayl, +512 | #27 ochiq |
  | Front `feature/abdurahmon-status-role-ui` | Abdurahmon | 4 fayl, +64 | #29 review kutyapti |
- 🔴 Billing (Zulfiqor) — 0 commit.
- 🔴 Izzat (17-sentdan), Fayoz (12-sentdan) — 0 commit. Behruz H. — 0 Issue.
- 🟢 Backend #23: xavfsizlik teshiklari yopildi + `authorization.test.js` (119 route × 5 rol).

**Branch'dagi kod = yo'q kod.** Mijoz `main` dagi narsani ko'radi, branch'dagini emas.

---

## 📏 Qoidalar (qat'iy)

1. **Har kuni kamida 1 push.** Kuni bo'yi ishlab, kechqurun push qilmasang — o'sha kun ishlamagan hisoblanasan.
2. **Push qilingan ish 24 soat ichida PR bo'ladi.** PR'siz branch — ishlanmagan ish.
3. **Har modul = 4-6 kichik PR.** Bitta PR ≤ 400 qator (test va lock fayllardan tashqari).
4. **O'z PR'ingni o'zing merge qilmaysan.** Review → approve → merge'ni Javodbek yoki reviewer bosadi.
5. **Har PR tavsifida:** nima qilindi, qanday tekshirish, skrinshot (front bo'lsa), `closes #N` (bo'lsa).
6. **Har kuni 20:00 — «✅ Hisobotlar»:** `Ism | PR havolasi | nima qilindi | bloklovchi`.
   Faqat GitHub'da BOR narsani yoz.
7. **Bloklangan odam 2 soatdan ortiq jim turmaydi.**
8. **`TASKS.md` ga tegmang.**

---

## 1️⃣ ZULFIQOR — BILLING: TRIAL VA OBUNA (backend)

Hozir `Client` modelida `subscription` maydoni **umuman yo'q** — «30 kun bepul, keyin 299 000» degan narsa kodda mavjud emas.

**PR 1 — model** (`feat/billing-subscription-model`)
- `Client` ga `subscription: { plan, status: trial|active|expired|blocked, trialEndsAt, paidUntil }`
- Yangi restoran yaratilganda avtomatik `trial`, `trialEndsAt = now + 30 kun`
- Migratsiya skripti: mavjud restoranlarga `trial` (bugundan 30 kun)

**PR 2 — middleware** (`feat/billing-guard`)
- `subscription.middleware.js`: obuna tugagan bo'lsa POST/PUT/PATCH/DELETE → **402**, GET ishlaydi
- `root` har doim o'tadi; `/auth`, `/billing`, `/public` ochiq
- Testlar: trial ichida → 200 · tugagan → 402 · tugagan + GET → 200 · root → 200

**PR 3 — API** (`feat/billing-status-api`)
- `GET /billing/status` — tarif, holat, qolgan kun
- `PATCH /root/clients/:id/subscription` — root qo'lda uzaytiradi (`paidUntil += N kun`) + AuditLog yozuvi

**PR 4 — Payme yoki Click sandbox tanlovi** — `docs/billing.md`: qaysi biri, nega, callback sxemasi. Kod 2-haftada.

✅ **Qabul (1-okt):** muddati o'tgan restoran yangi buyurtma ocholmaydi (402), lekin hisobotini ko'radi. CI yashil.

---

## 2️⃣ ABDUGANI — ONBOARDING: «10 DAQIQADA YANGI RESTORAN»

**PR 0 — BUGUN:** `feature/abdugani-guest-qr-flow` (+1351) ni **3 ta PR** ga bo'l:
1. Zal/stol parser (`«Asosiy zal: 20 stol»` → stollar) + unit testlar
2. QR PDF generator
3. Sehrgar UI (5 qadam)

**PR 4 — backend `POST /auth/register-restaurant`** (Backend repo)
- Bitta so'rov: `Client` + `admin` user yaratadi — **tranzaksiya ichida** (biri yiqilsa, ikkalasi ham yo'q)
- Telefon OTP bilan tasdiqlanadi (OTP tizimi tayyor — `Otp.js`)
- Test: bir xil telefon bilan 2-marta → 409; user yaratishda xato → `Client` ham qolmaydi

**PR 5 — front `/start` sahifasi**
- Restoran nomi, egasi, telefon, parol → OTP → avtomatik login → sehrgarning 1-qadami
- Sehrgar qadamlari saqlanadi: sahifa yopilsa, shu joydan davom etadi

✅ **Qabul (1-okt):** `/start` → OTP → sehrgar → «Asosiy zal: 10 stol» → 10 stol bazada + QR PDF yuklanadi.

---

## 3️⃣ MADINA — HISOBOTLARNI TOPSHIRISH + OMBOR (1-hafta)

**PR 0 — BUGUN:** `feature/madina-payment-role-guard` (+3104, 1 commitda) ni ajrat:
1. Hisobot API — `report.service` + testlar (aniq raqam: 3 ta to'lov = 450 000)
2. Excel/PDF eksport — `ExcelService.js` qoladi, **`export.service.js` (bir xil 323 qator) o'chiriladi**
3. Front `feature/madina-reports-and-landing` → 2 PR: `ReportsPage` va landing «mashhur taomlar»

Review — Abdurahmon, merge — Javodbek.

**PR 4-5 — Ombor backend** (`feature/madina-inventory-models`)
- `Ingredient`: nom, birlik (kg/l/dona), qoldiq, minimal qoldiq, oxirgi narx, `restaurant`
- `Product.recipe: [{ ingredient, qty }]` — texnologik karta
- `StockMovement`: kirim / chiqim / hisobdan chiqarish / inventarizatsiya — kim, qachon, qancha, sabab
- To'langanda retsept bo'yicha ayirish: `order.service.js:355` dagi `decrementStock(order.items)` o'rniga — **tranzaksiya ichida**
- Testlar: 2 osh → guruch 0,3 kg kamaydi · bekor qilingan buyurtma ayirmaydi · boshqa restoranga tegmaydi

✅ **Qabul (1-okt):** hisobotlar `main` da (4 PR), ombor modellari + ayirish testlari yashil.

---

## 4️⃣ ABDURAHMON — E2E: TO'LIQ SSENARIY AVTOMATDA

**PR 0:** Front #29 — review'ni o'zing so'ra (Zulfiqor yoki Madina), merge'ni Javodbek.

**PR 1 — Playwright o'rnatish** (`feature/abdurahmon-e2e-setup`)
- `@playwright/test`, `e2e/` papka, test baza (seed skripti — faqat test uchun)
- CI: backend + front ko'tariladi, Playwright ishlaydi, xato bo'lsa skrinshot artefakt

**PR 2 — asosiy ssenariy** (`e2e/full-flow.spec.js`)
- admin login → taom qo'shish → ofitsiant buyurtma → oshxona «tayyor» → kassa smena ochadi → to'lov → Z-hisobot summasi = to'lov summasi

**PR 3 — mehmon ssenariysi** (`e2e/guest.spec.js`)
- `/guest?table=` → buyurtma → oshxona ekranida chiqadi

✅ **Qabul (1-okt):** CI'da har PR'da E2E ishlaydi va yashil.

---

## 5️⃣ ZIYODILLA — MEHMON TOMONI: QR → BUYURTMA → KUZATISH

**PR 0 — BUGUN:** `origin/Ziyodilla` (21 fayl, +2060) — tartibga sol:
- Xarita commit'ini `feature/branches-map` ga ko'chir → PR #27 yangilanadi. `axios.js`, `time.js` ni PR'dan chiqar
- QR-buyurtma oqimini yangi branch `feature/ziyodilla-guest-order` ga, `main` dan boshlab
- **`git config user.name "Ziyodilla"` va `user.email` ni sozla** — hozir commit'laring `Sizning Ismingiz` nomida

**PR 1 — menyu** (`/guest?table=`): kategoriyalar, qidiruv, rasm, narx, telefonda chiroyli; matnlar `t()` da, 3 til
**PR 2 — savat:** son, izoh («piyozsiz»), `POST /public/orders` → mehmonga buyurtma raqami
**PR 3 — kuzatish:** «qabul qilindi → tayyorlanmoqda → tayyor» — socket orqali jonli

✅ **Qabul (1-okt):** telefonda QR skanerlab buyurtma berish va holatni jonli ko'rish.

---

## 6️⃣ IZZAT — BILDIRISHNOMALAR: HAR RESTORANGA O'Z TELEGRAMI

⚠️ **26-sent 20:00 gacha 1-PR bo'lmasa — modul boshqaga beriladi.** Bu gap o'zgarmadi.

Muammo: `telegram.service.js:12` — `process.env.TELEGRAM_CHAT_ID`. **Hamma restoranning xabari bitta chatga tushadi.**

**PR 1 — BUGUN (15 daqiqalik ish):** `:572` «ЗАБАНКРОТИЛСЯ ЗАПАС» → «ЗАКАНЧИВАЕТСЯ ЗАПАС НА СКЛАДЕ»
**PR 2:** `:549` dagi `200000` → sof funksiya `isLargeCancellation(amount, threshold)` + testlar
**PR 3:** `Client` ga `telegram: { chatId, enabled, events[], largeCancelThreshold }`
**PR 4:** `telegram.service` env emas, restoranning o'z sozlamasidan o'qisin. Test: 2 restoran → har birining xabari faqat o'z chatiga

✅ **Qabul (1-okt):** PR 1-3 `main` da, PR 4 ochiq.

---

## 7️⃣ FAYOZ — MOBIL + PWA (ofitsiant telefoni)

⚠️ **26-sent 20:00 gacha 1-PR bo'lmasa — modul boshqaga beriladi.**

**PR 1 — BUGUN:** `src/features/settings/pages/SettingsPage.module.css` → Tailwind, css faylni o'chir
**PR 2-3:** har sahifa 360px va 390px da — ofitsiant, oshxona, kassa, menyu, stollar.
Har buzilgan joy — alohida commit (`fix(mobile): kassa — jadval gorizontal scroll`). Tugmalar ≥ 44px
**PR 4 — PWA:** `vite-plugin-pwa`, manifest, ikonka — ofitsiant «Bosh ekranga qo'shish» qila oladi

✅ **Qabul (1-okt):** oldin/keyin skrinshotlari PR'larda; ofitsiant ekrani 360px da gorizontal scroll'siz.

---

## 8️⃣ BEHRUZ H. — SIFAT NAZORATI

⚠️ **26-sent 20:00 gacha kamida 5 ta Issue bo'lmasa — o'rin bo'shaydi.**

**PR 1:** `docs/mvp-checklist.md` — MVP'ning har qadami: qadam · kutilgan natija · ✅/❌
(ro'yxatdan o'tish → menyu → QR → mehmon buyurtmasi → oshxona → kassa → Z-hisobot → Telegram → obuna)
**Issue'lar:** `restoflow.uz` da shu ro'yxatni telefonda o'tkaz. Har uzilgan joy = Issue:
sahifa · qurilma · kenglik · qadamlar · kutilgan / haqiqiy natija · skrinshot.
**1-oktgacha kamida 10 ta**, 15-oktgacha 20 ta.
**Har PR merge bo'lgach** — ssenariyni qayta o'tkaz, natijani «✅ Hisobotlar» ga yoz.

✅ **Qabul (1-okt):** checklist `main` da, ≥ 10 Issue, har biri to'liq formatda.

---

## 🧭 JAVODBEK (PM)

- Har kuni 21:00 — hisobot bermaganlar ro'yxatini guruhga tashla
- Ochiq PR 24 soatdan ortiq review'siz turmasin — reviewer tayinla
- 26-sent 20:00 dan keyin Izzat / Fayoz / Behruz H. bo'yicha holatni Behruzga yoz

---

## 📅 Nazorat nuqtalari

| Sana | Nima |
|---|---|
| **26-sent 20:00** | Izzat, Fayoz — 1-PR · Behruz H. — 5 Issue · Madina, Abdugani, Ziyodilla — branch'lar PR'ga |
| **Har kuni 20:00** | «✅ Hisobotlar» |
| **1-okt** | 1-hafta qabuli — yuqoridagi ✅ mezonlar |
| **8-okt** | 2-hafta |
| **15-okt** | 🎯 MVP DEMO — butun zanjir prod'da, bitta telefonda |
