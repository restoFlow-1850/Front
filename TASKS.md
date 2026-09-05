# RestoFlow — Vazifalar (5-sentabr 2026, 6-to'plam)

> **Kod bo'yicha tekshirilgan, notaga emas.**
> frontend `origin/main` = `03a42b7` · backend `origin/main` = `b1ac0a8` (5-sent, 15:40 holati).
> **Demo ertaga — 6-sentabr.** Bu ro'yxat faqat demo zanjirini yopadigan ishlardan iborat.

Jamoa: Zulfiqor, Izzat, Abdurahmon, Ziyodilla, Fayoz, Madina, Abdugani.

---

## ✅ 3-sentabrdan beri yopilgani — juda yaxshi ish bo'ldi

Oldingi to'plamdagi **uchala P0 ham** yopildi:

- **429 xatosi ketdi.** `rateLimiter.middleware.js` endi GET (500/15daq) va yozish (300/15daq) uchun
  alohida limit beradi, kalit IP emas — **token'dagi user ID** (`keyGenerator`). Bitta odamning
  polling'i boshqasini bloklamaydi. `authLimiter` 10/15daq bo'lib qoldi — to'g'ri.
- **Oshpazga buyurtma tushadigan bo'ldi.** `socket.js` da `transports: ['websocket', 'polling']`,
  cheksiz reconnect. Backend `emitToRoles(['cook'], 'kitchen:new_order')` — endi event faqat
  oshpazlar xonasiga boradi, mijoz brauzeriga emas. Dublikat emitlar ham tozalandi (`0518b93`).
- **Har taomga izoh ishlaydi.** `OrderItem.note` (maxlength 200) → `WaiterPage` savatida har qatorga
  input → `OrderTicket.jsx:114` oshpaz ekranida ko'rsatadi. `normalizeKitchenOrder` uchun test ham bor.

Bundan tashqari: i18n **to'liq** (uz/ru/en, 356 kalit, 27 faylda `useTranslation`) · `'free'` statusi
va ziddiyatli `constants/tableStatus.js` butunlay yo'q qilindi · bildirishnomalar API'ga ulandi ·
Dashboard bundle <500kB · kassa 5-bosqichli oqim + chek chop etish · `vercel.json` · 44 stol ·
bron qilinganda stol `reserved` bo'ladi, bekor qilinsa `available` ga qaytadi · backend CI merge qilindi (PR #1).

---

## 🔴 Demo zanjiri qayerda uzilgan — bitta joyda

Demo ssenariysi: **mijoz QR bilan joy band qiladi va taom tanlaydi → oshpaz ko'radi → ofitsiant olib boradi → kassir yopadi.**

Birinchi bo'g'in uzilgan, sabab aniq topildi:

`/guest` sahifasi (`GuestMenuPage.jsx:145`) mehmon tanlagan taomlarni `POST /reservations` ga
`items: [{ product, quantity }]` ko'rinishida yuboradi. Backend ularni qabul qiladi
(`reservation.validation.js:16`) va `Reservation.items` ga **saqlaydi** — shu yerda tugaydi.

`reservation.service.js` hech qachon `Order` yaratmaydi va `kitchen:new_order` yubormaydi.
`POST /orders` esa `req.user.id` talab qiladi — ya'ni mehmon o'zi buyurtma yarata olmaydi.

**Natija: mehmon taom tanlaydi, lekin oshpaz uni hech qachon ko'rmaydi.** Demo shu yerda to'xtaydi.

Ikkinchi bloker: **public landing sahifasi hali ham 0 fayl** — `/` marshruti login'ga yo'naltiradi
(`router.jsx:112`), ya'ni demo uchun ochiladigan public link yo'q.

---

## 🔴 `main` hozir qizil — CI 3-sentabrdan beri yiqilyapti

`Front` repo `main` bo'yicha oxirgi **uchala** CI run ham `failure`. Sabab bitta va aniq:

