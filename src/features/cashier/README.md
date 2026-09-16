# Cashier — Kassa

**Mas'ul:** Madina

## Vazifalar
- [x] To'lov qabul qilish (naqd/karta/Click/Payme)
- [x] Chek chiqarish
- [x] Split bill + to'lovlar tarixi
- [x] Smena boshqarish (ochish/yopish)
- [x] Z-Report (sмена hisoboti)

## Tuzilma
```
cashier/
  components/
    ShiftPanel.jsx       # Smena boshqaruv paneli
    ZReportModal.jsx     # Z-Report modal + chop etish
    ReceiptPrintModal.jsx # Chek chop etish
    PaymentsHistory.jsx  # To'lovlar tarixi
  pages/
    Cashier.jsx          # Asosiy kassa sahifasi
  api.js                 # backend so'rovlari (axios)
  README.md              # shu fayl
```

## API Endpointlar

### Smena (Shift)
- `GET /api/shifts/current` — Joriy ochiq smena
- `POST /api/shifts/open` — Yangi smena ochish (`{ openingBalance }`)
- `POST /api/shifts/close` — Smena yopish (`{ closingBalance }`)
- `GET /api/shifts/:id/report` — Z-Report (sмена hisoboti)

### Buyurtmalar / To'lovlar
- `GET /orders/:id/receipt` — Buyurtma cheki
- `POST /payments` — To'lov qabul qilish
- `GET /payments` — To'lovlar tarixi
- `GET /payments/unpaid-orders` — To'lanmagan buyurtmalar

## Ishlab chiqish

### Smena sikli
1. Kassir kassaga kirganda "Smena ochish" tugmasini bosadi
2. Boshlang'ich balansni kiritadi (ixtiyoriy)
3. To'lovlarni qabul qiladi
4. Smena oxirida "Smena yopish" tugmasini bosadi
5. Yakuniy balansni (naqd kassadagi pul) kiritadi
6. Z-Report avtomatik ochiladi — chop etish mumkin

### Xususiyatlar
- Smena ochilmagan bo'lsa, to'lov qabul qilib bo'lmaydi
- Smena 30 sekundda avtomatik yangilanadi
- Z-Report: balans, buyurtmalar statistikasi, to'lov usullari bo'yicha, sotilgan taomlar
- Chop etish: monospace shrift bilan chek formatida
