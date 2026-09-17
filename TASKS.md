# RestoFlow — Vazifalar (17-sentabr 2026, 10-to'plam)

> **Kod bo'yicha tekshirilgan, notaga emas.**
> frontend `origin/main` = `2f56671` · backend `origin/main` = `ca276b9` (17-sent, 16:00 holati).
> PR, CI va deploy holati GitHub'dan (`gh`) o'qildi.
> **Deadline: 19-sentabr (shanba) darsi.**

Jamoa: Zulfiqor, Izzat, Abdurahmon, Ziyodilla, Fayoz, Madina, Abdugani, Behruz H.

---

## 🎯 Bu to'plamning bitta maqsadi

**Yangi funksiya YO'Q.** Yozilgan ishlar branch'larda turibdi, `main` ga yetib bormayapti.
10-to'plam = bor ishni `main` ga yashil CI bilan kiritish va prod'da tekshirish.

Hozirgi holat:

- 🔴 **Front `main` CI 12-sentabrdan beri qizil** — 4 ta ketma-ket failure. Sabab:
  `package-lock.json` da `@rolldown/binding-linux-x64-gnu` paketi yo'q
  (`Cannot find native binding`). To'g'ri lockfile **faqat PR #10 da bor** — u 5 kundan beri ochiq
  va endi `main` bilan `package-lock.json` da konflikt beryapti.
- 🔴 `.gitignore` da `<<<<<<<` / `>>>>>>>` belgilari hali ham `main` da (13, 26, 38, 44-qatorlar).
  Tuzatish `d64aedc` da bor, lekin u PR #13 ichida — merge bo'lmagan.
- 🔴 **Qoida #1 buzildi:** PR #11 va #12 qizil CI bilan merge qilindi; Backend'ga 16-sentabrda
  6 ta commit PR'siz to'g'ridan `main` ga tushdi.
- 🟡 Tayyor, lekin PR ochilmagan branch'lar: `feature/madina-kitchen-socket-sync`,
  `feature/madina-zreport-summary`, `feature/abdugani-guest-qr-flow`,
  backend `feature/zulfiqor-payment-concurrency-tests`.
- 🟢 Backend `main` CI yashil. Vercel production deploy ishlayapti (16-sent, `2f56671`).

## 📏 Qoidalar — o'zgarmadi, endi istisnosiz

