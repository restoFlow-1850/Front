# MVP tekshiruv ro'yxati (prod)

Har **release'dan keyin** prod'da (`https://restoflow.uz`), **telefonda** (360–390px kenglik) to'liq o'tkaziladi.
Natija 20:00 dagi «✅ Hisobotlar» ga yoziladi. Har ❌ — alohida GitHub Issue (pastdagi shablon bilan).

> Maqsad: 15-oktabr demosidagi ssenariy **bitta ham uzilishsiz** o'tishi.

## 0. Tayyorgarlik

| # | Qadam | Kutilgan natija | ✅/❌ |
|---|---|---|---|
| 0.1 | `https://api.restoflow.uz/api/health` ni oching | `status: healthy`, `commit` = `main` dagi oxirgi commit (GitHub → Backend → Commits) | |
| 0.2 | Front footer'dagi versiya | Front `main` dagi oxirgi commit bilan bir xil | |
| 0.3 | Telefon: Chrome (Android) yoki Safari (iOS), inkognito rejim | Kesh va eski token yo'q | |

## 1. Ro'yxatdan o'tish va kirish

| # | Qadam | Kutilgan natija | ✅/❌ |
|---|---|---|---|
| 1.1 | `/start` → yangi restoran (nom, telefon) | OTP keladi | |
| 1.2 | OTP kiritish | Avtomatik kirish, sehrgar ochiladi | |
| 1.3 | Chiqish → `/login` → email + parol | `/dashboard` ga tushadi | |
| 1.4 | Noto'g'ri parol 6 marta | 6-urinishda «juda ko'p urinish» (429), kirish bloklanadi | |
| 1.5 | Sahifani yangilash (F5) | Sessiya saqlanadi, qayta login so'ramaydi | |

## 2. Menyu

| # | Qadam | Kutilgan natija | ✅/❌ |
|---|---|---|---|
| 2.1 | «Demo ma'lumot» tugmasi | 3 kategoriya, 12 taom, 10 stol paydo bo'ladi | |
| 2.2 | Yangi kategoriya qo'shish | Ro'yxatda darhol ko'rinadi | |
| 2.3 | Yangi taom: nom, narx, rasm | Rasm yuklanadi, narx `45 000 so'm` formatida | |
| 2.4 | Taomni «Menyuda mavjud emas» qilish | Mehmon menyusida ko'rinmaydi | |

## 3. Stollar va QR

| # | Qadam | Kutilgan natija | ✅/❌ |
|---|---|---|---|
| 3.1 | `/tables` — stollar xaritasi | Barcha stollar, holati «Bo'sh» | |
| 3.2 | QR PDF yuklab olish | Har stol uchun alohida QR, chop etishga yaroqli | |
| 3.3 | QR'ni **boshqa telefonda** skanerlash | `/guest?table=...` ochiladi, to'g'ri restoran va stol | |

## 4. Mehmon buyurtmasi (QR)

| # | Qadam | Kutilgan natija | ✅/❌ |
|---|---|---|---|
| 4.1 | Kategoriya, qidiruv, rasm | Telefonda chiroyli, gorizontal scroll yo'q | |
| 4.2 | 2 ta taom + izoh («piyozsiz») → «Buyurtma berish» | Buyurtma raqami ko'rsatiladi | |
| 4.3 | Holat sahifasi | «Qabul qilindi» | |
| 4.4 | «Ofitsiantni chaqirish» | Ofitsiant ekranida xabar | |

## 5. Oshxona

| # | Qadam | Kutilgan natija | ✅/❌ |
|---|---|---|---|
| 5.1 | Oshpaz sifatida kirish → `/kitchen` | 4.2 dagi buyurtma **sahifani yangilamasdan** paydo bo'ladi, ovozli signal | |
| 5.2 | Izoh ko'rinadi | «piyozsiz» ticket'da | |
| 5.3 | «Tayyorlashni boshlash» → «Tayyor deb belgilash» | Mehmon holat sahifasi jonli yangilanadi: tayyorlanmoqda → tayyor | |
| 5.4 | Oshpazda «Bekor qilish» | Tugma **yo'q** (backend ham 403) | |

## 6. Ofitsiant

