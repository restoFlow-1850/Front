# RestoFlow — Vazifalar (22-avgust 2026, 3-to'plam)

> Kod bo'yicha tekshirilgan. frontend `main` = `adefab6`, backend `main` = `a866bbc`.
> Oldingi to'plam (18-avgust) shu faylning tarixida.

Jamoa: Zulfiqor, Izzat, Abdurahmon, Ziyodilla, Fayoz, Madina, Abdugani.

**Modul egaligi o'zgardi:** Madina kassadan **oshxonaga** o'tdi, Fayoz **mijozlar uchun landing**ga o'tdi.

---

## 🔴 P0 — uchta ildiz sabab (bugun)

Bu uchtasi butun demoni to'sib turibdi. Ikkitasi bitta odamda — Zulfiqorda.

### 1. 429 "Ko'p so'rov yubordingiz" — hamma joyda

Sabab topildi: `Backend/src/routes/index.js:7` da `apiLimiter` **barcha** API yo'llariga qo'yilgan —
`max: 200` so'rov / 15 daqiqa / IP (`rateLimiter.middleware.js:24-25`), `trust proxy = 1`.

Hisob-kitob: oshxona paneli har **20 soniyada** so'rov yuboradi (`useKitchenOrders.js:61`) = 45 so'rov/15 daq.
Dashboard 4 ta query, har biri 30–60 soniyada = ~90 so'rov/15 daq. Bitta ochiq oshxona + bitta dashboard = 135.
Ikkinchi odam qo'shilsa limit tugadi. Ofisda hammangiz bitta IP'dan chiqasiz — shuning uchun 429 hammaga birdan tushadi.

### 2. Ofitsiant zakaz bersa oshpazga tushmayapti

Backend **to'g'ri ishlayapti**: `order.controller.js:12` `kitchen:new_order` emit qiladi (`order:created` ham).
Muammo frontendda: `services/socket.js:10` da `transports: ['websocket']` — faqat websocket, polling zaxirasi yo'q.
Proxy yoki Railway websocket'ni kesib qo'ysa, socket **umuman ulanmaydi** va hech qanday xato ko'rinmaydi.
Ustiga socket faqat `App.jsx:17` da bir marta ulanadi — sahifa ochilganda token bo'lmasa, boshqa hech kim qayta ulamaydi.

### 3. Har taomga izoh (comment) — backendda joy yo'q

`Backend/src/models/OrderItem.js` da faqat `product`, `name`, `price`, `quantity` bor.
Izoh butun buyurtmaga tegishli (`Order.notes`), **har taomga alohida emas**.
Ya'ni "1 ta osh — achchiq bo'lmasin, 1 ta osh — go'shtsiz" deb yozib bo'lmaydi.

---

# 👤 Zulfiqor — Backend (P0 ×3)

- [ ] **🔴 429'ni tuzat.** `apiLimiter`ni hamma yo'lga qo'yish noto'g'ri. Qil:
  - `max`ni kamida **1000/15 daq** ga ko'tar (ofis bitta IP'dan chiqadi);
  - `GET` so'rovlarni limitdan chiqar yoki alohida yumshoq limit ber (o'qish xavfsiz);
  - limitni IP bo'yicha emas, **token bo'yicha** hisobla (`keyGenerator` — `req.user?.id ?? req.ip`), shunda bir xodimning polling'i boshqasini bloklamaydi;
  - `authLimiter` (10/15 daq) login uchun qolsin — u to'g'ri.
- [ ] **🔴 `OrderItem`ga `note` maydonini qo'sh.** `models/OrderItem.js` ga `note: { type: String, trim: true, default: '' }`,
      `validations/order.validation.js` dagi item sxemasiga `note: z.string().trim().max(200).optional()`.
      `kitchen:new_order` payload'idagi `items` allaqachon to'liq item obyektini yuboradi — `note` avtomatik tushadi, tekshirib qo'y.
