// Foydalanuvchi rollari — butun ilova bo'ylab ishlatiladi.
export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  WAITER: 'ofitsiant',
  CHEF: 'oshpaz',
  CASHIER: 'kassir',
}

// Buyurtma statuslari (backend bilan bir xil)
export const ORDER_STATUS = {
  NEW: 'yangi',
  IN_KITCHEN: 'oshxonada',
  READY: 'tayyor',
  SERVED: 'berildi',
  CLOSED: 'yopilgan',
}

// Stol holatlari
export const TABLE_STATUS = {
  FREE: 'bo\'sh',
  BUSY: 'band',
  RESERVED: 'bron',
}
