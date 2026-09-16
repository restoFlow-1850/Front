# RestoFlow Socket.io Events — Kanonik Ro'yxat (Single Source of Truth)

Ushbu hujjat Backend va Frontend o'rtasidagi barcha real-time Socket.io eventlarining yagona kanonik ro'yxati hisoblanadi.

---

## 1. Buyurtma (Order) Eventlari

### `order:new` / `order:created`
- **Tavsif:** Yangi buyurtma yaratilganda yuboriladi.
- **Qabul qiluvchilar:** Barcha ulangan mijozlar / admin / manager / waiter.
- **Payload:**
  ```json
  {
    "orderId": "6a76f9...",
    "table": "6a76f8...",
    "waiter": "6a76f7...",
    "items": [{ "product": "...", "name": "Osh", "price": 40000, "quantity": 2 }],
    "totalAmount": 80000,
    "status": "yangi",
    "createdAt": "2026-08-18T12:00:00.000Z"
  }
  ```

### `kitchen:new_order`
- **Tavsif:** Oshxona paneli uchun maxsus yangi buyurtma hodisasi.
- **Qabul qiluvchilar:** `role:cook` (oshpazlar).
- **Payload:**
  ```json
  {
    "orderId": "6a76f9...",
    "table": "6a76f8...",
    "items": [{ "product": "...", "name": "Osh", "quantity": 2 }],
    "notes": "Achchiq bo'lmasin",
    "createdAt": "2026-08-18T12:00:00.000Z"
  }
  ```

### `order:statusChanged` / `order:status_changed`
- **Tavsif:** Buyurtma holati o'zgarganda (`yangi` -> `oshxonada` -> `tayyor` -> `berildi` -> `yopilgan` / `bekor_qilingan`).
- **Qabul qiluvchilar:** Barcha mijozlar.
- **Payload:**
  ```json
  {
    "orderId": "6a76f9...",
    "table": "6a76f8...",
    "status": "oshxonada"
  }
  ```

### `order:ready`
- **Tavsif:** Buyurtma oshpaz tomonidan `tayyor` holatiga o'tkazilganda.
- **Qabul qiluvchilar:** Buyurtma muallifi (ofitsiant) va barcha waiter xonalari.
- **Payload:**
  ```json
  {
    "orderId": "6a76f9...",
    "table": "6a76f8..."
  }
  ```

### `order:cancelled`
- **Tavsif:** Buyurtma bekor qilinganda (`bekor_qilingan`).
- **Qabul qiluvchilar:** Barcha mijozlar.
- **Payload:**
  ```json
  {
    "orderId": "6a76f9...",
    "table": "6a76f8...",
    "reason": "Mijoz rad etdi"
  }
  ```

---

## 2. Stol (Table) Eventlari

### `table:status_updated`
- **Tavsif:** Stol holati (bo'sh/band/bron) o'zgarganda yagona kanonik event.
- **Qabul qiluvchilar:** Barcha mijozlar.
- **Payload variantlari:**
  1. Buyurtma bog'liq:
     ```json
     {
       "tableId": "6a76f8...",
       "status": "occupied" | "free",
       "currentOrderId": "6a76f9..." | null
     }
     ```
  2. Stol CRUD:
     ```json
     {
       "tableId": "6a76f8...",
       "action": "updated" | "deleted",
       "table": { "_id": "...", "number": 1, "status": "available" }
     }
     ```
  3. Bron qilinganda:
     ```json
     {
       "tableId": "6a76f8...",
       "date": "2026-08-18",
       "isReserved": true,
       "reservationId": "..."
     }
     ```

---

## 3. Bildirishnoma (Notification) Eventlari

### `notification:new`
- **Tavsif:** Foydalanuvchi yoki rol uchun yangi bildirishnoma kelganda.
- **Qabul qiluvchilar:** Tegishli rol (`role:waiter`, `role:cook`, `role:admin`) yoki konkret foydalanuvchi room'i (`user:<id>`).
- **Payload:**
  ```json
  {
    "id": "6a76f9...",
    "type": "order:new" | "order:ready" | "product:lowStock",
    "title": "Yangi buyurtma",
    "message": "Stol 1 uchun yangi buyurtma tushdi",
    "roles": ["cook"],
    "link": "/kitchen",
    "createdAt": "2026-08-18T12:00:00.000Z"
  }
  ```
