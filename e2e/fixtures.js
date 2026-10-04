// E2E uchun sobit hisoblar va ma'lumotlar.
// e2e/seed/seed.mjs aynan shularni bazaga yozadi — testlar shu yerdan o'qiydi.
// Faqat test bazasi uchun; production'da bunday hisoblar yo'q.

export const PASSWORD = 'E2e-Pass-2026!'

export const ACCOUNTS = {
  admin: { name: 'E2E Admin', email: 'e2e.admin@restoflow.test', role: 'admin', home: '/dashboard' },
  waiter: { name: 'E2E Ofitsiant', email: 'e2e.waiter@restoflow.test', role: 'waiter', home: '/waiter' },
  cook: { name: 'E2E Oshpaz', email: 'e2e.cook@restoflow.test', role: 'cook', home: '/kitchen' },
  cashier: { name: 'E2E Kassir', email: 'e2e.cashier@restoflow.test', role: 'cashier', home: '/cashier' },
}

export const RESTAURANT = { name: 'E2E Restoran', phone: '+998900000999', email: 'e2e@restoflow.test' }

export const MENU = {
  category: 'E2E Asosiy',
  product: { name: 'E2E Osh', price: 45000, stock: 100 },
}

export const TABLE = { number: 1, capacity: 4, location: 'E2E zal' }

// full-flow.spec.js da admin UI orqali qo'shadigan taom (seed'da YO'Q)
export const NEW_DISH = { name: "E2E Lag'mon", price: 38000 }