- [ ] **Socket eventlarni xonalarga yubor.** Hozir hammasi `io.emit` — ya'ni oshxona eventi mijoz brauzeriga ham ketadi.
      `socket/index.js` da `role:cook` / `role:waiter` xonalari allaqachon bor, ishlat: `io.to('role:cook').emit('kitchen:new_order', ...)`.
- [ ] **`try { getIO() } catch (e) {}`** — `order.controller.js` da xato jimgina yutilyapti. Hech bo'lmasa `console.error` qo'y, aks holda socket ishlamayotgani bilinmaydi.
- [ ] **`EVENTS.md` yolg'on gapiryapti** — unda `order:new`, `order:statusChanged`, `order:ready` sanalgan, backend bularni yubormaydi. Yo emit qil, yo hujjatdan o'chir.
- [ ] Yangi `order:cancelled` va `table:waiter_called` eventlari hujjatda yo'q — qo'sh.

---

# 👤 Madina — Oshxona (yangi modul)

Kassadan oshxonaga o'tding. Kassa ishing main'da ✅ (smena, Z-Report, chek, eksport).
Oshxona paneli hozir Ziyodilladan meros — kod bor, lekin real vaqtda ishlamaydi.

- [ ] **🔴 Taom tayyorlash jarayonini real vaqtda ishlat.** Zulfiqor socket xonalarini tuzatgach,
      oshxona `kitchen:new_order` kelishi bilan **so'rovsiz** yangi buyurtmani ko'rsatishi kerak —
      hozir 20 soniyalik polling'ga tayanadi, shuning uchun ham kech tushadi, ham 429 chiqaradi.
- [ ] **🔴 `refetchInterval: 20_000` ni olib tashla** (`useKitchenOrders.js:61`) yoki 2–3 daqiqaga uzaytir.
      Socket ishlagach polling faqat zaxira bo'lishi kerak, asosiy kanal emas.
- [ ] **🔴 Har taom izohini ko'rsat.** Zulfiqor `OrderItem.note` qo'shgach, `OrderTicket.jsx` da
      har taom qatorining tagida izohni chiqar (masalan sariq fonli kichik matn: *"achchiq bo'lmasin"*).
      Buyurtma darajasidagi `notes` allaqachon chiqadi — ikkalasini aralashtirma.
- [ ] Status zanjiri to'g'ri ishlashini tekshir: `yangi → oshxonada → tayyor`. Tugma bosilganda
      optimistik yangilanish bor, lekin xato bo'lsa orqaga qaytarish yo'q — qo'sh.
- [ ] Ovozli signal (`utils/audioAlert.js`) yangi buyurtmada ishlayotganini tasdiqla — hozir "Ovozni tekshirish" tugmasi bor, lekin haqiqiy buyurtmada sinalmagan.
- [ ] Zulfiqor bilan **birga ishla** — socket tomoni unda, ko'rsatish tomoni senda. Ikkovingiz bitta buyurtmani boshdan-oxir sinab ko'ring: ofitsiant yuboradi → oshpaz ekranida 1 soniyada paydo bo'ladi.

---

# 👤 Izzat — Ofitsiant: taomga izoh

Menyu vazifang bajarilgan ✅. Yangi ish — kichik, lekin oshxona uchun muhim.

- [ ] **Ofitsiant zakaz olayotganda har taomga izoh yozadigan qil.** Savatdagi har taom qatoriga
      "Izoh" tugmasi/inputi (masalan "go'shtsiz", "achchiq bo'lmasin", "alohida tarelkada").
- [ ] Buyurtma yuborilganda izoh `items[].note` sifatida ketsin — Zulfiqor bu maydonni backendga qo'shadi,
      u bilan kelishib ol, maydon nomi aynan `note` bo'lsin.
