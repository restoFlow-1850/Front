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