```
npm error `npm ci` can only install packages when package.json and package-lock.json are in sync
npm error Missing: @emnapi/core@1.11.3 from lock file
npm error Missing: @emnapi/runtime@1.11.3 from lock file
```

`package-lock.json` `package.json` bilan mos emas. Kulgilisi shuki, buni buzgan commit aynan
`934818c fix(deps): ... clean up lockfile` bo'lgan. Tuzatish: `npm install` (`npm ci` emas) —
yangilangan `package-lock.json` ni commit qil.

**Bu shunchaki qizil belgi emas:** `Front/main` himoyalangan va PR + 1 ta review talab qiladi.
CI qizil turganda ishonch bilan merge qilib bo'lmaydi — ertaga demo kuni hamma shu yerda tiqiladi.

---

# 👤 Zulfiqor — bron → buyurtma ko'prigi (P0, backend)

Bu demo'ning eng muhim ishi. Boshqa hamma narsa shunga bog'liq.

- [ ] **🔴 Mehmon kelganda broni buyurtmaga aylansin.** Yangi endpoint:
      `POST /reservations/:id/checkin` (`verifyToken`, rol: `waiter|admin|manager`).
      Ichida:
  - `reservation.items` bo'yicha `orderService.create()` chaqir (mavjud funksiya, qayta yozma) —
    shunda `kitchen:new_order` **avtomatik** ketadi va oshpaz ekranida chiqadi;
  - stol `reserved` → `occupied`;
  - bron statusi → `completed` (yoki yangi `seated` — enum'ga qo'shsang `reservation.validation.js:20` ni ham yangila);
  - javobda yaratilgan `order` ni qaytar, ofitsiant darhol uni ochsin.
- [ ] `reservation.items` bo'sh bo'lsa ham check-in ishlasin — bo'sh buyurtma yaratma,
      faqat stolni `occupied` qil. Aks holda demo'da xato chiqadi.
- [ ] **Test yoz** — `test/reservation.test.js` ga: check-in qilingandan keyin `Order` paydo bo'ldimi,
      stol `occupied` bo'ldimi, `kitchen:new_order` chiqdimi (`test/socket_events.test.js` da namuna bor).
- [ ] `fix/remove-duplicate-socket-emissions` branch'i hali merge qilinmagan (+1 commit) — yop.
- [ ] **`EVENTS.md` hamon yolg'on gapiryapti.** Hujjatda `order:new`, `order:ready`,
      `order:statusChanged` bor — backend bularni **yubormaydi**. Aksincha, backend yuboradigan
      `order:item_updated`, `order:status_updated`, `table:waiter_called` hujjatda yo'q.
      Shuning uchun `useKitchenOrders.js:104-113` bitta hodisaning **uchta nomiga** obuna bo'lib turibdi.
      Hujjatni koddagi haqiqiy 8 ta eventga moslashtir, keyin frontenddagi ortiqcha obunalarni Madina o'chiradi.

---

# 👤 Abdugani — Public landing sahifasi (P0, frontend)

Fayoz 16 kundan beri jim, demo esa ertaga — shuning uchun landing senga o'tdi.
Stollar bo'yicha ishing tugadi (`Abdugani` branch main'ga kirgan), demak vaqting bor.

- [ ] **🔴 `src/features/landing/` yarat va `/` marshrutiga qo'y.** Login talab qilinmaydi.
      `router.jsx` da hozir `{ index: true, element: <RoleHomeRedirect /> }` — uni
      `PrivateRoute` ichida qoldirib, `/` ni public qil (`/guest` bilan bir xil darajada, 104-qator namuna).
      Tizimga kirgan xodim `/` ga tushsa — o'z paneliga yo'naltirilsin (hozirgi mantiq saqlansin).
- [ ] **Ma'lumotni backenddan ol, hardcode qilma.** `GET /api/landing` va `GET /api/clients` —
      **ikkalasi ham tokensiz ochiq**, tayyor turibdi. Restoran nomi, tavsifi, telefon, manzil,
      ish vaqti, reyting, logo, hero rasm — hammasi shu javobda bor.