- [ ] Izoh oshpaz ekranida ko'rinishini Madina bilan birga sinab ko'r — ikkovingiz bitta buyurtmada tekshiring.
- [ ] Izoh uzunligini cheklab qo'y (200 belgi), bo'sh izoh yuborilmasin.

---

# 👤 Fayoz — Mijozlar uchun landing (yangi modul)

Auth UI'ing main'da ✅. Endi butunlay yangi ish: **istalgan odam kirib, restorandan joy band qiladi** — login talab qilinmaydi.

- [ ] **Ochiq landing sahifasi** (`/` yoki `/restoran`): restoran haqida, menyudan namunalar, "Joy band qilish" tugmasi.
      Login/parol so'ralmaydi — mehmon faqat ism va telefon qoldiradi.
- [ ] Bron oqimi allaqachon qisman bor: `features/qr-menu/pages/GuestMenuPage.jsx` (`/guest`) —
      sana, vaqt, mehmonlar soni, zal xaritasi ishlaydi va **haqiqiy backend** bilan ulangan. Uni noldan yozma, shuni landing'ga ulab ket.
- [ ] Backend tayyor: `POST /reservations` ochiq, `GET /tables/availability` bo'sh stollarni beradi.
- [ ] **⚠️ Aniqlashtirish kerak:** "luboy restoranga" — hozir backendda **bitta restoran** bor, `Restaurant` modeli yo'q.
      Ko'p restoranli qilish uchun backendda yangi model + har jadval/menyuga `restaurant` maydoni kerak — bu katta ish, alohida faza.
      **1-faza:** bitta restoran uchun ochiq landing + bron (shu haftaga ulguradi).
      **2-faza:** ko'p restoran — Zulfiqor bilan model chizib, keyin boshlanadi. Behruz qaror qiladi.
- [ ] Sozlamalar sahifang ham senda qoldi (`features/settings`) — `SettingsPage.module.css` 569 qator,
      loyihaning qolgani Tailwind'da. Landing tugagach ko'chir.

---

# 👤 Ziyodilla — Stollar + Ofitsiant paneli

Oshxona Madinaga o'tdi. Sening zimmangda stollar va ofitsiant oqimi — ya'ni Izzatning izohi va Madinaning oshxonasi orasidagi bo'g'in.

- [ ] **🔴 10 daqiqalik ish, hali qilinmagan:** stol statusi `'free'` → `'available'`.
      Backend `Table.js:16` enum = `['available','occupied','reserved']`, live API ham shuni qaytaradi.
      Frontend `constants/tableStatus.js:2-3` va `constants/roles.js:87` da `'free'` turibdi →
      bo'sh stol hech qachon topilmaydi, **stol ko'chirish umuman ishlamaydi**.
- [ ] `constants/tableStatus.js` dagi ruscha yorliqlarni (`Свободен`, `Занят`, `Бронь`) o'zbekchaga o'tkaz,
      keyin bu faylni butunlay o'chirib, hamma joy `constants/roles.js`dan olsin — ikkita konstanta fayli bir-biriga zid.
- [ ] Ofitsiant ekrani: buyurtma yuborilgandan keyin stol darhol `occupied` bo'lishini va
      oshxonaga tushganini ko'z bilan tekshir (Madina bilan birga).
