# RestoFlow — Vazifalar (15-sentabr 2026, 9-to'plam)

> **Kod bo'yicha tekshirilgan, notaga emas.**
> Frontend `origin/main` = `b09cbbf` — PR #9 merge bo'lgan (15-sentabr holati).
> CI va PR holatlari GitHub'dan ko'rilmadi (shu mashinada `gh` yo'q) — merge'dan oldin web'da tekshir.
> **Deadline: 17-sentabr darsi.** Shu kunga qadar HAMMA o'z taskini tugatadi, istisno yo'q.

Jamoa: Zulfiqor, Izzat, Abdurahmon, Ziyodilla, Fayoz, Madina, Abdugani.

---

## 📏 Yangi qoidalar — barcha uchun, hech kim istisno emas

1. **`main` ga to'g'ridan-to'g'ri push YO'Q.** Har qanday o'zgarish faqat PR orqali, CI yashil
   va review bilan kiritiladi. Front'da himoya bor — Backend'ga ham Abdurahmon shu to'plamda sozlaydi.
2. **Commit nomi faqat haqiqatda qilingan ishni aytadi.** Yarim tugagan ish `wip:` bilan yoziladi,
   lekin hech qachon tugallanmagan narsa `feat:` / `fix:` deb yozilmaydi. Bitta commit — bitta ish.

---

## ✅ 6-to'plamdan beri yopilgani

- **PR #9 main'ga merge bo'ldi** (`1f2bc25 fix: complete guest, feedback, and realtime integration`).
- **Check-in zanjiri ulandi:** `checkinReservation` (`src/features/reservations/api.js:16`),
  ReservationsPage'da «Mehmon keldi» tugmasi (`ReservationsPage.jsx:386`, faqat
  `admin|manager|waiter` uchun), uz/ru/en i18n kalitlari — hammasi main'da.
- **Landing sahifasi ishlaydi:** `/` endi public (`router.jsx:101`), `LandingPage` + `ClientsPage`
  backenddan restoranlarni oladi, API 404 bo'lsa fallback ko'rsatadi.
- **`EVENTS.md` haqiqiy eventlar bilan qayta yozildi** — `order:created` (alias `order:new`),
  `kitchen:new_order`, `order:item_updated` va qolganlari hujjatda koddaga mos.
- **QR orqali stol avtomatik tanlanadi:** `GuestMenuPage.jsx:46` URL'dan `table` param'ni o'qiydi.

---

# 👤 Zulfiqor — lockfile PR + check-in'ni to'liq sinash

<<<<<<< HEAD
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

- [x] **🔴 `src/features/landing/` yarat va `/` marshrutiga qo'y.** Login talab qilinmaydi.
      `router.jsx` da hozir `{ index: true, element: <RoleHomeRedirect /> }` — uni
      `PrivateRoute` ichida qoldirib, `/` ni public qil (`/guest` bilan bir xil darajada, 104-qator namuna).
      Tizimga kirgan xodim `/` ga tushsa — o'z paneliga yo'naltirilsin (hozirgi mantiq saqlansin).
- [x] **Ma'lumotni backenddan ol, hardcode qilma.** `GET /api/landing` va `GET /api/clients` —
      **ikkalasi ham tokensiz ochiq**, tayyor turibdi. Restoran nomi, tavsifi, telefon, manzil,
      ish vaqti, reyting, logo, hero rasm — hammasi shu javobda bor.
- [x] Sahifada bo'lishi kerak: restoran nomi + hero rasm, qisqa tavsif, ish vaqti va manzil,
      menyudan 6–8 ta namuna (`GET /products?limit=8&isAvailable=true` — ochiq),
      va katta **«Joy band qilish»** tugmasi → `/guest` ga olib boradi.
- [x] **Noldan yozma:** `features/qr-menu` dagi bron oqimi ishlaydi va backendga ulangan.
      Landing faqat unga kirish eshigi bo'lsin.
- [x] Matnlarni `t()` orqali yoz — i18n to'liq ishlaydi, uz/ru/en kalitlarini `locales/*/common.json` ga qo'sh.
- [x] Telefonda ochib ko'r — demo'da link telefondan ochiladi.

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