- [ ] Sahifada bo'lishi kerak: restoran nomi + hero rasm, qisqa tavsif, ish vaqti va manzil,
      menyudan 6–8 ta namuna (`GET /products?limit=8&isAvailable=true` — ochiq),
      va katta **«Joy band qilish»** tugmasi → `/guest` ga olib boradi.
- [ ] **Noldan yozma:** `features/qr-menu` dagi bron oqimi ishlaydi va backendga ulangan.
      Landing faqat unga kirish eshigi bo'lsin.
- [ ] Matnlarni `t()` orqali yoz — i18n to'liq ishlaydi, uz/ru/en kalitlarini `locales/*/common.json` ga qo'sh.
- [ ] Telefonda ochib ko'r — demo'da link telefondan ochiladi.

---

# 👤 Izzat — QR mehmon oqimi uchdan-uchgacha (P0)

13 kundan beri commit yo'q. Bu ish kichik, lekin demo aynan shundan boshlanadi.

- [ ] **Zulfiqor check-in endpoint'ini qo'shgach**, ofitsiant panelida «Mehmon keldi» tugmasini qo'y:
      bron ro'yxatidan bronni tanlaydi → tugma → `POST /reservations/:id/checkin` →
      buyurtma yaratiladi va oshpazga tushadi. Bu — uzilgan bo'g'inning frontend tomoni.
- [ ] **`/guest` oqimini boshdan-oxir o'zing sinab ko'r** telefonda: zal → menyu → tasdiqlash → muvaffaqiyat.
      Har bosqichda xato chiqsa yoz, tuzat. 409 (stol band) holati ham ishlashi kerak.
- [ ] **Stol uchun QR chop etish.** `TableQrModal.jsx` mavjud — unga A4 chop etish rejimini qo'sh
      (stol raqami + QR + restoran nomi). Demo'da bitta stolning QR'ini qog'ozga chiqarib qo'yamiz.
- [ ] QR manzili `/guest?table=<id>` bo'lsin va sahifa ochilganda o'sha stol avtomatik tanlangan bo'lsin —
      hozir mehmon zal xaritasidan qo'lda tanlaydi, QR'dan kirganda bu ortiqcha qadam.

---

# 👤 Abdurahmon — Deploy (P0) + test qamrovi

`vercel.json` main'da ✅, backend CI merge bo'ldi ✅. Endi eng muhimi — **haqiqiy public link**.

- [ ] **🔴 ENG BIRINCHI: `main` ni yashil qil.** `npm install` → yangilangan `package-lock.json` ni commit qil.
      CI 3-sentabrdan beri qizil. Buni tuzatmaguningcha qolgan hamma ish tiqilib turadi.
- [ ] **🔴 Frontendni Vercel'ga chinakam deploy qil.** Konfig fayl bor, lekin sayt hali yo'q.
      Muhit o'zgaruvchilari shart: `VITE_API_URL` va `VITE_SOCKET_URL` → Railway backend manzili.
      `socket.js:6-10` bularsiz `window.location.origin` ga tushadi va socket ulanmaydi.
- [ ] Deploy bo'lgach **backend CORS'iga Vercel domenini qo'sh** (Zulfiqor `5ea5940` da
      `credentials` ni yoqdi) — aks holda hamma so'rov CORS xatosi beradi.
- [ ] Public link'ni guruhga tashla va **telefondan ochib** login → buyurtma → oshxona zanjirini sinab ko'r.
- [ ] **Frontend testlari — 19 ga qarshi 1.** Backendda 19 ta test fayli bor, frontendda bitta
      (`normalizeKitchenOrder.test.js`). CI ishlayapti, lekin deyarli hech narsani tekshirmayapti.
      Kamida 4 ta qo'sh: savat hisob-kitobi (`WaiterPage` narx/miqdor), `qr-menu/lib/time.js` (UTC+5),
      stol statusi ranglari, i18n — uz/ru/en da bir xil kalitlar borligini tekshiradigan test.
