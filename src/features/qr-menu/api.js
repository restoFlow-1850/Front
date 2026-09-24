// Mehmon (login qilmagan) uchun ochiq so'rovlar — services/axios orqali.
// Stollar, band holati, menyu va bron yaratish shu yerdan ishlaydi.
import api from '../../services/axios'

export const getTableAvailability = (isoDateTime) =>
  api.get('/tables/availability', { params: { date: isoDateTime } })

export const getRestaurantTableAvailability = (restaurantId, isoDateTime) =>
  api.get(`/restaurants/${restaurantId}/tables/availability`, { params: { date: isoDateTime } })

export const getPublicCategories = () => api.get('/categories')

export const getPublicProducts = (params) =>
  api.get('/products', { params: { limit: 100, isAvailable: true, ...params } })

export const getRestaurantMenu = (restaurantId, params) =>
  api.get(`/restaurants/${restaurantId}/menu`, { params: { isAvailable: true, ...params } })

// Mehmon menyusi uchun yopilgan (stock=0 / mavjud emas) taomlarni ham qaytaradi —
// rostdan "tugagan" deb ko'rsatish va bosishni bloklash uchun (includeUnavailable=true).
export const getGuestRestaurantMenu = (restaurantId) => {
  if (restaurantId) {
    return api.get(`/restaurants/${restaurantId}/menu`)
  }
  return Promise.all([getPublicCategories(), api.get('/products', { params: { limit: 100 } })])
}

export const createGuestReservation = (payload) => api.post('/reservations', payload)

// ─── Mehmon buyurtma oqimi (QR-menyu) uchun ochiq endpointlar ─────────────
// Uch royhat: „Buyurtma berish", „Holat kuzatish" (socket + polling) va
// „Ofitsiantni chaqirish / hisob so'rash" — backend bilan kelishilgan.

/** Bitta stolni ochiq o'qish — status va restaurant aniqlash uchun. */
export const getTableById = (id) => api.get(`/tables/${id}`)

/** Restoran ma'lumoti (yopiq/ochiq rejimi, nomi) */
export const getRestaurantById = (id) => api.get(`/restaurants/${id}`)

/** Mehmon buyurtma yaratish — POST /public/orders (backend tayyor). */
export const createPublicOrder = (payload) => api.post('/public/orders', payload)

/** Buyurtmani id bo'yicha ochiq o'qish — polling fallback uchun. */
export const getPublicOrderById = (id) => api.get(`/public/orders/${id}`)

/**
 * Ofitsiantni chaqirish / hisob so'rash — ochiq endpoint (swagger: Tables,
 * „QR-menyu va mehmon uchun"). type: 'call' | 'bill_cash' | 'bill_card'.
 */
export const callWaiterForTable = (tableId, type = 'call', notes = '') =>
  api.post(`/tables/${tableId}/call-waiter`, { type, ...(notes ? { notes } : {}) })

const API_ORIGIN = (
  import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api' : 'https://backend-production-109c0.up.railway.app/api')
).replace(/\/api\/?$/, '')

export function resolveImageUrl(image) {
  if (!image) return null
  if (/^https?:\/\//.test(image)) return image
  return `${API_ORIGIN}${image.startsWith('/') ? '' : '/'}${image}`
}

export function formatSum(amount) {
  return `${Number(amount || 0).toLocaleString('ru-RU')} so'm`
}