- [ ] **Branch tartibi.** Uch marta tarixsiz (merge base'siz) branch push qilding — har safar fayllarni qo'lda ko'chirishga to'g'ri keldi.
      Endi faqat shunday: `git checkout main && git pull && git checkout -b feature/<nom>`.

---

# 👤 Abdurahmon — Infratuzilma

CI va o'lik qatlam tozalash main'da ✅ — eng foydali ish shu bo'ldi.

- [ ] **Socket ishonchliligi** (Zulfiqor bilan bo'lishib ol): `services/socket.js:10` dan
      `transports: ['websocket']` ni olib tashla — `['websocket', 'polling']` qil.
      Websocket kesilsa polling'ga tushsin, hozir jimgina ulanmay qoladi.
      Ustiga ulanish holatini ko'rsatadigan kichik indikator qo'y (yashil/qizil nuqta) — hozir socket o'lganini hech kim bilmaydi.
- [ ] **Sozlamalar dublikatini yop.** Backendda ikkita implementatsiya bor: Zulfiqorniki main'da
      (`Setting.js` + logo + printers), seniki `feature/abdurahmon-settings-api` branch'da (zod validatsiya bilan).
      Zulfiqor bilan kelishib bittasini qoldiring — ikkalasi merge qilinsa `/settings` ikki marta ro'yxatdan o'tadi.
      Frontendda Fayozning sahifasi tanlandi (backend logo/printers bilan mos).
- [ ] Kassadagi soliq/xizmat haqi qatorlarini backend maydon nomlari bilan qayta yoz:
      `taxPercent`, `serviceFeePercent` (sen `taxRate`, `serviceFee` deb yozgansan — shuning uchun merge qilinmadi).
- [ ] `/notifications` backend endpointlari hali ishlatilmayapti (Fayoz landingga o'tdi, bu ish egasiz qoldi) —
      bildirishnoma tarixi va "o'qilgan" belgisi serverga borsin.

---

# 👤 Abdugani — Stollar (davom)

20-avgustdagi ishing merge qilindi ✅ (TanStack migratsiya, UTC+5 tuzatish, Vite proxy).

- [ ] Ziyodilla bilan **kim qaysi faylni yozishini** bugun kelishib oling — ikkovingiz ham `features/tables` da ishlayapsiz.
- [ ] Bron va stol bog'lanishi: mehmon `/guest` orqali bron qilganda stol `reserved` bo'lishini tekshir (Fayozning landing'i shunga ulanadi).

---

## Ishlash tartibi — o'zgarmadi, lekin bu safar jiddiy

1. **Ish boshlashdan oldin guruhga bir qator yoz:** "men falon papkani olaman".
   To'rt kunda uchta ish ikki marta yozildi (sozlamalar sahifasi ×2, sozlamalar API ×2, kassa fayllari ×2) — ~1500 qator bekorga.
2. Branch faqat `origin/main`dan ochiladi. PR ochishdan oldin `npm run build` / `npm test`.
3. Yangi endpoint yoki event yozsang — `EVENTS.md` / Swagger'ni **o'sha PR ichida** yangila.

---
---

<details>
<summary>Eski vazifalar (18-avgust va undan oldingilar)</summary>

# RestoFlow — MVP Sprint (20–25 avgust 2026)

> Bu ro'yxat **kod holatidan** tuzilgan, notadan emas.
> Tekshirilgan: frontend `main` = merge qilingan (build ✅), backend `main` = `0fb2e30` (98/98 test ✅).
> Lokal ishlaydi: backend `:3000`, frontend `:5173`. `.env` to'liq (CORS, Telegram, SMTP, Supabase).

**Muddatlar:**
- **P0 — 22-avgust (shanba) 18:00** — bularsiz MVP yo'q
- **P1 — 24-avgust (dushanba) 18:00**
- **MVP DEMO — 25-avgust (seshanba) 17:00**

**Qoida:** har kim `feature/<ism>-<modul>` branch'ida ishlaydi, kuniga kamida 1 marta push.
PR ochishdan oldin `npm run build` (frontend) va `npm test` (backend) yashil bo'lishi shart.

---

## Vazifalar taqsimoti

| Kim | Modul | Vazifa | Ustuvorlik |
|-----|-------|--------|------------|
| 🟢 **Zulfiqor** | lead, integratsiya | Kunlik merge, PR review, demo ssenariysi, Telegram hisobot | P0 |
| 🟣 **Izzat** | `features/menu`, `features/qr-menu` | Menyuni localStorage'dan API'ga ko'chirish + QR mehmon buyurtmasi | **P0** |
| 🟤 **Madina** | `features/cashier` | Smena ochish/yopish + Z-Report UI | **P0** |
| 🔵 **Ziyodilla** | `features/orders`, `features/tables` | «Ofitsiant chaqirish» real-time oqimi | **P0** |
| 🟠 **Fayoz** | `features/kitchen`, `features/notifications` | Mock fallback'ni olib tashlash, bildirishnomalar to'liq ulanishi | P1 |
| ⚫ **Abdurahmon** | `infra`, backend `settings` | GitHub Actions CI + Sozlamalar API'si | P1 |

---

## 🟣 Izzat — Menyu + QR mehmon buyurtmasi (P0)

**Muammo:** `features/menu/pages/MenuPage.jsx` butun menyuni `localStorage`da saqlaydi (64–267-qatorlar), rasmlarni base64 qilib kvotani to'ldiradi, matnlari ruscha. Backend allaqachon tayyor.

- [ ] `MenuPage.jsx` dan **butun localStorage qatlamini olib tashlash**. Kategoriya CRUD → `/api/categories`, taom CRUD → `/api/products` (react-query `useMutation` + `invalidateQueries`).
- [ ] Rasm yuklash: base64 emas, `POST /api/products` ga `multipart/form-data` — backend Supabase Storage'ga o'zi yuklaydi (`.env` da `SUPABASE_SERVICE_KEY` bor, ishlaydi).
- [ ] Barcha ruscha matn va izohlarni o'zbekchaga, `₽` → **so'm**.
- [ ] `MenuPage.css` qoldiqlarini Tailwind'ga o'tkazish.
- [ ] **QR mehmon buyurtmasi:** `features/qr-menu/api.js` da hozir faqat `createGuestReservation` bor. `createGuestOrder` qo'shish → `POST /api/orders` (stol raqami QR'dan, `items` savatdan). `GuestMenuPage.jsx` da savat → tasdiqlash → buyurtma oqimi.

**Tayyor mezoni:** telefonda `/guest?table=5` ochib, taom tanlab, buyurtma berasan — oshxona panelida (`/kitchen`) o'sha buyurtma **sahifani yangilamasdan** paydo bo'ladi.

---

## 🟤 Madina — Smena va Z-Report (P0)

**Muammo:** backendda `/api/shifts` to'liq tayyor (`open`, `current`, `close`, ro'yxat + testlar), frontendda **umuman yo'q**. Smenasiz kassa yopilmaydi — MVP demo shu yerda uziladi.

- [ ] `features/cashier/api.js` ga: `openShift`, `getCurrentShift`, `closeShift`, `getShifts`.
- [ ] Kassa sahifasi tepasiga smena holati paneli: yopiq bo'lsa «Smenani ochish» (boshlang'ich naqd summa), ochiq bo'lsa — ochilgan vaqti, kassir ismi, joriy tushum.
- [ ] «Smenani yopish» modali → `POST /shifts/close` → qaytgan **Z-Report**ni ko'rsatish: naqd/karta bo'yicha summa, buyurtmalar soni, kutilgan va haqiqiy naqd farqi.
- [ ] Z-Report'ni chop etish (mavjud `ReceiptModal` chop etish mantiqidan foydalan).
- [ ] Smena ochilmagan bo'lsa to'lov qabul qilishni bloklash.

**Tayyor mezoni:** smena ochasan → 2 ta buyurtmani to'laysan → smenani yopasan → Z-Report'da o'sha 2 to'lov summasi to'g'ri chiqadi.

---

## 🔵 Ziyodilla — «Ofitsiant chaqirish» oqimi (P0)

**Muammo:** backend `POST /api/tables/:id/call-waiter` ni bajaradi, `table:waiter_called` eventini emit qiladi va notification yaratadi — lekin **frontendda bu eventni hech kim tinglamaydi**. Ya'ni funksiya bor, ko'rinmaydi.

- [ ] `features/qr-menu` ga mehmon uchun 3 ta tugma: «Ofitsiantni chaqirish», «Chek — naqd», «Chek — karta» → `POST /tables/:id/call-waiter` (`type: call | bill_cash | bill_card`).
- [ ] `WaiterPage.jsx` da `socket.on('table:waiter_called')` — ekranning tepasida qizil banner + ovozli signal (`useKitchenOrders.js` dagi `playAudioAlert` ni umumiy `utils`ga chiqarib qayta ishlat).
- [ ] `TablesPage.jsx` da chaqirgan stol yonib tursin, ofitsiant «Qabul qildim» bosgach o'chsin.
- [ ] Stollar/Ofitsiant sahifalaridagi socket lifecycle bug: komponent remount bo'lganda listener ikki marta osilib qolmasin (`useNotificationsSocket.js` dagi pattern namuna).

**Tayyor mezoni:** mehmon telefonidan chaqirasan → ofitsiant ekranida 2 soniya ichida signal + banner chiqadi.

---

## 🟠 Fayoz — Oshxona va bildirishnomalar (P1)

- [ ] `features/kitchen/mockData.js` va undan kelayotgan `demo` rejimni olib tashlash — backend yiqilsa mock ko'rsatish o'rniga aniq xato holati ko'rsatilsin.
- [ ] `useKitchenOrders.js` dagi `order:created` / `order:status_updated` / `kitchen:new_order` eventlarini `EVENTS.md` ga solishtirib tekshirish (merge paytida qo'lda birlashtirilgan — sinovdan o'tkazish kerak).
- [ ] Bildirishnomalar: `notificationsSlice.js` dagi mock ma'lumotni olib tashlab `/api/notifications` ga to'liq ulash, o'qilgan/o'qilmagan holati backendda saqlansin.
- [ ] Sidebar'dagi bell ikonkasiga o'qilmaganlar soni.

---

## ⚫ Abdurahmon — CI va Sozlamalar (P1)

- [ ] **CI:** `.github/workflows/ci.yml` — hozir repo'da `.github` papkasi umuman yo'q. Har PR'da: frontend `npm ci && npm run build`, backend `npm ci && npm test`. Yiqilsa merge bloklansin.
- [ ] **Sozlamalar backendi:** `features/settings/pages/SettingsPage.jsx` hamma narsani `localStorage`da saqlaydi (restoran nomi, soliq %, xizmat haqi %, printer). Backendda `Settings` modeli + `GET/PUT /api/settings` (faqat admin/manager) yozish.
- [ ] Frontendni o'sha API'ga ulash va **soliq/xizmat foizini chekda haqiqiy hisobga** olish (hozir chekda qattiq yozilgan qiymat ishlatilyapti).

---

## 🟢 Zulfiqor — Lead (P0, doimiy)

- [ ] Har kuni 18:00 da PR'larni merge qilish, konfliktlarni yechish.
- [ ] `main` doim yashil turishini kuzatish (build + test).
- [ ] Demo ssenariysi (25-avgust): QR'dan buyurtma → oshxona → ofitsiant → kassa → smena yopish → Telegram'ga hisobot.
- [ ] Telegram bot: kunlik hisobot avtomatik 23:00 da ketishini tekshirish.

---

## Merge'dan keyin qolgan quyruqlar (kim tegib ketsa — tuzatsin)

- `Dashboard.jsx` da `getReports()` o'chirildi (backendda `GET /reports` yo'q), `getDashboardStats()` ishlatilyapti.
- `EmployeesPage.jsx` ga Audit log tab'i qaytarildi — permission tekshiruvi bilan sinash kerak.
- `AttendanceTable` / `AuditLogPage` endi real API'da — bo'sh ma'lumotda ko'rinishini tekshirish kerak.
- Backend `transferTable` ga socket emit qo'shildi (stol ko'chirilganda real-time yangilanish).

</details>