- [ ] **Himoya sozlamalarini tugat.** `Front/main` da PR + 1 review bor ✅, lekin:
  - **CI talab qilinmaydi** (`required_status_checks` bo'sh) — qizil build ham merge bo'laveradi, shuni yoq;
  - `enforce_admins` o'chiq — adminlar qoidani chetlab o'tadi;
  - **`Backend/main` da himoya umuman yo'q** — har qanday a'zo to'g'ridan-to'g'ri push qila oladi.
    Front'dagi sozlamani Backend'ga ham nusxala.

---

# 👤 Madina — Demo repetitsiyasi + oshxona tozalash

Kassa va Dashboard ishing main'da ✅ (5-bosqichli oqim, chek, bundle 2.1MB → <500kB, theme).

- [ ] **🔴 Ertangi demo'ni bugun boshdan-oxir repetitsiya qil** va nima buzilganini yoz:
      smena ochish → buyurtma → oshxona → tayyor → to'lov → chek → smena yopish → Z-Report.
      Sen bu zanjirning oxirini yozgansan, shuning uchun tekshirish ham senda.
- [ ] **Ovozli signalni haqiqiy buyurtmada tasdiqla.** `utils/audioAlert.js` da «Ovozni tekshirish»
      tugmasi bor, lekin real `kitchen:new_order` kelganda chalinishi hali sinalmagan.
      Brauzer avtoplay siyosati sababli birinchi klikdan keyingina ishlashi mumkin — shuni tekshir.
- [ ] Zulfiqor `EVENTS.md` ni tuzatgach, `useKitchenOrders.js:104-113` dagi **ortiqcha obunalarni o'chir**.
      Hozir bitta hodisa uch xil nom bilan tinglanadi (`order:new` / `order:created` / `kitchen:new_order`) —
      backend faqat oxirgi ikkitasini yuboradi, birinchisi umuman yo'q.
- [ ] Status tugmasi bosilganda xato bo'lsa optimistik yangilanish orqaga qaytmaydi — `onError` da rollback qo'sh.

---

# 👤 Ziyodilla — 🔴 Avval branch, keyin kod

Bugun soat 15:01 da `ziyod7778` branch'ini push qilding. Uni **merge qilib bo'lmaydi**, sababi ikkita:

1. Branch **tarixsiz** — `main` bilan umumiy ajdodi yo'q (`git merge-base` bo'sh). Bu sening
   ketma-ket **oltinchi** shunday branching (`ziyodulla`, `ziyodkitchen`, `ziyod1911`, `ziyod8888`, `ziyod9999`, `ziyod7778`).
2. Muhimrog'i: bu branch loyihani **orqaga qaytaradi**. `main` bilan solishtirganda
   **11 907 qator o'chadi**, 6 943 qator qo'shiladi. Yo'qoladiganlar orasida: i18n tarjimalari
   (`locales/uz|ru|en/common.json` — har birida ~457 qator), `exportUtils.js`, `sound.js`,
   va qaytib keladiganlar orasida Abdurahmon o'chirgan **o'lik `src/store/` Redux qatlami**.
   Ya'ni sen eski nusxa ustida ishlagansan.

Ochig'ini aytaman, chunki bu muhim: **bugungi kunga qadar `main` da sening birorta ham qatoring yo'q.**
Ikkala repoda ham. Yozgan kodlaring bor, lekin hech qachon loyihaga qo'shilmagan — har safar branch
noto'g'ri bo'lgani uchun. Muammo qobiliyatda emas, faqat shu bitta odatda.

Bugun faqat shu ikki ishni qil, kod yozma:

- [ ] **To'g'ri branch ol** — aynan shu ketma-ketlikda:
      ```
      cd ~/Desktop/lessons/RestoFlow/Frontend
      git remote -v            # origin restoFlow-1850/Front ekanini tekshir
      git fetch origin
      git checkout main
      git reset --hard origin/main
      git checkout -b feature/ziyod-waiter
      ```
      Papkani ZIP qilib ko'chirish, yangi papkada `git init` qilish — **yo'q**. Faqat shu buyruqlar.
