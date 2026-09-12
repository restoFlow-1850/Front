// Foydalanuvchi rollari va domen enum'lari.
// DIQQAT: bu yerdagi qiymatlar backend modellari bilan bir xil bo'lishi SHART.
// Manba: Backend/src/models/{User,Order,Table,Payment,Reservation}.js

export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  WAITER: 'waiter',
  CASHIER: 'cashier',
  COOK: 'cook',
  // Alias — ba'zi eski kodlar CHEF ishlatadi (COOK bilan bir xil qiymat).
  CHEF: 'cook',
}

export const ROLE_LIST = [ROLES.ADMIN, ROLES.MANAGER, ROLES.WAITER, ROLES.CASHIER, ROLES.COOK]

// Har bir rol login qilgandan keyin qayerga tushishi kerak.
export const ROLE_HOME = {
  [ROLES.ADMIN]: '/dashboard',
  [ROLES.MANAGER]: '/dashboard',
  [ROLES.WAITER]: '/waiter',
  [ROLES.CASHIER]: '/cashier',
  [ROLES.COOK]: '/kitchen',
}

export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Admin',
  [ROLES.MANAGER]: 'Menejer',
  [ROLES.WAITER]: 'Ofitsiant',
  [ROLES.CASHIER]: 'Kassir',
  [ROLES.COOK]: 'Oshpaz',
}

// ─── Buyurtma holati ────────────────────────────────────────────────────────
// Backend Order.STATUSES = ['yangi','oshxonada','tayyor','berildi','yopilgan']
// Ilgari bu yerda inglizcha qiymatlar ('new','preparing',...) turgan edi — ular
// backend enum'iga tushmagani uchun status yangilash 400 qaytarardi.
export const ORDER_STATUS = {
  NEW: 'yangi',
  IN_KITCHEN: 'oshxonada',
  READY: 'tayyor',
  SERVED: 'berildi',
  CLOSED: 'yopilgan',
  CANCELLED: 'bekor_qilingan',
}

export const ORDER_STATUS_LIST = [
  ORDER_STATUS.NEW,
  ORDER_STATUS.IN_KITCHEN,
  ORDER_STATUS.READY,
  ORDER_STATUS.SERVED,
  ORDER_STATUS.CLOSED,
  ORDER_STATUS.CANCELLED,
]

export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.NEW]: 'Yangi',
  [ORDER_STATUS.IN_KITCHEN]: 'Oshxonada',
  [ORDER_STATUS.READY]: 'Tayyor',
  [ORDER_STATUS.SERVED]: 'Berildi',
  [ORDER_STATUS.CLOSED]: 'Yopilgan',
  [ORDER_STATUS.CANCELLED]: 'Bekor qilingan',
}

// Badge ranglari (components/ui/Badge variantlari).
export const ORDER_STATUS_TONE = {
  [ORDER_STATUS.NEW]: 'info',
  [ORDER_STATUS.IN_KITCHEN]: 'warning',
  [ORDER_STATUS.READY]: 'success',
  [ORDER_STATUS.SERVED]: 'neutral',
  [ORDER_STATUS.CLOSED]: 'neutral',
  [ORDER_STATUS.CANCELLED]: 'danger',
}

// Statusni faqat oldinga surish mumkin — UI shu ketma-ketlikka tayanadi.
export const NEXT_ORDER_STATUS = {
  [ORDER_STATUS.NEW]: ORDER_STATUS.IN_KITCHEN,
  [ORDER_STATUS.IN_KITCHEN]: ORDER_STATUS.READY,
  [ORDER_STATUS.READY]: ORDER_STATUS.SERVED,
  [ORDER_STATUS.SERVED]: ORDER_STATUS.CLOSED,
  [ORDER_STATUS.CLOSED]: null,
  [ORDER_STATUS.CANCELLED]: null,
}

export const TABLE_STATUS = {
  AVAILABLE: 'available',
  BUSY: 'occupied',
  RESERVED: 'reserved',
  CLEANING: 'cleaning',
}
// Aliases for legacy component compatibility
TABLE_STATUS.FREE = TABLE_STATUS.AVAILABLE
TABLE_STATUS.OCCUPIED = TABLE_STATUS.BUSY

export const TABLE_STATUS_LIST = [
  TABLE_STATUS.AVAILABLE,
  TABLE_STATUS.BUSY,
  TABLE_STATUS.RESERVED,
  TABLE_STATUS.CLEANING,
]

export const TABLE_STATUS_LABELS = {
  [TABLE_STATUS.AVAILABLE]: "Bo'sh",
  [TABLE_STATUS.BUSY]: 'Band',
  [TABLE_STATUS.RESERVED]: 'Bron qilingan',
  [TABLE_STATUS.CLEANING]: 'Tozalanmoqda',
}

export const TABLE_STATUS_TONE = {
  [TABLE_STATUS.AVAILABLE]: 'success',
  [TABLE_STATUS.BUSY]: 'danger',
  [TABLE_STATUS.RESERVED]: 'warning',
  [TABLE_STATUS.CLEANING]: 'neutral',
}

export const TABLE_STATUS_COLORS = {
  [TABLE_STATUS.AVAILABLE]: '#22C55E',
  [TABLE_STATUS.BUSY]: '#EF4444',
  [TABLE_STATUS.RESERVED]: '#F59E0B',
  [TABLE_STATUS.CLEANING]: '#94A3B8',
}

export const TRANSFERABLE_TARGET_STATUSES = [TABLE_STATUS.AVAILABLE]


// ─── To'lov usuli ───────────────────────────────────────────────────────────
// Backend Payment.METHODS = ['naqd','karta','click','payme']
export const PAYMENT_METHODS = {
  CASH: 'naqd',
  CARD: 'karta',
  CLICK: 'click',
  PAYME: 'payme',
}

export const PAYMENT_METHOD_LIST = [
  PAYMENT_METHODS.CASH,
  PAYMENT_METHODS.CARD,
  PAYMENT_METHODS.CLICK,
  PAYMENT_METHODS.PAYME,
]

export const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHODS.CASH]: 'Naqd',
  [PAYMENT_METHODS.CARD]: 'Karta',
  [PAYMENT_METHODS.CLICK]: 'Click',
  [PAYMENT_METHODS.PAYME]: 'Payme',
}

// ─── Bron holati ────────────────────────────────────────────────────────────
export const RESERVATION_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
}

export const RESERVATION_STATUS_LABELS = {
  [RESERVATION_STATUS.PENDING]: 'Kutilmoqda',
  [RESERVATION_STATUS.CONFIRMED]: 'Tasdiqlangan',
  [RESERVATION_STATUS.CANCELLED]: 'Bekor qilingan',
  [RESERVATION_STATUS.COMPLETED]: 'Yakunlangan',
}

export const RESERVATION_STATUS_TONE = {
  [RESERVATION_STATUS.PENDING]: 'warning',
  [RESERVATION_STATUS.CONFIRMED]: 'success',
  [RESERVATION_STATUS.CANCELLED]: 'danger',
  [RESERVATION_STATUS.COMPLETED]: 'neutral',
}