- [ ] **🔴 O'z branch'idan PR och, lockfile'ni main'dan bir-xil qil.**
      `main` CI hali qizil bo'lishi mumkin (eski `npm ci` muammosi). Ketma-ketlik:
      ```
      git fetch origin
      git checkout main && git reset --hard origin/main
      git checkout -b fix/lockfile-sync
      npm install          # npm ci emas
      git diff --stat      # faqat package-lock.json o'zgarganini tekshir
      git commit -m "fix(deps): sync package-lock.json with package.json"
      git push -u origin fix/lockfile-sync
      ```
      PR och, CI yashil bo'lgach merge qil. Bu — boshqalar PR'larining yashil turishi uchun poydevor.
- [ ] **Check-in'ni real zanjirda to'liq sinal.** Telefon bilan: bron yaratish → ofitsiant
      «Mehmon keldi» → buyurtma oshpazga tushishi → stol `occupied`. **`reservation.items` bo'sh**
      holatda ham check-in ishlashini tekshir (bo'sh buyurtma yaratilmasin, faqat stol band bo'lsin).
- [ ] `test/reservation.test.js` dagi check-in testlari yashil bo'lishini tasdiqla (PR ichida CI ko'radi).
- [ ] Yangi qoidani o'zingdan boshlab tur: merge qilishdan oldin CI yashil — aks holda kut.

# 👤 Abdurahmon — PR #10 merge → prod deploy → branch protection

- [ ] **🔴 PR #10 ni merge qil** — lekin faqat CI yashil bo'lgach (yangi qoida #1).
- [ ] **🔴 Prod deploy: URL + commit SHA'ni guruhga tashla.** Deploy'dan keyin aynan qaysi
      `main` commit'i (SHA) turganini yoz — «deploy qildim» degan xabar yolg'iz xabar bo'lib qolmasin.
      Muhit o'zgaruvchilarini tekshir: `VITE_API_URL` va `VITE_SOCKET_URL` — bularsiz socket
      ulanmaydi (`socket.js` `window.location.origin` ga tushadi).
- [ ] Backend CORS'ga Vercel domenini qo'sh — aks holda barcha so'rovlar CORS xatosi beradi.
- [ ] **`main` branch protection'ni yop:**
      - Front: `required_status_checks` ga CI'ni qo'sh (hozir bo'sh — qizil build ham merge bo'laveradi);
      - `enforce_admins` yoqish — adminlar ham qoidadan chetlab o'tmasin;
      - **Backend/main — hozir umuman himoyasiz**, Front'dagi sozlamani nusxala.
      Sozlagach skrinshot guruhga.

# 👤 Izzat — QR chop etish + URL to'g'irlash + telefon E2E

- [ ] **`TableQrModal.jsx` ga A4 chop etish rejimi.** Hozirgi `handlePrint` oddiy `window.print()` —
      butun modal qorong'u temada chiqib ketadi. Kerak: alohida chop etish layouti —
      stol raqami + QR + restoran nomi, oq fonda, A4'ga mos (@media print bilan).
- [ ] **QR manzilini to'g'rila:** `TableQrModal.jsx:6` hozir `/menu?table=...` yuboradi —
      lekin mehmon oqimi `/guest` da. `/guest?table=<id>` bo'lsin (sahifa param'ni o'qiydi, tayyor).
- [ ] `/guest` oqimini boshdan-oxir telefonda sinab chiq: QR skaner → zal → menyu → savat →
      tasdiqlash → muvaffaqiyat ekrani. 409 (stol band) holati ham ishlashi kerak.
- [ ] Zulfiqor lockfile PR'i merge bo'lgach o'z ishingni yangi branchda davom ettir (PR + CI).

# 👤 Madina — ovoz + obunalar tozalash + repetitsiya

- [ ] **Ovozli signalni haqiqiy buyurtmada sinab ko'r** (test tugmasida emas): real
      `kitchen:new_order` kelganda chalinishi. Brauzer avtoplay siyosati — birinchi klikdan
      keyin ishlashini tekshir, natijani yoz.
- [x] **`useKitchenOrders.js` dagi ortiqcha obunalar tozalandi** (11 → 7): `order:new`,
      `order:status_updated`, `order:itemUpdated`, `order:itemStatusChanged` olib tashlandi —
      EVENTS.md'da yo'q yoki alias. `order:created` + `kitchen:new_order` ikkisi qoldi
      (backend ikkalasini ham yuboradi), handler ID bo'yicha dedup qiladi — bir buyurtma
      uchun audio/unseenCount faqat bir marta.
- [x] Status/taom tugmasi xatosida rollback bor — kod tekshirildi, `statusMutation` va
      `itemReadyMutation` ikkalasida ham `onError` → `previousOrders` mavjud ekan. Qo'shish
      talab etilmadi.