- [ ] Yangi branchda `git log --oneline -5` qil va natijani guruhga tashla. Yuqorida
      `03a42b7 docs: move TASKS.md...` ko'rinishi kerak. Ko'rinmasa — to'xta, Zulfiqorga yoz.
- [ ] Shundan keyingina ish: ofitsiant panelida buyurtma yuborilgach stol darhol `occupied`
      bo'lishini va oshxonaga tushishini ko'z bilan tekshir (Madina bilan birga).
- [ ] Git sozlamang hamon standart: muallif `Sizning Ismingiz <sizning-emailingiz@example.com>`.
      Tuzat: `git config --global user.name "Ziyodilla"` va `git config --global user.email "<pochtang>"`.

---

# 👤 Fayoz — 16 kun jim (20-avgustdan beri commit yo'q)

Landing vazifasi Abduganiga o'tkazildi — demo ertaga, kutib bo'lmadi.
Qaytsang, senda quyidagi ish qoladi:

- [ ] Guruhga yozib qo'y: qaysi kunlar ishlay olasan. Vazifa taqsimoti shunga qarab tuziladi.
- [ ] `features/settings/SettingsPage.module.css` — 569 qator CSS module, loyihaning qolgan qismi
      butunlay Tailwind'da. Tailwind'ga ko'chir, CSS faylni o'chir.
- [ ] Landing chiqqach, Abdugani bilan birga uning menyu bo'limini to'ldirasan.

---

## Ishlash tartibi

1. **Branch faqat `origin/main` dan ochiladi.** Bugun `main` ga to'g'ridan-to'g'ri commit tushdi,
   bitta tarixsiz branch push qilindi — ikkalasi ham vaqt yo'qotadi.
2. Kod yozishdan oldin guruhga bir qator: «men falon papkani olaman».
3. **PR oching.** Loyiha boshidan beri jami 8 ta PR ochilgan, shundan 6 tasi Abdurahmonniki.
   Qolganlar branch push qilib qo'yadi, Zulfiqor esa ularni qo'lda merge qiladi — shuning uchun
   uning nomida 122 ta commit turibdi va hech kimning kodi ko'rib chiqilmaydi.
4. PR ochishdan oldin: frontend `npm run build`, backend `npm test` (105 test yashil bo'lishi shart).
5. Yangi endpoint yoki socket eventi yozsang — `EVENTS.md` / Swagger'ni **o'sha PR ichida** yangila.

## Ertangi demo tartibi (6-sentabr)

| # | Qadam | Kim tayyorlaydi |
|---|---|---|
| 1 | Public link ochiladi, restoran ko'rinadi | Abdugani + Abdurahmon |
| 2 | Mehmon QR'dan kiradi, stol tanlaydi, taom tanlaydi | Izzat |
| 3 | Ofitsiant «Mehmon keldi» bosadi → buyurtma oshpazga tushadi | Zulfiqor + Izzat |
| 4 | Oshpaz ekranida buyurtma + har taom izohi, ovozli signal | Madina |
| 5 | Kassir to'lov, chek, smena yopish, Z-Report | Madina |

**Bugun soat 18:00 da har kim guruhga bir qator holat yozadi.**

---
---

<details>
<summary>Eski to'plamlar</summary>

3-to'plam (22-avgust) va undan oldingilar shu faylning git tarixida.
5-to'plam (3-sentabr) hech qachon commit qilinmagan edi — Zulfiqor `03a42b7` da `TASKS.md` ni
repodan o'chirib, Behruzning shaxsiy Obsidian vault'iga ko'chirgan. Vault jamoaga ochiq emas,
shuning uchun bu fayl repoga qaytarildi. Vazifalar shu yerda turadi.

</details>
