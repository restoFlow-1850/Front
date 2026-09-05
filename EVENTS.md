# RestoFlow Socket.io Events — Kanonik Ro'yxat (8 ta Asosiy Event)

> **Yagona haqiqat manbai (Single Source of Truth)**  
> Ushbu hujjat RestoFlow tizimidagi barcha real-time Socket.io hodisalarining to'liq va aniq ro'yxatidir.
> Tizimda jami **8 ta kanonik real-time event** mavjud.

---

## 📌 8 ta Kanonik Event Xulosasi

| № | Event nomi | Qabul qiluvchilar (Scope) | Asosiy maqsadi |
|---|------------|---------------------------|----------------|
| 1 | `order:created` *(alias: `order:new`)* | Barcha mijozlar (All clients) | Yangi buyurtma tizimda yaratildi |
| 2 | `kitchen:new_order` | `role:cook` (Oshpazlar xonasi) | Oshxona ekrani uchun maxsus buyurtma signali (audio va ticket) |
| 3 | `order:status_changed` *(alias: `order:statusChanged`)* | Barcha mijozlar (All clients) | Buyurtma statusi o'zgardi (`yangi` → `oshxonada` → `tayyor` → `berildi` → `yopilgan`) |
| 4 | `order:ready` | Ofitsiantlar (`role:waiter`), buyurtmachi | Buyurtma tayyor, olib ketish mumkin |
| 5 | `order:item_updated` | Barcha mijozlar (All clients) | Oshxonada alohida taom tayyor deb belgilandi (`isReady=true`) |
| 6 | `order:cancelled` | Barcha mijozlar (All clients) | Buyurtma bekor qilindi (`bekor_qilingan`) |
| 7 | `table:status_updated` | Barcha mijozlar (All clients) | Stol statusi o'zgardi (`available`, `occupied`, `reserved`) |
| 8 | `notification:new` | Tegishli rollar (`role:*`) yoki user | Yangi tizim bildirishnomasi |

---

## 1. Buyurtma (Order) Eventlari

### 1. `order:created` *(Tizimda `order:new` bilan birga chiqariladi)*
- **Tavsif:** Yangi buyurtma ofitsiant, kassa yoki bron check-in orqali yaratilganda tizimga tarqatiladi.
- **Trigger:** `POST /api/orders` yoki `POST /api/reservations/:id/checkin`
- **Scope:** Barcha ulangan mijozlar (`io.emit`).
- **Payload:**
  ```json
  {
    "orderId": "65b1234567890abcdef12345",
    "table": "65b1234567890abcdef12340",
    "waiter": "65b1234567890abcdef12341",
    "items": [
      {
        "product": "65b1234567890abcdef12342",
        "name": "O'zbekcha Palov",
        "price": 48000,
        "quantity": 2,
        "note": "Kamroq yog'li bo'lsin"
      }
    ],
    "totalAmount": 96000,
    "status": "yangi",
    "createdAt": "2026-09-05T12:00:00.000Z"
  }
  ```

---

### 2. `kitchen:new_order`
- **Tavsif:** Oshxona paneli uchun maxsus signal. Faqat oshpazlar xonasiga yuboriladi va ovozli signal (audio chime) chaladi.
- **Trigger:** Yangi buyurtma tasdiqlanganda.
- **Scope:** `io.to('role:cook').emit(...)`
- **Payload:**
  ```json
  {
    "orderId": "65b1234567890abcdef12345",
    "table": "65b1234567890abcdef12340",
    "items": [
      {
        "product": "65b1234567890abcdef12342",
        "name": "O'zbekcha Palov",
        "quantity": 2,
        "note": "Kamroq yog'li bo'lsin"
      }
    ],
    "notes": "Mijoz zudlik bilan so'radi",
    "createdAt": "2026-09-05T12:00:00.000Z"
  }
  ```

---

### 3. `order:status_changed` *(Tizimda `order:statusChanged` bilan birga chiqariladi)*
- **Tavsif:** Buyurtma hayotiy tsikli o'zgarganda: `yangi` ➔ `oshxonada` ➔ `tayyor` ➔ `berildi` ➔ `yopilgan`.
- **Trigger:** `PATCH /api/orders/:id/status`
- **Scope:** Barcha ulangan mijozlar (`io.emit`).
- **Payload:**
  ```json
  {
    "orderId": "65b1234567890abcdef12345",
    "table": "65b1234567890abcdef12340",
    "status": "oshxonada"
  }
  ```

---

