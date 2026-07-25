# Orders — Ofitsiant ekrani

**Mas'ul:** Abdugani (ekran mantiqi) / Ziyodulla (backend ulash)

## Vazifalar
- [x] Stol tanlash -> menyudan savatga qo'shish (hozircha erkin matn, menyu tayyor bo'lgach select'ga o'tkaziladi)
- [x] Buyurtma yuborish (backendga ulandi)
- [x] Miqdor o'zgartirish + izoh

## Backend
`POST /orders` — `https://backend-production-11b7.up.railway.app`
Body: `{ table: string, items: [{ product: string, quantity: number }], notes: string }`

**TODO:** Swagger (`/api-docs`) orqali `/orders` manzili va javob shakli tasdiqlansin;
hozircha `api.js` shu deb faraz qiladi. Menyu feature (Izzat) tayyor bo'lgach,
mahsulot matn input o'rniga menyudan tanlash select/qidiruvga almashtiriladi.

## Tuzilma
```
orders/
  components/
    OrderItemRow.jsx  # savatdagi bitta taom qatori
  pages/
    OrdersPage.jsx    # buyurtma yaratish ekrani (route: /orders)
  api.js              # backend so'rovlari (axios)
```
