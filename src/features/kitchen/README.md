# Kitchen — Oshxona paneli

**Mas'ul:** Ziyodulla

## Vazifalar
- [x] Buyurtma ustunlari: Pending / Preparing / Ready
- [x] Socket.io real-time yangilanish
- [x] 'Tayyor' tugmasi (status yuborish)
- [x] Backend URL ulandi (Railway) — pastdagi TODO'larni Swagger orqali tasdiqlash kerak

## Backend
`https://backend-production-11b7.up.railway.app` (production, Railway'da ishlamoqda)
Swagger: `https://backend-production-11b7.up.railway.app/api-docs`

**Tasdiqlangan (foydalanuvchi yuborgan):**
- Buyurtma tanasi: `{ table: string, items: [{ product: string, quantity: number }], notes: string }`
- Status yangilash tanasi: `{ status: "yangi" }` — bu `constants/roles.js` dagi `ORDER_STATUS` qiymatlari bilan mos

**TODO (Ziyodulla) — Swagger UI ochilgach tasdiqlash kerak:**
- [ ] `GET /kitchen/orders` — oshxona taxtasi uchun ro'yxat manzili shu nomdami?
      (`api.js` da hozircha shu deb faraz qilingan)
- [ ] `PATCH /orders/{id}/status` — status yangilash manzili/usuli to'g'rimi?
- [ ] `VITE_API_URL` uchun `/api` prefiksi kerakmi yoki yo'qmi
- [ ] Socket.io namespace/yo'l (hozircha root manzilga ulanadi)
- [ ] Socket eventlari nomi: `order:new`, `order:statusChanged` backendda shu nom bilanmi
- [ ] Order obyektida `waiter`/`number` maydonlari bormi (bo'lmasa UI ularsiz ham ishlaydi)

Backend javob bermasa yoki manzil noto'g'ri bo'lsa, panel avtomatik demo
ma'lumotlarga (`mockData.js`) tushadi va navbar'da "Demo rejim" belgisi chiqadi —
shunday qilib boshqa dasturchilar backend holatidan qat'i nazar UI'ni ko'rishlari mumkin.

## Tuzilma
```
kitchen/
  components/
    OrderTicket.jsx     # bitta buyurtma cheki (timer + amal tugmasi)
    KitchenColumn.jsx   # ustun (Pending/Preparing/Ready)
  hooks/
    useKitchenOrders.js # fetch + socket + status yangilash
  pages/
    KitchenPage.jsx     # sahifa (route: /kitchen)
  api.js                # backend so'rovlari (axios)
  mockData.js           # demo ma'lumotlar (backend javob bermasa)
```