### 4. `order:ready`
- **Tavsif:** Buyurtma tayyor bo'lganda ofitsiantga xizmat ko'rsatish uchun chaqiruv xabari yuboriladi.
- **Trigger:** Buyurtma statusi `tayyor` qilib belgilanganda.
- **Scope:** Barcha ulangan ofitsiantlar va umumiy mijozlar.
- **Payload:**
  ```json
  {
    "orderId": "65b1234567890abcdef12345",
    "table": "65b1234567890abcdef12340"
  }
  ```

---

### 5. `order:item_updated`
- **Tavsif:** Oshxona paneli buyurtma ichidagi har bir taomni alohida check-off qilganda (`isReady: true/false`).
- **Trigger:** `PATCH /api/orders/:id/items/:itemId`
- **Scope:** Barcha ulangan mijozlar (oshxona va ofitsiant panellarini sinxronlash uchun).
- **Payload:**
  ```json
  {
    "orderId": "65b1234567890abcdef12345",
    "table": "65b1234567890abcdef12340",
    "itemId": "65b1234567890abcdef12349",
    "item": {
      "_id": "65b1234567890abcdef12349",
      "product": "65b1234567890abcdef12342",
      "name": "O'zbekcha Palov",
      "price": 48000,
      "quantity": 2,
      "isReady": true,
      "note": "Kamroq yog'li bo'lsin"
    },
    "items": [ ]
  }
  ```

---

### 6. `order:cancelled`
- **Tavsif:** Buyurtma bekor qilinganda (`bekor_qilingan`).
- **Trigger:** `PATCH /api/orders/:id/cancel`
- **Scope:** Barcha ulangan mijozlar (`io.emit`).
- **Payload:**
  ```json
  {
    "orderId": "65b1234567890abcdef12345",
    "table": "65b1234567890abcdef12340",
    "reason": "Mijoz buyurtmani bekor qildi"
  }
  ```

---

## 2. Stol (Table) Eventlari

### 7. `table:status_updated`
- **Tavsif:** Stol holati o'zgarganda chiqariladigan yagona kanonik hodisa. Holatlar: `'available'`, `'occupied'`, `'reserved'`.
- **Triggerlar:**
  - Buyurtma yaratilganda / check-in bo'lganda (`occupied`)
  - Buyurtma yopilganda / bekor qilinganda (`available`)
  - Stol ko'chirilganda (transfer table)
  - Yangi bron qilinganda (`reserved`)
  - Stol CRUD amallarida
- **Scope:** Barcha ulangan mijozlar (`io.emit`).
- **Payload variantlari:**
  1. **Buyurtma ochilganda yoki yopilganda:**
     ```json
     {
       "tableId": "65b1234567890abcdef12340",
       "status": "occupied" | "available",
       "currentOrderId": "65b1234567890abcdef12345" | null
     }
     ```
  2. **Bron yoki Check-in qilinganda:**
     ```json
     {
       "tableId": "65b1234567890abcdef12340",
       "date": "2026-09-05T18:00:00.000Z",
       "reservationId": "65b1234567890abcdef12399",
       "status": "reserved" | "completed" | "occupied",
       "isReserved": true
     }
     ```
  3. **Stol ma'lumotlari tahrirlanganda / o'chirilganda:**
     ```json
     {
       "tableId": "65b1234567890abcdef12340",
       "action": "updated" | "deleted",
       "table": {
         "_id": "65b1234567890abcdef12340",
         "number": 5,
         "capacity": 4,
         "status": "available"
       }
     }
     ```

---

## 3. Bildirishnoma (Notification) Eventlari

### 8. `notification:new`
- **Tavsif:** Foydalanuvchi yoki rol uchun yuboriladigan real-time push-bildirishnoma.
- **Trigger:** Yangi buyurtma, taom tayyor bo'lishi, mahsulot kamayishi, bron yaratilishi, ofitsiant chaqiruvi.
- **Scope:** `role:cook`, `role:waiter`, `role:admin`, `role:manager` yoki individual `user:<id>`.
- **Payload:**
  ```json
  {
    "_id": "65b1234567890abcdef12388",
    "type": "order:new" | "order:ready" | "reservation:new" | "product:lowStock",
    "title": "Buyurtma tayyor",
    "message": "Stol 5: buyurtma tayyor bo'ldi!",
    "roles": ["waiter"],
    "link": "/orders",
    "createdAt": "2026-09-05T12:00:00.000Z"
  }
  ```

---

## 🔒 Socket Ulanish va Autentifikatsiya

```javascript
import { io } from 'socket.io-client';

const socket = io('https://restoflow-api.../', {
  auth: {
    token: 'jwt_access_token_bu_yerda'
  },
  transports: ['websocket', 'polling']
});

// Xonaga avtomatik a'zolik:
// Autentifikatsiyadan o'tgan socketlar avtomatik `role:<user.role>` va `user:<user._id>` xonalariga ulanadi.
```