1. **`main` ga faqat PR + yashil CI orqali.** Qizil CI bilan merge — yo'q. O'z PR'ingni o'zing
   merge qilsang ham, avval CI yashil bo'lsin. Backend'ga ham tegishli (GitHub Free'da private
   repo uchun branch protection yo'q — shuning uchun bu qoida faqat bizning intizomimizda turadi).
2. **Commit nomi = haqiqatda qilingan ish.**
3. **Yozilgan ish PR'siz 24 soatdan ortiq turmaydi.** Branch'ga push qildingmi — o'sha kuni PR och.

## ✅ 9-to'plamdan beri qilingani

- **Madina** — o'z taskini bajardi: Z-Report jamlanma jadval + feedback tugmasi scope (`40e579f`),
  oshxona socket obunalari 11 → 7, ID bo'yicha dedup (`07efb6c`). Faqat PR ochilmagan.
- **Abdugani** — QR manzili `/guest` ga o'tdi + A4 chop etish shabloni (`8c6d4f1`), React key
  ogohlantirishlari tuzatildi (`c76063d`). Faqat PR ochilmagan.
- **Zulfiqor** — multi-restoran public API + Swagger, root (superadmin) panel back+front, xodim
  parolini reset qilish, stollarni zona+raqam bo'yicha saralash, «2 marta to'lov = 1 to'lov» testi
  (branch'da), `.gitignore` tozalash (PR #13 da).
- **Abdurahmon** — PR #10: CI'da lint qadami + to'g'ri lockfile, CI yashil.

---

## Merge navbati — tartib muhim

```
1. PR #10 (Abdurahmon)  → main yashil bo'ladi
2. PR #13 (Zulfiqor)    → .gitignore toza, root panel
3. Madina ×2, Abdugani  → har biri main'ni ichiga olib, CI yashil bo'lgach
4. Hamma prod'da telefon bilan tekshiradi
```

1-qadam bo'lmaguncha qolgan hech kim yashil CI ololmaydi. **Abdurahmon — hamma seni kutyapti.**

---

# 👤 Abdurahmon — PR #10 ni bugun yop (hammani bloklayapti)

- [ ] **🔴 PR #10 ni `main` bilan moslashtir.** Hozir `package-lock.json` da konflikt:
      ```
      git fetch origin
      git checkout feature/abdurahmon-ci-lint
      git merge origin/main
      # konflikt package-lock.json da chiqadi:
      git checkout origin/main -- package.json
      rm -rf node_modules package-lock.json
      npm install                 # npm ci EMAS
      grep -c "binding-linux-x64-gnu" package-lock.json   # 2 dan KATTA bo'lishi shart
      npm run build && npm run lint
      git add package-lock.json && git commit
      git push
      ```
      `node_modules` ni o'chirmasdan `npm install` qilsang — lockfile'ga faqat o'z OS'ingning
      binding'i tushadi va CI yana yiqiladi (npm bug #4828). Shuning uchun ikkalasini ham o'chir.
- [ ] CI yashil bo'lgach guruhga yoz, Zulfiqor yoki Behruz review qiladi → merge.
- [ ] **Front `main` protection:** `required_status_checks` ga `build-and-test` ni qo'sh
      (hozir ro'yxat bo'sh), `enforce_admins` ni yoq. Skrinshot guruhga.
- [ ] **Prod URL.** Vercel production deploy bor, lekin guruhda doimiy manzil yo'q
      (`front-co1133oys-mars7.vercel.app` — bitta deploy'ning manzili, har deploy'da o'zgaradi).
      Doimiy production domenini + turgan commit SHA'ni guruhga tashla.
      Inkognito telefonda tekshir: login ishlaydi, socket ulanadi (`VITE_API_URL`,
      `VITE_SOCKET_URL`, backend CORS'da shu domen).

# 👤 Zulfiqor — PR #13 yashil + backend'da ham PR tartibi

- [ ] **PR #13:** PR #10 merge bo'lgach `git merge origin/main`, lockfile'ni main'dan ol
      (`git checkout origin/main -- package-lock.json`), CI yashil → merge. Hozir PR #13 da
      `build-and-test: FAILURE` — shu holatda merge qilma.
- [ ] **Backend `feature/zulfiqor-payment-concurrency-tests`** (`4c36bde`) — main'da YO'Q.
      PR och, CI yashil, merge. Bu 8-to'plamdan beri kutilayotgan test.
- [ ] **Backend'ga to'g'ridan push to'xtaydi.** Har ish — branch → PR → CI yashil → merge.
      Bir o'zing ishlayotgan bo'lsang ham: PR — boshqalar nima o'zgarganini ko'radigan yagona joy.
- [ ] **Root panel review'dan o'tmagan** — platformadagi eng katta huquq PR'siz kirdi.
      Behruz bilan birga ko'rib chiqamiz: `root.routes.js`, `rootAuth.middleware.js`, `root.service.js`.
      Undan oldin: Railway'da **alohida `JWT_ROOT_SECRET`** qo'y (hozir yo'q bo'lsa refresh
      secret'dan derivatsiya bo'ladi — prod uchun alohida bo'lsin). URL'ni `/sap` ga yashirish
      himoya emas — himoya token + rate limit + rol tekshiruvida.
- [ ] Boshqalarning branch'larini o'z `Zulfiqor` branch'ingga merge qilma — har kim o'z PR'ini ochadi.

# 👤 Madina — 2 ta PR och (ish tayyor, faqat kiritish qoldi)

- [ ] PR #10 merge bo'lgach har ikki branch'da `git merge origin/main`, CI yashil bo'lsin:
      - `feature/madina-kitchen-socket-sync` → PR
      - `feature/madina-zreport-summary` → PR
- [ ] Z-Report PR tavsifiga **haqiqiy sinov jadvalini** yoz: bitta smenada 3 ta to'lov qil,
      keyin ustunlar — taomlar summasi | xizmat haqi | to'langan | chekdagi | Z-Report'dagi. Raqamlar mos bo'lsin.
- [ ] `40e579f` da `GuestMenuPage.jsx` ham o'zgargan (20 qator) — bu Abdugani zonasi.
      PR tavsifida nima uchun tekkaningni yoz, Abdugani bilan konflikt chiqmasligini kelish.
- [ ] Prod'da to'liq repetitsiya: smena ochish → buyurtma → oshxona (ovoz chalindi?) → to'lov →
      chek → smena yopish → Z-Report. Buzilgan joylar ro'yxati guruhga.

# 👤 Abdugani — QR PR + o'z landing taski

- [ ] `feature/abdugani-guest-qr-flow` → PR #10 dan keyin `git merge origin/main`, CI yashil, **PR och**.
      main'da hali `TableQrModal.jsx:6` → `/menu?table=` turibdi, ya'ni QR'lar noto'g'ri sahifaga olib boradi.
- [ ] **9-to'plamdagi o'z tasking qolgan:** `LandingPage.jsx` da `useTranslation` yo'q — sahifa
      to'liq hardcode. Matnlarni `t()` ga ko'chir, uz/ru/en `locales/*/common.json` ga kalitlar.
- [ ] Landing'da 6–8 ta namuna taom: `GET /products?limit=8&isAvailable=true`, «Joy band qilish» → `/guest`.
- [ ] Eski branch'larni o'chir: `Abdugani`, `abdugani`, `abdugani-tables-waiter`, `master`
      (avval ichida kerakli narsa qolmaganini tekshir).

# 👤 Ziyodilla — 16-sentabrdagi branch yana tarixsiz

`origin/Ziyodilla` ning `main` bilan **umumiy commit'i yo'q** («Initial commit», 204 fayl qaytadan
qo'shilgan) — ya'ni yana yangi papkada `git init` qilingan. Bu 7-marta. Bunday branch hech qachon
merge bo'lmaydi. Haqiqiy ishing kichik va foydali: `RestaurantMapCard.jsx` (6 qator) va
`AppLayout.jsx` (5 qator) — shuni to'g'ri yo'l bilan kiritamiz:

- [ ] ```
      git config --global user.name "Ziyodilla"
      git config --global user.email "<haqiqiy emailing>"
      cd ~/Desktop            # YANGI joy, eski papkaga tegma
      git clone https://github.com/restoFlow-1850/Front.git restoflow-front
      cd restoflow-front
      git log --oneline -3    # natijani guruhga tashla
      git checkout -b feature/ziyodilla-map-card
      ```
- [ ] Eski papkangdan **faqat shu 2 faylning o'zgargan qatorlarini** yangi papkaga qo'lda ko'chir.
      `git status` da faqat 2 ta fayl ko'rinishi kerak. Ko'p fayl ko'rinsa — to'xta, guruhga yoz.
- [ ] `git add` → `git commit -m "fix(dashboard): ..."` → `git push -u origin feature/ziyodilla-map-card` → PR och.
- [ ] 7 ta o'lik branch'ni o'chir: `Ziyodilla ziyod1911 ziyod7778 ziyod8888 ziyod9999 ziyodkitchen ziyodulla`
      (`git push origin --delete <nom>`).
- [ ] Qiynalsang — darsda Behruz bilan birga 10 daqiqada qilamiz. Lekin `git config` va `git clone` ni darsgacha o'zing qil.

# 👤 Izzat — oxirgi imkoniyat

1-sentabrdan beri git'da **0 ta commit**. QR taskingni (URL + A4 chop etish) Abdugani yopdi.

- [ ] Abdugani PR'i merge bo'lgach prod'da telefon bilan: QR chop et → skanerla → `/guest` → stol
      avtomatik tanlandi → menyu → savat → tasdiqlash. **Ekran yozuvi (video) guruhga.**
- [ ] 409 (stol band) holatini sinab ko'r — xato xabari tushunarlimi.
- [ ] Topilgan har bir xato — GitHub Issue (qadamlar + skrinshot).
- [ ] 19-sentabrgacha video ham, issue ham bo'lmasa — jamoadagi o'rning haqida alohida gaplashamiz.

# 👤 Fayoz — CI himoyasi + Settings

`.gitignore` ni Zulfiqor tozaladi (PR #13). Senga qolgani:

- [ ] **CI'ga konflikt belgisi tekshiruvi** — `.github/workflows/ci.yml` ga `npm ci` dan oldin:
      ```yaml
      - name: Check for merge conflict markers
        run: |
          if git grep -nE '^(<<<<<<<|>>>>>>>)( |$)' -- . ':!package-lock.json'; then
            echo "Konflikt belgilari topildi"; exit 1
          fi
      ```
      PR #13 merge bo'lgandan keyin och (undan oldin `.gitignore` sabab o'zi yiqiladi).
- [ ] `SettingsPage.module.css` (680+ qator) → Tailwind, CSS faylni o'chir. Alohida PR.
- [ ] Guruhga yoz: qaysi kunlari ishlay olasan.

# 👤 Behruz H. — mobil QA (3-marta)

GitHub Issues'da hozir **0 ta** yozuv.

- [ ] Prod'ni telefonda (yoki DevTools 360px va 390px) och: landing, `/guest`, login, ofitsiant,
      oshxona, kassa. Kesilgan tugma, ekrandan chiqib ketgan modal, gorizontal scroll — har biri
      alohida Issue: sahifa + kenglik + skrinshot. Kamida 5 ta.

---

## Hisobot

**18-sentabr (juma) 20:00 gacha** har kim guruhga bir qator:

```
Ism | PR havolasi | nima qilindi | dalil (CI yashil / skrinshot / video) | bloklovchi
```

## 19-sentabr darsi tartibi

| # | Qadam | Kim |
|---|---|---|
| 1 | `main` CI yashil, prod URL + SHA guruhda | Abdurahmon |
| 2 | QR skaner → `/guest` → buyurtma | Abdugani + Izzat |
| 3 | «Mehmon keldi» → oshxonada ticket + ovoz | Zulfiqor + Madina |
| 4 | To'lov → chek → Z-Report summalari mos | Madina |
| 5 | Root panel review | Zulfiqor + Behruz |
| 6 | Ziyodilla'ning birinchi toza PR'i | Ziyodilla |

Oldingi to'plamlar — shu faylning git tarixida. Vazifalar doim shu faylda turadi.
