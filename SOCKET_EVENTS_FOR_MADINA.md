# 📡 RestoFlow — Backend Socket.io Hodisalari va Payloadlari (Madina uchun qo'llanma)

> **Kim uchun:** Madina (Kassa va Dashboard bo'yicha mas'ul)  
> **Tayyorlovchi:** Zulfiqor  
> **Sana:** 10-sentabr, 2026-yil  
> **Maqsad:** Kassa va Dashboard sahifalarida real-time sinxronizatsiyani to'g'ri ulash, hodisalarni tozalash (cleanup) va takrorlanishlarning (duplicate toast/sound) oldini olish.

---

## ⚠️ MUHIM OGOHLANTIRISH (Nomlanish bo'yicha)

1. **`table:updated` emas, `table:status_updated`!**  
   Backendda kanonik event nomi: `table:status_updated`. Kassa va Stollar xaritasida aynan shu nomni tinglash kerak.
2. **`order:statusChanged` va `order:status_changed`:**  
   Backend ikkala nomni ham yuboradi (moslik uchun), lekin kanonik nom — `order:status_changed`.

---

## 📋 8 ta Kanonik Socket Hodisalari Jadvali

| № | Event nomi | Qachon yuboriladi | Payload tarkibi | Kassa / Dashboardda nima qilish kerak? |
|---|---|---|---|---|
| 1 | `table:status_updated` | Stol holati o'zgarganda (`available`, `occupied`, `reserved`) | `{ tableId, status, currentOrderId, action? }` | Stollar kartasi / dashboard kvitansiyasini yangilash |
| 2 | `order:created` *(alias: `order:new`)* | Yangi buyurtma ochilganda yoki check-in bo'lganda | `{ orderId, table, waiter, items, totalAmount, status, createdAt }` | Faol buyurtmalar hisoblagichi va kassa ro'yxatini yangilash |
| 3 | `order:status_changed` | Buyurtma statusi o'zgarganda (`yangi` → `oshxonada` → `tayyor` → `berildi` → `yopilgan`) | `{ orderId, table, status }` | Buyurtma holatini yangilash; agar `yopilgan` bo'lsa kassa hisobotiga qo'shish |
| 4 | `order:ready` | Taomlar tayyor bo'lib ofitsiantga signal borganda | `{ orderId, table }` | Bildirishnoma chiqarish (agar kerak bo'lsa) |
| 5 | `order:item_updated` | Oshxona bitta taomni tayyor qilib belgilasa | `{ orderId, table, itemId, item, items }` | Buyurtma tarkibini yangilash |
| 6 | `order:cancelled` | Buyurtma bekor qilinsa | `{ orderId, table, reason }` | Faol buyurtmalardan chiqarish, stolni bo'shatish |
| 7 | `notification:new` | Tizim bildirishnomasi | `{ _id, type, title, message, roles, link }` | Toast ko'rsatish va qo'ng'iroqcha sonini oshirish |
| 8 | `kitchen:new_order` | Maxsus faqat oshpazlar xonasi (`role:cook`) uchun | `{ orderId, table, items, notes }` | Oshpaz ekranida ticket chiqarish |

---

## 🔍 Batafsil Payload Tuzilmalari

### 1. `table:status_updated` (Kassa & Dashboard uchun eng muhimi!)
```json
{
  "tableId": "65b1234567890abcdef12340",
  "status": "occupied", // yoki "available", "reserved"
  "currentOrderId": "65b1234567890abcdef12345" // yoki null (agar bo'shatilgan bo'lsa)
}
```
*Bron / Check-in bo'lganda qo'shimcha maydonlar:*
```json
{
  "tableId": "65b1234567890abcdef12340",
  "status": "completed",
  "action": "checkin",
  "reservationId": "65b1234567890abcdef12399"
}
```

### 2. `order:created` (Yangi buyurtma)
```json
{
  "orderId": "65b1234567890abcdef12345",
  "table": "65b1234567890abcdef12340",
  "waiter": "65b1234567890abcdef12341",
  "items": [
    {
      "product": "65b1234567890abcdef12342",
      "name": "Osh (Palov)",
      "price": 45000,
      "quantity": 2,
      "note": "Kam yog'li"
    }
  ],
  "totalAmount": 90000,
  "status": "yangi",
  "createdAt": "2026-09-10T10:00:00.000Z"
}
```

### 3. `order:status_changed` (Status o'zgarishi)
```json
{
  "orderId": "65b1234567890abcdef12345",
  "table": "65b1234567890abcdef12340",
  "status": "yopilgan" // yoki "oshxonada", "tayyor", "berildi", "bekor_qilingan"
}
```

### 4. `notification:new` (Bildirishnoma)
```json
{
  "_id": "65b1234567890abcdef12388",
  "type": "order:new",
  "title": "Yangi buyurtma",
  "message": "Stol 3: yangi buyurtma keldi",
  "roles": ["cashier", "admin"],
  "link": "/cashier",
  "createdAt": "2026-09-10T10:05:00.000Z"
}
```

---

## 🛡️ Eng Yaxshi Amaliyotlar (Best Practices)

### 1. Sahifadan chiqishda listenerlarni tozalash (Memory leak oldini olish)
`useEffect` ichida obuna bo'linganda albatta `return () => socket.off(...)` qilish kerak:

```jsx
import { useEffect } from 'react'
import { socket } from '../../../services/socket'
import { useQueryClient } from '@tanstack/react-query'

export function useCashierSocket() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const handleTableStatus = (data) => {
      queryClient.invalidateQueries({ queryKey: ['tables'] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    }

    const handleOrderStatus = (data) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['shifts'] })
    }

    // Obuna bo'lish
    socket.on('table:status_updated', handleTableStatus)
    socket.on('order:status_changed', handleOrderStatus)
    socket.on('order:created', handleOrderStatus)

    // TOZALASH (Clean up): sahifadan chiqilganda yoki qayta chizilganda
    return () => {
      socket.off('table:status_updated', handleTableStatus)
      socket.off('order:status_changed', handleOrderStatus)
      socket.off('order:created', handleOrderStatus)
    }
  }, [queryClient])
}
```

### 2. Ovoz va Toaslarning takrorlanmasligi (Deduplication)
Bitta hodisaga bir nechta listener obuna bo'lib qolmasligi yoki tez-tez kelgan xabarlar ovozini ketma-ket chalmasligi uchun oxirgi yangilangan ID ni keshda saqlash tavsiya etiladi:

```javascript
const processedEvents = new Set()

function handleEventWithSound(event) {
  if (processedEvents.has(event.orderId)) return // Agar allaqachon eshitilgan bo'lsa
  processedEvents.add(event.orderId)
  
  // 10 soniyadan so'ng tozalash
  setTimeout(() => processedEvents.delete(event.orderId), 10000)

  // Ovoz va toast chiqarish
  playNotificationSound()
}
```

---
*Savollar bo'lsa, Zulfiqorga murojaat qilishingiz mumkin!*