- [ ] **17-sentabrga to'liq repetitsiya:** smena ochish → buyurtma → oshxona → tayyor → to'lov →
      chek → smena yopish → Z-Report. Buzilgan joylar ro'yxatini guruhga tashla.

# 👤 Abdugani — Landing'ni i18n va menyuga ulash

Landing ishlayapti ✅, lekin ikki narsa qoldi:

- [ ] **Matnlarni `t()` orqali chiqar.** `LandingPage.jsx` da `useTranslation` importi yo'q —
      butun sahifa hardcode o'zbekcha. Barcha matnlarni kalitlarga ko'chir, uz/ru/en
      `locales/*/common.json` ga qo'sh. Footer/hero/navbar ham.
- [ ] **Landing'da menyudan 6–8 ta namuna taom.** `GET /products?limit=8&isAvailable=true`
      (ochiq endpoint) — tanlangan restoran kartasi ostida yoki alohida bo'limda ko'rsat,
      «Joy band qilish» tugmasi `/guest` ga olib boring.
- [ ] Telefonda tekshir: landing → restoran kartasi → guest oqimi uzilishsiz o'tadi.

# 👤 Ziyodilla — avval branch, keyin kod (qayta)

`ziyod7778`, `ziyod1911`, `ziyod8888` branch'laring hali ham main'da yo'q — ya'ni hali birorta
ham merge bo'lmagan. Ketma-ketlik aynan shu, qisqartirish yo'q:

- [ ] **To'g'ri branch ol:**
      ```
      git remote -v            # origin restoFlow-1850/Front
      git fetch origin
      git checkout main
      git reset --hard origin/main
      git checkout -b feature/ziyod-waiter
      ```
      ZIP ko'chirish, yangi papkada `git init` — **yo'q**.
- [ ] `git log --oneline -5` natijasini guruhga tashla. Yuqorida `b09cbbf Merge pull request #9...`
      ko'rinishi kerak. Ko'rinmasa — to'xta, Zulfiqorga yoz.
- [ ] Ish: ofitsiant panelida buyurtma yuborilgach stol darhol `occupied` bo'lishini ko'z bilan
      tekshir (Madina bilan birga), keyin o'z branch'ingdan **PR och** (yangi qoida #1).
- [ ] Git muallifligini tuzat: `git config --global user.name "Ziyodilla"` va haqiqiy emailing.

# 👤 Fayoz — qaytsang, shu ikki ish

- [ ] Guruhga yoz: qaysi kunlar ishlay olasan — 17-sentabrdan keyingi taqsimot shunga qarab tuziladi.
- [ ] `SettingsPage.module.css` (680+ qator CSS module) — loyiha qolgan qismi Tailwind'da.
      Tailwind'ga ko'chir, CSS faylni o'chir. O'z branch'ingdan PR orqali.

---

## Ishlash tartibi (17-sentabrgacha)

1. **Branch faqat `origin/main` dan ochiladi**, hech qachon eski local nusxadan emas.
2. **Har ish — PR.** Push → PR och → CI yashil → review → merge. To'g'ridan push yo'q (qoida #1).
3. PR ochishdan oldin: `npm run build` (frontend), backend testlar yashil.
4. **Commit nomi = haqiqat** (qoida #2). Review'da commit nomi ishga mos emasa — qaytariladi.
5. Yangi endpoint/event bo'lsa — `EVENTS.md` o'sha PR ichida yangilanadi.

## 17-sentabr darsi tartibi

| # | Qadam | Kim |
|---|---|---|
| 1 | Prod link ochiladi, landing ko'rinadi (URL + SHA guruhda) | Abdurahmon + Abdugani |
| 2 | QR skaner → mehmon menyu tanlaydi | Izzat |
| 3 | Ofitsiant «Mehmon keldi» → buyurtma oshpazga tushadi | Zulfiqor + Izzat |
| 4 | Oshpaz ekranida ticket + izoh + ovozli signal | Madina |
| 5 | Kassir to'lov, chek, smena yopish, Z-Report | Madina |

**16-sentabr soat 18:00 da har kim guruhga bir qator holat yozadi** — nima tayyor, nima qoldi.

---
---

<details>
<summary>Eski to'plamlar</summary>

3-to'plam (22-avgust), 5-to'plam (3-sentabr), 6-to'plam (5-sentabr) — shu faylning git tarixida.
Vazifalar doim shu faylda turadi, repodan o'chirilmaydi.

</details>
