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
}

export const ORDER_STATUS_LIST = [
  ORDER_STATUS.NEW,
  ORDER_STATUS.IN_KITCHEN,
  ORDER_STATUS.READY,
  ORDER_STATUS.SERVED,
  ORDER_STATUS.CLOSED,
]

export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.NEW]: 'Yangi',
  [ORDER_STATUS.IN_KITCHEN]: 'Oshxonada',
  [ORDER_STATUS.READY]: 'Tayyor',
  [ORDER_STATUS.SERVED]: 'Berildi',
  [ORDER_STATUS.CLOSED]: 'Yopilgan',
}

// Badge ranglari (components/ui/Badge variantlari).
export const ORDER_STATUS_TONE = {
  [ORDER_STATUS.NEW]: 'info',
  [ORDER_STATUS.IN_KITCHEN]: 'warning',
  [ORDER_STATUS.READY]: 'success',
  [ORDER_STATUS.SERVED]: 'neutral',
  [ORDER_STATUS.CLOSED]: 'neutral',
}

// Statusni faqat oldinga surish mumkin — UI shu ketma-ketlikka tayanadi.
export const NEXT_ORDER_STATUS = {
  [ORDER_STATUS.NEW]: ORDER_STATUS.IN_KITCHEN,
  [ORDER_STATUS.IN_KITCHEN]: ORDER_STATUS.READY,
  [ORDER_STATUS.READY]: ORDER_STATUS.SERVED,
  [ORDER_STATUS.SERVED]: ORDER_STATUS.CLOSED,
  [ORDER_STATUS.CLOSED]: null,
}

// ─── Stol holati ────────────────────────────────────────────────────────────
// KO'CHIRILDI: bu yerda ilgari TABLE_STATUS/TABLE_STATUS_LABELS/TABLE_STATUS_TONE
// alohida (va boshqacha kalitlar bilan: FREE/BUSY) qayta e'lon qilingan edi,
// constants/tableStatus.js dagi versiyadan (AVAILABLE/OCCUPIED/RESERVED/CLEANING)
// mustaqil holda. Ikkalasi ham 'available'/'occupied' qiymatlariga ega bo'lsa-da,
// har xil kalit nomlari import qilingan joyga qarab noto'g'ri ishlatilishiga olib
// kelishi mumkin edi. Endi YAGONA manba: constants/tableStatus.js.
// import { TABLE_STATUS, TABLE_STATUS_LABELS, TABLE_STATUS_TONE } from './tableStatus'

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
