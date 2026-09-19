# RestoFlow — Vazifalar (19-sentabr 2026, 11-to'plam)

> **Kod bo'yicha tekshirilgan, notaga emas.**
> frontend `origin/main` = `6af67ae` · backend `origin/main` = `8caee0a` (19-sent, 16:00 holati).
> PR, CI va Issues holati GitHub'dan (`gh`) o'qildi.
> **Deadline: 22-sentabr (seshanba) darsi.**

Jamoa: Zulfiqor, Izzat, Abdurahmon, Ziyodilla, Fayoz, Madina, Abdugani, Behruz H.
**Loyiha boshqaruvchisi (19-sentdan): Javodbek** (`Javodbekabdusalimov`, Telegram `@Javodbe411`) —
task, review, merge va deadline u orqali.

---

## 🎯 Bu to'plamning maqsadi

**Avval har kim O'Z xatosini tuzatadi.** Tugatganlarga — yangi ish (⭐).

Hozirgi holat:

- 🟢 Ikkala `main` CI yashil (Front 17-sent 16:30 dan beri). `restoflow.uz` prod'da ishlayapti.
- 🟢 Xavfsizlik auditi (17-sent): 10 topilmadan 6 tasi yopildi (Backend #2 #4 #5 #6 #8, Front #17).
- 🔴 17-sentdan beri 8 ta PR — **hech birida review yo'q**, 7 tasini muallifning o'zi merge qilgan
  (#20 — 0 daqiqada, #11 — 2 daqiqada).
- 🔴 Backend'ga `6d478cd` yana PR'siz to'g'ridan `main` ga tushdi.
- 🔴 Tayyor ishlar `main` dan tashqarida: Abdugani branchi (4 commit, shu jumladan QR → `/guest`),
  Zulfiqor `afe7cf6` + `fd702b7` (merge bo'lib ketgan `integration/sprint-10` da yetim),
  backend `feature/zulfiqor-payment-concurrency-tests`.
- 🔴 Izzat, Fayoz, Ziyodilla, Behruz H. — 17-sentdan beri 0 commit, 0 PR, 0 Issue.
- 🔴 18-sent 20:00 hisobotini hech kim yozmadi.

## 📏 Qoidalar

1. **`main` ga faqat PR + yashil CI orqali.** Backend'ga ham (GitHub Free'da private repo uchun
   branch protection yo'q — bu qoida faqat intizomda turadi).
2. **Commit nomi = haqiqatda qilingan ish.**
3. **Yozilgan ish PR'siz 24 soatdan ortiq turmaydi.**
4. **YANGI: o'z PR'ingni o'zing merge qilmaysan.** Kamida 1 kishi review (approve) beradi,
   merge'ni Javodbek yoki reviewer bosadi.
5. **YANGI: `TASKS.md` ga hech kim tegmaydi** — har safar konflikt beryapti. O'zgartirish kerak bo'lsa Javodbekka yoz.

---

## Avval o'z xatoingni tuzat

### 1. Zulfiqor
- `afe7cf6` (RootPanel «Control Center») va `fd702b7` (notifications 401 guard) — PR #15 merge bo'lgandan
  KEYIN `integration/sprint-10` ga push qilingan, `main` da yo'q. Konfliktsiz:
  ```bash
  git fetch origin && git switch -c feature/zulfiqor-rootpanel-control-center origin/main
  git cherry-pick fd702b7 afe7cf6
  git push -u origin HEAD   # → PR
  ```
- Backend `feature/zulfiqor-payment-concurrency-tests` — 3 kundan beri PR'siz. Bugun och.
- Guruhga yoz: Railway'da `JWT_ROOT_SECRET` alohidami? `api.restoflow.uz` SSL chiqdimi?
  Prod'da 4 ta test user (admin / manager / cashier / cook) — parollar Javodbekka lichkada, guruhga emas.
- ⭐ Yangi: `docs/multi-tenant.md` (Backend #3, HIGH) — 1 sahifa, kodsiz: `restaurant` maydoni qaysi
  modellarga (`Order, Table, User, Payment, Shift, Reservation, Setting`), JWT'da `restaurantId`
  qanday yuradi, eski ma'lumot qanday ko'chadi.

### 2. Madina
- `d87db34` (branch `feature/madina-zreport-summary`) — Backend #7 ni **teskari** qilgansan. Audit
  «to'lov yozuvlarini hamma rol ko'ryapti — yop» degan; sen frontda `payments:view` ni oshpazga ham berding.
  Bu commitni tashla, PR qilma.
- To'g'ri fix **backend**da: `src/routes/payment.routes.js` → `router.get('/')` ga
  `checkRole('admin', 'manager', 'cashier')` (97-qatorda tayyor namuna bor) +
  `test/payment.test.js` ga 2 test: cook → 403, cashier → 200. PR → Backend #7 yopiladi.
- Merge bo'lgan 2 ta eski branchingni o'chir (`kitchen-socket-sync`, `zreport-summary`).

### 3. Abdugani
- `feature/abdugani-guest-qr-flow` dagi 4 commit (`8c6d4f1` QR → `/guest` + A4, `c76063d`, `65c60c1`
  landing `t()`, `597a310`) `main` da **yo'q** — prod'da QR hali `/menu` ga olib boradi. **Bugun:**
  ```bash
  git fetch origin && git switch feature/abdugani-guest-qr-flow
  git merge origin/main            # konflikt faqat TASKS.md da
  git checkout origin/main -- TASKS.md && git commit
  git push                         # → PR
  ```
- ⭐ Yangi (sotuv uchun №1 funksiya): Menyu sahifasida «Excel'dan yuklash» — `exceljs` allaqachon bor.
  Ustunlar: nom | kategoriya | narx | tavsif → preview jadval → har qator `POST /products`.

### 4. Abdurahmon
- 19-sentda 3 ta PR — zo'r. Lekin #20 va #11 ni o'zing, reviewsiz merge qilding. Backend PR #10
  (npm audit) ga review so'ra, o'zing bosma.
- Backend #8 ni yop (PR #11 tuzatgan).
- 10-to'plamdan qolgan: Front `main` protection — required check `build-and-test` + 1 review +
  `enforce_admins`. Skrinshot guruhga.
- ⭐ Yangi: `src/constants/permissions.js` dagi `can()` uchun vitest (har rol × ruxsat).

## 0 commit — oxirgi imkoniyat

22-sentabrgacha kamida 1 ta PR yoki Issue bo'lmasa — o'rin vazifa kutayotganlarga beriladi.

### 5. Izzat — backend, branch `fix/izzat-telegram-alerts`
- `src/services/telegram.service.js:572` — «ЗАБАНКРОТИЛСЯ ЗАПАС» → «ЗАКАНЧИВАЕТСЯ ЗАПАС НА СКЛАДЕ».
- `:549` dagi `200000` → `LARGE_CANCEL_THRESHOLD` env (+ `.env.example`).
- Sof funksiya `isLargeCancellation(amount)` + `test/telegram.test.js` da 3 test
  (199 999 → false, 200 000 → true, env o'zgarsa chegara o'zgaradi). `npm test` yashil → PR.

### 6. Fayoz
- `src/features/settings/pages/SettingsPage.module.css` → Tailwind, CSS faylni o'chir → PR.
- Sening demo-login tasking (Front #17) ni Javodbek yopdi. Qaysi kunlari ishlay olishingni guruhga yoz.

### 7. Ziyodilla
- `origin/Ziyodilla` yana tarixsiz (`git init` qilingan) — `main` bilan umumiy commit yo'q, merge bo'lmaydi.
  ```bash
  git config --global user.name "Ziyodilla"
  git config --global user.email "<github emailing>"
  git clone https://github.com/restoFlow-1850/Front.git restoflow-yangi && cd restoflow-yangi
  git switch -c feature/ziyodilla-map-card
  # faqat RestaurantMapCard.jsx va AppLayout.jsx ni eski papkadan ko'chir
  git status        # 2 tadan ko'p fayl ko'rinsa — TO'XTA, Javodbekka yoz
  git add -A && git commit -m "feat(map): update RestaurantMapCard and AppLayout" && git push -u origin HEAD
  ```
- Tushunmasang — BUGUN Javodbekka yoz, birga qilamiz.

### 8. Behruz H.
- `restoflow.uz` ni telefonda (360/390px) och: landing, `/guest`, login, ofitsiant, oshxona, kassa.
  Har bir kesilgan tugma/modal = alohida GitHub Issue (sahifa + kenglik + skrinshot). Kamida 5 ta.
- Login sahifasida demo tugmalar endi yo'qligini tasdiqla (skrinshot).

---

## Hali ochiq Issue'lar

| Issue | Daraja | Kim |
|---|---|---|
| Backend #3 — tenant/restoran scoping | HIGH | Zulfiqor (avval `docs/multi-tenant.md`) |
| Backend #7 — `GET /payments` checkRole | MEDIUM | Madina |
| Backend #9 — npm audit | HIGH | Abdurahmon (PR #10 review kutmoqda) |
| Backend #8 — sanitize body | LOW | tuzatilgan, yopish kerak |
| Front #18 — token `localStorage` da | MEDIUM | keyingi to'plam |

## 📝 Hisobot

**21-sentabr (dushanba) 20:00** gacha «✅ Hisobotlar» topigiga bir qator:

```
Ism | PR/Issue havolasi | nima qilindi | bloklovchi
```