| # | Qadam | Kutilgan natija | ✅/❌ |
|---|---|---|---|
| 6.1 | Ofitsiant sifatida kirish → `/waiter` | Stol tanlash → taom → «Buyurtmani yuborish» ishlaydi | |
| 6.2 | «Tayyor» tugmasi | Ofitsiantda **ko'rinmaydi** (faqat oshxona) | |
| 6.3 | Oshxona «tayyor» qilganda | Ofitsiantga bildirishnoma keladi | |
| 6.4 | Buyurtmani boshqa stolga ko'chirish | Stol holatlari to'g'ri yangilanadi | |

## 7. Kassa va Z-hisobot

| # | Qadam | Kutilgan natija | ✅/❌ |
|---|---|---|---|
| 7.1 | Kassir sifatida kirish → `/cashier` | «Smena ochilmagan» — to'lov qabul qilib bo'lmaydi | |
| 7.2 | «Smenani ochish» (boshlang'ich 0) | «Smena ochiq» | |
| 7.3 | Buyurtmani tanlash | Chek: buyurtma summasi, to'langan, **qolgan balans** | |
| 7.4 | Qisman to'lov (split bill), keyin qolgani | Ikkala to'lov chekdagi ro'yxatda, qoldiq 0 | |
| 7.5 | Chek chop etish | Chek to'g'ri, xizmat haqi va soliq alohida qatorda | |
| 7.6 | Z-Report | «Jami to'langan summa» = qabul qilingan to'lovlar yig'indisi | |
| 7.7 | Smenani yopish | Z-hisobot kunlik daromad bilan bir xil | |

## 8. Hisobot va Telegram

| # | Qadam | Kutilgan natija | ✅/❌ |
|---|---|---|---|
| 8.1 | `/dashboard` — bugungi daromad | 7-bo'limdagi to'lovlar bilan bir xil | |
| 8.2 | Excel eksport | Fayl ochiladi, raqamlar ekrandagi bilan bir xil | |
| 8.3 | Telegram: yirik bekor qilish / kunlik hisobot | Xabar **shu restoranning** chatiga keladi (boshqa restoranga emas) | |

## 9. Obuna (billing)

| # | Qadam | Kutilgan natija | ✅/❌ |
|---|---|---|---|
| 9.1 | `/billing/status` | Trial, qolgan kunlar ko'rsatiladi | |
| 9.2 | Obunasi tugagan restoran (root panelda holatni o'zgartirib) | Yangi buyurtma ochib bo'lmaydi (402), ma'lumotlarni ko'rish mumkin | |

## 10. Xavfsizlik va izolyatsiya

| # | Qadam | Kutilgan natija | ✅/❌ |
|---|---|---|---|
| 10.1 | 2-restoran admini bilan kirish | 1-restoranning taomlari, buyurtmalari, to'lovlari **ko'rinmaydi** | |
| 10.2 | Ofitsiant `/cashier` ni URL orqali ochadi | 403 sahifasi | |
| 10.3 | DevTools → Application → Local Storage | Refresh token **yo'q** (httpOnly cookie'da, #18) | |

---

## Natija shabloni («✅ Hisobotlar» uchun)

```
MVP checklist — <sana>, prod commit <backend sha7> / <front sha7>, qurilma: <model>, <kenglik>px
✅ <o'tgan soni>/<jami>   ❌ <yiqilgan soni>
❌ 5.3 — mehmon holati jonli yangilanmadi → Issue #__
❌ ...
```

## Issue shabloni (har ❌ uchun)

```
Sarlavha: [MVP 5.3] Mehmon holat sahifasi jonli yangilanmaydi

Sahifa:      /guest?table=...
Qurilma:     iPhone 12, Safari, 390px
Commit:      backend a1b2c3d / front e4f5g6h
Qadamlar:    1) ... 2) ... 3) ...
Kutilgan:    «tayyorlanmoqda» → «tayyor» avtomatik
Haqiqiy:     sahifani yangilamaguncha o'zgarmaydi
Skrinshot:   (biriktiring)
```

Label: `mvp-checklist`, `bug`. Assignee — modul egasi (TASKS.md dagi jadval).
